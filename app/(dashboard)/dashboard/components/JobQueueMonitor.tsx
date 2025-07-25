'use client';

import { useState, useEffect } from 'react';
// Simple UI components since shadcn/ui is not installed
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'destructive'; className?: string }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, disabled = false, className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);
import { RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface QueueHealth {
  [key: string]: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    total: number;
  };
}

interface JobLog {
  id: string;
  queueName: string;
  jobId: string;
  jobType: string;
  status: string;
  error?: string;
  attempts: number;
  duration?: number;
  createdAt: string;
}

interface JobQueueStats {
  failedJobsCount: number;
  completedJobsCount: number;
  totalJobs: number;
}

interface JobQueueData {
  queueHealth: QueueHealth;
  recentJobLogs: JobLog[];
  statistics: JobQueueStats;
  timestamp: string;
}

export default function JobQueueMonitor() {
  const [data, setData] = useState<JobQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/job-queues');
      if (!response.ok) {
        throw new Error('Failed to fetch job queue data');
      }
      
      const result = await response.json();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQueueStatus = (queue: any) => {
    const { waiting, active, failed } = queue;
    if (failed > 0) return 'error';
    if (active > 0) return 'processing';
    if (waiting > 0) return 'pending';
    return 'idle';
  };

  const getQueueIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Queue Monitor</CardTitle>
          <CardDescription>Monitoring background job processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading queue data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Queue Monitor</CardTitle>
          <CardDescription>Monitoring background job processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Queue Monitor</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Jobs</p>
                <p className="text-2xl font-bold">{data.statistics.completedJobsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Jobs</p>
                <p className="text-2xl font-bold">{data.statistics.failedJobsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {data.statistics.totalJobs > 0
                    ? Math.round((data.statistics.completedJobsCount / data.statistics.totalJobs) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Health */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Health</CardTitle>
          <CardDescription>Current status of all job queues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.queueHealth).map(([queueName, queue]) => {
              const status = getQueueStatus(queue);
              const total = queue.total;
              const activePercent = total > 0 ? (queue.active / total) * 100 : 0;
              const waitingPercent = total > 0 ? (queue.waiting / total) * 100 : 0;
              const failedPercent = total > 0 ? (queue.failed / total) * 100 : 0;

              return (
                <div key={queueName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getQueueIcon(status)}
                      <h3 className="font-semibold capitalize">
                        {queueName.replace('-', ' ')}
                      </h3>
                      <Badge variant={status === 'error' ? 'destructive' : 'secondary'}>
                        {status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {total}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active: {queue.active}</span>
                      <span>Waiting: {queue.waiting}</span>
                      <span>Failed: {queue.failed}</span>
                    </div>
                    
                    <div className="flex space-x-1">
                      {queue.active > 0 && (
                        <div 
                          className="h-2 bg-blue-500 rounded"
                          style={{ width: `${activePercent}%` }}
                        />
                      )}
                      {queue.waiting > 0 && (
                        <div 
                          className="h-2 bg-yellow-500 rounded"
                          style={{ width: `${waitingPercent}%` }}
                        />
                      )}
                      {queue.failed > 0 && (
                        <div 
                          className="h-2 bg-red-500 rounded"
                          style={{ width: `${failedPercent}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Job Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Logs</CardTitle>
          <CardDescription>Latest job processing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentJobLogs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                  <div>
                    <p className="font-medium">{job.jobType}</p>
                    <p className="text-sm text-muted-foreground">
                      Queue: {job.queueName} • ID: {job.jobId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </p>
                  {job.duration && (
                    <p className="text-xs text-muted-foreground">
                      {job.duration}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {data.recentJobLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent job activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 