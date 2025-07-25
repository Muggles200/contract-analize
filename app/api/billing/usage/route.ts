import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // week, month, year

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get usage statistics
    const [currentPeriodStats, historicalStats] = await Promise.all([
      // Current period statistics
      prisma.analysisResult.groupBy({
        by: ['status'],
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate }
        },
        _count: { id: true },
        _sum: { 
          processingTime: true,
          estimatedCost: true,
          tokensUsed: true
        }
      }),

      // Historical data for the last 6 months
      prisma.analysisResult.groupBy({
        by: ['createdAt'],
        where: {
          userId: session.user.id,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) }
        },
        _count: { id: true },
        _sum: { estimatedCost: true }
      })
    ]);

    // Calculate current period metrics
    const completedAnalyses = currentPeriodStats.find(stat => stat.status === 'COMPLETED');
    const totalCost = currentPeriodStats.reduce((sum, stat) => {
      return sum + (Number(stat._sum.estimatedCost) || 0);
    }, 0);
    
    const totalProcessingTime = currentPeriodStats.reduce((sum, stat) => {
      return sum + (stat._sum.processingTime || 0);
    }, 0);

    const averageProcessingTime = completedAnalyses?._count.id 
      ? Math.round(totalProcessingTime / completedAnalyses._count.id)
      : 0;

    // Process historical data
    const history = historicalStats.map(stat => ({
      month: stat.createdAt.toISOString().substring(0, 7), // YYYY-MM
      contractsAnalyzed: stat._count.id,
      totalCost: Number(stat._sum.estimatedCost) || 0
    }));

    return NextResponse.json({
      currentPeriod: {
        contractsAnalyzed: completedAnalyses?._count.id || 0,
        totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
        averageProcessingTime,
        period
      },
      history
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
} 
