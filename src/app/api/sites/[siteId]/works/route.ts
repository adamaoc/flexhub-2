import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkCategory, WorkType } from "@prisma/client";

// GET /api/sites/[siteId]/works - Get all works for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        users: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!site && user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Site not found or access denied" },
        { status: 404 }
      );
    }

    // Check if works feature is enabled
    const worksFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: "WORKS",
        },
      },
    });

    if (!worksFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Works feature is not enabled for this site" },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      siteId,
    };

    if (category) {
      where.category = category as WorkCategory;
    }

    if (featured !== null && featured !== undefined) {
      where.featured = featured === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { client: { contains: search, mode: "insensitive" } },
        { technologies: { has: search } },
      ];
    }

    const [works, total] = await Promise.all([
      prisma.work.findMany({
        where,
        orderBy: [{ featured: "desc" }, { date: "desc" }],
        skip,
        take: limit,
      }),
      prisma.work.count({ where }),
    ]);

    return NextResponse.json({
      works,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteId]/works - Create a new work
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        users: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!site && user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Site not found or access denied" },
        { status: 404 }
      );
    }

    // Check if works feature is enabled
    const worksFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: "WORKS",
        },
      },
    });

    if (!worksFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Works feature is not enabled for this site" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      category,
      image,
      logo,
      description,
      excerpt,
      type = "WORK",
      date,
      client,
      featured = false,
      technologies = [],
      duration,
      results,
      githubUrl,
      videoUrl,
      url,
    } = body;

    // Validate required fields
    if (!title || !category || !description || !date) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, category, description, date",
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "WEBSITE",
      "VIDEO",
      "CLI_TOOL",
      "SEO",
      "SOCIAL_MEDIA",
      "ADVERTISING",
      "DESIGN",
      "CONSULTING",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate type
    const validTypes = ["WORK", "WEBSITE"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const work = await prisma.work.create({
      data: {
        title,
        category: category as WorkCategory,
        image: image || null,
        logo: logo || null,
        description,
        excerpt: excerpt || null,
        type: type as WorkType,
        date: new Date(date),
        client: client || null,
        featured,
        technologies,
        duration: duration || null,
        results: results || null,
        githubUrl: githubUrl || null,
        videoUrl: videoUrl || null,
        url: url || null,
        siteId,
      },
    });

    return NextResponse.json(work, { status: 201 });
  } catch (error) {
    console.error("Error creating work:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
