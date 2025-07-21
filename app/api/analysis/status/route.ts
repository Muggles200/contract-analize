import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Build where clause
    const whereClause: any = {
      userId: userId
    };

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    // Fetch analyses with their current status
    const analyses = await prisma.analysisResult.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        contract: {
          select: {
            id: true,
            fileName: true,
            contractName: true
          }
        }
      }
    });

    // Get aggregated statistics
    const stats = await prisma.analysisResult.groupBy({
      by: ['status'],
      where: { userId: userId },
      _count: {
        id: true
      }
    });

    // Calculate processing statistics
    const recentAnalyses = await prisma.analysisResult.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        processingTime: true,
        tokensUsed: true,
        estimatedCost: true
      }
    });

    // Calculate averages
    const avgProcessingTime = recentAnalyses.length > 0 
      ? recentAnalyses.reduce((acc, a) => acc + (a.processingTime || 0), 0) / recentAnalyses.length
      : 0;

    const totalTokensUsed = recentAnalyses.reduce((acc, a) => acc + (a.tokensUsed || 0), 0);
    const totalCost = recentAnalyses.reduce((acc, a) => acc + (Number(a.estimatedCost) || 0), 0);

    // Convert dates to strings and normalize status
    const normalizedAnalyses = analyses.map(analysis => ({
      ...analysis,
      status: analysis.status.toLowerCase(),
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
      startedAt: analysis.startedAt?.toISOString(),
      completedAt: analysis.completedAt?.toISOString(),
      estimatedCost: analysis.estimatedCost ? Number(analysis.estimatedCost) : null
    }));

    // Normalize stats
    const normalizedStats = stats.map(stat => ({
      status: stat.status.toLowerCase(),
      count: stat._count.id
    }));

    return NextResponse.json({
      success: true,
      data: {
        analyses: normalizedAnalyses,
        statistics: {
          byStatus: normalizedStats,
          processing: {
            averageTime: Math.round(avgProcessingTime),
            totalTokensToday: totalTokensUsed,
            totalCostToday: Number(totalCost.toFixed(4)),
            completedToday: recentAnalyses.length
          }
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching analysis status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis status' },
      { status: 500 }
    );
  }
} 