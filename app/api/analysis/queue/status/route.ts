import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analysisQueue } from '@/lib/analysis-queue';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get queue status
    const queueStatus = await analysisQueue.getQueueStatus();

    // Get user's recent jobs
    const userJobs = await analysisQueue.getUserJobs(
      session.user.id,
      session.user.organizationId,
      10, // Limit to 10 recent jobs
      0
    );

    // Get organization jobs if user is in an organization
    let organizationJobs: any[] = [];
    if (session.user.organizationId) {
      organizationJobs = await prisma.analysisResult.findMany({
        where: {
          organizationId: session.user.organizationId,
          status: {
            in: ['PENDING', 'PROCESSING']
          }
        },
        include: {
          contract: {
            select: {
              fileName: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    }

    return NextResponse.json({
      queue: queueStatus,
      userJobs: userJobs.map(job => ({
        id: job.id,
        contractId: job.contractId,
        analysisType: job.analysisType,
        status: job.status,
        priority: job.priority,
        progress: job.progress,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        error: (job as any).error,
        retryCount: job.retryCount
      })),
      organizationJobs: organizationJobs.map(job => ({
        id: job.id,
        contractId: job.contractId,
        analysisType: job.analysisType,
        status: job.status,
        priority: job.priority,
        progress: job.progress,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        user: job.user,
        contract: job.contract
      }))
    });

  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you might want to add admin role checking)
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start':
        analysisQueue.start();
        return NextResponse.json({
          success: true,
          message: 'Queue processor started'
        });

      case 'stop':
        analysisQueue.stop();
        return NextResponse.json({
          success: true,
          message: 'Queue processor stopped'
        });

      case 'cleanup':
        const cleanedCount = await analysisQueue.cleanupOldJobs(30); // 30 days
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${cleanedCount} old jobs`
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error managing queue:', error);
    return NextResponse.json(
      { error: 'Failed to manage queue' },
      { status: 500 }
    );
  }
} 