#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up development database...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if we need to run migrations
    console.log('📋 Checking database schema...');
    
    // Try to query the site_features table to see if it exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM site_features LIMIT 1`;
      console.log('✅ Site features table already exists');
    } catch (error) {
      console.log('⚠️  Site features table not found. You may need to run migrations:');
      console.log('   npx prisma migrate deploy');
    }

    console.log('🎉 Development database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n📋 Make sure you have:');
    console.log('   1. PostgreSQL running');
    console.log('   2. DATABASE_URL set in .env.local');
    console.log('   3. Database created');
    console.log('\n💡 Example DATABASE_URL:');
    console.log('   DATABASE_URL="postgresql://postgres:password@localhost:5432/flexhub?schema=public"');
  } finally {
    await prisma.$disconnect();
  }
}

main(); 