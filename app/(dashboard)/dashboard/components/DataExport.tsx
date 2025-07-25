'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Trash2,
  RefreshCw,
  Eye,
  FileJson,
  FileSpreadsheet,
  File,
  Database,
  Settings,
  BarChart3,
  Users,
  Archive
} from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DataExportRequest {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  dataTypes: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  format: 'json' | 'csv' | 'pdf';
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DataExportProps {
  user: User;
}

export default function DataExport({ user }: DataExportProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExports, setIsLoadingExports] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  
  // New export form state
  const [exportType, setExportType] = useState('full');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['profile', 'contracts', 'analyses']);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [useDateRange, setUseDateRange] = useState(false);

  // Load export requests on component mount
  useEffect(() => {
    loadExportRequests();
  }, []);

  const loadExportRequests = async () => {
    try {
      const response = await fetch('/api/user/data-export');
      if (response.ok) {
        const data = await response.json();
        setExportRequests(data.exportRequests || []);
      }
    } catch (error) {
      console.error('Error loading export requests:', error);
    } finally {
      setIsLoadingExports(false);
    }
  };

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType)
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handleCreateExport = async () => {
    if (selectedDataTypes.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one data type to export' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const requestData = {
        type: exportType,
        dataTypes: selectedDataTypes,
        format: exportFormat,
        dateRange: useDateRange && dateRange.start && dateRange.end ? dateRange : undefined,
      };

      const response = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: 'Export request created successfully! You will receive an email when it\'s ready.' 
        });
        
        // Reset form
        setExportType('full');
        setSelectedDataTypes(['profile', 'contracts', 'analyses']);
        setExportFormat('json');
        setDateRange({ start: '', end: '' });
        setUseDateRange(false);
        
        // Reload export requests
        await loadExportRequests();
        router.refresh();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create export request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create export request' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadExport = async (exportId: string) => {
    try {
      const response = await fetch(`/api/user/data-export/${exportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${exportId}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setMessage({ type: 'error', text: 'Failed to download export file' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download export file' });
    }
  };

  const handleDeleteExport = async (exportId: string) => {
    if (!confirm('Are you sure you want to delete this export request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/data-export/${exportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Export request deleted successfully' });
        await loadExportRequests();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete export request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete export request' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <FileJson className="w-4 h-4" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'pdf':
        return <File className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const dataTypeOptions = [
    { value: 'profile', label: 'Profile Information', icon: Users, description: 'Personal data and account settings' },
    { value: 'contracts', label: 'Contracts', icon: FileText, description: 'All uploaded contracts and metadata' },
    { value: 'analyses', label: 'Analyses', icon: BarChart3, description: 'Contract analysis results and reports' },
    { value: 'settings', label: 'Settings', icon: Settings, description: 'All user preferences and configurations' },
    { value: 'activity', label: 'Activity Log', icon: Archive, description: 'User activity and audit logs' },
  ];

  if (isLoadingExports) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading export requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Create New Export */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Create Data Export</h3>
          <p className="text-sm text-gray-600">
            Export your data in various formats for backup or transfer purposes.
          </p>
        </div>

        {/* Export Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Type
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="full">Full Data Export</option>
            <option value="contracts">Contracts Only</option>
            <option value="analyses">Analyses Only</option>
            <option value="settings">Settings Only</option>
            <option value="gdpr-portability">GDPR Data Portability</option>
          </select>
        </div>

        {/* Data Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Data Types to Export
          </label>
          <div className="space-y-3">
            {dataTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDataTypes.includes(option.value)}
                    onChange={() => handleDataTypeToggle(option.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'json', label: 'JSON', icon: FileJson, description: 'Machine-readable format' },
              { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet format' },
              { value: 'pdf', label: 'PDF', icon: File, description: 'Document format' },
            ].map((format) => {
              const Icon = format.icon;
              return (
                <label
                  key={format.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportFormat === format.value}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv' | 'pdf')}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{format.label}</p>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useDateRange}
              onChange={(e) => setUseDateRange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Filter by date range</span>
          </label>
          
          {useDateRange && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Create Export Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreateExport}
            disabled={isLoading || selectedDataTypes.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Create Export Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export History</h3>
            <p className="text-sm text-gray-600">
              Track the status of your data export requests.
            </p>
          </div>
          <button
            type="button"
            onClick={loadExportRequests}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {exportRequests.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No export requests found</p>
            <p className="text-sm text-gray-400">Create your first export request above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exportRequests.map((exportRequest) => (
              <div
                key={exportRequest.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(exportRequest.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {exportRequest.type.charAt(0).toUpperCase() + exportRequest.type.slice(1)} Export
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exportRequest.status)}`}>
                          {exportRequest.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          {getFormatIcon(exportRequest.format)}
                          <span>{exportRequest.format.toUpperCase()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(exportRequest.createdAt).toLocaleDateString()}</span>
                        </span>
                        {exportRequest.fileSize && (
                          <span>{formatFileSize(exportRequest.fileSize)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {exportRequest.status === 'completed' && exportRequest.fileUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadExport(exportRequest.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteExport(exportRequest.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {exportRequest.dataTypes && exportRequest.dataTypes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Data types:</p>
                    <div className="flex flex-wrap gap-1">
                      {exportRequest.dataTypes.map((dataType) => (
                        <span
                          key={dataType}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {dataType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Export Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Export files are available for 30 days after completion</li>
                <li>Large exports may take several minutes to process</li>
                <li>You will receive an email notification when your export is ready</li>
                <li>Exports include all data within the specified date range</li>
                <li>For GDPR requests, use the "GDPR Data Portability" export type</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : message.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
} 