import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; jobListingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { siteId, jobListingId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sites: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has access to the site
    let hasAccess = false;
    if (user.role === "SUPERADMIN") {
      hasAccess = true;
    } else {
      hasAccess = user.sites.some((s) => s.id === siteId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this site" },
        { status: 403 }
      );
    }

    const jobListing = await prisma.jobListing.findUnique({
      where: {
        id: jobListingId,
        siteId: siteId,
      },
      include: {
        company: true,
      },
    });

    if (!jobListing) {
      return NextResponse.json(
        { error: "Job listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobListing);
  } catch (error) {
    console.error("Error fetching job listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; jobListingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { siteId, jobListingId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sites: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has access to the site
    let hasAccess = false;
    if (user.role === "SUPERADMIN") {
      hasAccess = true;
    } else {
      hasAccess = user.sites.some((s) => s.id === siteId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this site" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const jobListing = await prisma.jobListing.update({
      where: {
        id: jobListingId,
        siteId: siteId,
      },
      data: {
        title: body.title,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
        jobType: body.jobType,
        experienceLevel: body.experienceLevel,
        remoteWorkType: body.remoteWorkType,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        salaryCurrency: body.salaryCurrency,
        location: body.location,
        applicationUrl: body.applicationUrl,
        image: body.image,
        companyId: body.companyId,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(jobListing);
  } catch (error) {
    console.error("Error updating job listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; jobListingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { siteId, jobListingId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sites: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has access to the site
    let hasAccess = false;
    if (user.role === "SUPERADMIN") {
      hasAccess = true;
    } else {
      hasAccess = user.sites.some((s) => s.id === siteId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this site" },
        { status: 403 }
      );
    }

    await prisma.jobListing.delete({
      where: {
        id: jobListingId,
        siteId: siteId,
      },
    });

    return NextResponse.json(
      { message: "Job listing deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
