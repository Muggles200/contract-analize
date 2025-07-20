'use client';

import Link from 'next/link';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Eye, 
  FileText,
  BarChart3,
  Download,
  Calendar,
  Zap
} from 'lucide-react';
import AnalysisStatusBadge from './AnalysisStatusBadge';

interface Analysis {
  id: string;
  status: string;
  analysisType: string;
  createdAt: string;
  processingTime?: number | null;
  confidenceScore?: number | null;
  contract: {
    id: string;
    fileName: string;
    contractName?: string | null;
  };
}

interface RecentAnalysesProps {
  analyses: Analysis[];
}

export default function RecentAnalyses({ analyses }: RecentAnalysesProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return <BarChart3 className="w-4 h-4" />;
      case 'risk-assessment':
        return <AlertTriangle className="w-4 h-4" />;
      case 'clause-extraction':
        return <Eye className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
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

  const formatConfidenceScore = (score: number) => {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
          <Link
            href="/dashboard/analysis"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {analyses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No analyses yet</p>
            <p className="text-sm">Upload a contract to start your first analysis</p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Contract
            </Link>
          </div>
        ) : (
          analyses.map((analysis) => (
            <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getAnalysisTypeIcon(analysis.analysisType)}
                      <h3 className="text-sm font-medium text-gray-900">
                        {getAnalysisTypeLabel(analysis.analysisType)}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {analysis.contract.contractName || analysis.contract.fileName}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Duration: {formatDuration(analysis.processingTime || 0)}</span>
                      </div>
                      {analysis.confidenceScore && (
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>Confidence: {formatConfidenceScore(analysis.confidenceScore)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <AnalysisStatusBadge status={analysis.status} size="sm" />
                  
                  <div className="flex items-center space-x-1">
                    <Link
                      href={`/dashboard/analysis/${analysis.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View analysis"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {analysis.status === 'complete' && (
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Download results"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 