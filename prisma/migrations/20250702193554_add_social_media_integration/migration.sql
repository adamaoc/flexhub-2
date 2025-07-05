-- CreateEnum
CREATE TYPE "SocialMediaPlatform" AS ENUM ('YOUTUBE', 'TWITCH', 'INSTAGRAM', 'TWITTER', 'TIKTOK', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "SocialMediaStatType" AS ENUM ('YOUTUBE_SUBSCRIBERS', 'YOUTUBE_TOTAL_VIEWS', 'YOUTUBE_VIDEO_COUNT', 'YOUTUBE_AVERAGE_VIEWS', 'YOUTUBE_RECENT_VIDEOS', 'TWITCH_FOLLOWERS', 'TWITCH_TOTAL_VIEWS', 'TWITCH_RECENT_STREAMS', 'TWITCH_AVERAGE_VIEWERS', 'TWITCH_SUBSCRIBER_COUNT', 'PLATFORM_URL', 'CHANNEL_NAME', 'LAST_UPDATED');

-- CreateTable
CREATE TABLE "social_media_channels" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "platform" "SocialMediaPlatform" NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelName" TEXT,
    "channelUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_channel_stats" (
    "id" TEXT NOT NULL,
    "socialMediaChannelId" TEXT NOT NULL,
    "statType" "SocialMediaStatType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "value" TEXT,
    "lastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_channel_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_media_channels_siteId_platform_channelId_key" ON "social_media_channels"("siteId", "platform", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_channel_stats_socialMediaChannelId_statType_key" ON "social_media_channel_stats"("socialMediaChannelId", "statType");

-- AddForeignKey
ALTER TABLE "social_media_channels" ADD CONSTRAINT "social_media_channels_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_channel_stats" ADD CONSTRAINT "social_media_channel_stats_socialMediaChannelId_fkey" FOREIGN KEY ("socialMediaChannelId") REFERENCES "social_media_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
