import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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

    let sites;

    // Role-based access control
    if (user.role === 'SUPERADMIN') {
      // Super admins can see all sites
      sites = await prisma.site.findMany({
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'ADMIN') {
      // Admins can see sites they're connected to
      sites = await prisma.site.findMany({
        where: {
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Regular users can only see sites they're connected to
      sites = await prisma.site.findMany({
        where: {
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
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 