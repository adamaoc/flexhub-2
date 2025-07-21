import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedLocalAndUntoldDataUpsert() {
  try {
    console.log("🌱 Seeding Local and Untold platform data (with upsert)...\n");

    // Create multiple businesses using upsert
    console.log("1. Creating businesses...");
    const businesses = await Promise.all([
      prisma.localAndUntoldBusiness.upsert({
        where: { slug: "downtown-coffee-co" },
        update: {},
        create: {
          name: "Downtown Coffee Co.",
          slug: "downtown-coffee-co",
          ownerName: "Sarah Johnson",
          location: "Downtown Dallas",
          industry: "Food & Beverage",
          description:
            "A cozy coffee shop serving locally roasted beans and fresh pastries",
          websiteUrl: "https://downtowncoffee.com",
          phone: "214-555-0101",
          email: "sarah@downtowncoffee.com",
          address: "123 Main St, Dallas, TX 75201",
          status: "ACTIVE",
          featuredImageUrl: "/images/downtown-coffee.jpg",
        },
      }),
      prisma.localAndUntoldBusiness.upsert({
        where: { slug: "artisan-bakery" },
        update: {},
        create: {
          name: "Artisan Bakery",
          slug: "artisan-bakery",
          ownerName: "Michael Chen",
          location: "Deep Ellum",
          industry: "Food & Beverage",
          description:
            "Handcrafted breads and pastries made with traditional techniques",
          websiteUrl: "https://artisanbakery.com",
          phone: "214-555-0202",
          email: "michael@artisanbakery.com",
          address: "456 Elm St, Dallas, TX 75226",
          status: "ACTIVE",
          featuredImageUrl: "/images/artisan-bakery.jpg",
        },
      }),
      prisma.localAndUntoldBusiness.upsert({
        where: { slug: "vintage-vinyl-records" },
        update: {},
        create: {
          name: "Vintage Vinyl Records",
          slug: "vintage-vinyl-records",
          ownerName: "Lisa Rodriguez",
          location: "Oak Cliff",
          industry: "Entertainment",
          description:
            "Curated collection of vintage vinyl records and music memorabilia",
          websiteUrl: "https://vintagevinyl.com",
          phone: "214-555-0303",
          email: "lisa@vintagevinyl.com",
          address: "789 Oak St, Dallas, TX 75208",
          status: "ACTIVE",
          featuredImageUrl: "/images/vintage-vinyl.jpg",
        },
      }),
    ]);
    console.log(`✅ Created/Updated ${businesses.length} businesses`);

    // Create tags using upsert
    console.log("\n2. Creating tags...");
    const tags = await Promise.all([
      prisma.localAndUntoldTag.upsert({
        where: { slug: "local-business" },
        update: {},
        create: {
          name: "Local Business",
          slug: "local-business",
          description: "Stories about local businesses",
        },
      }),
      prisma.localAndUntoldTag.upsert({
        where: { slug: "food-drink" },
        update: {},
        create: {
          name: "Food & Drink",
          slug: "food-drink",
          description: "Stories about restaurants, cafes, and food businesses",
        },
      }),
      prisma.localAndUntoldTag.upsert({
        where: { slug: "entrepreneur" },
        update: {},
        create: {
          name: "Entrepreneur",
          slug: "entrepreneur",
          description: "Stories about entrepreneurs and business owners",
        },
      }),
      prisma.localAndUntoldTag.upsert({
        where: { slug: "community" },
        update: {},
        create: {
          name: "Community",
          slug: "community",
          description: "Stories about community impact and involvement",
        },
      }),
      prisma.localAndUntoldTag.upsert({
        where: { slug: "music" },
        update: {},
        create: {
          name: "Music",
          slug: "music",
          description: "Stories about music and entertainment businesses",
        },
      }),
    ]);
    console.log(`✅ Created/Updated ${tags.length} tags`);

    // Create stories using upsert
    console.log("\n3. Creating stories...");
    const stories = await Promise.all([
      prisma.localAndUntoldStory.upsert({
        where: { slug: "coffee-shop-community-hub" },
        update: {},
        create: {
          title: "The Coffee Shop That Became a Community Hub",
          slug: "coffee-shop-community-hub",
          excerpt:
            "How Downtown Coffee Co. transformed from a simple coffee shop into the heart of downtown Dallas",
          content: `Sarah Johnson never imagined that her small coffee shop would become the community hub it is today. When she opened Downtown Coffee Co. in 2018, she just wanted to serve great coffee to her neighbors.

What started as a simple coffee shop has evolved into something much more. The shop now hosts weekly poetry readings, local artist showcases, and community meetings. "It's not just about the coffee anymore," Sarah says. "It's about bringing people together."

The transformation began when a local book club asked if they could meet at the shop. Sarah agreed, and soon other groups followed. Today, the shop hosts over 20 different community events each month.

"The most rewarding part is seeing the connections people make here," Sarah reflects. "We've had people find jobs, start businesses, and even get married after meeting at our events."`,
          businessId: businesses[0].id,
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-15T10:00:00Z"),
          featuredImageUrl: "/images/coffee-shop-story.jpg",
          youtubeVideoId: "dQw4w9WgXcQ",
        },
      }),
      prisma.localAndUntoldStory.upsert({
        where: { slug: "baking-with-heart-artisan-bakery" },
        update: {},
        create: {
          title: "Baking with Heart: The Artisan Bakery Story",
          slug: "baking-with-heart-artisan-bakery",
          excerpt:
            "Michael Chen's journey from corporate life to creating handcrafted breads that bring joy to the community",
          content: `Michael Chen left his high-paying corporate job in 2020 to pursue his passion for baking. "I was making good money, but I wasn't happy," he recalls. "I wanted to create something with my hands that would make people smile."

The Artisan Bakery started as a small operation in Michael's home kitchen. He would wake up at 3 AM to start baking, then deliver fresh bread to local restaurants and cafes. "Those early days were tough, but I loved every minute of it," he says.

Today, the bakery serves over 500 customers daily and employs 15 people. Michael still wakes up early to personally oversee the bread-making process. "Quality is everything," he explains. "We use traditional techniques and the finest ingredients. Every loaf is made with love."

The bakery has become known for its sourdough bread, which has a 100-year-old starter that Michael inherited from his grandmother. "It's not just bread," he says. "It's a connection to my family and our traditions."`,
          businessId: businesses[1].id,
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-20T14:00:00Z"),
          featuredImageUrl: "/images/artisan-bakery-story.jpg",
        },
      }),
      prisma.localAndUntoldStory.upsert({
        where: { slug: "keeping-music-alive-vintage-vinyl" },
        update: {},
        create: {
          title: "Keeping the Music Alive: Vintage Vinyl Records",
          slug: "keeping-music-alive-vintage-vinyl",
          excerpt:
            "Lisa Rodriguez's mission to preserve musical history and connect generations through vinyl records",
          content: `Lisa Rodriguez opened Vintage Vinyl Records in 2019 with a simple mission: to keep the music alive. "Vinyl records aren't just a format," she explains. "They're a connection to our musical heritage."

The shop houses over 50,000 records, ranging from classic rock to jazz, blues, and everything in between. Lisa personally curates each addition to the collection, ensuring quality and authenticity.

"Every record has a story," Lisa says. "When someone comes in looking for a specific album, I love sharing the history behind it. It's not just about selling records—it's about preserving musical culture."

The shop has become a gathering place for music lovers of all ages. Young people discovering vinyl for the first time often find themselves talking to older customers about their favorite albums. "It's beautiful to see these connections," Lisa reflects.

Lisa also hosts listening parties and educational events about music history. "I want people to understand the importance of preserving our musical heritage," she says. "These records are more than just music—they're pieces of history."`,
          businessId: businesses[2].id,
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-25T16:00:00Z"),
          featuredImageUrl: "/images/vintage-vinyl-story.jpg",
        },
      }),
    ]);
    console.log(`✅ Created/Updated ${stories.length} stories`);

    // Link stories to tags (delete existing and recreate)
    console.log("\n4. Linking stories to tags...");
    await prisma.localAndUntoldStoryTag.deleteMany({
      where: {
        storyId: { in: stories.map((s) => s.id) },
      },
    });

    await Promise.all([
      // Coffee shop story tags
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[0].id, tagId: tags[0].id }, // Local Business
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[0].id, tagId: tags[1].id }, // Food & Drink
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[0].id, tagId: tags[2].id }, // Entrepreneur
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[0].id, tagId: tags[3].id }, // Community
      }),
      // Bakery story tags
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[1].id, tagId: tags[0].id }, // Local Business
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[1].id, tagId: tags[1].id }, // Food & Drink
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[1].id, tagId: tags[2].id }, // Entrepreneur
      }),
      // Vinyl shop story tags
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[2].id, tagId: tags[0].id }, // Local Business
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[2].id, tagId: tags[2].id }, // Entrepreneur
      }),
      prisma.localAndUntoldStoryTag.create({
        data: { storyId: stories[2].id, tagId: tags[4].id }, // Music
      }),
    ]);
    console.log("✅ Linked stories to tags");

    // Create media files (delete existing first)
    console.log("\n5. Creating media files...");
    await prisma.localAndUntoldMediaFile.deleteMany({
      where: {
        filename: {
          in: [
            "coffee-shop-interior.jpg",
            "bakery-bread.jpg",
            "vinyl-records.jpg",
          ],
        },
      },
    });

    const mediaFiles = await Promise.all([
      prisma.localAndUntoldMediaFile.create({
        data: {
          filename: "coffee-shop-interior.jpg",
          originalFilename: "interior.jpg",
          filePath: "/uploads/coffee-shop-interior.jpg",
          fileSize: BigInt(2048000), // 2MB
          mimeType: "image/jpeg",
          fileType: "IMAGE",
          width: 1920,
          height: 1080,
          altText: "Cozy interior of Downtown Coffee Co.",
          caption: "The warm and inviting atmosphere of Downtown Coffee Co.",
          usedInStoryId: stories[0].id,
        },
      }),
      prisma.localAndUntoldMediaFile.create({
        data: {
          filename: "bakery-bread.jpg",
          originalFilename: "bread.jpg",
          filePath: "/uploads/bakery-bread.jpg",
          fileSize: BigInt(1536000), // 1.5MB
          mimeType: "image/jpeg",
          fileType: "IMAGE",
          width: 1600,
          height: 1200,
          altText: "Fresh artisan bread from the bakery",
          caption:
            "Handcrafted sourdough bread made with traditional techniques",
          usedInStoryId: stories[1].id,
        },
      }),
      prisma.localAndUntoldMediaFile.create({
        data: {
          filename: "vinyl-records.jpg",
          originalFilename: "records.jpg",
          filePath: "/uploads/vinyl-records.jpg",
          fileSize: BigInt(2560000), // 2.5MB
          mimeType: "image/jpeg",
          fileType: "IMAGE",
          width: 1920,
          height: 1080,
          altText: "Collection of vintage vinyl records",
          caption: "Curated collection of classic vinyl records",
          usedInStoryId: stories[2].id,
        },
      }),
    ]);
    console.log(`✅ Created ${mediaFiles.length} media files`);

    // Create site settings using upsert
    console.log("\n6. Creating site settings...");
    const siteSettings = await Promise.all([
      prisma.localAndUntoldSiteSetting.upsert({
        where: { settingKey: "site_title" },
        update: {},
        create: {
          settingKey: "site_title",
          settingValue: "Local and Untold",
          settingType: "STRING",
          description: "The main title of the website",
          isPublic: true,
        },
      }),
      prisma.localAndUntoldSiteSetting.upsert({
        where: { settingKey: "site_description" },
        update: {},
        create: {
          settingKey: "site_description",
          settingValue: "Discovering the untold stories of local businesses",
          settingType: "STRING",
          description: "The main description of the website",
          isPublic: true,
        },
      }),
      prisma.localAndUntoldSiteSetting.upsert({
        where: { settingKey: "contact_email" },
        update: {},
        create: {
          settingKey: "contact_email",
          settingValue: "hello@localanduntold.com",
          settingType: "STRING",
          description: "Contact email for the website",
          isPublic: true,
        },
      }),
      prisma.localAndUntoldSiteSetting.upsert({
        where: { settingKey: "featured_stories_limit" },
        update: {},
        create: {
          settingKey: "featured_stories_limit",
          settingValue: "6",
          settingType: "NUMBER",
          description: "Number of featured stories to display on homepage",
          isPublic: false,
        },
      }),
      prisma.localAndUntoldSiteSetting.upsert({
        where: { settingKey: "enable_analytics" },
        update: {},
        create: {
          settingKey: "enable_analytics",
          settingValue: "true",
          settingType: "BOOLEAN",
          description: "Whether to enable analytics tracking",
          isPublic: false,
        },
      }),
    ]);
    console.log(`✅ Created/Updated ${siteSettings.length} site settings`);

    // Display summary
    console.log("\n📊 Seeding Summary:");
    console.log(`   - Businesses: ${businesses.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Stories: ${stories.length}`);
    console.log(`   - Media Files: ${mediaFiles.length}`);
    console.log(`   - Site Settings: ${siteSettings.length}`);

    console.log("\n🎉 Local and Untold platform seeded successfully!");
    console.log(
      "\nYou can now view the data in your database or through your application."
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLocalAndUntoldDataUpsert();
