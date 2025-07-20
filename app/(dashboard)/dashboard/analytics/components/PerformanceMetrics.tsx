'use client';

import { 
  Clock, 
  Target, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity
} from 'lucide-react';

interface PerformanceMetricsProps {
  data: {
    _avg: {
      processingTime: number | null;
      confidenceScore: number | null;
    };
    _min: {
      processingTime: number | null;
    };
    _max: {
      processingTime: number | null;
    };
    _count: {
      id: number;
    };
  };
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const formatConfidence = (score: number | null) => {
    if (!score) return 'N/A';
    return `${(score * 100).toFixed(1)}%`;
  };

  const getPerformanceStatus = (avgTime: number | null) => {
    if (!avgTime) return 'unknown';
    if (avgTime < 30) return 'excellent';
    if (avgTime < 60) return 'good';
    if (avgTime < 120) return 'fair';
    return 'poor';
  };

  const getConfidenceStatus = (score: number | null) => {
    if (!score) return 'unknown';
    if (score > 0.9) return 'excellent';
    if (score > 0.8) return 'good';
    if (score > 0.7) return 'fair';
    return 'poor';
  };

  const performanceStatus = getPerformanceStatus(data._avg.processingTime);
  const confidenceStatus = getConfidenceStatus(data._avg.confidenceScore);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <TrendingUp className="w-4 h-4" />;
      case 'good':
        return <Target className="w-4 h-4" />;
      case 'fair':
        return <Activity className="w-4 h-4" />;
      case 'poor':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Zap className="w-4 h-4" />
            <span>Analysis Performance</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Processing Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-900">Processing Time</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatTime(data._avg.processingTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fastest</span>
                <span className="text-sm text-green-600">
                  {formatTime(data._min.processingTime)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Slowest</span>
                <span className="text-sm text-red-600">
                  {formatTime(data._max.processingTime)}
                </span>
              </div>
            </div>

            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(performanceStatus)}`}>
              {getStatusIcon(performanceStatus)}
              <span className="ml-1 capitalize">{performanceStatus}</span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-gray-900">Confidence Score</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatConfidence(data._avg.confidenceScore)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${data._avg.confidenceScore ? (data._avg.confidenceScore * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(confidenceStatus)}`}>
              {getStatusIcon(confidenceStatus)}
              <span className="ml-1 capitalize">{confidenceStatus}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data._count.id}</p>
              <p className="text-sm text-gray-600">Total Analyses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data._avg.processingTime ? formatTime(data._avg.processingTime) : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Avg Processing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 