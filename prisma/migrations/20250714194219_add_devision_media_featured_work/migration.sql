-- CreateTable
CREATE TABLE "devision_media_featured_work" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isVideo" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "videoUrl" TEXT,
    "clientName" TEXT,
    "projectDate" TIMESTAMP(3),
    "tags" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devision_media_featured_work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devision_media_featured_work_category_idx" ON "devision_media_featured_work"("category");

-- CreateIndex
CREATE INDEX "devision_media_featured_work_isFeatured_idx" ON "devision_media_featured_work"("isFeatured");

-- CreateIndex
CREATE INDEX "devision_media_featured_work_projectDate_idx" ON "devision_media_featured_work"("projectDate");

-- CreateIndex
CREATE INDEX "devision_media_featured_work_sortOrder_idx" ON "devision_media_featured_work"("sortOrder");
