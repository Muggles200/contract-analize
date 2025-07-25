import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const contract = await prisma.contract.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // In a real implementation, you would:
    // 1. Fetch the file from your storage service (Vercel Blob, AWS S3, etc.)
    // 2. Return the file as a response with proper headers
    
    // For now, we'll return the blob URL and let the client handle the download
    return NextResponse.json({
      downloadUrl: contract.blobUrl,
      fileName: contract.fileName,
      fileSize: contract.fileSize,
      fileType: contract.fileType,
    })
  } catch (error) {
    console.error('Error downloading contract:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 