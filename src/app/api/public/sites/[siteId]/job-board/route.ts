import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobType, ExperienceLevel, RemoteWorkType } from "@prisma/client";

// GET /api/public/sites/[siteId]/job-board - Get public job listings with search and filters
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

    // Check if job board feature is enabled
    const jobBoardFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: { siteId, feature: "JOB_BOARD" },
      },
    });

    if (!jobBoardFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Job board feature is not enabled for this site" },
        { status: 403 }
      );
    }

    // Get query parameters for filtering and search
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const jobType = searchParams.get("jobType");
    const companyId = searchParams.get("companyId");
    const location = searchParams.get("location");
    const experienceLevel = searchParams.get("experienceLevel");
    const remoteWorkType = searchParams.get("remoteWorkType");
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause for active job listings only
    const where: any = {
      siteId,
      status: "ACTIVE",
      company: { isActive: true },
    };

    // Add filters
    if (jobType) {
      where.jobType = jobType as JobType;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel as ExperienceLevel;
    }

    if (remoteWorkType) {
      where.remoteWorkType = remoteWorkType as RemoteWorkType;
    }

    if (salaryMin) {
      where.salaryMax = { gte: parseInt(salaryMin) };
    }

    if (salaryMax) {
      where.salaryMin = { lte: parseInt(salaryMax) };
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
        { company: { industry: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get job listings with company information
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
              website: true,
              size: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.jobListing.count({ where }),
    ]);

    // Get available filters for the frontend
    const [jobTypes, companies, locations, experienceLevels, remoteWorkTypes] =
      await Promise.all([
        prisma.jobListing.findMany({ where: { siteId, status: "ACTIVE" }, select: { jobType: true }, distinct: ["jobType"] }),
        prisma.company.findMany({ where: { siteId, isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.jobListing.findMany({ where: { siteId, status: "ACTIVE", location: { not: null } }, select: { location: true }, distinct: ["location"] }),
        prisma.jobListing.findMany({ where: { siteId, status: "ACTIVE", experienceLevel: { not: null } }, select: { experienceLevel: true }, distinct: ["experienceLevel"] }),
        prisma.jobListing.findMany({ where: { siteId, status: "ACTIVE", remoteWorkType: { not: null } }, select: { remoteWorkType: true }, distinct: ["remoteWorkType"] }),
      ]);

    const response = NextResponse.json({
      jobListings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      filters: {
        jobTypes: jobTypes.map((j) => j.jobType),
        companies: companies.map((c) => ({ id: c.id, name: c.name })),
        locations: locations.map((l) => l.location).filter(Boolean),
        experienceLevels: experienceLevels.map((e) => e.experienceLevel).filter(Boolean),
        remoteWorkTypes: remoteWorkTypes.map((r) => r.remoteWorkType).filter(Boolean),
      },
      lastUpdated: new Date().toISOString(),
    });

    // Cache for 5 minutes to reduce load
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=150"
    );

    return response;
  } catch (error) {
    console.error("Error fetching public job board:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        jobListings: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        filters: { jobTypes: [], companies: [], locations: [], experienceLevels: [], remoteWorkTypes: [] },
      },
      { status: 500 }
    );
  }
}
