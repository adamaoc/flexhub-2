-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('PAGES', 'BLOG_POSTS', 'MEDIA_FILES', 'EMAIL_MANAGEMENT', 'CONTACT_MANAGEMENT', 'SPONSORS', 'ONLINE_STORE', 'NEWSLETTER', 'ANALYTICS', 'SEO_TOOLS', 'SOCIAL_MEDIA_INTEGRATION', 'MULTI_LANGUAGE', 'CUSTOM_FORMS', 'MEMBER_AREA', 'EVENT_MANAGEMENT');

-- CreateTable
CREATE TABLE "site_features" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "feature" "FeatureType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_features_siteId_feature_key" ON "site_features"("siteId", "feature");

-- AddForeignKey
ALTER TABLE "site_features" ADD CONSTRAINT "site_features_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE; 