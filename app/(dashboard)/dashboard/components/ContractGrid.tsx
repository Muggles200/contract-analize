'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Edit,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Tag,
  Calendar,
  HardDrive
} from 'lucide-react';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  contractType?: string | null;
  fileSize: number;
  fileType: string;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  analysisResults: Array<{
    id: string;
    status: string;
  }>;
}

interface ContractGridProps {
  contracts: Contract[];
  selectedContracts: string[];
  onSelectContract: (contractId: string) => void;
  onAction: (contractId: string, action: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'complete':
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'processing':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'error':
    case 'failed':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete':
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'processing':
      return 'text-yellow-600 bg-yellow-50';
    case 'error':
    case 'failed':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ContractGrid({
  contracts,
  selectedContracts,
  onSelectContract,
  onAction
}: ContractGridProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (contractId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedCards(newExpanded);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {contracts.map((contract) => (
        <div
          key={contract.id}
          className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
            selectedContracts.includes(contract.id) ? 'ring-2 ring-blue-500' : 'border-gray-200'
          }`}
        >
          {/* Card Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedContracts.includes(contract.id)}
                  onChange={() => onSelectContract(contract.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Link
                  href={`/dashboard/contracts/${contract.id}`}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => onAction(contract.id, 'download')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAction(contract.id, 'delete')}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4">
            <div className="space-y-3">
              {/* Contract Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {contract.contractName || contract.fileName}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {contract.fileName}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(contract.status)}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
                {contract.contractType && (
                  <span className="text-xs text-gray-500 capitalize">
                    {contract.contractType}
                  </span>
                )}
              </div>

              {/* Analysis Status */}
              {contract.analysisResults.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Analysis:</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(contract.analysisResults[0].status)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contract.analysisResults[0].status)}`}>
                      {contract.analysisResults[0].status}
                    </span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {contract.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {contract.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {contract.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{contract.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* File Details */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <HardDrive className="w-3 h-3" />
                  <span>{formatFileSize(contract.fileSize)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(contract.createdAt)}</span>
                </div>
              </div>

              {/* Expandable Details */}
              {expandedCards.has(contract.id) && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>File Type:</span>
                      <span>{contract.fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Modified:</span>
                      <span>{formatDate(contract.updatedAt)}</span>
                    </div>
                  </div>
                  
                  {contract.tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-900 mb-1">All Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {contract.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleCard(contract.id)}
                className="w-full text-xs text-blue-600 hover:text-blue-700 py-1"
              >
                {expandedCards.has(contract.id) ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 