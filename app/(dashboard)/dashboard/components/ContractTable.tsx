'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Edit,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Tag
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

interface ContractTableProps {
  contracts: Contract[];
  selectedContracts: string[];
  onSelectContract: (contractId: string) => void;
  onSelectAll: () => void;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
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

export default function ContractTable({
  contracts,
  selectedContracts,
  onSelectContract,
  onSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onAction
}: ContractTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (contractId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const isAllSelected = contracts.length > 0 && selectedContracts.length === contracts.length;
  const isIndeterminate = selectedContracts.length > 0 && selectedContracts.length < contracts.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('contractName')}
            >
              <div className="flex items-center space-x-1">
                <span>Contract Name</span>
                {getSortIcon('contractName')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('contractType')}
            >
              <div className="flex items-center space-x-1">
                <span>Type</span>
                {getSortIcon('contractType')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('fileSize')}
            >
              <div className="flex items-center space-x-1">
                <span>Size</span>
                {getSortIcon('fileSize')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center space-x-1">
                <span>Created</span>
                {getSortIcon('createdAt')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contracts.map((contract) => (
            <React.Fragment key={contract.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedContracts.includes(contract.id)}
                    onChange={() => onSelectContract(contract.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.contractName || contract.fileName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.fileName}
                      </div>
                      {contract.tags.length > 0 && (
                        <div className="flex items-center mt-1">
                          <Tag className="w-3 h-3 text-gray-400 mr-1" />
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
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {contract.contractType ? (
                      <span className="capitalize">{contract.contractType}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(contract.status)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </div>
                  {contract.analysisResults.length > 0 && (
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Analysis:</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(contract.analysisResults[0].status)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(contract.analysisResults[0].status)}`}>
                          {contract.analysisResults[0].status}
                        </span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatFileSize(contract.fileSize)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(contract.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/contracts/${contract.id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onAction(contract.id, 'download')}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/dashboard/contracts/${contract.id}/edit`}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onAction(contract.id, 'delete')}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRows.has(contract.id) && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">File Details</h4>
                        <dl className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <dt>File Type:</dt>
                            <dd>{contract.fileType}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Last Modified:</dt>
                            <dd>{formatDate(contract.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {contract.tags.length > 0 ? (
                            contract.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
} 