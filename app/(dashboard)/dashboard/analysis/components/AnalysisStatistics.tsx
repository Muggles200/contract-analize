'use client';

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Zap,
  Brain
} from 'lucide-react';

interface AnalysisStats {
  status: string;
  analysisType: string;
  _count: {
    id: number;
  };
}

interface AnalysisStatisticsProps {
  analysisStats: AnalysisStats[];
}

export default function AnalysisStatistics({ analysisStats }: AnalysisStatisticsProps) {
  // Process statistics data
  const statusStats = analysisStats.reduce((acc, stat) => {
    if (!acc[stat.status]) {
      acc[stat.status] = 0;
    }
    acc[stat.status] += stat._count.id;
    return acc;
  }, {} as Record<string, number>);

  const typeStats = analysisStats.reduce((acc, stat) => {
    if (!acc[stat.analysisType]) {
      acc[stat.analysisType] = 0;
    }
    acc[stat.analysisType] += stat._count.id;
    return acc;
  }, {} as Record<string, number>);

  const totalAnalyses = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
  const completedAnalyses = statusStats['complete'] || 0;
  const failedAnalyses = statusStats['error'] || 0;
  const processingAnalyses = statusStats['processing'] || 0;
  const pendingAnalyses = statusStats['pending'] || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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
      case 'basic':
        return <Zap className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return 'Comprehensive';
      case 'risk-assessment':
        return 'Risk Assessment';
      case 'clause-extraction':
        return 'Clause Extraction';
      case 'basic':
        return 'Basic';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    }
  };

  const calculateSuccessRate = () => {
    if (totalAnalyses === 0) return 0;
    return Math.round((completedAnalyses / totalAnalyses) * 100);
  };

  const calculateFailureRate = () => {
    if (totalAnalyses === 0) return 0;
    return Math.round((failedAnalyses / totalAnalyses) * 100);
  };

  const getMostPopularType = () => {
    if (Object.keys(typeStats).length === 0) return 'N/A';
    
    const entries = Object.entries(typeStats);
    const mostPopular = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    return getAnalysisTypeLabel(mostPopular[0]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analysis Statistics</h3>
        <div className="p-2 bg-purple-50 rounded-lg">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{calculateSuccessRate()}%</p>
          <p className="text-sm text-green-700">Success Rate</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{calculateFailureRate()}%</p>
          <p className="text-sm text-red-700">Failure Rate</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Status Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(statusStats).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status)}
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{count}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round((count / totalAnalyses) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Type Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Analysis Types</h4>
        <div className="space-y-2">
          {Object.entries(typeStats).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getAnalysisTypeIcon(type)}
                <span className="text-sm font-medium text-gray-900">
                  {getAnalysisTypeLabel(type)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{count}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round((count / totalAnalyses) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-900">Most Popular Type</span>
          <span className="text-sm font-bold text-blue-700">{getMostPopularType()}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <span className="text-sm font-medium text-orange-900">Currently Processing</span>
          <span className="text-sm font-bold text-orange-700">{processingAnalyses}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <span className="text-sm font-medium text-yellow-900">Pending</span>
          <span className="text-sm font-bold text-yellow-700">{pendingAnalyses}</span>
        </div>
      </div>

      {totalAnalyses === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No analysis data</p>
          <p className="text-sm">Start analyzing contracts to see statistics</p>
        </div>
      )}
    </div>
  );
} 