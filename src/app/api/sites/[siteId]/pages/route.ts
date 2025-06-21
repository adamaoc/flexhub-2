import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all pages for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sites: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to this site
    const hasAccess = user.sites.some(site => site.id === siteId);
    const isSuperAdmin = user.role === 'SUPERADMIN';

    if (!hasAccess && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const pages = await prisma.page.findMany({
      where: { siteId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sites: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to this site
    const hasAccess = user.sites.some(site => site.id === siteId);
    const isSuperAdmin = user.role === 'SUPERADMIN';

    if (!hasAccess && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, content, isPublished = false } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists for this site
    const existingPage = await prisma.page.findFirst({
      where: {
        siteId,
        slug: slug,
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        isPublished,
        siteId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 