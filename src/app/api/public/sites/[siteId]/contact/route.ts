import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CORS headers - comprehensive for production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
  'Access-Control-Allow-Credentials': 'false',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Max-Age': '86400', // 24 hours
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();

    // Verify site exists and has an active contact form
    const site = await prisma.site.findUnique({
      where: {
        id: siteId
      },
      include: {
        contactForm: {
          include: {
            fields: {
              where: {
                isActive: true
              },
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404, headers: corsHeaders });
    }

    if (!site.contactForm || !site.contactForm.isActive) {
      return NextResponse.json({ error: 'Contact form not available' }, { status: 404, headers: corsHeaders });
    }

    // Validate required fields
    const requiredFields = site.contactForm.fields.filter(field => field.isRequired);
    const missingFields = [];

    for (const field of requiredFields) {
      if (!body.data || !body.data[field.fieldName] || body.data[field.fieldName].trim() === '') {
        missingFields.push(field.fieldLabel);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: 'Missing required fields',
        missingFields
      }, { status: 400, headers: corsHeaders });
    }

    // Get client IP and user agent for basic tracking
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create the contact submission
    await prisma.contactSubmission.create({
      data: {
        contactFormId: site.contactForm.id,
        siteId: siteId,
        submitterIp: clientIp,
        submitterUserAgent: userAgent,
        submissionData: {
          create: site.contactForm.fields
            .filter(field => body.data && body.data[field.fieldName])
            .map(field => ({
              contactFormFieldId: field.id,
              value: String(body.data[field.fieldName]).substring(0, 5000) // Limit length
            }))
        }
      }
    });

    // Return success response without sensitive data
    return NextResponse.json({
      success: true,
      message: 'Contact submitted successfully'
    }, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ 
      error: 'There was a problem submitting your message. Please try again.' 
    }, { status: 500, headers: corsHeaders });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
} 