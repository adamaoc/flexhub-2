import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function createInvite() {
  try {
    // Get the email from command line argument or use a default
    const email = process.argv[2] || 'your-github-email@example.com'
    const role = process.argv[3] || 'USER' // USER, ADMIN, or SUPERADMIN
    
    console.log(`Creating invite for: ${email} with role: ${role}`)
    
    // First, check if we have a super admin to create the invite
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    })
    
    if (!superAdmin) {
      console.log('No super admin found. Creating one first...')
      const newSuperAdmin = await prisma.user.create({
        data: {
          email: 'admin@flexhub.com',
          name: 'Super Admin',
          role: 'SUPERADMIN',
          isActive: true,
          isInvited: true,
          invitedAt: new Date(),
          lastLogin: new Date(),
        },
      })
      console.log('Super admin created:', newSuperAdmin.email)
    }
    
    const admin = superAdmin || await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } })
    
    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: { email }
    })
    
    if (existingInvite) {
      console.log(`Invite already exists for ${email}`)
      console.log('Token:', existingInvite.token)
      console.log('Expires:', existingInvite.expiresAt)
      console.log('Used:', existingInvite.isUsed)
      return
    }
    
    // Create new invite
    const inviteToken = randomBytes(32).toString('hex')
    const invite = await prisma.invite.create({
      data: {
        email,
        role: role as any,
        token: inviteToken,
        invitedBy: admin!.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
    
    console.log('\n✅ Invite created successfully!')
    console.log('Email:', invite.email)
    console.log('Role:', invite.role)
    console.log('Token:', invite.token)
    console.log('Expires:', invite.expiresAt)
    console.log('\nNow try signing in with GitHub again!')
    
  } catch (error) {
    console.error('Error creating invite:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createInvite() 