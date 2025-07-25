import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent batch analysis jobs
    const jobs = await prisma.analysisResult.findMany({
      where: { 
        userId: session.user.id,
        customParameters: {
          path: ['batchJob'],
          equals: true
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        contract: {
          select: {
            fileName: true,
          }
        }
      }
    });

    // Get batch analysis statistics
    const stats = await prisma.analysisResult.groupBy({
      by: ['status'],
      where: { 
        userId: session.user.id,
        customParameters: {
          path: ['batchJob'],
          equals: true
        }
      },
      _count: {
        status: true
      }
    });

    const statusStats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: jobs.length
    };

    stats.forEach(stat => {
      if (statusStats.hasOwnProperty(stat.status)) {
        statusStats[stat.status as keyof typeof statusStats] = stat._count.status;
      }
    });

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        analysisType: job.analysisType,
        createdAt: job.createdAt,
        contract: job.contract,
        progress: job.progress,
      })),
      stats: statusStats,
    });

  } catch (error) {
    console.error('Batch analysis status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch analysis status' },
      { status: 500 }
    );
  }
} 