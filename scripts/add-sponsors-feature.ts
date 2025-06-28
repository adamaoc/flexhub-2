#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏆 Adding sponsors feature and sample sponsors...");

  try {
    // Get all sites
    const sites = await prisma.site.findMany({
      include: {
        features: true,
        sponsors: true,
      },
    });

    if (sites.length === 0) {
      console.log("❌ No sites found. Please create a site first.");
      return;
    }

    for (const site of sites) {
      console.log(`\n📋 Processing site: ${site.name} (${site.id})`);

      // Check if sponsors feature already exists
      const existingSponsorsFeature = site.features.find(
        (f) => f.feature === "SPONSORS"
      );

      if (!existingSponsorsFeature) {
        console.log(`➕ Adding SPONSORS feature to ${site.name}`);
        await prisma.siteFeature.create({
          data: {
            siteId: site.id,
            feature: "SPONSORS",
            displayName: "Sponsors",
            description: "Manage sponsors and partnerships for your site",
            isEnabled: true,
          },
        });
      } else {
        console.log(`✅ SPONSORS feature already exists for ${site.name}`);
      }

      // Add sample sponsors if none exist
      if (site.sponsors.length === 0) {
        console.log(`➕ Adding sample sponsors to ${site.name}`);

        const sampleSponsors = [
          {
            name: "TechCorp Solutions",
            url: "https://techcorp-solutions.com",
            logo: "https://via.placeholder.com/200x100/3B82F6/FFFFFF?text=TechCorp",
            active: true,
          },
          {
            name: "Innovate Labs",
            url: "https://innovatelabs.io",
            logo: "https://via.placeholder.com/200x100/10B981/FFFFFF?text=Innovate",
            active: true,
          },
          {
            name: "Digital Dynamics",
            url: "https://digitaldynamics.net",
            logo: "https://via.placeholder.com/200x100/F59E0B/FFFFFF?text=Digital",
            active: true,
          },
          {
            name: "Future Systems",
            url: "https://futuresystems.com",
            logo: "https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Future",
            active: false,
          },
        ];

        for (const sponsorData of sampleSponsors) {
          await prisma.sponsor.create({
            data: {
              ...sponsorData,
              siteId: site.id,
            },
          });
        }

        console.log(
          `✅ Added ${sampleSponsors.length} sample sponsors to ${site.name}`
        );
      } else {
        console.log(
          `✅ ${site.name} already has ${site.sponsors.length} sponsors`
        );
      }
    }

    // Verify the changes
    console.log("\n🎉 Verification:");
    const updatedSites = await prisma.site.findMany({
      include: {
        features: {
          where: {
            feature: "SPONSORS",
          },
        },
        sponsors: true,
      },
    });

    for (const site of updatedSites) {
      const sponsorsFeature = site.features[0];
      console.log(`\n📋 ${site.name}:`);
      console.log(
        `  - SPONSORS feature: ${
          sponsorsFeature?.isEnabled ? "✅ Enabled" : "❌ Disabled"
        }`
      );
      console.log(`  - Sponsors count: ${site.sponsors.length}`);
      if (site.sponsors.length > 0) {
        console.log(
          `  - Active sponsors: ${site.sponsors.filter((s) => s.active).length}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error adding sponsors feature:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
