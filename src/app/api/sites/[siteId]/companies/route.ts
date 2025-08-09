import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/sites/[siteId]/companies - Get all companies for a site
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

    // Check if job board feature is enabled
    const jobBoardFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: "JOB_BOARD",
        },
      },
    });

    if (!jobBoardFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Job board feature is not enabled for this site" },
        { status: 403 }
      );
    }

    const companies = await prisma.company.findMany({
      where: {
        siteId,
      },
      include: {
        _count: {
          select: {
            jobListings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteId]/companies - Create a new company
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

    // Check if job board feature is enabled
    const jobBoardFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: "JOB_BOARD",
        },
      },
    });

    if (!jobBoardFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Job board feature is not enabled for this site" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      website,
      logo,
      location,
      industry,
      size,
      founded,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        description: description || null,
        website: website || null,
        logo: logo || null,
        location: location || null,
        industry: industry || null,
        size: size || null,
        founded: founded || null,
        siteId,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
