import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/sites/[siteId]/sponsors - Get all sponsors for a site
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

    // Check if user has access to this site
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
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if sponsors feature is enabled
    const sponsorsFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: 'SPONSORS'
        }
      }
    });

    if (!sponsorsFeature?.isEnabled) {
      return NextResponse.json({ error: 'Sponsors feature is not enabled for this site' }, { status: 403 });
    }

    const sponsors = await prisma.sponsor.findMany({
      where: {
        siteId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sites/[siteId]/sponsors - Create a new sponsor
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
    const { name, url, logo } = body;

    if (!name) {
      return NextResponse.json({ error: 'Sponsor name is required' }, { status: 400 });
    }

    // Check if user has access to this site
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
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if sponsors feature is enabled
    const sponsorsFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: 'SPONSORS'
        }
      }
    });

    if (!sponsorsFeature?.isEnabled) {
      return NextResponse.json({ error: 'Sponsors feature is not enabled for this site' }, { status: 403 });
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        url: url || null,
        logo: logo || null,
        siteId
      }
    });

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 