import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analysisQueue } from '@/lib/analysis-queue';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: analysisId } = await params;

    // Fetch user's organization membership
    const membership = await prisma.organizationMember.findFirst({ where: { userId } });
    const organizationId = membership?.organizationId;

    // Get analysis result with full details
    const analysis = await prisma.analysisResult.findFirst({
      where: {
        id: analysisId,
        OR: [
          { userId: userId },
          { organizationId: organizationId }
        ]
      },
      include: {
        contract: {
          select: {
            fileName: true,
            fileSize: true,
            createdAt: true,
            metadata: true
          }
        }
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      );
    }

    // Check if analysis is completed
    if (analysis.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Analysis not completed yet' },
        { status: 400 }
      );
    }

    // Calculate processing time
    let processingTime = null;
    if (analysis.completedAt && analysis.startedAt) {
      processingTime = analysis.completedAt.getTime() - analysis.startedAt.getTime();
    }

    // Prepare response
    const response = {
      id: analysis.id,
      contractId: analysis.contractId,
      analysisType: analysis.analysisType,
      status: analysis.status,
      priority: analysis.priority,
      createdAt: analysis.createdAt,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt,
      processingTime,
      tokensUsed: analysis.tokensUsed,
      estimatedCost: analysis.estimatedCost,
      confidenceScore: analysis.confidenceScore,
      summary: analysis.summary,
      results: analysis.results,
      contract: (analysis as any).contract,
      metadata: {
        totalClauses: analysis.totalClauses,
        totalRisks: analysis.totalRisks,
        totalRecommendations: analysis.totalRecommendations,
        highRiskCount: analysis.highRiskCount,
        criticalRiskCount: analysis.criticalRiskCount
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting analysis results:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis results' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: analysisId } = await params;

    // Fetch user's organization membership
    const membership = await prisma.organizationMember.findFirst({ where: { userId } });
    const organizationId = membership?.organizationId;

    // Check if analysis exists and user has access
    const analysis = await prisma.analysisResult.findFirst({
      where: {
        id: analysisId,
        OR: [
          { userId: userId },
          { organizationId: organizationId }
        ]
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      );
    }

    // Cancel the analysis
    const cancelled = await analysisQueue.cancelJob(analysisId);

    if (!cancelled) {
      return NextResponse.json(
        { error: 'Failed to cancel analysis' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling analysis:', error);
    return NextResponse.json(
      { error: 'Failed to cancel analysis' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: analysisId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Fetch user's organization membership
    const membership = await prisma.organizationMember.findFirst({ where: { userId } });
    const organizationId = membership?.organizationId;

    // Check if analysis exists and user has access
    const analysis = await prisma.analysisResult.findFirst({
      where: {
        id: analysisId,
        OR: [
          { userId: userId },
          { organizationId: organizationId }
        ]
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'retry':
        if (analysis.status !== 'FAILED') {
          return NextResponse.json(
            { error: 'Only failed analyses can be retried' },
            { status: 400 }
          );
        }

        const retried = await analysisQueue.retryJob(analysisId);
        if (!retried) {
          return NextResponse.json(
            { error: 'Failed to retry analysis' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Analysis queued for retry'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    );
  }
} 