import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupTestData() {
  try {
    console.log("🧹 Cleaning up test data...\n");

    // Delete in reverse order to respect foreign key constraints
    await prisma.localAndUntoldPageView.deleteMany({
      where: {
        pageUrl: "/stories/story-of-test-coffee-shop",
      },
    });
    console.log("✅ Page views deleted");

    await prisma.localAndUntoldAnalytics.deleteMany({
      where: {
        pageUrl: "/stories/story-of-test-coffee-shop",
      },
    });
    console.log("✅ Analytics entries deleted");

    await prisma.localAndUntoldCalendarEvent.deleteMany({
      where: {
        title: "Coffee Shop Interview",
      },
    });
    console.log("✅ Calendar events deleted");

    await prisma.localAndUntoldMediaFile.deleteMany({
      where: {
        filename: "coffee-shop-interior.jpg",
      },
    });
    console.log("✅ Media files deleted");

    await prisma.localAndUntoldStoryTag.deleteMany({
      where: {
        story: {
          slug: "story-of-test-coffee-shop",
        },
      },
    });
    console.log("✅ Story tags deleted");

    await prisma.localAndUntoldStory.deleteMany({
      where: {
        slug: "story-of-test-coffee-shop",
      },
    });
    console.log("✅ Stories deleted");

    await prisma.localAndUntoldTag.deleteMany({
      where: {
        slug: "local-business",
      },
    });
    console.log("✅ Tags deleted");

    await prisma.localAndUntoldBusiness.deleteMany({
      where: {
        slug: "test-coffee-shop",
      },
    });
    console.log("✅ Businesses deleted");

    await prisma.localAndUntoldSiteSetting.deleteMany({
      where: {
        settingKey: "site_title",
      },
    });
    console.log("✅ Site settings deleted");

    console.log("\n✨ All test data cleaned up successfully!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();
