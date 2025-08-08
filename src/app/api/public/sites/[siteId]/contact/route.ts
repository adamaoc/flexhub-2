import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();

    // Verify site exists and has an active contact form
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        contactForm: {
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (!site.contactForm || !site.contactForm.isActive) {
      return NextResponse.json({ error: 'Contact form not available' }, { status: 404 });
    }

    // Validate required fields
    const requiredFields = site.contactForm.fields.filter(field => field.isRequired);
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!body.data || !body.data[field.fieldName] || String(body.data[field.fieldName]).trim() === '') {
        missingFields.push(field.fieldLabel);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: 'Missing required fields',
        missingFields,
      }, { status: 400 });
    }

    // Get client IP and user agent for basic tracking
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create the contact submission
    await prisma.contactSubmission.create({
      data: {
        contactFormId: site.contactForm.id,
        siteId,
        submitterIp: clientIp,
        submitterUserAgent: userAgent,
        submissionData: {
          create: site.contactForm.fields
            .filter(field => body.data && body.data[field.fieldName])
            .map(field => ({
              contactFormFieldId: field.id,
              value: String(body.data[field.fieldName]).substring(0, 5000), // Limit length
            })),
        },
      },
    });

    // Return success response without sensitive data
    return NextResponse.json({ success: true, message: 'Contact submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'There was a problem submitting your message. Please try again.' }, { status: 500 });
  }
}

// Handle preflight requests for CORS (handled centrally via next.config.ts headers)
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
