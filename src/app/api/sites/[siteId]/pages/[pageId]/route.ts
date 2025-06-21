import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { siteId, pageId } = await params;
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

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
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

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { siteId, pageId } = await params;
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
    const { title, slug, content, isPublished } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists for this site (excluding current page)
    const existingPage = await prisma.page.findFirst({
      where: {
        siteId,
        slug: slug,
        id: { not: pageId },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.page.update({
      where: {
        id: pageId,
        siteId,
      },
      data: {
        title,
        slug,
        content,
        isPublished,
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

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  try {
    const { siteId, pageId } = await params;
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

    // Check if page exists
    const existingPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        siteId,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.page.delete({
      where: {
        id: pageId,
        siteId,
      },
    });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 