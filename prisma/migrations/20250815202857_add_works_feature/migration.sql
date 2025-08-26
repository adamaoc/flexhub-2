-- CreateEnum
CREATE TYPE "WorkCategory" AS ENUM ('WEBSITE', 'VIDEO', 'CLI_TOOL', 'SEO', 'SOCIAL_MEDIA', 'ADVERTISING', 'DESIGN', 'CONSULTING');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('WORK', 'WEBSITE');

-- AlterEnum
ALTER TYPE "FeatureType" ADD VALUE 'WORKS';

-- CreateTable
CREATE TABLE "works" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "WorkCategory" NOT NULL,
    "image" TEXT,
    "description" TEXT NOT NULL,
    "type" "WorkType" NOT NULL DEFAULT 'WORK',
    "date" TIMESTAMP(3) NOT NULL,
    "client" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "technologies" TEXT[],
    "duration" TEXT,
    "results" TEXT,
    "githubUrl" TEXT,
    "videoUrl" TEXT,
    "url" TEXT,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
