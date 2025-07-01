import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers - comprehensive for production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma",
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Expose-Headers": "Content-Length, X-JSON",
  "Access-Control-Max-Age": "86400", // 24 hours
};

// GET /api/public/sites - Get all sites with basic details and features (public endpoint)
export async function GET() {
  try {
    // Get all sites with basic information and enabled features
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        domain: true,
        logo: true,
        coverImage: true,
        features: {
          where: {
            isEnabled: true,
          },
          select: {
            id: true,
            feature: true,
            displayName: true,
            description: true,
            config: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to make it more API-friendly
    const transformedSites = sites.map((site) => ({
      id: site.id,
      name: site.name,
      description: site.description,
      domain: site.domain,
      logo: site.logo,
      coverImage: site.coverImage,
      features: site.features.map((feature) => ({
        id: feature.id,
        type: feature.feature,
        displayName: feature.displayName,
        description: feature.description,
        config: feature.config,
      })),
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    }));

    // Add response headers for public access and caching
    const response = NextResponse.json(
      {
        sites: transformedSites,
        count: transformedSites.length,
        lastUpdated: new Date().toISOString(),
      },
      { headers: corsHeaders }
    );

    // Cache for 10 minutes to reduce load
    response.headers.set(
      "Cache-Control",
      "public, max-age=600, stale-while-revalidate=300"
    );

    return response;
  } catch (error) {
    console.error("Error fetching public sites:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        sites: [],
        count: 0,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
