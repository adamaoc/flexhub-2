#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding sample features to sites...');

  try {
    // Get the first site
    const site = await prisma.site.findFirst({
      include: {
        features: true,
      },
    });

    if (!site) {
      console.log('❌ No sites found. Please create a site first.');
      return;
    }

    console.log(`📋 Found site: ${site.name} (${site.id})`);
    console.log(`📊 Current features: ${site.features.length}`);

    // Sample features to add
    const sampleFeatures = [
      'PAGES' as const,
      'BLOG_POSTS' as const, 
      'MEDIA_FILES' as const,
      'ANALYTICS' as const,
      'ONLINE_STORE' as const
    ];

    // Add features that don't already exist
    for (const featureType of sampleFeatures) {
      const existingFeature = site.features.find(f => f.feature === featureType);
      
      if (!existingFeature) {
        console.log(`➕ Adding feature: ${featureType}`);
        await prisma.siteFeature.create({
          data: {
            siteId: site.id,
            feature: featureType,
            isEnabled: true,
          },
        });
      } else {
        console.log(`✅ Feature already exists: ${featureType}`);
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
    console.log('📋 Enabled features:');
    updatedSite?.features.forEach(f => {
      console.log(`  - ${f.feature}: ${f.isEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    });

  } catch (error) {
    console.error('❌ Error adding features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 