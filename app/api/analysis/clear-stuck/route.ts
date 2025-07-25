import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contractId, analysisType } = body;

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Find stuck analyses (PENDING or PROCESSING for more than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const stuckAnalyses = await prisma.analysisResult.findMany({
      where: {
        contractId,
        ...(analysisType && { analysisType }),
        status: {
          in: ['PENDING', 'PROCESSING']
        },
        OR: [
          { startedAt: null },
          { startedAt: { lt: tenMinutesAgo } }
        ]
      }
    });

    if (stuckAnalyses.length === 0) {
      return NextResponse.json({
        message: 'No stuck analyses found',
        count: 0
      });
    }

    // Update stuck analyses to FAILED status
    const updatedAnalyses = await prisma.analysisResult.updateMany({
      where: {
        id: {
          in: stuckAnalyses.map(a => a.id)
        }
      },
      data: {
        status: 'FAILED',
        errorMessage: 'Analysis cancelled due to timeout or stuck status',
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${updatedAnalyses.count} stuck analyses`,
      clearedCount: updatedAnalyses.count,
      analysisIds: stuckAnalyses.map(a => a.id)
    });

  } catch (error) {
    console.error('Error clearing stuck analyses:', error);
    return NextResponse.json(
      { error: 'Failed to clear stuck analyses' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const analysisType = searchParams.get('analysisType');

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Find all analyses for the contract
    const analyses = await prisma.analysisResult.findMany({
      where: {
        contractId,
        ...(analysisType && { analysisType }),
        OR: [
          { userId: session.user.id },
          { organizationId: session.user.organizationId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        analysisType: true,
        status: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        errorMessage: true
      }
    });

    return NextResponse.json({
      analyses,
      count: analyses.length,
      pendingCount: analyses.filter(a => a.status === 'PENDING').length,
      processingCount: analyses.filter(a => a.status === 'PROCESSING').length
    });

  } catch (error) {
    console.error('Error getting analyses:', error);
    return NextResponse.json(
      { error: 'Failed to get analyses' },
      { status: 500 }
    );
  }
} 