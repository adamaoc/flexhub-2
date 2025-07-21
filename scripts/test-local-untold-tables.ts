import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testLocalAndUntoldTables() {
  try {
    console.log("🧪 Testing Local and Untold tables...\n");

    // Test 1: Create a business
    console.log("1. Creating a test business...");
    const business = await prisma.localAndUntoldBusiness.create({
      data: {
        name: "Test Coffee Shop",
        slug: "test-coffee-shop",
        ownerName: "John Doe",
        location: "Downtown Dallas",
        industry: "Food & Beverage",
        description: "A cozy coffee shop in the heart of downtown",
        websiteUrl: "https://testcoffee.com",
        phone: "214-555-0123",
        email: "john@testcoffee.com",
        address: "123 Main St, Dallas, TX 75201",
        status: "ACTIVE",
      },
    });
    console.log("✅ Business created:", business.name);

    // Test 2: Create a tag
    console.log("\n2. Creating a test tag...");
    const tag = await prisma.localAndUntoldTag.create({
      data: {
        name: "Local Business",
        slug: "local-business",
        description: "Stories about local businesses",
      },
    });
    console.log("✅ Tag created:", tag.name);

    // Test 3: Create a story
    console.log("\n3. Creating a test story...");
    const story = await prisma.localAndUntoldStory.create({
      data: {
        title: "The Story of Test Coffee Shop",
        slug: "story-of-test-coffee-shop",
        excerpt:
          "Discover how this local coffee shop became a community favorite",
        content: "This is the full story content about the coffee shop...",
        businessId: business.id,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    console.log("✅ Story created:", story.title);

    // Test 4: Link story to tag
    console.log("\n4. Linking story to tag...");
    const storyTag = await prisma.localAndUntoldStoryTag.create({
      data: {
        storyId: story.id,
        tagId: tag.id,
      },
    });
    console.log("✅ Story linked to tag");

    // Test 5: Create a media file
    console.log("\n5. Creating a test media file...");
    const mediaFile = await prisma.localAndUntoldMediaFile.create({
      data: {
        filename: "coffee-shop-interior.jpg",
        originalFilename: "interior.jpg",
        filePath: "/uploads/coffee-shop-interior.jpg",
        fileSize: 1024000, // 1MB
        mimeType: "image/jpeg",
        fileType: "IMAGE",
        width: 1920,
        height: 1080,
        altText: "Interior of the coffee shop",
        caption: "The cozy interior of Test Coffee Shop",
        usedInStoryId: story.id,
      },
    });
    console.log("✅ Media file created:", mediaFile.filename);

    // Test 6: Create a calendar event
    console.log("\n6. Creating a test calendar event...");
    const calendarEvent = await prisma.localAndUntoldCalendarEvent.create({
      data: {
        title: "Coffee Shop Interview",
        description: "Interview with the owner of Test Coffee Shop",
        eventType: "INTERVIEW",
        startDate: new Date("2024-01-15T10:00:00Z"),
        endDate: new Date("2024-01-15T11:00:00Z"),
        location: "Test Coffee Shop",
        attendees: ["John Doe", "Interviewer"],
        storyId: story.id,
        businessId: business.id,
        status: "SCHEDULED",
      },
    });
    console.log("✅ Calendar event created:", calendarEvent.title);

    // Test 7: Create analytics entry
    console.log("\n7. Creating a test analytics entry...");
    const analytics = await prisma.localAndUntoldAnalytics.create({
      data: {
        pageUrl: "/stories/story-of-test-coffee-shop",
        pageTitle: "The Story of Test Coffee Shop",
        visitorIp: "192.168.1.1",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "test-session-123",
        pageViews: 1,
        timeOnPage: 120,
        bounce: false,
        deviceType: "DESKTOP",
        browser: "Chrome",
        os: "Windows",
        country: "US",
        city: "Dallas",
      },
    });
    console.log("✅ Analytics entry created");

    // Test 8: Create a page view
    console.log("\n8. Creating a test page view...");
    const pageView = await prisma.localAndUntoldPageView.create({
      data: {
        storyId: story.id,
        pageUrl: "/stories/story-of-test-coffee-shop",
        visitorIp: "192.168.1.1",
        sessionId: "test-session-123",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timeSpent: 120,
      },
    });
    console.log("✅ Page view created");

    // Test 9: Create a site setting
    console.log("\n9. Creating a test site setting...");
    const siteSetting = await prisma.localAndUntoldSiteSetting.create({
      data: {
        settingKey: "site_title",
        settingValue: "Local and Untold",
        settingType: "STRING",
        description: "The main title of the website",
        isPublic: true,
      },
    });
    console.log("✅ Site setting created:", siteSetting.settingKey);

    // Test 10: Query relationships
    console.log("\n10. Testing relationships...");
    const storyWithRelations = await prisma.localAndUntoldStory.findUnique({
      where: { id: story.id },
      include: {
        business: true,
        tags: {
          include: {
            tag: true,
          },
        },
        mediaFiles: true,
        calendarEvents: true,
      },
    });
    console.log("✅ Story with relationships retrieved");
    console.log("   - Business:", storyWithRelations?.business?.name);
    console.log(
      "   - Tags:",
      storyWithRelations?.tags.map((st) => st.tag.name).join(", ")
    );
    console.log("   - Media files:", storyWithRelations?.mediaFiles.length);
    console.log(
      "   - Calendar events:",
      storyWithRelations?.calendarEvents.length
    );

    console.log(
      "\n🎉 All tests passed! Local and Untold tables are working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalAndUntoldTables();
