"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Youtube,
  Twitch,
  Instagram,
  Twitter,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
// Use the site type from useCurrentSite hook instead of the full Site type
type SiteFromHook = {
  id: string;
  name: string;
  domain: string | null;
  createdAt: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
  }>;
  mediaFiles: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
  }>;
  features: Array<{
    id: string;
    feature: string;
    displayName: string;
    description: string | null;
    isEnabled: boolean;
    config: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>;
  _count: {
    pages: number;
    blogPosts: number;
    mediaFiles: number;
    users: number;
  };
};

type SocialMediaChannel = {
  id: string;
  platform: string;
  channelId: string;
  channelName: string | null;
  channelUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  stats: Array<{
    id: string;
    statType: string;
    displayName: string;
    isEnabled: boolean;
    value: string | null;
    lastUpdated: Date | null;
  }>;
};

type SocialMediaManagerProps = {
  site: SiteFromHook;
};

const PLATFORM_INFO = {
  YOUTUBE: {
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-500",
    placeholder: "UCxxx... or channel URL",
    helpText: "Enter YouTube channel ID or full channel URL",
  },
  TWITCH: {
    name: "Twitch",
    icon: Twitch,
    color: "bg-purple-500",
    placeholder: "username",
    helpText: "Enter Twitch username",
  },
  INSTAGRAM: {
    name: "Instagram",
    icon: Instagram,
    color: "bg-pink-500",
    placeholder: "username",
    helpText: "Enter Instagram username",
  },
  TWITTER: {
    name: "Twitter",
    icon: Twitter,
    color: "bg-blue-500",
    placeholder: "username",
    helpText: "Enter Twitter username",
  },
};

const AVAILABLE_STATS = {
  YOUTUBE: [
    { type: "YOUTUBE_SUBSCRIBERS", name: "Subscribers" },
    { type: "YOUTUBE_TOTAL_VIEWS", name: "Total Views" },
    { type: "YOUTUBE_VIDEO_COUNT", name: "Video Count" },
    { type: "YOUTUBE_THUMBNAIL", name: "Channel Thumbnail" },
    { type: "YOUTUBE_DESCRIPTION", name: "Channel Description" },
    { type: "CHANNEL_NAME", name: "Channel Name" },
    { type: "PLATFORM_URL", name: "Channel URL" },
  ],
  TWITCH: [
    { type: "TWITCH_FOLLOWERS", name: "Followers" },
    { type: "TWITCH_TOTAL_VIEWS", name: "Total Views" },
    { type: "CHANNEL_NAME", name: "Channel Name" },
    { type: "PLATFORM_URL", name: "Channel URL" },
  ],
  DEFAULT: [
    { type: "CHANNEL_NAME", name: "Channel Name" },
    { type: "PLATFORM_URL", name: "Channel URL" },
  ],
};

export function SocialMediaManager({ site }: SocialMediaManagerProps) {
  const [channels, setChannels] = useState<SocialMediaChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [channelInput, setChannelInput] = useState("");
  const [selectedStats, setSelectedStats] = useState<string[]>([]);
  const [addingChannel, setAddingChannel] = useState(false);
  const [error, setError] = useState<string>("");

  // Check if social media feature is enabled
  const isFeatureEnabled = site.features.some(
    (feature) =>
      feature.feature === "SOCIAL_MEDIA_INTEGRATION" && feature.isEnabled
  );

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sites/${site.id}/social-media`);
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error("Failed to fetch social media channels:", error);
    } finally {
      setLoading(false);
    }
  }, [site.id]);

  useEffect(() => {
    if (isFeatureEnabled) {
      fetchChannels();
    } else {
      setLoading(false);
    }
  }, [isFeatureEnabled, fetchChannels]);

  const handleAddChannel = async () => {
    if (!selectedPlatform || !channelInput.trim()) {
      setError("Please select a platform and enter a channel ID");
      return;
    }

    try {
      setAddingChannel(true);
      setError("");

      const response = await fetch(`/api/sites/${site.id}/social-media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          channelId: channelInput.trim(),
          enabledStats: selectedStats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add channel");
      }

      await fetchChannels();
      setAddChannelModalOpen(false);
      setSelectedPlatform("");
      setChannelInput("");
      setSelectedStats([]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add channel"
      );
    } finally {
      setAddingChannel(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;

    try {
      const response = await fetch(
        `/api/sites/${site.id}/social-media/${channelId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchChannels();
      }
    } catch (error) {
      console.error("Failed to delete channel:", error);
    }
  };

  const handleToggleChannel = async (channelId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `/api/sites/${site.id}/social-media/${channelId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (response.ok) {
        await fetchChannels();
      }
    } catch (error) {
      console.error("Failed to toggle channel:", error);
    }
  };

  const handleToggleStat = async (
    channelId: string,
    statId: string,
    isEnabled: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/sites/${site.id}/social-media/${channelId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stats: [{ id: statId, isEnabled: !isEnabled }],
          }),
        }
      );

      if (response.ok) {
        await fetchChannels();
      }
    } catch (error) {
      console.error("Failed to toggle stat:", error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO];
    if (!info) return Settings;
    return info.icon;
  };

  const getPlatformColor = (platform: string) => {
    const info = PLATFORM_INFO[platform as keyof typeof PLATFORM_INFO];
    return info?.color || "bg-gray-500";
  };

  const getAvailableStats = (platform: string) => {
    return (
      AVAILABLE_STATS[platform as keyof typeof AVAILABLE_STATS] ||
      AVAILABLE_STATS.DEFAULT
    );
  };

  if (!isFeatureEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Social Media Integration
          </CardTitle>
          <CardDescription>
            Social media integration is not enabled for this site.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading social media channels...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Social Media Integration ({channels.length})
            </CardTitle>
            <CardDescription>
              Manage social media channels and their public stats
            </CardDescription>
          </div>
          <Dialog
            open={addChannelModalOpen}
            onOpenChange={setAddChannelModalOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Social Media Channel</DialogTitle>
                <DialogDescription>
                  Connect a new social media channel to display stats publicly
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                        const Icon = info.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {info.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlatform && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="channelInput">Channel ID/URL</Label>
                      <Input
                        id="channelInput"
                        placeholder={
                          PLATFORM_INFO[
                            selectedPlatform as keyof typeof PLATFORM_INFO
                          ]?.placeholder
                        }
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {
                          PLATFORM_INFO[
                            selectedPlatform as keyof typeof PLATFORM_INFO
                          ]?.helpText
                        }
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Available Stats</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="select-all-stats"
                            checked={(() => {
                              const availableStats =
                                getAvailableStats(selectedPlatform);
                              return (
                                availableStats.length > 0 &&
                                availableStats.every((stat) =>
                                  selectedStats.includes(stat.type)
                                )
                              );
                            })()}
                            ref={(el) => {
                              if (el) {
                                const availableStats =
                                  getAvailableStats(selectedPlatform);
                                const selectedCount = availableStats.filter(
                                  (stat) => selectedStats.includes(stat.type)
                                ).length;
                                el.indeterminate =
                                  selectedCount > 0 &&
                                  selectedCount < availableStats.length;
                              }
                            }}
                            onChange={(e) => {
                              const availableStats =
                                getAvailableStats(selectedPlatform);
                              if (e.target.checked) {
                                // Select all stats
                                const allStatTypes = availableStats.map(
                                  (stat) => stat.type
                                );
                                setSelectedStats(allStatTypes);
                              } else {
                                // Deselect all stats
                                setSelectedStats([]);
                              }
                            }}
                            className="rounded"
                          />
                          <Label
                            htmlFor="select-all-stats"
                            className="text-sm font-medium"
                          >
                            Select All
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {getAvailableStats(selectedPlatform).map((stat) => (
                          <div
                            key={stat.type}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={stat.type}
                              checked={selectedStats.includes(stat.type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStats([
                                    ...selectedStats,
                                    stat.type,
                                  ]);
                                } else {
                                  setSelectedStats(
                                    selectedStats.filter((s) => s !== stat.type)
                                  );
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={stat.type} className="text-sm">
                              {stat.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddChannelModalOpen(false);
                      setError("");
                    }}
                    disabled={addingChannel}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddChannel}
                    disabled={
                      !selectedPlatform || !channelInput.trim() || addingChannel
                    }
                  >
                    {addingChannel ? "Adding..." : "Add Channel"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {channels.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No social media channels added yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => {
              const Icon = getPlatformIcon(channel.platform);
              const platformColor = getPlatformColor(channel.platform);

              return (
                <div key={channel.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platformColor}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {channel.channelName || channel.channelId}
                          {channel.channelUrl && (
                            <a
                              href={channel.channelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {channel.platform} •{" "}
                          {channel.stats.filter((s) => s.isEnabled).length}{" "}
                          stats enabled
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={channel.isActive ? "default" : "secondary"}
                      >
                        {channel.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleChannel(channel.id, channel.isActive)
                        }
                      >
                        {channel.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Stats Configuration:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {channel.stats.map((stat) => (
                        <div
                          key={stat.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm">{stat.displayName}</span>
                          <Switch
                            checked={stat.isEnabled}
                            onCheckedChange={() =>
                              handleToggleStat(
                                channel.id,
                                stat.id,
                                stat.isEnabled
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
