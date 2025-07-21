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

    // Get analysis result
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
            createdAt: true
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

    // Calculate processing time if completed
    let processingTime = null;
    if (analysis.completedAt && analysis.startedAt) {
      processingTime = analysis.completedAt.getTime() - analysis.startedAt.getTime();
    } else if (analysis.startedAt) {
      processingTime = Date.now() - analysis.startedAt.getTime();
    }

    // Prepare response
    const response: any = {
      id: analysis.id,
      contractId: analysis.contractId,
      analysisType: analysis.analysisType,
      status: analysis.status,
      priority: analysis.priority,
      progress: analysis.progress,
      error: analysis.errorMessage,
      retryCount: analysis.retryCount,
      maxRetries: analysis.maxRetries,
      createdAt: analysis.createdAt,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt,
      processingTime,
      tokensUsed: analysis.tokensUsed,
      estimatedCost: analysis.estimatedCost,
      contract: (analysis as any).contract
    };

    // Add results if completed
    if (analysis.status === 'COMPLETED' && analysis.results) {
      response.results = analysis.results;
      response.summary = analysis.summary;
      response.confidenceScore = analysis.confidenceScore;
      response.totalClauses = analysis.totalClauses;
      response.totalRisks = analysis.totalRisks;
      response.totalRecommendations = analysis.totalRecommendations;
      response.highRiskCount = analysis.highRiskCount;
      response.criticalRiskCount = analysis.criticalRiskCount;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting analysis status:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis status' },
      { status: 500 }
    );
  }
} 