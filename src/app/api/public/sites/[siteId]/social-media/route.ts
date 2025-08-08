import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { youtubeService } from "@/lib/youtube";

// GET /api/public/sites/[siteId]/social-media - Get all social media data for a site
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

    // Check if social media integration feature is enabled
    const socialMediaFeature = await prisma.siteFeature.findFirst({
      where: { siteId, feature: "SOCIAL_MEDIA_INTEGRATION", isEnabled: true },
    });

    if (!socialMediaFeature) {
      return NextResponse.json(
        { error: "Social media integration is not enabled for this site" },
        { status: 403 }
      );
    }

    // Get all active channels with their enabled stats
    const channels = await prisma.socialMediaChannel.findMany({
      where: { siteId, isActive: true },
      include: {
        stats: { where: { isEnabled: true }, orderBy: { displayOrder: "asc" } },
      },
      orderBy: { displayOrder: "asc" },
    });

    if (channels.length === 0) {
      return NextResponse.json({
        channels: [],
        count: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Fetch fresh data for each channel and update stats
    const channelsWithData = await Promise.all(
      channels.map(async (channel) => {
        const updatedStats = await updateChannelStats(channel);
        return {
          id: channel.id,
          platform: channel.platform,
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelUrl: channel.channelUrl,
          stats: updatedStats,
        };
      })
    );

    const response = NextResponse.json({
      channels: channelsWithData,
      count: channelsWithData.length,
      lastUpdated: new Date().toISOString(),
    });

    // Cache for 5 minutes to reduce API calls and load
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=150"
    );

    return response;
  } catch (error) {
    console.error("Error fetching public social media data:", error);
    return NextResponse.json(
      { error: "Internal server error", channels: [], count: 0 },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS (handled centrally via next.config.ts headers)
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Helper function to update channel stats with fresh data
async function updateChannelStats(channel: {
  id: string;
  platform: string;
  channelId: string;
  channelName: string | null;
  channelUrl: string | null;
  stats: Array<{
    id: string;
    statType: string;
    displayName: string;
    value: string | null;
    lastUpdated: Date | null;
  }>;
}) {
  const now = new Date();
  const updatedStats = [];

  for (const stat of channel.stats) {
    let newValue = stat.value;
    let shouldUpdate = false;

    // Check if stat needs updating (older than 10 minutes)
    if (
      !stat.lastUpdated ||
      now.getTime() - stat.lastUpdated.getTime() > 10 * 60 * 1000
    ) {
      shouldUpdate = true;
    }

    if (shouldUpdate && channel.platform === "YOUTUBE") {
      try {
        const channelStats = await youtubeService.getChannelStats(
          channel.channelId
        );
        if (channelStats) {
          switch (stat.statType) {
            case "YOUTUBE_SUBSCRIBERS":
              newValue = formatNumber(parseInt(channelStats.subscriberCount));
              break;
            case "YOUTUBE_TOTAL_VIEWS":
              newValue = formatNumber(parseInt(channelStats.totalViews));
              break;
            case "YOUTUBE_VIDEO_COUNT":
              newValue = formatNumber(parseInt(channelStats.videoCount));
              break;
            case "YOUTUBE_THUMBNAIL":
              newValue = channelStats.thumbnailUrl;
              break;
            case "YOUTUBE_DESCRIPTION":
              newValue = channelStats.description || "";
              break;
            case "CHANNEL_NAME":
              newValue = channelStats.channelName;
              break;
            case "PLATFORM_URL":
              newValue = channelStats.channelUrl;
              break;
          }

          // Update the stat in database
          if (newValue !== stat.value) {
            await prisma.socialMediaChannelStat.update({
              where: { id: stat.id },
              data: {
                value: newValue,
                lastUpdated: now,
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `Error updating stat ${stat.statType} for channel ${channel.id}:`,
          error
        );
        // Use cached value if API fails
        newValue = stat.value;
      }
    }

    updatedStats.push({
      type: stat.statType,
      displayName: stat.displayName,
      value: newValue,
      lastUpdated: shouldUpdate
        ? now.toISOString()
        : stat.lastUpdated?.toISOString(),
    });
  }

  return updatedStats;
}

// Helper function to format numbers for display
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
