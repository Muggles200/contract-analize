'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, FileSpreadsheet, FileJson, Calendar, Loader2, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DataExportProps {
  user: User;
}

interface ExportRequest {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export default function DataExport({ user }: DataExportProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([
    {
      id: '1',
      type: 'Complete Data Export',
      status: 'completed',
      createdAt: '2024-01-15',
      completedAt: '2024-01-15',
      downloadUrl: '#',
    },
    {
      id: '2',
      type: 'Contracts Only',
      status: 'processing',
      createdAt: '2024-01-20',
    },
  ]);

  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([
    'profile',
    'contracts',
    'analyses',
    'billing',
  ]);

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const dataTypes = [
    { value: 'profile', label: 'Profile Information', description: 'Your account details and preferences' },
    { value: 'contracts', label: 'Contracts', description: 'All uploaded contracts and metadata' },
    { value: 'analyses', label: 'Analysis Results', description: 'AI analysis results and reports' },
    { value: 'billing', label: 'Billing History', description: 'Invoices and payment history' },
    { value: 'usage', label: 'Usage Statistics', description: 'Usage logs and analytics' },
    { value: 'organizations', label: 'Organizations', description: 'Organization memberships and settings' },
  ];

  const exportFormats = [
    {
      value: 'json',
      label: 'JSON',
      description: 'Structured data in JSON format',
      icon: FileJson,
      color: 'text-blue-600',
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Spreadsheet format for data analysis',
      icon: FileSpreadsheet,
      color: 'text-green-600',
    },
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Human-readable report format',
      icon: FileText,
      color: 'text-red-600',
    },
  ];

  const handleToggleDataType = (dataType: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(dataType)
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handleRequestExport = async (format: string) => {
    if (selectedDataTypes.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one data type to export' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, you'd call an API to create the export request
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newRequest: ExportRequest = {
        id: Date.now().toString(),
        type: `${selectedDataTypes.join(', ')} (${format.toUpperCase()})`,
        status: 'processing',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setExportRequests(prev => [newRequest, ...prev]);
      setMessage({ type: 'success', text: 'Export request submitted successfully! You will receive an email when it\'s ready.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit export request' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (request: ExportRequest) => {
    if (!request.downloadUrl) return;

    try {
      // In a real app, you'd trigger the actual download
      setMessage({ type: 'success', text: 'Download started!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download file' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Export Configuration */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Export Configuration</h3>

        {/* Data Types Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Data to Export
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataTypes.map((dataType) => (
              <label key={dataType.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDataTypes.includes(dataType.value)}
                  onChange={() => handleToggleDataType(dataType.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{dataType.label}</p>
                  <p className="text-sm text-gray-500">{dataType.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Export Formats */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.value}
                  onClick={() => handleRequestExport(format.value)}
                  disabled={isLoading || selectedDataTypes.length === 0}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className={`w-8 h-8 ${format.color} mb-2`} />
                  <p className="text-sm font-medium text-gray-900">{format.label}</p>
                  <p className="text-xs text-gray-500 text-center mt-1">{format.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Export History</h3>

        {exportRequests.length === 0 ? (
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Export Requests</h3>
            <p className="text-gray-600">
              Your export requests will appear here once you create them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exportRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.type}</p>
                    <p className="text-sm text-gray-500">
                      Requested {request.createdAt}
                      {request.completedAt && ` • Completed ${request.completedAt}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.status === 'completed' && request.downloadUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownload(request)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Download className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Data Export Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Exports may take several minutes to process depending on data size</li>
                <li>You will receive an email notification when your export is ready</li>
                <li>Download links expire after 7 days for security</li>
                <li>Large exports are automatically compressed to reduce file size</li>
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
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
} 