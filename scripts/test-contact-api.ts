import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testContactAPI() {
  try {
    console.log("🔍 Checking sites in database...");

    // Get all sites with their contact management feature
    const sites = await prisma.site.findMany({
      include: {
        features: {
          where: {
            feature: "CONTACT_MANAGEMENT",
          },
        },
        contactForm: true,
      },
    });

    console.log(`\n📊 Found ${sites.length} sites:`);

    sites.forEach((site, index) => {
      const hasContactFeature = site.features.some(
        (f) => f.feature === "CONTACT_MANAGEMENT" && f.isEnabled
      );
      const hasContactForm = !!site.contactForm;

      console.log(`\n${index + 1}. Site: ${site.name}`);
      console.log(`   ID: ${site.id}`);
      console.log(`   Domain: ${site.domain || "No domain set"}`);
      console.log(
        `   Contact Management Feature: ${
          hasContactFeature ? "✅ Enabled" : "❌ Disabled"
        }`
      );
      console.log(
        `   Contact Form: ${hasContactForm ? "✅ Created" : "❌ Not created"}`
      );

      if (hasContactFeature && hasContactForm) {
        console.log(
          `   🔗 API Endpoint: http://localhost:3005/api/public/sites/${site.id}/contact`
        );
      }
    });

    // Check the specific site ID from the error
    const testSiteId = "e93fb31b-75fc-480d-9235-992c0db3f74b";
    console.log(`\n🔍 Checking specific site ID: ${testSiteId}`);

    const specificSite = await prisma.site.findUnique({
      where: {
        id: testSiteId,
      },
      include: {
        features: {
          where: {
            feature: "CONTACT_MANAGEMENT",
          },
        },
        contactForm: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (specificSite) {
      console.log("✅ Site found!");
      console.log(`   Name: ${specificSite.name}`);
      console.log(
        `   Contact Feature: ${
          specificSite.features.length > 0 && specificSite.features[0].isEnabled
            ? "✅ Enabled"
            : "❌ Disabled"
        }`
      );
      console.log(
        `   Contact Form: ${
          specificSite.contactForm ? "✅ Present" : "❌ Missing"
        }`
      );

      if (specificSite.contactForm) {
        console.log(
          `   Form Fields: ${
            specificSite.contactForm.fields?.length || 0
          } fields`
        );
      }
    } else {
      console.log("❌ Site not found in database!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  testContactAPI()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default testContactAPI;
