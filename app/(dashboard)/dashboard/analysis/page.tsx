import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  RefreshCw,
  FileText,
  Zap,
  Eye,
  Download,
  Settings
} from "lucide-react";
import AnalysisQueueStatus from "./components/AnalysisQueueStatus";
import ProcessingProgress from "./components/ProcessingProgress";
import RecentAnalyses from "./components/RecentAnalyses";
import AnalysisStatistics from "./components/AnalysisStatistics";
import QuickAnalysisActions from "./components/QuickAnalysisActions";

export default async function AnalysisDashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch analysis data
  const [
    pendingAnalysesRaw,
    processingAnalysesRaw,
    recentAnalysesRaw,
    analysisStats,
    queueStats
  ] = await Promise.all([
    // Pending analyses
    prisma.analysisResult.findMany({
      where: { 
        userId: session.user.id,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'asc' },
      include: {
        contract: {
          select: {
            id: true,
            fileName: true,
            contractName: true
          }
        }
      }
    }),
    
    // Processing analyses
    prisma.analysisResult.findMany({
      where: { 
        userId: session.user.id,
        status: 'PROCESSING'
      },
      orderBy: { createdAt: 'asc' },
      include: {
        contract: {
          select: {
            id: true,
            fileName: true,
            contractName: true
          }
        }
      }
    }),
    
    // Recent analyses (last 10)
    prisma.analysisResult.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        contract: {
          select: {
            id: true,
            fileName: true,
            contractName: true
          }
        }
      }
    }),
    
    // Analysis statistics
    prisma.analysisResult.groupBy({
      by: ['status', 'analysisType'],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _count: {
        id: true
      }
    }),
    
    // Queue statistics
    prisma.analysisResult.groupBy({
      by: ['status'],
      where: { userId: session.user.id },
      _count: {
        id: true
      }
    })
  ]);

  // Convert dates to strings for component compatibility
  const convertDatesToStrings = (analysis: any) => ({
    ...analysis,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
    startedAt: analysis.startedAt?.toISOString(),
    completedAt: analysis.completedAt?.toISOString()
  });

  const pendingAnalyses = pendingAnalysesRaw.map(convertDatesToStrings);
  const processingAnalyses = processingAnalysesRaw.map(convertDatesToStrings);
  const recentAnalyses = recentAnalysesRaw.map(convertDatesToStrings);

  // Calculate statistics
  const totalAnalyses = recentAnalyses.length;
  const completedAnalyses = recentAnalyses.filter((a: any) => a.status === 'COMPLETED').length;
  const failedAnalyses = recentAnalyses.filter((a: any) => a.status === 'FAILED').length;
  const avgProcessingTime = recentAnalyses
    .filter((a: any) => a.processingTime && a.status === 'COMPLETED')
    .reduce((acc: number, a: any) => acc + (a.processingTime || 0), 0) / 
    recentAnalyses.filter((a: any) => a.processingTime && a.status === 'COMPLETED').length || 0;

  const stats = [
    {
      title: "Total Analyses",
      value: totalAnalyses,
      change: "+12%",
      changeType: "positive" as const,
      icon: "Brain",
      color: "blue"
    },
    {
      title: "Completed",
      value: completedAnalyses,
      change: "+8%",
      changeType: "positive" as const,
      icon: "CheckCircle",
      color: "green"
    },
    {
      title: "Failed",
      value: failedAnalyses,
      change: "-3%",
      changeType: "negative" as const,
      icon: "XCircle",
      color: "red"
    },
    {
      title: "Avg. Processing Time",
      value: avgProcessingTime > 0 ? `${Math.round(avgProcessingTime / 1000)}s` : "N/A",
      change: "-5%",
      changeType: "positive" as const,
      icon: "Clock",
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              AI Analysis Dashboard
            </h1>
            <p className="text-purple-100">
              Monitor your contract analyses and AI processing queue
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-lg">
            <Brain className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                'bg-purple-50 text-purple-600'
              }`}>
                {stat.icon === 'Brain' && <Brain className="w-6 h-6" />}
                {stat.icon === 'CheckCircle' && <CheckCircle className="w-6 h-6" />}
                {stat.icon === 'XCircle' && <XCircle className="w-6 h-6" />}
                {stat.icon === 'Clock' && <Clock className="w-6 h-6" />}
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stat.changeType === 'positive' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Queue Status */}
        <div className="lg:col-span-1">
          <AnalysisQueueStatus 
            pendingAnalyses={pendingAnalyses}
            processingAnalyses={processingAnalyses}
            queueStats={queueStats}
          />
        </div>

        {/* Processing Progress */}
        <div className="lg:col-span-2">
          <ProcessingProgress 
            processingAnalyses={processingAnalyses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <RecentAnalyses analyses={recentAnalyses} />
        
        {/* Analysis Statistics */}
        <AnalysisStatistics analysisStats={analysisStats} />
      </div>

      {/* Quick Analysis Actions */}
      <QuickAnalysisActions />
    </div>
  );
} 