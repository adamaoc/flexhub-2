import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all features for a site
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPERADMIN can manage site features
    if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const features = await prisma.siteFeature.findMany({
      where: { siteId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ features });
  } catch (error) {
    console.error('Error fetching site features:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add a feature to a site
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only SUPERADMIN can manage site features
    if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { feature, isEnabled = true, config } = body;

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature type is required' },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if feature already exists for this site
    const existingFeature = await prisma.siteFeature.findFirst({
      where: {
        siteId,
        feature,
      },
    });

    if (existingFeature) {
      return NextResponse.json(
        { error: 'This feature is already enabled for this site' },
        { status: 409 }
      );
    }

    const siteFeature = await prisma.siteFeature.create({
      data: {
        siteId,
        feature,
        isEnabled,
        config,
      },
    });

    return NextResponse.json({ feature: siteFeature }, { status: 201 });
  } catch (error) {
    console.error('Error adding site feature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 