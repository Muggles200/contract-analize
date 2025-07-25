import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { calculateAnalyticsTrends, calculateTimeSeriesData, calculatePerformanceTrends } from "@/lib/analytics-trends";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Clock,
  Users,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Target
} from "lucide-react";
import AnalyticsOverview from "./components/AnalyticsOverview";
import PerformanceMetrics from "./components/PerformanceMetrics";
import CostAnalysis from "./components/CostAnalysis";
import ContractTypeDistribution from "./components/ContractTypeDistribution";
import CommonRisks from "./components/CommonRisks";
import TimeSeriesCharts from "./components/TimeSeriesCharts";
import AnalyticsFilters from "./components/AnalyticsFilters";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; organizationId?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const period = params.period || 'month';
  const organizationId = params.organizationId;

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

  // Build where clause
  const where: any = {
    userId: session.user.id,
    createdAt: {
      gte: startDate,
    },
  };

  if (organizationId) {
    where.organizationId = organizationId;
  }

  // Calculate real trends
  const trends = await calculateAnalyticsTrends({
    userId: session.user.id,
    organizationId: organizationId || undefined,
    period: period as 'week' | 'month' | 'year',
    compareWith: 'previous',
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

  // Fetch analytics data
  const [
    overviewData,
    performanceData,
    costData,
    contractTypes,
    commonRisks,
  ] = await Promise.all([
    // Overview data
    prisma.$transaction([
      // Total contracts
      prisma.contract.count({
        where: {
          userId: session.user.id,
          deletedAt: null,
          ...(organizationId && { organizationId }),
        },
      }),
      // Total analyses
      prisma.analysisResult.count({
        where: {
          userId: session.user.id,
          ...(organizationId && { organizationId }),
        },
      }),
      // Contracts this period
      prisma.contract.count({
        where: {
          ...where,
          deletedAt: null,
        },
      }),
      // Analyses this period
      prisma.analysisResult.count({
        where,
      }),
      // Usage statistics
      prisma.usageLog.groupBy({
        by: ['action'],
        where: {
          userId: session.user.id,
          createdAt: {
            gte: startDate,
          },
          ...(organizationId && { organizationId }),
        },
        _count: {
          action: true,
        },
        orderBy: [
          { action: 'asc' }
        ],
      }),
    ]),

    // Performance metrics
    prisma.analysisResult.aggregate({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
        processingTime: {
          not: null,
        },
        ...(organizationId && { organizationId }),
      },
      _avg: {
        processingTime: true,
        confidenceScore: true,
      },
      _min: {
        processingTime: true,
      },
      _max: {
        processingTime: true,
      },
      _count: {
        id: true,
      },
    }),

    // Cost analysis
    prisma.analysisResult.aggregate({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
        estimatedCost: {
          not: null,
        },
        ...(organizationId && { organizationId }),
      },
      _sum: {
        estimatedCost: true,
        tokensUsed: true,
      },
      _avg: {
        estimatedCost: true,
      },
      _count: {
        id: true,
      },
    }),

    // Contract type distribution
    prisma.contract.groupBy({
      by: ['contractType'],
      where: {
        userId: session.user.id,
        deletedAt: null,
        createdAt: {
          gte: startDate,
        },
        ...(organizationId && { organizationId }),
      },
      _count: {
        contractType: true,
      },
      orderBy: [
        { contractType: 'asc' }
      ],
    }),

    // Common risks
    prisma.analysisResult.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
        status: 'COMPLETED',
        ...(organizationId && { organizationId }),
      },
      select: {
        results: true,
        totalRisks: true,
        highRiskCount: true,
        criticalRiskCount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    }),

    // Time series data
    prisma.usageLog.groupBy({
      by: ['action', 'createdAt'],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
        ...(organizationId && { organizationId }),
      },
      _count: {
        action: true,
      },
      orderBy: [
        { createdAt: 'asc' }
      ],
    }),
  ]);

  // Process overview data
  const [totalContracts, totalAnalyses, contractsThisPeriod, analysesThisPeriod, usageStats] = overviewData;

  // Transform usage stats to match expected interface
  const transformedUsageStats = usageStats.map(stat => ({
    action: stat.action,
    _count: {
      action: typeof stat._count === 'object' && stat._count?.action ? stat._count.action : 0
    }
  }));



  // Process common risks
  const riskData = commonRisks.reduce((acc, analysis) => {
    if (analysis.results && typeof analysis.results === 'object') {
      const risks = (analysis.results as any).risks || [];
      risks.forEach((risk: any) => {
        const riskType = risk.type || risk.category || 'Other';
        if (!acc[riskType]) {
          acc[riskType] = 0;
        }
        acc[riskType]++;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const analyticsData = {
    overview: {
      totalContracts,
      totalAnalyses,
      contractsThisPeriod,
      analysesThisPeriod,
      usageStats: transformedUsageStats,
      trends,
    },
    performance: {
      _avg: {
        processingTime: performanceData._avg.processingTime ? Number(performanceData._avg.processingTime) : null,
        confidenceScore: performanceData._avg.confidenceScore ? Number(performanceData._avg.confidenceScore) : null,
      },
      _min: {
        processingTime: performanceData._min.processingTime ? Number(performanceData._min.processingTime) : null,
      },
      _max: {
        processingTime: performanceData._max.processingTime ? Number(performanceData._max.processingTime) : null,
      },
      _count: {
        id: performanceData._count.id,
      },
      trends: performanceTrends,
    },
    cost: {
      _sum: {
        estimatedCost: costData._sum.estimatedCost ? Number(costData._sum.estimatedCost) : null,
        tokensUsed: costData._sum.tokensUsed ? Number(costData._sum.tokensUsed) : null,
      },
      _avg: {
        estimatedCost: costData._avg.estimatedCost ? Number(costData._avg.estimatedCost) : null,
      },
      _count: {
        id: costData._count.id,
      },
      trends: {
        costs: trends.costs,
      },
    },
    contractTypes,
    commonRisks: Object.entries(riskData)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    timeSeries: timeSeriesData,
    trends,
    period,
    startDate,
    endDate: now,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-blue-100">
              Comprehensive insights into your contract analysis performance and usage patterns.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnalyticsFilters period={period} organizationId={organizationId} />

      {/* Overview Cards */}
      <AnalyticsOverview data={analyticsData.overview} period={period} />

      {/* Time Series Charts */}
      <TimeSeriesCharts data={analyticsData.timeSeries} period={period} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <PerformanceMetrics data={analyticsData.performance} />

        {/* Cost Analysis */}
        <CostAnalysis data={analyticsData.cost} period={period} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Type Distribution */}
        <ContractTypeDistribution data={analyticsData.contractTypes} />

        {/* Common Risks */}
        <CommonRisks data={analyticsData.commonRisks} />
      </div>
    </div>
  );
} 