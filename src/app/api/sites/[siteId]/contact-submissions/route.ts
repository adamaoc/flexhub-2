import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Add interface for query filters
interface SubmissionFilters {
  siteId: string;
  isRead?: boolean;
  isArchived?: boolean;
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead');
    const isArchived = searchParams.get('isArchived');

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

    // Build filters
    const where: SubmissionFilters = {
      siteId: siteId
    };

    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    if (isArchived !== null) {
      where.isArchived = isArchived === 'true';
    }

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        include: {
          submissionData: {
            include: {
              contactFormField: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contactSubmission.count({ where })
    ]);

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 