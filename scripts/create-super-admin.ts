import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('Creating super admin setup...')
    
    // Create super admin user
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@flexhub.com' },
      update: {},
      create: {
        email: 'admin@flexhub.com',
        name: 'Super Admin',
        role: 'SUPERADMIN',
        isActive: true,
        isInvited: true,
        invitedAt: new Date(),
        lastLogin: new Date(),
      },
    })

    console.log('Super admin user created:', {
      id: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name,
      role: superAdmin.role,
    })

    // Create invite for super admin (for demonstration)
    const inviteToken = randomBytes(32).toString('hex')
    const invite = await prisma.invite.create({
      data: {
        email: 'admin@flexhub.com',
        role: 'SUPERADMIN',
        token: inviteToken,
        invitedBy: superAdmin.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isUsed: true,
        usedAt: new Date(),
      },
    })

    console.log('Super admin invite created:', {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      token: inviteToken,
    })

    // Create a test user invite
    const testInviteToken = randomBytes(32).toString('hex')
    const testInvite = await prisma.invite.create({
      data: {
        email: 'user@example.com',
        role: 'USER',
        token: testInviteToken,
        invitedBy: superAdmin.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    console.log('Test user invite created:', {
      id: testInvite.id,
      email: testInvite.email,
      role: testInvite.role,
      token: testInviteToken,
    })

    console.log('\n✅ Setup complete!')
    console.log('\n📧 Test invites:')
    console.log(`- Super Admin: admin@flexhub.com (already created)`)
    console.log(`- Test User: user@example.com (invite token: ${testInviteToken})`)
    
  } catch (error) {
    console.error('Error creating super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin() 