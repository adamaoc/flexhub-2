import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update a site feature
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; featureId: string }> }
) {
  try {
    const { siteId, featureId } = await params;
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

    // Only SUPERADMIN can manage site features
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isEnabled, config, displayName, description } = body;

    // Check if feature exists and belongs to the site
    const existingFeature = await prisma.siteFeature.findFirst({
      where: {
        id: featureId,
        siteId,
      },
    });

    if (!existingFeature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    const updateData = {
      updatedAt: new Date(),
      ...(isEnabled !== undefined && { isEnabled }),
      ...(config !== undefined && { config }),
      ...(displayName !== undefined && { displayName }),
      ...(description !== undefined && { description }),
    };

    const updatedFeature = await prisma.siteFeature.update({
      where: {
        id: featureId,
      },
      data: updateData,
    });

    return NextResponse.json({ feature: updatedFeature });
  } catch (error) {
    console.error("Error updating site feature:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a feature from a site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; featureId: string }> }
) {
  try {
    const { siteId, featureId } = await params;
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

    // Only SUPERADMIN can manage site features
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if feature exists and belongs to the site
    const existingFeature = await prisma.siteFeature.findFirst({
      where: {
        id: featureId,
        siteId,
      },
    });

    if (!existingFeature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    await prisma.siteFeature.delete({
      where: {
        id: featureId,
      },
    });

    return NextResponse.json({ message: "Feature removed successfully" });
  } catch (error) {
    console.error("Error removing site feature:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
