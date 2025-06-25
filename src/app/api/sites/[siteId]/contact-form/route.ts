import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Add interface for field data
interface ContactFormFieldData {
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId } = await params;

    // Verify user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found or access denied' }, { status: 404 });
    }

    // Get contact form with fields
    const contactForm = await prisma.contactForm.findUnique({
      where: {
        siteId: siteId
      },
      include: {
        fields: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ contactForm });
  } catch (error) {
    console.error('Error fetching contact form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await request.json();

    // Verify user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found or access denied' }, { status: 404 });
    }

    // Check if contact form already exists
    const existingForm = await prisma.contactForm.findUnique({
      where: {
        siteId: siteId
      }
    });

    if (existingForm) {
      return NextResponse.json({ error: 'Contact form already exists for this site' }, { status: 400 });
    }

    // Create contact form with fields
    const contactForm = await prisma.contactForm.create({
      data: {
        name: body.name || 'Contact Form',
        description: body.description,
        isActive: body.isActive ?? true,
        siteId: siteId,
        fields: {
          create: body.fields?.map((field: ContactFormFieldData, index: number) => ({
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
            isRequired: field.isRequired ?? false,
            placeholder: field.placeholder,
            helpText: field.helpText,
            options: field.options,
            sortOrder: field.sortOrder ?? index,
            isActive: field.isActive ?? true
          })) || []
        }
      },
      include: {
        fields: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ contactForm }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await request.json();

    // Verify user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        users: {
          some: {
            id: session.user.id
          }
        }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found or access denied' }, { status: 404 });
    }

    // Check if contact form exists
    const existingForm = await prisma.contactForm.findUnique({
      where: {
        siteId: siteId
      }
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Contact form not found' }, { status: 404 });
    }

    // Update contact form and replace all fields
    const contactForm = await prisma.$transaction(async (tx) => {
      // Delete existing fields
      await tx.contactFormField.deleteMany({
        where: {
          contactFormId: existingForm.id
        }
      });

      // Update form and create new fields
      return await tx.contactForm.update({
        where: {
          id: existingForm.id
        },
        data: {
          name: body.name,
          description: body.description,
          isActive: body.isActive,
          fields: {
            create: body.fields?.map((field: ContactFormFieldData, index: number) => ({
              fieldName: field.fieldName,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              isRequired: field.isRequired ?? false,
              placeholder: field.placeholder,
              helpText: field.helpText,
              options: field.options,
              sortOrder: field.sortOrder ?? index,
              isActive: field.isActive ?? true
            })) || []
          }
        },
        include: {
          fields: {
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
    });

    return NextResponse.json({ contactForm });
  } catch (error) {
    console.error('Error updating contact form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 