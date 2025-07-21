import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyLocalAndUntoldData() {
  try {
    console.log("🔍 Verifying Local and Untold platform data...\n");

    // Get all businesses
    const businesses = await prisma.localAndUntoldBusiness.findMany({
      include: {
        stories: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
            mediaFiles: true,
          },
        },
      },
    });

    console.log("📊 BUSINESSES:");
    businesses.forEach((business, index) => {
      console.log(`\n${index + 1}. ${business.name}`);
      console.log(`   Owner: ${business.ownerName}`);
      console.log(`   Location: ${business.location}`);
      console.log(`   Industry: ${business.industry}`);
      console.log(`   Status: ${business.status}`);
      console.log(`   Stories: ${business.stories.length}`);

      business.stories.forEach((story, storyIndex) => {
        console.log(`   \n   Story ${storyIndex + 1}: ${story.title}`);
        console.log(`   Status: ${story.status}`);
        console.log(
          `   Published: ${
            story.publishedAt?.toLocaleDateString() || "Not published"
          }`
        );
        console.log(
          `   Tags: ${story.tags.map((st) => st.tag.name).join(", ")}`
        );
        console.log(`   Media Files: ${story.mediaFiles.length}`);
      });
    });

    // Get all tags
    const tags = await prisma.localAndUntoldTag.findMany({
      include: {
        stories: {
          include: {
            story: true,
          },
        },
      },
    });

    console.log("\n\n🏷️ TAGS:");
    tags.forEach((tag, index) => {
      console.log(`\n${index + 1}. ${tag.name}`);
      console.log(`   Slug: ${tag.slug}`);
      console.log(`   Description: ${tag.description}`);
      console.log(`   Stories: ${tag.stories.length}`);
    });

    // Get all stories with full details
    const stories = await prisma.localAndUntoldStory.findMany({
      include: {
        business: true,
        tags: {
          include: {
            tag: true,
          },
        },
        mediaFiles: true,
        pageViews: true,
      },
    });

    console.log("\n\n📖 STORIES:");
    stories.forEach((story, index) => {
      console.log(`\n${index + 1}. ${story.title}`);
      console.log(`   Slug: ${story.slug}`);
      console.log(`   Business: ${story.business?.name || "No business"}`);
      console.log(`   Status: ${story.status}`);
      console.log(
        `   Published: ${
          story.publishedAt?.toLocaleDateString() || "Not published"
        }`
      );
      console.log(`   Tags: ${story.tags.map((st) => st.tag.name).join(", ")}`);
      console.log(`   Media Files: ${story.mediaFiles.length}`);
      console.log(`   Page Views: ${story.pageViews.length}`);
      console.log(`   Excerpt: ${story.excerpt.substring(0, 100)}...`);
    });

    // Get site settings
    const siteSettings = await prisma.localAndUntoldSiteSetting.findMany();

    console.log("\n\n⚙️ SITE SETTINGS:");
    siteSettings.forEach((setting, index) => {
      console.log(`\n${index + 1}. ${setting.settingKey}`);
      console.log(`   Value: ${setting.settingValue}`);
      console.log(`   Type: ${setting.settingType}`);
      console.log(`   Public: ${setting.isPublic}`);
      console.log(`   Description: ${setting.description}`);
    });

    // Get analytics summary
    const analyticsCount = await prisma.localAndUntoldAnalytics.count();
    const pageViewsCount = await prisma.localAndUntoldPageView.count();

    console.log("\n\n📈 ANALYTICS SUMMARY:");
    console.log(`   Total Analytics Entries: ${analyticsCount}`);
    console.log(`   Total Page Views: ${pageViewsCount}`);

    // Get media files summary
    const mediaFiles = await prisma.localAndUntoldMediaFile.findMany();
    const mediaByType = mediaFiles.reduce((acc, file) => {
      acc[file.fileType] = (acc[file.fileType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n\n📁 MEDIA FILES:");
    console.log(`   Total Files: ${mediaFiles.length}`);
    Object.entries(mediaByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log("\n✅ Data verification complete!");
    console.log("\nThe Local and Untold platform is ready with sample data.");
  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLocalAndUntoldData();
