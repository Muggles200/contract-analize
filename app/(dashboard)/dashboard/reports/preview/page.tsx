import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Download, 
  Share2, 
  ArrowLeft,
  Eye,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Users,
  CheckCircle,
  Clock,
  File,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import ReportActions from "./components/ReportActions";

export default async function ReportPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    template?: string; 
    dateRange?: string; 
    type?: string;
    organizationId?: string;
  }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const template = params.template || 'overview';
  const dateRange = params.dateRange || 'month';
  const reportType = params.type || 'summary';
  const organizationId = params.organizationId;

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

  // Fetch report data
  const [
    contractsData,
    analysesData,
    costData,
    riskData
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

  const getTemplateInfo = () => {
    const templates = {
      overview: {
        name: 'Overview Report',
        description: 'High-level summary of contracts and analyses',
        icon: BarChart3,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      performance: {
        name: 'Performance Report',
        description: 'Analysis performance and processing metrics',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      cost: {
        name: 'Cost Analysis Report',
        description: 'Detailed cost breakdown and token usage',
        icon: DollarSign,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      risks: {
        name: 'Risk Assessment Report',
        description: 'Risk analysis and mitigation recommendations',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      },
      usage: {
        name: 'Usage Report',
        description: 'User activity and feature utilization',
        icon: Activity,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
      comprehensive: {
        name: 'Comprehensive Report',
        description: 'Complete analysis with all metrics and insights',
        icon: FileText,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      },
    };
    return templates[template as keyof typeof templates] || templates.overview;
  };

  const getReportTypeInfo = () => {
    const types = {
      summary: { name: 'Summary', description: 'Key metrics and highlights' },
      detailed: { name: 'Detailed', description: 'Comprehensive analysis with charts' },
      executive: { name: 'Executive', description: 'High-level insights for leadership' },
      technical: { name: 'Technical', description: 'Technical details and performance data' },
    };
    return types[reportType as keyof typeof types] || types.summary;
  };

  const getDateRangeInfo = () => {
    const ranges = {
      week: { name: 'Last 7 Days', description: 'Past week' },
      month: { name: 'This Month', description: 'Current month' },
      quarter: { name: 'This Quarter', description: 'Current quarter' },
      year: { name: 'This Year', description: 'Current year' },
    };
    return ranges[dateRange as keyof typeof ranges] || ranges.month;
  };

  const templateInfo = getTemplateInfo();
  const reportTypeInfo = getReportTypeInfo();
  const dateRangeInfo = getDateRangeInfo();
  const Icon = templateInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/reports"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Reports</span>
              </Link>
            </div>
            <ReportActions 
              template={template}
              dateRange={dateRange}
              reportType={reportType}
              organizationId={organizationId}
            />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${templateInfo.bgColor}`}>
                <Icon className={`w-8 h-8 ${templateInfo.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {templateInfo.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {templateInfo.description}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{dateRangeInfo.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{reportTypeInfo.name} Report</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Generated {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Report Status</div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {contractsData.length}
              </div>
              <div className="text-sm text-gray-600">Total Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analysesData.length}
              </div>
              <div className="text-sm text-gray-600">Analyses Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${costData._sum.estimatedCost ? Number(costData._sum.estimatedCost).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {Object.keys(processedRiskData).length}
              </div>
              <div className="text-sm text-gray-600">Risk Categories</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Processing Time</span>
                <span className="font-medium">
                  {costData._avg.processingTime ? `${Math.round(Number(costData._avg.processingTime) / 1000)}s` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Confidence Score</span>
                <span className="font-medium">
                  {costData._avg.confidenceScore ? `${(Number(costData._avg.confidenceScore) * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tokens Used</span>
                <span className="font-medium">
                  {costData._sum.tokensUsed ? costData._sum.tokensUsed.toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-medium text-green-600">
                  ${costData._sum.estimatedCost ? Number(costData._sum.estimatedCost).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Cost per Analysis</span>
                <span className="font-medium">
                  ${costData._avg.estimatedCost ? Number(costData._avg.estimatedCost).toFixed(4) : '0.0000'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Analyses with Cost Data</span>
                <span className="font-medium">
                  {costData._count.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(processedRiskData)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([riskType, count], index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{riskType}</span>
                    <span className="text-sm text-gray-500">{count} occurrences</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(processedRiskData))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {analysesData.slice(0, 5).map((analysis, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <File className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {analysis.contract?.contractName || analysis.contract?.fileName || 'Unknown Contract'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {analysis.contract?.contractType || 'Unknown Type'} • {new Date(analysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    analysis.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    analysis.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 