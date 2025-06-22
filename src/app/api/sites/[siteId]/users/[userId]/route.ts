import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string; userId: string }> }
) {
  try {
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

    // Only SUPERADMIN can manage site users
    if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { siteId, userId } = await params;

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is assigned to this site
    const existingAssignment = await prisma.site.findFirst({
      where: {
        id: siteId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json({ error: 'User is not assigned to this site' }, { status: 404 });
    }

    // Remove user from site
    await prisma.site.update({
      where: { id: siteId },
      data: {
        users: {
          disconnect: {
            id: userId,
          },
        },
      },
    });

    return NextResponse.json({ message: 'User removed from site successfully' });
  } catch (error) {
    console.error('Error removing user from site:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 