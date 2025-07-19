'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Analysis {
  id: string;
  analysisType: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
}

interface AnalysisResponse {
  analyses: Analysis[];
  count: number;
  pendingCount: number;
  processingCount: number;
}

export default function ClearStuckAnalysesPage() {
  const [contractId, setContractId] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  const checkAnalyses = async () => {
    if (!contractId.trim()) {
      toast.error('Please enter a contract ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/analysis/clear-stuck?contractId=${encodeURIComponent(contractId)}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalysisData(data);
        toast.success(`Found ${data.count} analyses for this contract`);
      } else {
        toast.error(data.error || 'Failed to fetch analyses');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const clearStuckAnalyses = async () => {
    if (!contractId.trim()) {
      toast.error('Please enter a contract ID');
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/analysis/clear-stuck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        // Refresh the analysis list
        await checkAnalyses();
      } else {
        toast.error(data.error || 'Failed to clear stuck analyses');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setClearing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Management</h1>
          <p className="text-gray-600">
            Check and clear stuck analysis jobs that might be causing conflicts.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Contract Analysis Status</h2>
            <p className="text-gray-600">
              Enter a contract ID to check its analysis status and clear any stuck jobs.
            </p>
          </div>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter contract ID (e.g., cmd7vok2a0001cv5khdzw0pjn)"
              value={contractId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={checkAnalyses} 
              disabled={loading || !contractId.trim()}
              className="min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Check Status
            </button>
          </div>

          {analysisData && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="text-gray-600">Total: {analysisData.count}</span>
                <span className="text-yellow-600">Pending: {analysisData.pendingCount}</span>
                <span className="text-blue-600">Processing: {analysisData.processingCount}</span>
              </div>

              {(analysisData.pendingCount > 0 || analysisData.processingCount > 0) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <p className="text-yellow-800">
                      Found {analysisData.pendingCount + analysisData.processingCount} stuck analyses. 
                      You can clear them to resolve conflicts.
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={clearStuckAnalyses}
                disabled={clearing || (analysisData.pendingCount === 0 && analysisData.processingCount === 0)}
                className="min-w-[150px] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {clearing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Clear Stuck Jobs
              </button>
            </div>
          )}
        </div>

        {analysisData && analysisData.analyses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Analysis History</h2>
              <p className="text-gray-600">
                Recent analyses for contract: {contractId}
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-3">
                {analysisData.analyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(analysis.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {analysis.analysisType} Analysis
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(analysis.createdAt).toLocaleString()}
                        </p>
                        {analysis.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {analysis.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 