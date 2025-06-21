import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkInvite() {
  try {
    const email = process.argv[2] || 'adamaoc@gmail.com'
    
    console.log(`Checking invite for: ${email}`)
    
    const invite = await prisma.invite.findFirst({
      where: { email }
    })
    
    if (!invite) {
      console.log('❌ No invite found for this email')
      return
    }
    
    console.log('📧 Invite found:')
    console.log('- Email:', invite.email)
    console.log('- Role:', invite.role)
    console.log('- Token:', invite.token)
    console.log('- Invited by:', invite.invitedBy)
    console.log('- Invited at:', invite.invitedAt)
    console.log('- Expires at:', invite.expiresAt)
    console.log('- Is used:', invite.isUsed)
    console.log('- Used at:', invite.usedAt)
    
    const now = new Date()
    const isExpired = invite.expiresAt < now
    
    console.log('\n🔍 Status:')
    console.log('- Current time:', now)
    console.log('- Is expired:', isExpired)
    console.log('- Is used:', invite.isUsed)
    
    if (isExpired) {
      console.log('❌ Invite has expired')
    } else if (invite.isUsed) {
      console.log('❌ Invite has already been used')
    } else {
      console.log('✅ Invite is valid and ready to use')
    }
    
    // Also check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    console.log('\n👤 User status:')
    if (user) {
      console.log('- User exists:', true)
      console.log('- User ID:', user.id)
      console.log('- User role:', user.role)
      console.log('- Is active:', user.isActive)
      console.log('- Is invited:', user.isInvited)
    } else {
      console.log('- User does not exist yet')
    }
    
  } catch (error) {
    console.error('Error checking invite:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInvite() 