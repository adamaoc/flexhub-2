#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function setupProduction() {
  console.log('🚀 FlexHub CMS Production Setup')
  console.log('================================\n')

  try {
    // Test database connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Check if any users exist
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('No users found. Creating first super admin...\n')
      
      const name = await question('Enter your full name: ')
      const email = await question('Enter your email address: ')
      
      if (!name || !email) {
        console.log('❌ Name and email are required')
        process.exit(1)
      }

      // Create super admin user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          role: 'SUPERADMIN',
          isActive: true,
        }
      })

      console.log(`✅ Super admin user created: ${user.name} (${user.email})`)
      console.log('You can now sign in with your OAuth provider\n')
    } else {
      console.log(`✅ Found ${userCount} existing user(s)`)
      console.log('No setup needed\n')
    }

    // Check if any sites exist
    const siteCount = await prisma.site.count()
    
    if (siteCount === 0) {
      console.log('No sites found. Creating default site...\n')
      
      const siteName = await question('Enter your site name (or press Enter for "My Site"): ') || 'My Site'
      const domain = await question('Enter your domain (optional): ') || null

      const site = await prisma.site.create({
        data: {
          name: siteName,
          domain,
        }
      })

      console.log(`✅ Default site created: ${site.name}`)
      
      // Create a sample page
      await prisma.page.create({
        data: {
          title: 'Welcome',
          slug: 'welcome',
          content: '# Welcome to FlexHub CMS\n\nThis is your first page. You can edit it or create new pages.',
          isPublished: true,
          siteId: site.id,
        }
      })

      console.log('✅ Sample page created: /welcome\n')
    } else {
      console.log(`✅ Found ${siteCount} existing site(s)`)
    }

    console.log('🎉 Setup complete! Your FlexHub CMS is ready to use.')
    console.log('\nNext steps:')
    console.log('1. Configure your OAuth providers (Google/GitHub)')
    console.log('2. Set up your domain and SSL certificate')
    console.log('3. Test the sign-in flow')
    console.log('4. Start managing your content!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

setupProduction() 