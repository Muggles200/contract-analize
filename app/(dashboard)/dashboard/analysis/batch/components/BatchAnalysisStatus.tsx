'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  FileText,
  BarChart3,
  Eye,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface BatchJob {
  id: string;
  status: string;
  analysisType: string;
  createdAt: Date;
  contract: {
    fileName: string;
  };
}

interface BatchAnalysisStatusProps {
  recentJobs: BatchJob[];
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending'
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Processing'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Completed'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Failed'
  }
};

const ANALYSIS_TYPE_ICONS = {
  comprehensive: BarChart3,
  'risk-assessment': AlertTriangle,
  'clause-extraction': Eye,
  basic: Zap
};

export default function BatchAnalysisStatus({ recentJobs }: BatchAnalysisStatusProps) {
  const [jobs, setJobs] = useState<BatchJob[]>(recentJobs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshJobs = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/analysis/batch/status');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      toast.error('Failed to refresh batch jobs');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: jobs.length
    };

    jobs.forEach(job => {
      if (stats.hasOwnProperty(job.status)) {
        stats[job.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const stats = getStatusStats();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getAnalysisTypeIcon = (type: string) => {
    const IconComponent = ANALYSIS_TYPE_ICONS[type as keyof typeof ANALYSIS_TYPE_ICONS] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Batch Analysis Status</h2>
        <button
          onClick={refreshJobs}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Batch Jobs</h3>
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No batch analysis jobs found</p>
            <p className="text-sm">Start a batch analysis to see jobs here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const statusConfig = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={job.id}
                  className={`p-4 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.color} ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job.contract.fileName}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getAnalysisTypeIcon(job.analysisType)}
                            <span>{job.analysisType.replace('-', ' ')}</span>
                          </div>
                          <span>{formatTimeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {job.status === 'completed' && (
                      <button
                        onClick={() => window.open(`/dashboard/analysis/${job.id}`, '_blank')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Analysis Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Batch Analysis Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Batch analysis processes contracts in parallel for efficiency</li>
          <li>• You can monitor progress in real-time</li>
          <li>• Completed analyses are automatically saved</li>
          <li>• Failed jobs can be retried individually</li>
        </ul>
      </div>
    </div>
  );
} 