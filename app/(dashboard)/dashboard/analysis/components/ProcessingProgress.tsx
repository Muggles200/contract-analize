'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import AnalysisProgressBar from './AnalysisProgressBar';
import AnalysisStatusBadge from './AnalysisStatusBadge';

interface Analysis {
  id: string;
  status: string;
  analysisType: string;
  createdAt: string;
  processingTime?: number | null;
  contract: {
    id: string;
    fileName: string;
    contractName?: string | null;
  };
}

interface ProcessingProgressProps {
  processingAnalyses: Analysis[];
}

export default function ProcessingProgress({ processingAnalyses }: ProcessingProgressProps) {
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate progress updates for processing analyses
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    processingAnalyses.forEach((analysis) => {
      if (analysis.status === 'processing') {
        const interval = setInterval(() => {
          setProgressData(prev => {
            const currentProgress = prev[analysis.id] || 0;
            const newProgress = Math.min(currentProgress + Math.random() * 10, 95);
            return { ...prev, [analysis.id]: newProgress };
          });
        }, 2000);

        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [processingAnalyses]);

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'processing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
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
      default:
        return <BarChart3 className="w-4 h-4" />;
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

  const getEstimatedTimeRemaining = (progress: number, elapsedTime: number) => {
    if (progress <= 0) return 'Calculating...';
    
    const totalEstimatedTime = (elapsedTime / progress) * 100;
    const remainingTime = totalEstimatedTime - elapsedTime;
    
    if (remainingTime <= 0) return 'Almost done...';
    
    return formatDuration(remainingTime);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Analysis cancelled');
        window.location.reload();
      } else {
        throw new Error('Failed to cancel analysis');
      }
    } catch (error) {
      toast.error('Failed to cancel analysis');
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    window.open(`/dashboard/analysis/${analysisId}`, '_blank');
  };

  if (processingAnalyses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Processing Progress</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="text-center py-12 text-gray-500">
          <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No analyses processing</p>
          <p className="text-sm">All analyses are either completed or pending</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Processing Progress</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {processingAnalyses.map((analysis) => {
          const progress = progressData[analysis.id] || 0;
          const elapsedTime = analysis.processingTime || 
            (Date.now() - new Date(analysis.createdAt).getTime());
          const estimatedTimeRemaining = getEstimatedTimeRemaining(progress, elapsedTime);

          return (
            <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(analysis.status)}
                  <div className="flex items-center space-x-2">
                    {getAnalysisTypeIcon(analysis.analysisType)}
                    <span className="text-sm font-medium text-gray-900">
                      {getAnalysisTypeLabel(analysis.analysisType)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}%
                  </span>
                  <button
                    onClick={() => handleViewAnalysis(analysis.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View analysis"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancelAnalysis(analysis.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Cancel analysis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {analysis.contract.contractName || analysis.contract.fileName}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Elapsed: {formatDuration(elapsedTime)}</span>
                <span>ETA: {estimatedTimeRemaining}</span>
                <span>Started: {new Date(analysis.createdAt).toLocaleTimeString()}</span>
              </div>

              {/* Processing Steps */}
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                <div className={`flex items-center space-x-1 ${
                  progress > 10 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    progress > 10 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Text Extraction</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  progress > 30 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    progress > 30 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>AI Analysis</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  progress > 70 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    progress > 70 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Results Processing</span>
                </div>
                <div className={`flex items-center space-x-1 ${
                  progress > 90 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    progress > 90 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>Finalizing</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 