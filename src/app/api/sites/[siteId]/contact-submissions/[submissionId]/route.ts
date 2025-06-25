import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, submissionId } = await params;

    // Verify user has access to this site and submission
    const submission = await prisma.contactSubmission.findFirst({
      where: {
        id: submissionId,
        siteId: siteId,
        site: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      },
      include: {
        submissionData: {
          include: {
            contactFormField: true
          },
          orderBy: {
            contactFormField: {
              sortOrder: 'asc'
            }
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, submissionId } = await params;
    const body = await request.json();

    // Verify user has access to this site and submission
    const existingSubmission = await prisma.contactSubmission.findFirst({
      where: {
        id: submissionId,
        siteId: siteId,
        site: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found or access denied' }, { status: 404 });
    }

    // Update submission status
    const submission = await prisma.contactSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        isRead: body.isRead,
        isArchived: body.isArchived
      },
      include: {
        submissionData: {
          include: {
            contactFormField: true
          },
          orderBy: {
            contactFormField: {
              sortOrder: 'asc'
            }
          }
        }
      }
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, submissionId } = await params;

    // Verify user has access to this site and submission
    const existingSubmission = await prisma.contactSubmission.findFirst({
      where: {
        id: submissionId,
        siteId: siteId,
        site: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found or access denied' }, { status: 404 });
    }

    // Delete submission (this will cascade to submission data)
    await prisma.contactSubmission.delete({
      where: {
        id: submissionId
      }
    });

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 