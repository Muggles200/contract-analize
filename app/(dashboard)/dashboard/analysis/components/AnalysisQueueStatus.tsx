'use client';

import { useState } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface Analysis {
  id: string;
  status: string;
  analysisType: string;
  createdAt: string;
  contract: {
    id: string;
    fileName: string;
    contractName?: string | null;
  };
}

interface QueueStats {
  status: string;
  _count: {
    id: number;
  };
}

interface AnalysisQueueStatusProps {
  pendingAnalyses: Analysis[];
  processingAnalyses: Analysis[];
  queueStats: QueueStats[];
}

export default function AnalysisQueueStatus({ 
  pendingAnalyses, 
  processingAnalyses, 
  queueStats 
}: AnalysisQueueStatusProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'complete':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
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

  const handlePauseQueue = async () => {
    try {
      setIsPaused(!isPaused);
      toast.success(isPaused ? 'Queue resumed' : 'Queue paused');
    } catch (error) {
      toast.error('Failed to update queue status');
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Refresh the page to get latest data
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
        // Refresh the page to get latest data
        window.location.reload();
      } else {
        throw new Error('Failed to cancel analysis');
      }
    } catch (error) {
      toast.error('Failed to cancel analysis');
    }
  };

  const totalInQueue = pendingAnalyses.length + processingAnalyses.length;
  const pendingCount = pendingAnalyses.length;
  const processingCount = processingAnalyses.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Queue Status</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePauseQueue}
            className={`p-2 rounded-lg transition-colors ${
              isPaused 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Queue Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{totalInQueue}</p>
          <p className="text-sm text-blue-700">Total in Queue</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-yellow-700">Pending</p>
        </div>
      </div>

      {/* Queue Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Queue Status:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isPaused 
              ? 'text-yellow-700 bg-yellow-50 border-yellow-200' 
              : 'text-green-700 bg-green-50 border-green-200'
          }`}>
            {isPaused ? 'Paused' : 'Active'}
          </span>
        </div>

        {isPaused && (
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-700">
              Queue is paused. New analyses will not be processed.
            </span>
          </div>
        )}
      </div>

      {/* Processing Analyses */}
      {processingAnalyses.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Currently Processing</h4>
          <div className="space-y-2">
            {processingAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                {getStatusIcon(analysis.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {analysis.contract.contractName || analysis.contract.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getAnalysisTypeLabel(analysis.analysisType)}
                  </p>
                </div>
                <button
                  onClick={() => handleCancelAnalysis(analysis.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Cancel analysis"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Analyses */}
      {pendingAnalyses.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Pending</h4>
          <div className="space-y-2">
            {pendingAnalyses.slice(0, 3).map((analysis) => (
              <div key={analysis.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {getStatusIcon(analysis.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {analysis.contract.contractName || analysis.contract.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getAnalysisTypeLabel(analysis.analysisType)}
                  </p>
                </div>
                <button
                  onClick={() => handleCancelAnalysis(analysis.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Cancel analysis"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {pendingAnalyses.length > 3 && (
              <div className="text-center p-2 text-sm text-gray-500">
                +{pendingAnalyses.length - 3} more pending
              </div>
            )}
          </div>
        </div>
      )}

      {totalInQueue === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No analyses in queue</p>
          <p className="text-sm">Upload a contract to start analysis</p>
        </div>
      )}
    </div>
  );
} 