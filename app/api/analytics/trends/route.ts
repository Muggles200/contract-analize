import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { 
  calculateAnalyticsTrends, 
  calculateTimeSeriesData, 
  calculatePerformanceTrends 
} from '@/lib/analytics-trends';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const period = searchParams.get('period') || 'month';
    const compareWith = searchParams.get('compareWith') || 'previous';

    // Validate period
    if (!['week', 'month', 'year'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be week, month, or year' },
        { status: 400 }
      );
    }

    // Validate compareWith
    if (!['previous', 'same_period_last_year'].includes(compareWith)) {
      return NextResponse.json(
        { error: 'Invalid compareWith. Must be previous or same_period_last_year' },
        { status: 400 }
      );
    }

    // Calculate comprehensive trends
    const trends = await calculateAnalyticsTrends({
      userId: session.user.id,
      organizationId: organizationId || undefined,
      period: period as 'week' | 'month' | 'year',
      compareWith: compareWith as 'previous' | 'same_period_last_year',
    });

    // Calculate time series data
    const timeSeriesData = await calculateTimeSeriesData({
      userId: session.user.id,
      organizationId: organizationId || undefined,
      period: period as 'week' | 'month' | 'year',
    });

    // Calculate performance trends
    const performanceTrends = await calculatePerformanceTrends({
      userId: session.user.id,
      organizationId: organizationId || undefined,
      period: period as 'week' | 'month' | 'year',
    });

    return NextResponse.json({
      success: true,
      trends,
      timeSeriesData,
      performanceTrends,
      period,
      compareWith,
      calculatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error calculating analytics trends:', error);
    return NextResponse.json(
      { error: 'Failed to calculate trends' },
      { status: 500 }
    );
  }
} 