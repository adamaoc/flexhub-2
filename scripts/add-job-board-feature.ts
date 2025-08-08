#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("💼 Adding job board feature to sites...");

  try {
    // Get all sites
    const sites = await prisma.site.findMany({
      include: {
        features: true,
      },
    });

    if (sites.length === 0) {
      console.log("❌ No sites found. Please create a site first.");
      return;
    }

    for (const site of sites) {
      console.log(`\n📋 Processing site: ${site.name} (${site.id})`);

      // Check if job board feature already exists
      const existingJobBoardFeature = site.features.find(
        (f) => f.feature === "JOB_BOARD"
      );

      if (!existingJobBoardFeature) {
        console.log(`➕ Adding JOB_BOARD feature to ${site.name}`);
        await prisma.siteFeature.create({
          data: {
            siteId: site.id,
            feature: "JOB_BOARD",
            displayName: "Job Board",
            description:
              "Manage job listings and company profiles for your site",
            isEnabled: true,
          },
        });
      } else {
        console.log(`✅ JOB_BOARD feature already exists for ${site.name}`);
      }
    }

    console.log("\n🎉 Job board feature has been added to all sites!");
    console.log("\n📋 Next steps:");
    console.log("1. Visit the Job Board page in your admin panel");
    console.log("2. Add companies to your job board");
    console.log("3. Create job listings for those companies");
    console.log("4. Use the public API to display jobs on external websites");
  } catch (error) {
    console.error("❌ Error adding job board feature:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
