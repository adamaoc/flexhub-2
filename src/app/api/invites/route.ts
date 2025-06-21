import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
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
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: { email }
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already exists for this email' }, { status: 409 })
    }

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        email,
        role: role as 'USER' | 'ADMIN' | 'SUPERADMIN',
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        inviter: {
          connect: {
            id: dbUser.id
          }
        }
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      invite
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only super admins can access invite data
    if (session.user?.role !== 'SUPERADMIN') {
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
        inviter: true,
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