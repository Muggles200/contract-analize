'use client';

import Link from 'next/link';
import { Brain, Clock, CheckCircle, AlertTriangle, Eye, FileText } from 'lucide-react';

interface Analysis {
  id: string;
  status: string;
  analysisType: string;
  createdAt: Date;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'processing':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'failed':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'processing':
      return 'text-yellow-600 bg-yellow-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getAnalysisTypeLabel = (type: string) => {
  switch (type) {
    case 'basic':
      return 'Basic Analysis';
    case 'comprehensive':
      return 'Comprehensive';
    case 'risk_assessment':
      return 'Risk Assessment';
    case 'clause_extraction':
      return 'Clause Extraction';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export default function RecentAnalyses({ analyses }: RecentAnalysesProps) {
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {getAnalysisTypeLabel(analysis.analysisType)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {analysis.contract.contractName || analysis.contract.fileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(analysis.status)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </div>
                  
                  <Link
                    href={`/dashboard/analysis/${analysis.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                {analysis.processingTime && (
                  <span>Processing: {analysis.processingTime}s</span>
                )}
                {analysis.confidenceScore && (
                  <span>Confidence: {Math.round(Number(analysis.confidenceScore) * 100)}%</span>
                )}
                <Link
                  href={`/dashboard/contracts/${analysis.contract.id}`}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <FileText className="w-3 h-3" />
                  <span>View Contract</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 