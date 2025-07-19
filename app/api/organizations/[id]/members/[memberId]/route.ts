import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateMemberSchema = z.object({
  role: z.enum(['member', 'admin']).optional(),
  permissions: z.array(z.string()).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, memberId } = await params
    const body = await request.json()
    const validatedData = updateMemberSchema.parse(body)

    // Check if user has permission to update members
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: session.user.id,
        role: { in: ['owner', 'admin'] },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update members' },
        { status: 403 }
      )
    }

    // Check if target member exists
    const targetMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: memberId,
      },
    })

    if (!targetMembership) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prevent updating owner role
    if (targetMembership.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot modify owner role' },
        { status: 400 }
      )
    }

    // Update member
    const updatedMembership = await prisma.organizationMember.update({
      where: {
        id: targetMembership.id,
      },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedMembership)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, memberId } = await params

    // Check if user has permission to remove members
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: session.user.id,
        role: { in: ['owner', 'admin'] },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove members' },
        { status: 403 }
      )
    }

    // Check if target member exists
    const targetMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: memberId,
      },
    })

    if (!targetMembership) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Prevent removing owner
    if (targetMembership.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove organization owner' },
        { status: 400 }
      )
    }

    // Prevent removing yourself if you're an admin (only owners can remove admins)
    if (targetMembership.userId === session.user.id && membership.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot remove themselves' },
        { status: 400 }
      )
    }

    // Remove member
    await prisma.organizationMember.delete({
      where: {
        id: targetMembership.id,
      },
    })

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 