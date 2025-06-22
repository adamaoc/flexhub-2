import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-based access control
    let site;
    if (user.role === 'SUPERADMIN') {
      // Super admins can access any site
      site = await prisma.site.findUnique({
        where: { id: siteId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pages: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              createdAt: true,
            },
          },
          blogPosts: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              publishedAt: true,
              createdAt: true,
            },
          },
          mediaFiles: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              pages: true,
              blogPosts: true,
              mediaFiles: true,
              users: true,
            },
          },
        },
      });
    } else if (user.role === 'ADMIN') {
      // Admins can only access sites they're connected to
      site = await prisma.site.findFirst({
        where: {
          id: siteId,
          users: {
            some: {
              id: user.id,
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pages: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              createdAt: true,
            },
          },
          blogPosts: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              publishedAt: true,
              createdAt: true,
            },
          },
          mediaFiles: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              pages: true,
              blogPosts: true,
              mediaFiles: true,
              users: true,
            },
          },
        },
      });
    } else {
      // Regular users can only access sites they're connected to
      site = await prisma.site.findFirst({
        where: {
          id: siteId,
          users: {
            some: {
              id: user.id,
            },
          },
        },
        include: {
          users: {
            where: {
              id: user.id,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pages: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              createdAt: true,
            },
          },
          blogPosts: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              publishedAt: true,
              createdAt: true,
            },
          },
          mediaFiles: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              pages: true,
              blogPosts: true,
              mediaFiles: true,
              users: true,
            },
          },
        },
      });
    }

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPERADMIN can edit sites
    if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, domain } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    // Validate domain format if provided
    if (domain && typeof domain === 'string' && domain.trim().length > 0) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(domain.trim())) {
        return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
      }
    }

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if site name already exists (excluding current site)
    const duplicateName = await prisma.site.findFirst({
      where: {
        name: name.trim(),
        id: { not: siteId },
      },
    });

    if (duplicateName) {
      return NextResponse.json({ error: 'A site with this name already exists' }, { status: 409 });
    }

    // Check if domain already exists (excluding current site)
    if (domain && domain.trim().length > 0) {
      const duplicateDomain = await prisma.site.findFirst({
        where: {
          domain: domain.trim(),
          id: { not: siteId },
        },
      });

      if (duplicateDomain) {
        return NextResponse.json({ error: 'A site with this domain already exists' }, { status: 409 });
      }
    }

    // Update the site
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        name: name.trim(),
        domain: domain && domain.trim().length > 0 ? domain.trim() : null,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            pages: true,
            blogPosts: true,
            mediaFiles: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json({ site: updatedSite });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 