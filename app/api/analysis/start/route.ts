import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { analysisQueue } from '@/lib/analysis-queue';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { contractId, analysisType, priority = 'normal' } = body;

    // Validate required fields
    if (!contractId || !analysisType) {
      return NextResponse.json(
        { error: 'Contract ID and analysis type are required' },
        { status: 400 }
      );
    }

    // Validate analysis type
    const validAnalysisTypes = ['comprehensive', 'risk-assessment', 'clause-extraction', 'basic'];
    if (!validAnalysisTypes.includes(analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    // Check if contract exists and user has access
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        OR: [
          { userId: session.user.id },
          { organizationId: session.user.organizationId }
        ]
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found or access denied' },
        { status: 404 }
      );
    }

    // Check if analysis is already in progress
    const existingAnalysis = await prisma.analysisResult.findFirst({
      where: {
        contractId,
        analysisType,
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      }
    });

    if (existingAnalysis) {
      return NextResponse.json(
        { 
          error: 'Analysis already in progress',
          analysisId: existingAnalysis.id
        },
        { status: 409 }
      );
    }

    // Add job to queue
    const analysisId = await analysisQueue.addJob(
      contractId,
      analysisType,
      session.user.id,
      session.user.organizationId,
      priority
    );

    // Get the created analysis record
    const analysis = await prisma.analysisResult.findUnique({
      where: { id: analysisId },
      include: {
        contract: {
          select: {
            fileName: true,
            fileSize: true
          }
        }
      }
    });

    // Convert BigInt to number for JSON serialization
    const serializedAnalysis = analysis ? {
      ...analysis,
      contract: analysis.contract ? {
        ...analysis.contract,
        fileSize: Number(analysis.contract.fileSize)
      } : null
    } : null;

    return NextResponse.json({
      success: true,
      analysisId,
      status: 'pending',
      message: 'Analysis job added to queue',
      analysis: serializedAnalysis
    });

  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
} 