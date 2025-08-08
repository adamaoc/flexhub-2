import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/sites/[siteId]/companies/[companyId] - Get a specific company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; companyId: string }> }
) {
  try {
    const { siteId, companyId } = await params;
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

    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        siteId,
      },
      include: {
        jobListings: {
          where: {
            status: "ACTIVE",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            jobListings: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteId]/companies/[companyId] - Update a company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; companyId: string }> }
) {
  try {
    const { siteId, companyId } = await params;
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
      isActive,
    } = body;

    // Check if company exists and belongs to this site
    const existingCompany = await prisma.company.findFirst({
      where: {
        id: companyId,
        siteId,
      },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        name: name || existingCompany.name,
        description:
          description !== undefined ? description : existingCompany.description,
        website: website !== undefined ? website : existingCompany.website,
        logo: logo !== undefined ? logo : existingCompany.logo,
        location: location !== undefined ? location : existingCompany.location,
        industry: industry !== undefined ? industry : existingCompany.industry,
        size: size !== undefined ? size : existingCompany.size,
        founded: founded !== undefined ? founded : existingCompany.founded,
        isActive: isActive !== undefined ? isActive : existingCompany.isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId]/companies/[companyId] - Delete a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; companyId: string }> }
) {
  try {
    const { siteId, companyId } = await params;
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

    // Check if company exists and belongs to this site
    const existingCompany = await prisma.company.findFirst({
      where: {
        id: companyId,
        siteId,
      },
      include: {
        _count: {
          select: {
            jobListings: true,
          },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if company has active job listings
    if (existingCompany._count.jobListings > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete company with active job listings. Please delete or deactivate all job listings first.",
        },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: {
        id: companyId,
      },
    });

    return NextResponse.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
