import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/public/sites/[siteId]/sponsors - Get all active sponsors for a site (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: {
        id: siteId
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

    // Get only active sponsors with limited public information
    const sponsors = await prisma.sponsor.findMany({
      where: {
        siteId,
        active: true
      },
      select: {
        id: true,
        name: true,
        url: true,
        logo: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add CORS headers for public access (also handled by Next.js config)
    const response = NextResponse.json(sponsors);
    response.headers.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    return response;
  } catch (error) {
    console.error('Error fetching public sponsors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS preflight (also handled by Next.js config)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
} 