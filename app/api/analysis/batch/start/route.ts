import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { AnalysisStatus } from '@/lib/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contractIds, analysisType } = body;

    if (!contractIds || !Array.isArray(contractIds) || contractIds.length === 0) {
      return NextResponse.json(
        { error: 'Contract IDs are required' },
        { status: 400 }
      );
    }

    if (!analysisType || !['comprehensive', 'risk-assessment', 'clause-extraction', 'basic'].includes(analysisType)) {
      return NextResponse.json(
        { error: 'Valid analysis type is required' },
        { status: 400 }
      );
    }

    // Verify all contracts belong to the user
    const contracts = await prisma.contract.findMany({
      where: {
        id: { in: contractIds },
        userId: session.user.id,
        deletedAt: null
      },
      select: { id: true, fileName: true }
    });

    if (contracts.length !== contractIds.length) {
      return NextResponse.json(
        { error: 'Some contracts not found or access denied' },
        { status: 403 }
      );
    }

    // Create batch analysis jobs
    const batchJobs = await Promise.all(
      contractIds.map(async (contractId) => {
        return await prisma.analysisResult.create({
          data: {
            contractId,
            userId: session.user.id,
            analysisType,
            status: AnalysisStatus.PENDING,
            customParameters: {
              batchJob: true,
              batchStartedAt: new Date().toISOString(),
              analysisType,
            },
            progress: 0,
          },
        });
      })
    );

    // Log the batch analysis creation
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        activityType: 'batch_analysis_started',
        description: `Started batch analysis for ${contractIds.length} contracts`,
        metadata: {
          contractIds,
          analysisType,
          batchJobCount: contractIds.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Batch analysis started for ${contractIds.length} contract(s)`,
      batchJobs: batchJobs.map(job => ({
        id: job.id,
        contractId: job.contractId,
        status: job.status,
        analysisType: job.analysisType,
      })),
    });

  } catch (error) {
    console.error('Batch analysis start error:', error);
    return NextResponse.json(
      { error: 'Failed to start batch analysis' },
      { status: 500 }
    );
  }
} 