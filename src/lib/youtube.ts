export interface YouTubeChannelStats {
  channelId: string;
  channelName: string;
  subscriberCount: string;
  totalViews: string;
  videoCount: string;
  thumbnailUrl: string;
  channelUrl: string;
  customUrl?: string;
  description?: string;
  publishedAt: string;
}

export interface YouTubeVideoStats {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
}

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get channel statistics for a YouTube channel
   */
  async getChannelStats(
    channelId: string
  ): Promise<YouTubeChannelStats | null> {
    try {
      const url = `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const channel = data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;

      console.log({ "youtubeData channel": channel });
      console.log({ "youtubeData snippet": snippet });
      console.log({ "youtubeData statistics": statistics });

      return {
        channelId: channel.id,
        channelName: snippet.title,
        subscriberCount: statistics.subscriberCount || "0",
        totalViews: statistics.viewCount || "0",
        videoCount: statistics.videoCount || "0",
        thumbnailUrl: snippet.thumbnails?.default?.url || "",
        channelUrl: `https://www.youtube.com/channel/${channel.id}`,
        customUrl: snippet.customUrl,
        description: snippet.description,
        publishedAt: snippet.publishedAt,
      };
    } catch (error) {
      console.error("Error fetching YouTube channel stats:", error);
      return null;
    }
  }

  /**
   * Get recent videos from a channel
   */
  async getRecentVideos(
    channelId: string,
    maxResults: number = 5
  ): Promise<YouTubeVideoStats[]> {
    try {
      // First, get the uploads playlist ID
      const channelUrl = `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${this.apiKey}`;
      const channelResponse = await fetch(channelUrl);

      if (!channelResponse.ok) {
        throw new Error(`YouTube API error: ${channelResponse.status}`);
      }

      const channelData = await channelResponse.json();
      if (!channelData.items || channelData.items.length === 0) {
        return [];
      }

      const uploadsPlaylistId =
        channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // Get recent videos from uploads playlist
      const playlistUrl = `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`;
      const playlistResponse = await fetch(playlistUrl);

      if (!playlistResponse.ok) {
        throw new Error(`YouTube API error: ${playlistResponse.status}`);
      }

      const playlistData = await playlistResponse.json();

      if (!playlistData.items) {
        return [];
      }

      // Get detailed stats for each video
      const videoIds = playlistData.items
        .map(
          (item: { snippet: { resourceId: { videoId: string } } }) =>
            item.snippet.resourceId.videoId
        )
        .join(",");
      const videosUrl = `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`;
      const videosResponse = await fetch(videosUrl);

      if (!videosResponse.ok) {
        throw new Error(`YouTube API error: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();

      return videosData.items.map(
        (video: {
          id: string;
          snippet: {
            title: string;
            description: string;
            publishedAt: string;
            thumbnails?: { default?: { url: string } };
          };
          statistics: {
            viewCount?: string;
            likeCount?: string;
            commentCount?: string;
          };
          contentDetails: { duration: string };
        }) => ({
          videoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          publishedAt: video.snippet.publishedAt,
          thumbnailUrl: video.snippet.thumbnails?.default?.url || "",
          viewCount: video.statistics.viewCount || "0",
          likeCount: video.statistics.likeCount || "0",
          commentCount: video.statistics.commentCount || "0",
          duration: video.contentDetails.duration,
        })
      );
    } catch (error) {
      console.error("Error fetching YouTube recent videos:", error);
      return [];
    }
  }

  /**
   * Get channel ID from a channel URL
   */
  async getChannelIdFromUrl(channelUrl: string): Promise<string | null> {
    try {
      // Handle different YouTube URL formats
      let channelIdentifier = "";

      if (channelUrl.includes("/channel/")) {
        // Direct channel ID URL
        channelIdentifier = channelUrl.split("/channel/")[1].split("?")[0];
        return channelIdentifier;
      } else if (channelUrl.includes("/c/") || channelUrl.includes("/user/")) {
        // Custom URL or username - need to resolve
        const username = channelUrl.includes("/c/")
          ? channelUrl.split("/c/")[1].split("?")[0]
          : channelUrl.split("/user/")[1].split("?")[0];

        const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${username}&type=channel&maxResults=1&key=${this.apiKey}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
          return data.items[0].id.channelId;
        }
      } else if (channelUrl.includes("/@")) {
        // Handle new @username format
        const username = channelUrl.split("/@")[1].split("?")[0];
        const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${username}&type=channel&maxResults=1&key=${this.apiKey}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
          return data.items[0].id.channelId;
        }
      }

      return null;
    } catch (error) {
      console.error("Error resolving YouTube channel ID:", error);
      return null;
    }
  }

  /**
   * Validate if a channel ID exists and is accessible
   */
  async validateChannelId(channelId: string): Promise<boolean> {
    try {
      const stats = await this.getChannelStats(channelId);
      return stats !== null;
    } catch {
      return false;
    }
  }
}

// Create a singleton instance that can be used throughout the app
export const youtubeService = new YouTubeService(
  process.env.YOUTUBE_API_KEY || ""
);
