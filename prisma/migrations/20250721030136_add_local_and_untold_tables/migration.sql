-- CreateEnum
CREATE TYPE "LocalAndUntoldBusinessStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "LocalAndUntoldStoryStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LocalAndUntoldMediaFileType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO');

-- CreateEnum
CREATE TYPE "LocalAndUntoldDeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET');

-- CreateEnum
CREATE TYPE "LocalAndUntoldEventType" AS ENUM ('PUBLICATION', 'INTERVIEW', 'REVIEW', 'MEDIA', 'MAINTENANCE', 'REPORT');

-- CreateEnum
CREATE TYPE "LocalAndUntoldEventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LocalAndUntoldSettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateTable
CREATE TABLE "local_and_untold_businesses" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "ownerName" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "websiteUrl" VARCHAR(500),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "coordinates" TEXT,
    "status" "LocalAndUntoldBusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "featuredImageUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_and_untold_businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_stories" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "businessId" TEXT,
    "status" "LocalAndUntoldStoryStatus" NOT NULL DEFAULT 'DRAFT',
    "featuredImageUrl" VARCHAR(500),
    "youtubeVideoId" VARCHAR(20),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_and_untold_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_and_untold_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_story_tags" (
    "storyId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "local_and_untold_story_tags_pkey" PRIMARY KEY ("storyId","tagId")
);

-- CreateTable
CREATE TABLE "local_and_untold_media_files" (
    "id" TEXT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileType" "LocalAndUntoldMediaFileType" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "altText" VARCHAR(255),
    "caption" TEXT,
    "usedInStoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_and_untold_media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_analytics" (
    "id" TEXT NOT NULL,
    "pageUrl" VARCHAR(500) NOT NULL,
    "pageTitle" VARCHAR(255),
    "visitorIp" VARCHAR(45),
    "userAgent" TEXT,
    "referrer" VARCHAR(500),
    "sessionId" VARCHAR(255),
    "pageViews" INTEGER NOT NULL DEFAULT 1,
    "timeOnPage" INTEGER,
    "bounce" BOOLEAN NOT NULL DEFAULT false,
    "deviceType" "LocalAndUntoldDeviceType",
    "browser" VARCHAR(50),
    "os" VARCHAR(50),
    "country" VARCHAR(2),
    "city" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_and_untold_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_page_views" (
    "id" TEXT NOT NULL,
    "storyId" TEXT,
    "pageUrl" VARCHAR(500) NOT NULL,
    "visitorIp" VARCHAR(45),
    "sessionId" VARCHAR(255),
    "userAgent" TEXT,
    "referrer" VARCHAR(500),
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_and_untold_page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_calendar_events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "eventType" "LocalAndUntoldEventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "location" VARCHAR(255),
    "attendees" TEXT[],
    "storyId" TEXT,
    "businessId" TEXT,
    "status" "LocalAndUntoldEventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_and_untold_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_and_untold_site_settings" (
    "id" TEXT NOT NULL,
    "settingKey" VARCHAR(100) NOT NULL,
    "settingValue" TEXT,
    "settingType" "LocalAndUntoldSettingType" NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_and_untold_site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "local_and_untold_businesses_slug_key" ON "local_and_untold_businesses"("slug");

-- CreateIndex
CREATE INDEX "local_and_untold_businesses_status_idx" ON "local_and_untold_businesses"("status");

-- CreateIndex
CREATE INDEX "local_and_untold_businesses_industry_idx" ON "local_and_untold_businesses"("industry");

-- CreateIndex
CREATE INDEX "local_and_untold_businesses_location_idx" ON "local_and_untold_businesses"("location");

-- CreateIndex
CREATE INDEX "local_and_untold_businesses_slug_idx" ON "local_and_untold_businesses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "local_and_untold_stories_slug_key" ON "local_and_untold_stories"("slug");

-- CreateIndex
CREATE INDEX "local_and_untold_stories_status_idx" ON "local_and_untold_stories"("status");

-- CreateIndex
CREATE INDEX "local_and_untold_stories_publishedAt_idx" ON "local_and_untold_stories"("publishedAt");

-- CreateIndex
CREATE INDEX "local_and_untold_stories_businessId_idx" ON "local_and_untold_stories"("businessId");

-- CreateIndex
CREATE INDEX "local_and_untold_stories_slug_idx" ON "local_and_untold_stories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "local_and_untold_tags_name_key" ON "local_and_untold_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "local_and_untold_tags_slug_key" ON "local_and_untold_tags"("slug");

-- CreateIndex
CREATE INDEX "local_and_untold_tags_slug_idx" ON "local_and_untold_tags"("slug");

-- CreateIndex
CREATE INDEX "local_and_untold_media_files_fileType_idx" ON "local_and_untold_media_files"("fileType");

-- CreateIndex
CREATE INDEX "local_and_untold_media_files_usedInStoryId_idx" ON "local_and_untold_media_files"("usedInStoryId");

-- CreateIndex
CREATE INDEX "local_and_untold_analytics_createdAt_idx" ON "local_and_untold_analytics"("createdAt");

-- CreateIndex
CREATE INDEX "local_and_untold_analytics_pageUrl_idx" ON "local_and_untold_analytics"("pageUrl");

-- CreateIndex
CREATE INDEX "local_and_untold_analytics_sessionId_idx" ON "local_and_untold_analytics"("sessionId");

-- CreateIndex
CREATE INDEX "local_and_untold_page_views_storyId_idx" ON "local_and_untold_page_views"("storyId");

-- CreateIndex
CREATE INDEX "local_and_untold_page_views_createdAt_idx" ON "local_and_untold_page_views"("createdAt");

-- CreateIndex
CREATE INDEX "local_and_untold_calendar_events_startDate_idx" ON "local_and_untold_calendar_events"("startDate");

-- CreateIndex
CREATE INDEX "local_and_untold_calendar_events_eventType_idx" ON "local_and_untold_calendar_events"("eventType");

-- CreateIndex
CREATE INDEX "local_and_untold_calendar_events_status_idx" ON "local_and_untold_calendar_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "local_and_untold_site_settings_settingKey_key" ON "local_and_untold_site_settings"("settingKey");

-- AddForeignKey
ALTER TABLE "local_and_untold_stories" ADD CONSTRAINT "local_and_untold_stories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "local_and_untold_businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_and_untold_story_tags" ADD CONSTRAINT "local_and_untold_story_tags_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "local_and_untold_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_and_untold_story_tags" ADD CONSTRAINT "local_and_untold_story_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "local_and_untold_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_and_untold_media_files" ADD CONSTRAINT "local_and_untold_media_files_usedInStoryId_fkey" FOREIGN KEY ("usedInStoryId") REFERENCES "local_and_untold_stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_and_untold_page_views" ADD CONSTRAINT "local_and_untold_page_views_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "local_and_untold_stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_and_untold_calendar_events" ADD CONSTRAINT "local_and_untold_calendar_events_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "local_and_untold_stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_and_untold_calendar_events" ADD CONSTRAINT "local_and_untold_calendar_events_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "local_and_untold_businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
