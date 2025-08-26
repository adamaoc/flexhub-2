import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkCategory, WorkType } from "@prisma/client";

// GET /api/sites/[siteId]/works/[workId] - Get a specific work
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; workId: string }> }
) {
  try {
    const { siteId, workId } = await params;
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

    const work = await prisma.work.findFirst({
      where: {
        id: workId,
        siteId,
      },
    });

    if (!work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    return NextResponse.json(work);
  } catch (error) {
    console.error("Error fetching work:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[siteId]/works/[workId] - Update a work
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; workId: string }> }
) {
  try {
    const { siteId, workId } = await params;
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

    // Check if work exists
    const existingWork = await prisma.work.findFirst({
      where: {
        id: workId,
        siteId,
      },
    });

    if (!existingWork) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      title,
      category,
      image,
      logo,
      description,
      excerpt,
      type,
      date,
      client,
      featured,
      technologies,
      duration,
      results,
      githubUrl,
      videoUrl,
      url,
    } = body;

    // Validate category if provided
    if (category) {
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
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    // Validate type if provided
    if (type) {
      const validTypes = ["WORK", "WEBSITE"];
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category as WorkCategory;
    if (image !== undefined) updateData.image = image || null;
    if (logo !== undefined) updateData.logo = logo || null;
    if (description !== undefined) updateData.description = description;
    if (excerpt !== undefined) updateData.excerpt = excerpt || null;
    if (type !== undefined) updateData.type = type as WorkType;
    if (date !== undefined) updateData.date = new Date(date);
    if (client !== undefined) updateData.client = client || null;
    if (featured !== undefined) updateData.featured = featured;
    if (technologies !== undefined) updateData.technologies = technologies;
    if (duration !== undefined) updateData.duration = duration || null;
    if (results !== undefined) updateData.results = results || null;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl || null;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
    if (url !== undefined) updateData.url = url || null;

    const work = await prisma.work.update({
      where: {
        id: workId,
      },
      data: updateData,
    });

    return NextResponse.json(work);
  } catch (error) {
    console.error("Error updating work:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[siteId]/works/[workId] - Delete a work
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; workId: string }> }
) {
  try {
    const { siteId, workId } = await params;
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

    // Check if work exists
    const existingWork = await prisma.work.findFirst({
      where: {
        id: workId,
        siteId,
      },
    });

    if (!existingWork) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    await prisma.work.delete({
      where: {
        id: workId,
      },
    });

    return NextResponse.json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Error deleting work:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
