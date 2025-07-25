import { prisma } from './db';

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface AnalyticsTrends {
  contracts: TrendData;
  analyses: TrendData;
  uploads: TrendData;
  views: TrendData;
  processingTime: TrendData;
  costs: TrendData;
  risks: TrendData;
  successRate: TrendData;
}

export interface TrendCalculationOptions {
  userId: string;
  organizationId?: string;
  period: 'week' | 'month' | 'year';
  compareWith?: 'previous' | 'same_period_last_year';
}

/**
 * Calculate date ranges for trend comparison
 */
function calculateDateRanges(period: string, compareWith: string = 'previous') {
  const now = new Date();
  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case 'week':
      // Current week (Monday to Sunday)
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay() + 1);
      currentWeekStart.setHours(0, 0, 0, 0);
      
      currentStart = currentWeekStart;
      currentEnd = new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      if (compareWith === 'previous') {
        previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEnd = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
      } else {
        // Same period last year
        previousStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate());
        previousEnd = new Date(previousStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      }
      break;

    case 'month':
      // Current month
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      if (compareWith === 'previous') {
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      } else {
        // Same month last year
        previousStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        previousEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);
      }
      break;

    case 'year':
      // Current year
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date(now.getFullYear(), 11, 31);
      
      if (compareWith === 'previous') {
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
      } else {
        // Same period last year (not applicable for year comparison)
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
      }
      break;

    default:
      throw new Error(`Invalid period: ${period}`);
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}

/**
 * Calculate trend data for a metric
 */
function calculateTrend(current: number, previous: number): TrendData {
  const change = current - previous;
  const percentage = previous > 0 ? (change / previous) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(percentage) < 1) {
    trend = 'stable';
  } else if (percentage > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return {
    current,
    previous,
    change,
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    trend,
    period: 'current'
  };
}

/**
 * Calculate contract trends
 */
async function calculateContractTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    deletedAt: null,
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentCount, previousCount] = await Promise.all([
    prisma.contract.count({ where: whereClause(currentStart, currentEnd) }),
    prisma.contract.count({ where: whereClause(previousStart, previousEnd) }),
  ]);

  return calculateTrend(currentCount, previousCount);
}

/**
 * Calculate analysis trends
 */
async function calculateAnalysisTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentCount, previousCount] = await Promise.all([
    prisma.analysisResult.count({ where: whereClause(currentStart, currentEnd) }),
    prisma.analysisResult.count({ where: whereClause(previousStart, previousEnd) }),
  ]);

  return calculateTrend(currentCount, previousCount);
}

/**
 * Calculate upload trends (contract uploads)
 */
async function calculateUploadTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    activityType: 'contract_uploaded',
    createdAt: { gte: start, lte: end },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentCount, previousCount] = await Promise.all([
    prisma.userActivity.count({ where: whereClause(currentStart, currentEnd) }),
    prisma.userActivity.count({ where: whereClause(previousStart, previousEnd) }),
  ]);

  return calculateTrend(currentCount, previousCount);
}

/**
 * Calculate view trends (contract views)
 */
async function calculateViewTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    activityType: 'contract_viewed',
    createdAt: { gte: start, lte: end },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentCount, previousCount] = await Promise.all([
    prisma.userActivity.count({ where: whereClause(currentStart, currentEnd) }),
    prisma.userActivity.count({ where: whereClause(previousStart, previousEnd) }),
  ]);

  return calculateTrend(currentCount, previousCount);
}

/**
 * Calculate processing time trends
 */
async function calculateProcessingTimeTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    processingTime: { not: null },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentAvg, previousAvg] = await Promise.all([
    prisma.analysisResult.aggregate({
      where: whereClause(currentStart, currentEnd),
      _avg: { processingTime: true },
    }),
    prisma.analysisResult.aggregate({
      where: whereClause(previousStart, previousEnd),
      _avg: { processingTime: true },
    }),
  ]);

  const current = currentAvg._avg.processingTime || 0;
  const previous = previousAvg._avg.processingTime || 0;

  return calculateTrend(current, previous);
}

/**
 * Calculate cost trends
 */
async function calculateCostTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    estimatedCost: { not: null },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentSum, previousSum] = await Promise.all([
    prisma.analysisResult.aggregate({
      where: whereClause(currentStart, currentEnd),
      _sum: { estimatedCost: true },
    }),
    prisma.analysisResult.aggregate({
      where: whereClause(previousStart, previousEnd),
      _sum: { estimatedCost: true },
    }),
  ]);

  const current = Number(currentSum._sum.estimatedCost) || 0;
  const previous = Number(previousSum._sum.estimatedCost) || 0;

  return calculateTrend(current, previous);
}

/**
 * Calculate risk trends
 */
async function calculateRiskTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    highRiskCount: { not: null },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentAvg, previousAvg] = await Promise.all([
    prisma.analysisResult.aggregate({
      where: whereClause(currentStart, currentEnd),
      _avg: { highRiskCount: true },
    }),
    prisma.analysisResult.aggregate({
      where: whereClause(previousStart, previousEnd),
      _avg: { highRiskCount: true },
    }),
  ]);

  const current = currentAvg._avg.highRiskCount || 0;
  const previous = previousAvg._avg.highRiskCount || 0;

  return calculateTrend(current, previous);
}

/**
 * Calculate success rate trends
 */
async function calculateSuccessRateTrends(options: TrendCalculationOptions): Promise<TrendData> {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentStats, previousStats] = await Promise.all([
    prisma.analysisResult.groupBy({
      by: ['status'],
      where: whereClause(currentStart, currentEnd),
      _count: { status: true },
    }),
    prisma.analysisResult.groupBy({
      by: ['status'],
      where: whereClause(previousStart, previousEnd),
      _count: { status: true },
    }),
  ]);

  const getSuccessRate = (stats: any[]) => {
    const total = stats.reduce((sum, stat) => sum + stat._count.status, 0);
    const completed = stats.find(stat => stat.status === 'COMPLETED')?._count.status || 0;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const current = getSuccessRate(currentStats);
  const previous = getSuccessRate(previousStats);

  return calculateTrend(current, previous);
}

/**
 * Calculate comprehensive analytics trends
 */
export async function calculateAnalyticsTrends(options: TrendCalculationOptions): Promise<AnalyticsTrends> {
  const [
    contracts,
    analyses,
    uploads,
    views,
    processingTime,
    costs,
    risks,
    successRate,
  ] = await Promise.all([
    calculateContractTrends(options),
    calculateAnalysisTrends(options),
    calculateUploadTrends(options),
    calculateViewTrends(options),
    calculateProcessingTimeTrends(options),
    calculateCostTrends(options),
    calculateRiskTrends(options),
    calculateSuccessRateTrends(options),
  ]);

  return {
    contracts,
    analyses,
    uploads,
    views,
    processingTime,
    costs,
    risks,
    successRate,
  };
}

/**
 * Get trend summary for display
 */
export function getTrendSummary(trend: TrendData): string {
  const sign = trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : '';
  return `${sign}${Math.abs(trend.percentage)}%`;
}

/**
 * Get trend color for UI
 */
export function getTrendColor(trend: TrendData): string {
  switch (trend.trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get trend icon for UI
 */
export function getTrendIcon(trend: TrendData): 'trending-up' | 'trending-down' | 'minus' {
  switch (trend.trend) {
    case 'up':
      return 'trending-up';
    case 'down':
      return 'trending-down';
    default:
      return 'minus';
  }
}

/**
 * Calculate time series data for charts
 */
export async function calculateTimeSeriesData(options: TrendCalculationOptions) {
  const { currentStart, currentEnd } = calculateDateRanges(options.period);
  
  const whereClause = {
    userId: options.userId,
    createdAt: { gte: currentStart, lte: currentEnd },
    ...(options.organizationId && { organizationId: options.organizationId }),
  };

  // Get daily data for the current period
  const dailyData = await prisma.usageLog.groupBy({
    by: ['action', 'createdAt'],
    where: whereClause,
    _count: { action: true },
    orderBy: [{ createdAt: 'asc' }],
  });

  // Process into time series format
  const timeSeries = dailyData.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][item.action] = item._count.action;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  return timeSeries;
}

/**
 * Calculate performance metrics trends
 */
export async function calculatePerformanceTrends(options: TrendCalculationOptions) {
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(options.period);
  
  const whereClause = (start: Date, end: Date) => ({
    userId: options.userId,
    createdAt: { gte: start, lte: end },
    processingTime: { not: null },
    ...(options.organizationId && { organizationId: options.organizationId }),
  });

  const [currentMetrics, previousMetrics] = await Promise.all([
    prisma.analysisResult.aggregate({
      where: whereClause(currentStart, currentEnd),
      _avg: { processingTime: true, confidenceScore: true },
      _min: { processingTime: true },
      _max: { processingTime: true },
    }),
    prisma.analysisResult.aggregate({
      where: whereClause(previousStart, previousEnd),
      _avg: { processingTime: true, confidenceScore: true },
      _min: { processingTime: true },
      _max: { processingTime: true },
    }),
  ]);

  return {
    processingTime: calculateTrend(
      currentMetrics._avg.processingTime || 0,
      previousMetrics._avg.processingTime || 0
    ),
    confidenceScore: calculateTrend(
      Number(currentMetrics._avg.confidenceScore) || 0,
      Number(previousMetrics._avg.confidenceScore) || 0
    ),
    minProcessingTime: calculateTrend(
      currentMetrics._min.processingTime || 0,
      previousMetrics._min.processingTime || 0
    ),
    maxProcessingTime: calculateTrend(
      currentMetrics._max.processingTime || 0,
      previousMetrics._max.processingTime || 0
    ),
  };
} 