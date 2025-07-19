'use client';

import { 
  FileText, 
  Calendar, 
  HardDrive, 
  Tag, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Building
} from 'lucide-react';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  contractType?: string | null;
  fileSize: number;
  fileType: string;
  blobUrl: string;
  status: string;
  tags: string[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
  analysisResults: Array<{
    id: string;
    status: string;
    analysisType: string;
    createdAt: string;
    processingTime?: number;
    confidenceScore?: number;
  }>;
}

interface ContractInfoProps {
  contract: Contract;
}

export default function ContractInfo({ contract }: ContractInfoProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
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

  const latestAnalysis = contract.analysisResults[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">File Name</p>
              <p className="text-sm text-gray-900">{contract.fileName}</p>
            </div>
          </div>

          {contract.contractName && (
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contract Name</p>
                <p className="text-sm text-gray-900">{contract.contractName}</p>
              </div>
            </div>
          )}

          {contract.contractType && (
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contract Type</p>
                <p className="text-sm text-gray-900 capitalize">{contract.contractType}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">File Size</p>
              <p className="text-sm text-gray-900">{formatFileSize(contract.fileSize)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">File Type</p>
              <p className="text-sm text-gray-900">{contract.fileType}</p>
            </div>
          </div>
        </div>

        {/* Status and Dates */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(contract.status)}
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                {getStatusText(contract.status)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Upload Date</p>
              <p className="text-sm text-gray-900">
                {new Date(contract.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-900">
                {new Date(contract.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {latestAnalysis && (
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Latest Analysis</p>
                <p className="text-sm text-gray-900">
                  {new Date(latestAnalysis.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {contract.tags.length > 0 && (
            <div className="flex items-start space-x-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contract.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Summary */}
      {latestAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Latest Analysis Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {latestAnalysis.analysisType.replace('-', ' ')}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Status</p>
              <div className="flex items-center justify-center space-x-1">
                {getStatusIcon(latestAnalysis.status)}
                <span className="text-sm font-medium text-gray-900">
                  {getStatusText(latestAnalysis.status)}
                </span>
              </div>
            </div>
            {latestAnalysis.processingTime && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Processing Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {Math.round(latestAnalysis.processingTime / 1000)}s
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 