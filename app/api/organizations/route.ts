import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    // Get organizations where user is a member
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
          deletedAt: null,
        },
        include: {
          members: {
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
          },
          _count: {
            select: {
              contracts: true,
              analysisResults: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.organization.count({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
          deletedAt: null,
        },
      }),
    ])

    return NextResponse.json({
      organizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOrganizationSchema.parse(body)

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug is unique
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this name already exists' },
        { status: 400 }
      )
    }

    // Create organization and add user as owner
    const organization = await prisma.organization.create({
      data: {
        ...validatedData,
        slug,
        members: {
          create: {
            userId: userId!,
            role: 'owner',
            permissions: ['*'], // All permissions for owner
          },
        },
      },
      include: {
        members: {
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
        },
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 