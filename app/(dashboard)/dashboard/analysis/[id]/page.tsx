import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { 
  Brain, 
  ArrowLeft, 
  Download, 
  Share2, 
  Printer, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  FileText,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import AnalysisOverview from "./components/AnalysisOverview";
import ClausesSection from "./components/ClausesSection";
import RisksSection from "./components/RisksSection";
import RecommendationsSection from "./components/RecommendationsSection";
import MetadataSummary from "./components/MetadataSummary";
import ExportResults from "./components/ExportResults";
import ShareAnalysis from "./components/ShareAnalysis";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisResultsPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch analysis result with contract details
  const analysis = await prisma.analysisResult.findFirst({
    where: {
      id: id,
      userId: userId
    },
    include: {
      contract: {
        select: {
          id: true,
          fileName: true,
          contractName: true,
          fileSize: true,
          fileType: true,
          createdAt: true,
          tags: true
        }
      }
    }
  });

  if (!analysis) {
    notFound();
  }

  // Parse analysis results
  const results = analysis.results as any || {};
  const clauses = results.clauses || [];
  const risks = results.risks || [];
  const recommendations = results.recommendations || [];
  const summary = results.summary || '';
  const metadata = results.metadata || {};

  // Calculate analysis statistics
  const totalClauses = clauses.length;
  const totalRisks = risks.length;
  const totalRecommendations = recommendations.length;
  const highRiskCount = risks.filter((risk: any) => risk.severity === 'high' || risk.severity === 'critical').length;
  const criticalRiskCount = risks.filter((risk: any) => risk.severity === 'critical').length;

  // Calculate processing time
  const processingTime = analysis.processingTime || 
    (analysis.completedAt ? 
      new Date(analysis.completedAt).getTime() - new Date(analysis.createdAt).getTime() : 
      0
    );

  const formatDuration = (milliseconds: number) => {
    if (!milliseconds) return 'N/A';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return 'Comprehensive Analysis';
      case 'risk-assessment':
        return 'Risk Assessment';
      case 'clause-extraction':
        return 'Clause Extraction';
      case 'basic':
        return 'Basic Analysis';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return <BarChart3 className="w-5 h-5" />;
      case 'risk-assessment':
        return <AlertTriangle className="w-5 h-5" />;
      case 'clause-extraction':
        return <Eye className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/analysis"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getAnalysisTypeLabel(analysis.analysisType)}
                </h1>
                <p className="text-sm text-gray-500">
                  {analysis.contract.contractName || analysis.contract.fileName}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(analysis.status)}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(analysis.status)}`}>
                {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <ExportResults analysisId={analysis.id} />
              <ShareAnalysis analysisId={analysis.id} />
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Metadata */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Processing Time</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDuration(processingTime)}
              </p>
            </div>
          </div>
          
          {analysis.confidenceScore && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Confidence</p>
                <p className="text-sm font-medium text-gray-900">
                  {Math.round(Number(analysis.confidenceScore) * 100)}%
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getAnalysisTypeIcon(analysis.analysisType)}
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm font-medium text-gray-900">
                {getAnalysisTypeLabel(analysis.analysisType)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Overview */}
      <AnalysisOverview 
        summary={summary}
        totalClauses={totalClauses}
        totalRisks={totalRisks}
        totalRecommendations={totalRecommendations}
        highRiskCount={highRiskCount}
        criticalRiskCount={criticalRiskCount}
        confidenceScore={Number(analysis.confidenceScore)}
        processingTime={processingTime}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clauses Section */}
        <ClausesSection clauses={clauses} />
        
        {/* Risks Section */}
        <RisksSection risks={risks} />
      </div>

      {/* Recommendations Section */}
      <RecommendationsSection recommendations={recommendations} />

      {/* Metadata Summary */}
      <MetadataSummary metadata={metadata} contract={analysis.contract as any} />

      {analysis.status === 'FAILED' && analysis.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Analysis Failed</h3>
              <p className="text-sm text-red-700 mt-1">{analysis.errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 