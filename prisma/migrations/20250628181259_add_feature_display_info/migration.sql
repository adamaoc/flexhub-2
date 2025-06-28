/*
  Warnings:

  - Added the required column `displayName` to the `site_features` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable: First add columns as nullable
ALTER TABLE "site_features" ADD COLUMN "description" TEXT,
ADD COLUMN "displayName" TEXT;

-- Update existing records with display names and descriptions
UPDATE "site_features" SET 
  "displayName" = 'Pages',
  "description" = 'Create and manage static pages'
WHERE "feature" = 'PAGES';

UPDATE "site_features" SET 
  "displayName" = 'Blog Posts',
  "description" = 'Publish and manage blog content'
WHERE "feature" = 'BLOG_POSTS';

UPDATE "site_features" SET 
  "displayName" = 'Media Files',
  "description" = 'Upload and manage media files'
WHERE "feature" = 'MEDIA_FILES';

UPDATE "site_features" SET 
  "displayName" = 'Email Management',
  "description" = 'Manage email campaigns and templates'
WHERE "feature" = 'EMAIL_MANAGEMENT';

UPDATE "site_features" SET 
  "displayName" = 'Contact Management',
  "description" = 'Manage contact forms and inquiries'
WHERE "feature" = 'CONTACT_MANAGEMENT';

UPDATE "site_features" SET 
  "displayName" = 'Sponsors',
  "description" = 'Manage sponsor relationships and content'
WHERE "feature" = 'SPONSORS';

UPDATE "site_features" SET 
  "displayName" = 'Online Store',
  "description" = 'E-commerce functionality'
WHERE "feature" = 'ONLINE_STORE';

UPDATE "site_features" SET 
  "displayName" = 'Newsletter',
  "description" = 'Newsletter subscription and management'
WHERE "feature" = 'NEWSLETTER';

UPDATE "site_features" SET 
  "displayName" = 'Analytics',
  "description" = 'Site analytics and reporting'
WHERE "feature" = 'ANALYTICS';

UPDATE "site_features" SET 
  "displayName" = 'SEO Tools',
  "description" = 'Search engine optimization tools'
WHERE "feature" = 'SEO_TOOLS';

UPDATE "site_features" SET 
  "displayName" = 'Social Media Integration',
  "description" = 'Connect with social media platforms'
WHERE "feature" = 'SOCIAL_MEDIA_INTEGRATION';

UPDATE "site_features" SET 
  "displayName" = 'Multi Language',
  "description" = 'Multi-language content support'
WHERE "feature" = 'MULTI_LANGUAGE';

UPDATE "site_features" SET 
  "displayName" = 'Custom Forms',
  "description" = 'Create custom forms and surveys'
WHERE "feature" = 'CUSTOM_FORMS';

UPDATE "site_features" SET 
  "displayName" = 'Member Area',
  "description" = 'Member-only content and features'
WHERE "feature" = 'MEMBER_AREA';

UPDATE "site_features" SET 
  "displayName" = 'Event Management',
  "description" = 'Manage events and registrations'
WHERE "feature" = 'EVENT_MANAGEMENT';

-- Finally, make displayName NOT NULL
ALTER TABLE "site_features" ALTER COLUMN "displayName" SET NOT NULL;
