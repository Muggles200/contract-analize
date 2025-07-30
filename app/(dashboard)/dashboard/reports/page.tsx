import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Activity,
  Plus,
  Filter,
  RefreshCw
} from "lucide-react";
import ReportGenerator from "./components/ReportGenerator";
import ReportTemplates from "./components/ReportTemplates";
import ScheduledReports from "./components/ScheduledReports";
import ReportHistory from "./components/ReportHistory";
import ExportOptions from "./components/ExportOptions";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    template?: string; 
    dateRange?: string; 
    organizationId?: string;
    type?: string;
  }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const template = params.template || 'overview';
  const dateRange = params.dateRange || 'month';
  const organizationId = params.organizationId;
  const reportType = params.type || 'summary';

  // Calculate date range based on selection
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  
  switch (dateRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      // For custom dates, we'll handle this in the component
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Build where clause
  const where: any = {
    userId: session.user.id,
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (organizationId) {
    where.organizationId = organizationId;
  }

  // Fetch report data based on template and type
  const [
    contractsData,
    analysesData,
    usageData,
    costData,
    riskData,
    scheduledReports,
    reportHistory
  ] = await Promise.all([
    // Contracts data
    prisma.contract.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        analysisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Analyses data
    prisma.analysisResult.findMany({
      where,
      include: {
        contract: {
          select: {
            id: true,
            fileName: true,
            contractName: true,
            contractType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Usage data
    prisma.usageLog.groupBy({
      by: ['action', 'createdAt'],
      where,
      _count: {
        action: true,
      },
      orderBy: [
        { createdAt: 'asc' }
      ],
    }),

    // Cost data
    prisma.analysisResult.aggregate({
      where: {
        ...where,
        estimatedCost: {
          not: null,
        },
      },
      _sum: {
        estimatedCost: true,
        tokensUsed: true,
      },
      _avg: {
        estimatedCost: true,
        processingTime: true,
        confidenceScore: true,
      },
      _count: {
        id: true,
      },
    }),

    // Risk data
    prisma.analysisResult.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
      },
      select: {
        results: true,
        totalRisks: true,
        highRiskCount: true,
        criticalRiskCount: true,
        contract: {
          select: {
            contractType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),

    // Scheduled reports
    prisma.scheduledReport.findMany({
      where: {
        userId: session.user.id,
        ...(organizationId && { organizationId }),
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Report history
    prisma.reportHistory.findMany({
      where: {
        userId: session.user.id,
        ...(organizationId && { organizationId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  // Process risk data
  const processedRiskData = riskData.reduce((acc, analysis) => {
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

  // Process usage data for time series
  const usageTimeSeries = usageData.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][item.action] = item._count.action;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  // Transform scheduled reports to match interface
  const transformedScheduledReports = scheduledReports.map(report => ({
    ...report,
    description: report.description || undefined,
    dayOfWeek: report.dayOfWeek || undefined,
    dayOfMonth: report.dayOfMonth || undefined,
    timeOfDay: report.timeOfDay || undefined,
    recipients: Array.isArray(report.recipients) ? (report.recipients as string[]) : undefined,
    lastRunAt: report.lastRunAt || undefined,
    nextRunAt: report.nextRunAt || undefined,
  }));

  const reportData = {
    contracts: contractsData,
    analyses: analysesData,
    usage: usageTimeSeries,
    cost: costData,
    risks: Object.entries(processedRiskData)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    scheduledReports: transformedScheduledReports,
    reportHistory,
    dateRange: {
      start: startDate,
      end: endDate,
      period: dateRange,
    },
    template,
    reportType,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-purple-100">
              Generate comprehensive reports and export insights from your contract analysis data.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <ReportGenerator 
        data={reportData} 
        template={template}
        dateRange={dateRange}
        organizationId={organizationId}
        reportType={reportType}
      />

      {/* Report Templates */}
      <ReportTemplates 
        currentTemplate={template}
        currentDateRange={dateRange}
        organizationId={organizationId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Reports */}
        <ScheduledReports 
          scheduledReports={transformedScheduledReports}
          organizationId={organizationId}
        />

        {/* Export Options */}
        <ExportOptions 
          data={reportData}
          template={template}
          dateRange={dateRange}
        />
      </div>

      {/* Report History */}
      <ReportHistory 
        reportHistory={reportHistory as any}
        organizationId={organizationId}
      />
    </div>
  );
} 