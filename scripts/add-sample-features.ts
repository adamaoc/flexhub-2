#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Adding sample features to sites...");

  try {
    // Get the first site
    const site = await prisma.site.findFirst({
      include: {
        features: true,
      },
    });

    if (!site) {
      console.log("❌ No sites found. Please create a site first.");
      return;
    }

    console.log(`📋 Found site: ${site.name} (${site.id})`);
    console.log(`📊 Current features: ${site.features.length}`);

    // Sample features to add with their display names
    const sampleFeatures = [
      {
        type: "PAGES" as const,
        displayName: "Pages",
        description: "Create and manage static pages for your site",
      },
      {
        type: "BLOG_POSTS" as const,
        displayName: "Blog Posts",
        description: "Write and publish blog posts",
      },
      {
        type: "MEDIA_FILES" as const,
        displayName: "Media Files",
        description: "Upload and manage images, videos, and other media",
      },
      {
        type: "ANALYTICS" as const,
        displayName: "Analytics",
        description: "Track site performance and visitor statistics",
      },
      {
        type: "ONLINE_STORE" as const,
        displayName: "Online Store",
        description: "Sell products and manage orders",
      },
    ];

    // Add features that don't already exist
    for (const feature of sampleFeatures) {
      const existingFeature = site.features.find(
        (f) => f.feature === feature.type
      );

      if (!existingFeature) {
        console.log(`➕ Adding feature: ${feature.type}`);
        await prisma.siteFeature.create({
          data: {
            siteId: site.id,
            feature: feature.type,
            displayName: feature.displayName,
            description: feature.description,
            isEnabled: true,
          },
        });
      } else {
        console.log(`✅ Feature already exists: ${feature.type}`);
      }
    }

    // Verify the features were added
    const updatedSite = await prisma.site.findUnique({
      where: { id: site.id },
      include: {
        features: true,
      },
    });

    console.log(`🎉 Updated site features: ${updatedSite?.features.length}`);
    console.log("📋 Enabled features:");
    updatedSite?.features.forEach((f) => {
      console.log(
        `  - ${f.feature}: ${f.isEnabled ? "✅ Enabled" : "❌ Disabled"}`
      );
    });
  } catch (error) {
    console.error("❌ Error adding features:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
