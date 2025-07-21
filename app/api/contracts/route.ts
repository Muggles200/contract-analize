import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createContractSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  fileType: z.string().min(1),
  blobUrl: z.string().url(),
  contractName: z.string().optional(),
  contractType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
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
    const organizationId = searchParams.get('organizationId')
    const status = searchParams.get('status')
    const contractType = searchParams.get('contractType')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: userId,
      deletedAt: null,
    }

    if (organizationId) {
      where.organizationId = organizationId
    }

    if (status) {
      where.status = status
    }

    if (contractType) {
      where.contractType = contractType
    }

    // Add search functionality
    if (search) {
      where.OR = [
        {
          contractName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          fileName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            hasSome: [search]
          }
        }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'contractName') {
      orderBy.contractName = sortOrder
    } else if (sortBy === 'contractType') {
      orderBy.contractType = sortOrder
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder
    } else if (sortBy === 'fileSize') {
      orderBy.fileSize = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get contracts with pagination
    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          analysisResults: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ])

    // Convert BigInt to number for JSON serialization
    const serializedContracts = contracts.map(contract => ({
      ...contract,
      fileSize: Number(contract.fileSize),
    }))

    return NextResponse.json({
      contracts: serializedContracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching contracts:', error)
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
    const validatedData = createContractSchema.parse(body)

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        ...validatedData,
        userId: userId,
        tags: validatedData.tags || [],
        metadata: validatedData.metadata || {},
      },
      include: {
        analysisResults: true,
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 