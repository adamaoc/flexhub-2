import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkCategory, Prisma } from "@prisma/client";

// GET /api/public/sites/[siteId]/works - Get public works with search and filters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // Check if site exists
    const site = await prisma.site.findUnique({ where: { id: siteId } });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check if works feature is enabled
    const worksFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: { siteId, feature: "WORKS" },
      },
    });

    if (!worksFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Works feature is not enabled for this site" },
        { status: 403 }
      );
    }

    // Get query parameters for filtering and search
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const type = searchParams.get("type");
    const client = searchParams.get("client");
    const technology = searchParams.get("technology");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.WorkWhereInput = {
      siteId,
    };

    if (category) {
      where.category = category as WorkCategory;
    }

    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true";
    }

    if (type) {
      where.type = type as "WORK" | "WEBSITE";
    }

    if (client) {
      where.client = { contains: client, mode: "insensitive" };
    }

    if (technology) {
      where.technologies = { has: technology };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { client: { contains: search, mode: "insensitive" } },
        { technologies: { has: search } },
        { results: { contains: search, mode: "insensitive" } },
      ];
    }

    const [works, total] = await Promise.all([
      prisma.work.findMany({
        where,
        orderBy: [{ featured: "desc" }, { date: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          image: true,
          logo: true,
          description: true,
          excerpt: true,
          type: true,
          date: true,
          client: true,
          featured: true,
          technologies: true,
          duration: true,
          results: true,
          githubUrl: true,
          videoUrl: true,
          url: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.work.count({ where }),
    ]);

    // Get filter options for the response
    const [categories, clients, technologies] = await Promise.all([
      prisma.work.findMany({
        where: { siteId },
        distinct: ["category"],
        select: { category: true },
      }),
      prisma.work.findMany({
        where: { siteId, client: { not: null } },
        distinct: ["client"],
        select: { client: true },
      }),
      prisma.$queryRaw<Array<{ technology: string }>>`
        SELECT DISTINCT unnest(technologies) as technology
        FROM works
        WHERE "siteId" = ${siteId}
        AND technologies IS NOT NULL
        AND array_length(technologies, 1) > 0
        ORDER BY technology
      `,
    ]);

    const response = NextResponse.json({
      works,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories: categories.map((c) => c.category),
        clients: clients.map((c) => c.client).filter(Boolean),
        technologies: technologies.map((t) => t.technology),
      },
      lastUpdated: new Date().toISOString(),
    });

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, max-age=600, s-maxage=600, stale-while-revalidate=300"
    );

    return response;
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
