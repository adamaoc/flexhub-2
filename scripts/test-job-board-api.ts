#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testJobBoardAPI() {
  try {
    console.log("🧪 Testing Job Board API endpoints...");

    // Get all sites with job board feature
    const sites = await prisma.site.findMany({
      include: {
        features: {
          where: {
            feature: "JOB_BOARD",
            isEnabled: true,
          },
        },
        companies: {
          include: {
            _count: {
              select: {
                jobListings: true,
              },
            },
          },
        },
        jobListings: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                location: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    console.log(`\n📊 Found ${sites.length} sites with job board feature:`);

    sites.forEach((site, index) => {
      const jobBoardFeature = site.features.find(
        (f) => f.feature === "JOB_BOARD" && f.isEnabled
      );

      console.log(`\n${index + 1}. Site: ${site.name}`);
      console.log(`   ID: ${site.id}`);
      console.log(`   Domain: ${site.domain || "No domain set"}`);
      console.log(
        `   Job Board Feature: ${
          jobBoardFeature ? "✅ Enabled" : "❌ Disabled"
        }`
      );
      console.log(`   Companies: ${site.companies.length}`);
      console.log(`   Job Listings: ${site.jobListings.length}`);

      if (jobBoardFeature) {
        console.log(
          `   🔗 Admin API: http://localhost:3005/api/sites/${site.id}/companies`
        );
        console.log(
          `   🔗 Public API: http://localhost:3005/api/public/sites/${site.id}/job-board`
        );
      }

      // Show sample companies
      if (site.companies.length > 0) {
        console.log("   📋 Companies:");
        site.companies.forEach((company) => {
          console.log(
            `     - ${company.name} (${company._count.jobListings} jobs)`
          );
        });
      }

      // Show sample job listings
      if (site.jobListings.length > 0) {
        console.log("   💼 Job Listings:");
        site.jobListings.slice(0, 3).forEach((job) => {
          console.log(
            `     - ${job.title} at ${job.company.name} (${job.jobType})`
          );
        });
        if (site.jobListings.length > 3) {
          console.log(`     ... and ${site.jobListings.length - 3} more`);
        }
      }
    });

    // Test API endpoints
    console.log("\n🔗 Testing API endpoints...");

    for (const site of sites) {
      if (site.features.some((f) => f.feature === "JOB_BOARD" && f.isEnabled)) {
        console.log(`\n📋 Testing site: ${site.name}`);

        // Test companies endpoint
        try {
          const companiesResponse = await fetch(
            `http://localhost:3005/api/sites/${site.id}/companies`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (companiesResponse.ok) {
            const companies = await companiesResponse.json();
            console.log(
              `   ✅ Companies API: ${companies.length} companies found`
            );
          } else {
            console.log(
              `   ❌ Companies API: ${companiesResponse.status} error`
            );
          }
        } catch (error) {
          console.log(`   ❌ Companies API: Connection error`);
        }

        // Test job listings endpoint
        try {
          const jobsResponse = await fetch(
            `http://localhost:3005/api/sites/${site.id}/job-listings`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (jobsResponse.ok) {
            const jobs = await jobsResponse.json();
            console.log(
              `   ✅ Job Listings API: ${
                jobs.jobListings?.length || 0
              } jobs found`
            );
          } else {
            console.log(`   ❌ Job Listings API: ${jobsResponse.status} error`);
          }
        } catch (error) {
          console.log(`   ❌ Job Listings API: Connection error`);
        }

        // Test public API
        try {
          const publicResponse = await fetch(
            `http://localhost:3005/api/public/sites/${site.id}/job-board`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            console.log(
              `   ✅ Public API: ${
                publicData.jobListings?.length || 0
              } jobs found`
            );
            console.log(
              `   ✅ Public API: ${
                publicData.filters?.companies?.length || 0
              } companies available`
            );
          } else {
            console.log(`   ❌ Public API: ${publicResponse.status} error`);
          }
        } catch (error) {
          console.log(`   ❌ Public API: Connection error`);
        }
      }
    }

    console.log("\n🎉 Job Board API testing completed!");
    console.log("\n📋 To test the feature:");
    console.log("1. Start the development server: npm run dev");
    console.log("2. Visit http://localhost:3005/job-board");
    console.log("3. Add some companies and job listings");
    console.log("4. Test the public API endpoints");
  } catch (error) {
    console.error("❌ Error testing job board API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testJobBoardAPI();
