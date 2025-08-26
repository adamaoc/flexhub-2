#!/usr/bin/env ts-node

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addWorksFeature() {
  try {
    console.log("🚀 Adding WORKS feature to existing sites...");

    // Get all sites
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        features: {
          where: {
            feature: "WORKS",
          },
        },
      },
    });

    console.log(`📊 Found ${sites.length} sites`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const site of sites) {
      // Check if site already has WORKS feature
      if (site.features.length > 0) {
        console.log(`⏭️  Skipping ${site.name} - WORKS feature already exists`);
        skippedCount++;
        continue;
      }

      // Add WORKS feature to the site
      await prisma.siteFeature.create({
        data: {
          siteId: site.id,
          feature: "WORKS",
          displayName: "Works",
          description: "Showcase portfolio work and projects",
          isEnabled: true, // Enable by default
        },
      });

      console.log(`✅ Added WORKS feature to ${site.name}`);
      addedCount++;
    }

    console.log("\n📈 Summary:");
    console.log(`  • Sites with WORKS feature added: ${addedCount}`);
    console.log(`  • Sites skipped (already had feature): ${skippedCount}`);
    console.log(`  • Total sites processed: ${sites.length}`);

    if (addedCount > 0) {
      console.log("\n🎉 WORKS feature has been successfully added to sites!");
      console.log(
        "💡 Users can now access the Works management page at /works"
      );
    }
  } catch (error) {
    console.error("❌ Error adding WORKS feature:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addWorksFeature();
