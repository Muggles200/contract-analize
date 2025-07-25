import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for report generation
const generateReportSchema = z.object({
  template: z.enum(['overview', 'usage', 'performance', 'cost', 'risk', 'custom']),
  reportType: z.enum(['summary', 'detailed', 'comparison']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  organizationId: z.string().optional(),
  filters: z.any().optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeCharts: z.boolean().default(true),
  includeRawData: z.boolean().default(false),
});

// Report templates with their data requirements
const reportTemplates = {
  overview: {
    name: 'Overview Report',
    description: 'High-level summary of all activities',
    dataPoints: ['contracts', 'analyses', 'usage', 'trends'],
  },
  usage: {
    name: 'Usage Report',
    description: 'Detailed usage statistics and patterns',
    dataPoints: ['usageByAction', 'timeSeriesData', 'contractTypes', 'analysisTypes'],
  },
  performance: {
    name: 'Performance Report',
    description: 'Analysis performance and quality metrics',
    dataPoints: ['processingTime', 'confidenceScores', 'errorRates', 'successRates'],
  },
  cost: {
    name: 'Cost Report',
    description: 'Cost analysis and billing insights',
    dataPoints: ['estimatedCosts', 'tokenUsage', 'costByType', 'costTrends'],
  },
  risk: {
    name: 'Risk Report',
    description: 'Risk assessment and mitigation insights',
    dataPoints: ['riskDistribution', 'highRiskItems', 'riskTrends', 'mitigationSuggestions'],
  },
  custom: {
    name: 'Custom Report',
    description: 'Custom report with user-defined parameters',
    dataPoints: ['userDefined'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const template = searchParams.get('template') || 'overview';
    const reportType = searchParams.get('type') || 'summary';
    const dateRange = searchParams.get('dateRange') || 'month';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // completed, failed, processing

    // Build where clause for report history
    const where: any = {
      userId: session.user.id,
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    // Get report history with pagination
    const [reports, totalCount] = await Promise.all([
      prisma.reportHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.reportHistory.count({ where }),
    ]);

    // Get available templates
    const availableTemplates = Object.entries(reportTemplates).map(([key, template]) => ({
      id: key,
      ...template,
    }));

    // Get report statistics
    const reportStats = await prisma.reportHistory.groupBy({
      by: ['status'],
      where: {
        userId: session.user.id,
        ...(organizationId && { organizationId }),
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      total: totalCount,
      completed: reportStats.find(s => s.status === 'completed')?._count.status || 0,
      failed: reportStats.find(s => s.status === 'failed')?._count.status || 0,
      processing: reportStats.find(s => s.status === 'processing')?._count.status || 0,
    };

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats,
      availableTemplates,
      filters: {
        template,
        reportType,
        dateRange,
        status,
      },
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = generateReportSchema.parse(body);

    // Check if template exists
    if (!reportTemplates[validatedData.template]) {
      return NextResponse.json(
        { error: 'Invalid report template' },
        { status: 400 }
      );
    }

    // Create report history entry
    const reportHistory = await prisma.reportHistory.create({
      data: {
        userId: session.user.id,
        organizationId: validatedData.organizationId,
        reportName: reportTemplates[validatedData.template].name,
        template: validatedData.template,
        reportType: validatedData.reportType,
        dateRange: {
          start: validatedData.dateRange.start,
          end: validatedData.dateRange.end,
        },
        status: 'processing',
        metadata: {
          filters: validatedData.filters,
          format: validatedData.format,
          includeCharts: validatedData.includeCharts,
          includeRawData: validatedData.includeRawData,
        },
      },
    });

    // Generate report data asynchronously
    generateReportData(reportHistory.id, validatedData, session.user.id).catch(error => {
      console.error('Error generating report data:', error);
    });

    // Log the activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        organizationId: validatedData.organizationId,
        activityType: 'report_generated',
        description: `Generated ${validatedData.template} report`,
        metadata: {
          reportId: reportHistory.id,
          template: validatedData.template,
          reportType: validatedData.reportType,
        },
      },
    });

    return NextResponse.json({
      message: 'Report generation started',
      reportId: reportHistory.id,
      status: 'processing',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Async function to generate report data
async function generateReportData(
  reportId: string,
  data: z.infer<typeof generateReportSchema>,
  userId: string
) {
  try {
    const startDate = new Date(data.dateRange.start);
    const endDate = new Date(data.dateRange.end);

    // Build where clause
    const where: any = {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (data.organizationId) {
      where.organizationId = data.organizationId;
    }

    // Generate data based on template
    let reportData: any = {};

    switch (data.template) {
      case 'overview':
        reportData = await generateOverviewData(where, data);
        break;
      case 'usage':
        reportData = await generateUsageData(where, data);
        break;
      case 'performance':
        reportData = await generatePerformanceData(where, data);
        break;
      case 'cost':
        reportData = await generateCostData(where, data);
        break;
      case 'risk':
        reportData = await generateRiskData(where, data);
        break;
      case 'custom':
        reportData = await generateCustomData(where, data);
        break;
    }

    // Generate file if needed
    let filePath = null;
    let fileSize = null;

    if (data.format !== 'json') {
      const fileResult = await generateReportFile(reportData, data.format, reportId, userId);
      filePath = fileResult.filePath;
      fileSize = fileResult.fileSize;
    }

    // Update report history
    await prisma.reportHistory.update({
      where: { id: reportId },
      data: {
        status: 'completed',
        filePath,
        fileSize: fileSize ? BigInt(fileSize) : null,
        metadata: {
          ...reportData.metadata,
          generatedAt: new Date().toISOString(),
          dataPoints: reportData.dataPoints || [],
        },
      },
    });

  } catch (error) {
    console.error('Error generating report data:', error);
    
    // Update report history with error
    await prisma.reportHistory.update({
      where: { id: reportId },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

// Generate overview report data
async function generateOverviewData(where: any, data: z.infer<typeof generateReportSchema>) {
  const [
    totalContracts,
    totalAnalyses,
    contractsThisPeriod,
    analysesThisPeriod,
    usageStats,
    recentActivity,
  ] = await Promise.all([
    prisma.contract.count({
      where: {
        userId: where.userId,
        deletedAt: null,
        ...(where.organizationId && { organizationId: where.organizationId }),
      },
    }),
    prisma.analysisResult.count({
      where: {
        userId: where.userId,
        ...(where.organizationId && { organizationId: where.organizationId }),
      },
    }),
    prisma.contract.count({
      where: {
        ...where,
        deletedAt: null,
      },
    }),
    prisma.analysisResult.count({ where }),
    prisma.usageLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
    }),
    prisma.userActivity.findMany({
      where: {
        userId: where.userId,
        ...(where.organizationId && { organizationId: where.organizationId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    overview: {
      totalContracts,
      totalAnalyses,
      contractsThisPeriod,
      analysesThisPeriod,
    },
    usage: usageStats,
    recentActivity,
    dataPoints: ['contracts', 'analyses', 'usage', 'activity'],
  };
}

// Generate usage report data
async function generateUsageData(where: any, data: z.infer<typeof generateReportSchema>) {
  const [
    usageByAction,
    usageOverTime,
    contractTypes,
    analysisTypes,
  ] = await Promise.all([
    prisma.usageLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
    }),
    prisma.usageLog.groupBy({
      by: ['action', 'createdAt'],
      where,
      _count: { action: true },
      orderBy: [{ createdAt: 'asc' }],
    }),
    prisma.contract.groupBy({
      by: ['contractType'],
      where: {
        ...where,
        deletedAt: null,
      },
      _count: { contractType: true },
    }),
    prisma.analysisResult.groupBy({
      by: ['analysisType'],
      where,
      _count: { analysisType: true },
    }),
  ]);

  return {
    usageByAction,
    usageOverTime,
    contractTypes,
    analysisTypes,
    dataPoints: ['usageByAction', 'timeSeriesData', 'contractTypes', 'analysisTypes'],
  };
}

// Generate performance report data
async function generatePerformanceData(where: any, data: z.infer<typeof generateReportSchema>) {
  const [
    performanceMetrics,
    processingTimeDistribution,
    confidenceScores,
    errorRates,
  ] = await Promise.all([
    prisma.analysisResult.aggregate({
      where: {
        ...where,
        processingTime: { not: null },
      },
      _avg: { processingTime: true, confidenceScore: true },
      _min: { processingTime: true },
      _max: { processingTime: true },
    }),
    prisma.analysisResult.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
    prisma.analysisResult.findMany({
      where: {
        ...where,
        confidenceScore: { not: null },
      },
      select: { confidenceScore: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.analysisResult.groupBy({
      by: ['status'],
      where: {
        ...where,
        status: { in: ['FAILED', 'CANCELLED'] },
      },
      _count: { status: true },
    }),
  ]);

  return {
    performanceMetrics,
    processingTimeDistribution,
    confidenceScores,
    errorRates,
    dataPoints: ['processingTime', 'confidenceScores', 'errorRates', 'successRates'],
  };
}

// Generate cost report data
async function generateCostData(where: any, data: z.infer<typeof generateReportSchema>) {
  const [
    costMetrics,
    costByType,
    tokenUsage,
  ] = await Promise.all([
    prisma.analysisResult.aggregate({
      where: {
        ...where,
        estimatedCost: { not: null },
      },
      _sum: { estimatedCost: true },
      _avg: { estimatedCost: true },
    }),
    prisma.analysisResult.groupBy({
      by: ['analysisType'],
      where: {
        ...where,
        estimatedCost: { not: null },
      },
      _sum: { estimatedCost: true },
    }),
    prisma.analysisResult.aggregate({
      where: {
        ...where,
        tokensUsed: { not: null },
      },
      _sum: { tokensUsed: true },
      _avg: { tokensUsed: true },
    }),
  ]);

  return {
    costMetrics,
    costByType,
    tokenUsage,
    dataPoints: ['estimatedCosts', 'tokenUsage', 'costByType', 'costTrends'],
  };
}

// Generate risk report data
async function generateRiskData(where: any, data: z.infer<typeof generateReportSchema>) {
  const [
    riskDistribution,
    highRiskItems,
    riskTrends,
  ] = await Promise.all([
    prisma.analysisResult.groupBy({
      by: ['highRiskCount', 'criticalRiskCount'],
      where: {
        ...where,
        highRiskCount: { not: null },
      },
      _count: { highRiskCount: true },
    }),
    prisma.analysisResult.findMany({
      where: {
        ...where,
        highRiskCount: { gt: 0 },
      },
      select: {
        id: true,
        highRiskCount: true,
        criticalRiskCount: true,
        contract: {
          select: { fileName: true },
        },
        createdAt: true,
      },
      orderBy: { highRiskCount: 'desc' },
      take: 20,
    }),
    prisma.analysisResult.findMany({
      where: {
        ...where,
        highRiskCount: { not: null },
      },
      select: {
        highRiskCount: true,
        criticalRiskCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return {
    riskDistribution,
    highRiskItems,
    riskTrends,
    dataPoints: ['riskDistribution', 'highRiskItems', 'riskTrends', 'mitigationSuggestions'],
  };
}

// Generate custom report data
async function generateCustomData(where: any, data: z.infer<typeof generateReportSchema>) {
  // This would be implemented based on custom filters and requirements
  return {
    customData: 'Custom report data based on user-defined parameters',
    dataPoints: ['userDefined'],
  };
}

// Generate report file with real data
async function generateReportFile(data: any, format: string, reportId: string, userId: string) {
  const { generatePDFReport, generateCSVExport, generateJSONExport } = await import('@/lib/export-utils');
  
  const options = {
    format: format as 'pdf' | 'csv' | 'json',
    template: 'analytics-report',
    dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
    reportType: 'analytics',
    userId
  };

  let fileBuffer: Buffer;
  let fileSize: number;

  switch (format) {
    case 'pdf':
      fileBuffer = await generatePDFReport(data, options);
      break;
    case 'csv':
      // Convert data to array format for CSV
      const csvData = Object.entries(data).map(([key, value]) => ({ metric: key, value: JSON.stringify(value) }));
      fileBuffer = await generateCSVExport(csvData, options);
      break;
    case 'json':
      fileBuffer = await generateJSONExport(data, options);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  fileSize = fileBuffer.length;

  // In a real implementation, you would save the file to storage (S3, Vercel Blob, etc.)
  // For now, we'll return the file info
  return {
    filePath: `/reports/${reportId}.${format}`,
    fileSize,
    fileBuffer // This would be saved to storage in production
  };
} 