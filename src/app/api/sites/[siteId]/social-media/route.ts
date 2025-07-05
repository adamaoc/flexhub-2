import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { youtubeService } from "@/lib/youtube";
import { SocialMediaStatType } from "@prisma/client";

// GET - Fetch all social media channels for a site
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

    const channels = await prisma.socialMediaChannel.findMany({
      where: { siteId },
      include: {
        stats: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error fetching social media channels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a new social media channel
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

    // Check if social media integration feature is enabled
    const socialMediaFeature = await prisma.siteFeature.findFirst({
      where: {
        siteId,
        feature: "SOCIAL_MEDIA_INTEGRATION",
        isEnabled: true,
      },
    });

    if (!socialMediaFeature) {
      return NextResponse.json(
        { error: "Social media integration feature is not enabled" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { platform, channelId, channelUrl, enabledStats } = body;

    if (!platform || !channelId) {
      return NextResponse.json(
        { error: "Platform and channel ID are required" },
        { status: 400 }
      );
    }

    // Validate the channel based on platform
    let channelName = "";
    let resolvedChannelUrl = channelUrl || "";

    if (platform === "YOUTUBE") {
      // Validate YouTube channel
      const channelStats = await youtubeService.getChannelStats(channelId);
      if (!channelStats) {
        return NextResponse.json(
          { error: "Invalid YouTube channel ID or channel not accessible" },
          { status: 400 }
        );
      }
      channelName = channelStats.channelName;
      resolvedChannelUrl = channelStats.channelUrl;
    }

    // Check if channel already exists for this site
    const existingChannel = await prisma.socialMediaChannel.findFirst({
      where: {
        siteId,
        platform,
        channelId,
      },
    });

    if (existingChannel) {
      return NextResponse.json(
        { error: "This channel is already added to this site" },
        { status: 409 }
      );
    }

    // Create the channel
    const channel = await prisma.socialMediaChannel.create({
      data: {
        siteId,
        platform,
        channelId,
        channelName,
        channelUrl: resolvedChannelUrl,
        isActive: true,
        displayOrder: 0,
      },
    });

    // Create default stats for the platform
    const defaultStats = getDefaultStatsForPlatform(platform);
    const statsToCreate = enabledStats?.length
      ? defaultStats.filter((stat) => enabledStats.includes(stat.statType))
      : defaultStats;

    if (statsToCreate.length > 0) {
      await prisma.socialMediaChannelStat.createMany({
        data: statsToCreate.map((stat, index) => ({
          socialMediaChannelId: channel.id,
          statType: stat.statType as SocialMediaStatType,
          displayName: stat.displayName,
          isEnabled: true,
          displayOrder: index,
        })),
      });
    }

    // Fetch the created channel with stats
    const createdChannel = await prisma.socialMediaChannel.findUnique({
      where: { id: channel.id },
      include: {
        stats: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ channel: createdChannel }, { status: 201 });
  } catch (error) {
    console.error("Error creating social media channel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get default stats for each platform
function getDefaultStatsForPlatform(platform: string) {
  switch (platform) {
    case "YOUTUBE":
      return [
        { statType: "YOUTUBE_SUBSCRIBERS", displayName: "Subscribers" },
        { statType: "YOUTUBE_TOTAL_VIEWS", displayName: "Total Views" },
        { statType: "YOUTUBE_VIDEO_COUNT", displayName: "Video Count" },
        { statType: "YOUTUBE_THUMBNAIL", displayName: "Channel Thumbnail" },
        { statType: "YOUTUBE_DESCRIPTION", displayName: "Channel Description" },
        { statType: "CHANNEL_NAME", displayName: "Channel Name" },
        { statType: "PLATFORM_URL", displayName: "Channel URL" },
      ];
    case "TWITCH":
      return [
        { statType: "TWITCH_FOLLOWERS", displayName: "Followers" },
        { statType: "TWITCH_TOTAL_VIEWS", displayName: "Total Views" },
        { statType: "CHANNEL_NAME", displayName: "Channel Name" },
        { statType: "PLATFORM_URL", displayName: "Channel URL" },
      ];
    default:
      return [
        { statType: "CHANNEL_NAME", displayName: "Channel Name" },
        { statType: "PLATFORM_URL", displayName: "Channel URL" },
      ];
  }
}
