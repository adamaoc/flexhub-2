import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the actual user from database to ensure we have the correct ID
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is super admin
    if (dbUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden: Super admin access required' }, { status: 403 })
    }

    // Parse request body
    const { email, role = 'USER' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPERADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
    }

    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: { email }
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already exists for this email' }, { status: 400 })
    }

    // Create new invite
    const inviteToken = randomBytes(32).toString('hex')
    const invite = await prisma.invite.create({
      data: {
        email,
        role: role as any,
        token: inviteToken,
        invitedBy: dbUser.id, // Use the database user ID
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt,
        invitedAt: invite.invitedAt
      }
    })

  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only super admins can access invite data
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const invites = await prisma.invite.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isUsed: true,
        expiresAt: true,
        invitedAt: true,
        usedAt: true,
        invitedBy: true,
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        invitedAt: 'desc'
      }
    })

    // Transform the data
    const transformedInvites = invites.map(invite => ({
      ...invite,
      expiresAt: invite.expiresAt.toISOString(),
      invitedAt: invite.invitedAt.toISOString(),
      usedAt: invite.usedAt?.toISOString() || null,
      invitedBy: invite.inviter?.name || invite.inviter?.email || 'system'
    }))

    return NextResponse.json(transformedInvites)
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 