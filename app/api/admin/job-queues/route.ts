import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getQueueHealth } from '@/lib/job-queue';
import { prisma } from '@/lib/db';

// GET - Get job queue health and status
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you would implement proper admin check)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get queue health
    const queueHealth = await getQueueHealth();

    // Get recent job logs
    const recentJobLogs = await prisma.jobLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get failed jobs count
    const failedJobsCount = await prisma.jobLog.count({
      where: { status: 'failed' },
    });

    // Get completed jobs count (last 24 hours)
    const completedJobsCount = await prisma.jobLog.count({
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({
      queueHealth,
      recentJobLogs,
      statistics: {
        failedJobsCount,
        completedJobsCount,
        totalJobs: failedJobsCount + completedJobsCount,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching job queue health:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 