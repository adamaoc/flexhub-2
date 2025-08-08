import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobType, JobStatus } from "@prisma/client";

// GET /api/sites/[siteId]/job-listings - Get all job listings for a site
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jobType = searchParams.get("jobType");
    const companyId = searchParams.get("companyId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      siteId,
    };

    if (status) {
      where.status = status as JobStatus;
    }

    if (jobType) {
      where.jobType = jobType as JobType;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [jobListings, total] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              location: true,
              industry: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.jobListing.count({ where }),
    ]);

    return NextResponse.json({
      jobListings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sites/[siteId]/job-listings - Create a new job listing
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
      title,
      description,
      requirements,
      benefits,
      jobType,
      experienceLevel,
      remoteWorkType,
      salaryMin,
      salaryMax,
      salaryCurrency = "USD",
      location,
      applicationUrl,
      image,
      companyId,
      expiresAt,
    } = body;

    if (!title || !description || !jobType || !companyId) {
      return NextResponse.json(
        {
          error: "Title, description, job type, and company are required",
        },
        { status: 400 }
      );
    }

    // Verify company exists and belongs to this site
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        siteId,
        isActive: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or inactive" },
        { status: 400 }
      );
    }

    const jobListing = await prisma.jobListing.create({
      data: {
        title,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        jobType,
        experienceLevel: experienceLevel || null,
        remoteWorkType: remoteWorkType || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        salaryCurrency,
        location: location || null,
        applicationUrl: applicationUrl || null,
        image: image || null,
        companyId,
        siteId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true,
            industry: true,
          },
        },
      },
    });

    return NextResponse.json(jobListing, { status: 201 });
  } catch (error) {
    console.error("Error creating job listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
