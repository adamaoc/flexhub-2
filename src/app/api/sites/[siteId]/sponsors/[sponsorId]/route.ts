import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/sites/[siteId]/sponsors/[sponsorId] - Get a specific sponsor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, sponsorId } = await params;

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

    const sponsor = await prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        siteId
      }
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/sites/[siteId]/sponsors/[sponsorId] - Update a sponsor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, sponsorId } = await params;
    const body = await request.json();
    const { name, url, logo, active } = body;

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

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        siteId
      }
    });

    if (!existingSponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    const sponsor = await prisma.sponsor.update({
      where: {
        id: sponsorId
      },
      data: {
        name,
        url: url || null,
        logo: logo || null,
        active: active !== undefined ? active : existingSponsor.active
      }
    });

    return NextResponse.json(sponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/sites/[siteId]/sponsors/[sponsorId] - Delete a sponsor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; sponsorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, sponsorId } = await params;

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

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        siteId
      }
    });

    if (!existingSponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    await prisma.sponsor.delete({
      where: {
        id: sponsorId
      }
    });

    return NextResponse.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 