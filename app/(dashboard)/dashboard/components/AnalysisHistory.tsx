'use client';

import { useState } from 'react';
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Download,
  Eye,
  Calendar,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  id: string;
  status: string;
  analysisType: string;
  createdAt: string;
  processingTime?: number;
  confidenceScore?: number;
  summary?: string;
  risks?: any[];
  clauses?: any[];
  recommendations?: any[];
}

interface AnalysisHistoryProps {
  analysisResults: AnalysisResult[];
  contractId: string;
}

export default function AnalysisHistory({ analysisResults, contractId }: AnalysisHistoryProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'processing':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
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

  const formatDuration = (milliseconds?: number) => {
    if (!milliseconds) return '-';
    const seconds = Math.round(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatConfidence = (score?: number) => {
    if (!score) return '-';
    return `${Math.round(score * 100)}%`;
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedResults = [...analysisResults].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'type':
        comparison = a.analysisType.localeCompare(b.analysisType);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleExportAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/export`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analysis-${analysisId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Analysis exported successfully');
      } else {
        throw new Error('Failed to export analysis');
      }
    } catch (error) {
      toast.error('Failed to export analysis');
    }
  };

  const getPerformanceTrend = () => {
    if (analysisResults.length < 2) return null;
    
    const recentResults = analysisResults
      .filter(r => r.processingTime)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
    
    if (recentResults.length < 2) return null;
    
    const [latest, previous] = recentResults;
    const latestTime = latest.processingTime!;
    const previousTime = previous.processingTime!;
    
    if (latestTime < previousTime) {
      return { trend: 'improving', percentage: Math.round(((previousTime - latestTime) / previousTime) * 100) };
    } else if (latestTime > previousTime) {
      return { trend: 'declining', percentage: Math.round(((latestTime - previousTime) / previousTime) * 100) };
    }
    
    return { trend: 'stable', percentage: 0 };
  };

  const performanceTrend = getPerformanceTrend();

  if (analysisResults.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis History</h3>
          <p className="text-gray-600">
            This contract hasn't been analyzed yet. Start an analysis to see the history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2" />
            Analysis History
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'type' | 'status')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{analysisResults.length}</p>
            <p className="text-sm text-gray-500">Total Analyses</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {analysisResults.filter(r => r.status === 'complete').length}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(analysisResults.reduce((acc, r) => acc + (r.processingTime || 0), 0) / analysisResults.length)}
            </p>
            <p className="text-sm text-gray-500">Avg. Processing Time</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              {performanceTrend ? (
                <>
                  {performanceTrend.trend === 'improving' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : performanceTrend.trend === 'declining' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {performanceTrend.percentage}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
            <p className="text-sm text-gray-500">Performance Trend</p>
          </div>
        </div>
      </div>

      {/* Analysis List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Analysis Runs</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedResults.map((analysis) => (
            <div
              key={analysis.id}
              className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedAnalysis?.id === analysis.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => setSelectedAnalysis(selectedAnalysis?.id === analysis.id ? null : analysis)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(analysis.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      {getAnalysisTypeIcon(analysis.analysisType)}
                      <h5 className="text-sm font-medium text-gray-900 capitalize">
                        {analysis.analysisType.replace('-', ' ')} Analysis
                      </h5>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Processing Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDuration(analysis.processingTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className={`text-sm font-medium ${getConfidenceColor(analysis.confidenceScore)}`}>
                      {formatConfidence(analysis.confidenceScore)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(analysis.status)}`}>
                    {getStatusText(analysis.status)}
                  </span>
                  {analysis.status === 'complete' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportAnalysis(analysis.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedAnalysis?.id === analysis.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {analysis.summary && (
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Summary</h6>
                      <p className="text-sm text-gray-600">{analysis.summary}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.risks && analysis.risks.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1 text-red-500" />
                          Risks ({analysis.risks.length})
                        </h6>
                        <div className="space-y-2">
                          {analysis.risks.slice(0, 3).map((risk, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {risk.title}
                            </div>
                          ))}
                          {analysis.risks.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{analysis.risks.length - 3} more risks
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {analysis.clauses && analysis.clauses.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-blue-500" />
                          Clauses ({analysis.clauses.length})
                        </h6>
                        <div className="space-y-2">
                          {analysis.clauses.slice(0, 3).map((clause, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {clause.title}
                            </div>
                          ))}
                          {analysis.clauses.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{analysis.clauses.length - 3} more clauses
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <BarChart3 className="w-4 h-4 mr-1 text-green-500" />
                          Recommendations ({analysis.recommendations.length})
                        </h6>
                        <div className="space-y-2">
                          {analysis.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {rec.title}
                            </div>
                          ))}
                          {analysis.recommendations.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{analysis.recommendations.length - 3} more recommendations
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 