import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch a specific social media channel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; channelId: string }> }
) {
  try {
    const { siteId, channelId } = await params;
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

    const channel = await prisma.socialMediaChannel.findFirst({
      where: {
        id: channelId,
        siteId,
      },
      include: {
        stats: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error("Error fetching social media channel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a social media channel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; channelId: string }> }
) {
  try {
    const { siteId, channelId } = await params;
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

    const channel = await prisma.socialMediaChannel.findFirst({
      where: {
        id: channelId,
        siteId,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const body = await request.json();
    const { isActive, displayOrder, stats } = body;

    // Update channel
    const updateData: { isActive?: boolean; displayOrder?: number } = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    if (Object.keys(updateData).length > 0) {
      await prisma.socialMediaChannel.update({
        where: { id: channelId },
        data: updateData,
      });
    }

    // Update stats if provided
    if (stats && Array.isArray(stats)) {
      for (const stat of stats) {
        if (stat.id) {
          await prisma.socialMediaChannelStat.update({
            where: { id: stat.id },
            data: {
              isEnabled:
                stat.isEnabled !== undefined ? stat.isEnabled : undefined,
              displayName: stat.displayName || undefined,
              displayOrder:
                stat.displayOrder !== undefined ? stat.displayOrder : undefined,
            },
          });
        }
      }
    }

    // Fetch updated channel
    const updatedChannel = await prisma.socialMediaChannel.findFirst({
      where: {
        id: channelId,
        siteId,
      },
      include: {
        stats: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ channel: updatedChannel });
  } catch (error) {
    console.error("Error updating social media channel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a social media channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; channelId: string }> }
) {
  try {
    const { siteId, channelId } = await params;
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

    const channel = await prisma.socialMediaChannel.findFirst({
      where: {
        id: channelId,
        siteId,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Delete the channel (stats will be deleted via cascade)
    await prisma.socialMediaChannel.delete({
      where: { id: channelId },
    });

    return NextResponse.json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Error deleting social media channel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
