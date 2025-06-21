import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { id } = await params

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
    const { role } = await request.json()

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPERADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if invite exists
    const existingInvite = await prisma.invite.findUnique({
      where: { id }
    })

    if (!existingInvite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if invite is already used
    if (existingInvite.isUsed) {
      return NextResponse.json({ error: 'Cannot update used invite' }, { status: 400 })
    }

    // Update the invite
    const updatedInvite = await prisma.invite.update({
      where: { id },
      data: { role: role as 'USER' | 'ADMIN' | 'SUPERADMIN' },
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
      invite: updatedInvite
    })

  } catch (error) {
    console.error('Error updating invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { id } = await params

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

    // Check if invite exists
    const existingInvite = await prisma.invite.findUnique({
      where: { id }
    })

    if (!existingInvite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if invite is already used
    if (existingInvite.isUsed) {
      return NextResponse.json({ error: 'Cannot delete used invite' }, { status: 400 })
    }

    // Delete the invite
    await prisma.invite.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Invite deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting invite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 