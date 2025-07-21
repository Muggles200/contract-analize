import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateContractSchema = z.object({
  contractName: z.string().optional(),
  contractType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const contract = await prisma.contract.findFirst({
      where: {
        id,
        userId: userId,
        deletedAt: null,
      },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
        },
        contractFiles: true,
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Convert BigInt to number for JSON serialization
    const serializedContract = {
      ...contract,
      fileSize: Number(contract.fileSize),
    }

    return NextResponse.json(serializedContract)
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateContractSchema.parse(body)

    // Check if contract exists and belongs to user
    const existingContract = await prisma.contract.findFirst({
      where: {
        id,
        userId: userId,
        deletedAt: null,
      },
    })

    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Update contract
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...validatedData,
        tags: validatedData.tags || existingContract.tags,
        metadata: validatedData.metadata || existingContract.metadata || {},
      },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Convert BigInt to number for JSON serialization
    const serializedContract = {
      ...contract,
      fileSize: Number(contract.fileSize),
    }

    return NextResponse.json(serializedContract)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating contract:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if contract exists and belongs to user
    const existingContract = await prisma.contract.findFirst({
      where: {
        id,
        userId: userId,
        deletedAt: null,
      },
    })

    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Soft delete the contract
    await prisma.contract.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: 'Contract deleted successfully' })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 