'use client';

import Link from 'next/link';
import { FileText, Clock, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  status: string;
  createdAt: Date;
  analysisResults: Array<{
    id: string;
    status: string;
  }>;
}

interface RecentContractsProps {
  contracts: Contract[];
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

export default function RecentContracts({ contracts }: RecentContractsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Contracts</h2>
          <Link
            href="/dashboard/contracts"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {contracts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No contracts yet</p>
            <p className="text-sm">Upload your first contract to get started</p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Contract
            </Link>
          </div>
        ) : (
          contracts.map((contract) => (
            <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {contract.contractName || contract.fileName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(contract.status)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </div>
                  
                  <Link
                    href={`/dashboard/contracts/${contract.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              
              {contract.analysisResults.length > 0 && (
                <div className="mt-3 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Analysis:</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(contract.analysisResults[0].status)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contract.analysisResults[0].status)}`}>
                      {contract.analysisResults[0].status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 