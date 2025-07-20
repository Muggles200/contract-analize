'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  File,
  FileSpreadsheet,
  FileText as FileTextIcon,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ReportHistoryItem {
  id: string;
  reportName: string;
  template: string;
  reportType: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filePath?: string;
  fileSize?: bigint;
  downloadCount: number;
  status: string;
  errorMessage?: string;
  metadata?: any;
  createdAt: Date;
}

interface ReportHistoryProps {
  reportHistory: ReportHistoryItem[];
  organizationId?: string;
}

export default function ReportHistory({ reportHistory, organizationId }: ReportHistoryProps) {
  const [selectedReport, setSelectedReport] = useState<ReportHistoryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'processing':
        return '⏳';
      default:
        return '?';
    }
  };

  const getFileIcon = (template: string) => {
    switch (template) {
      case 'pdf':
        return File;
      case 'excel':
        return FileSpreadsheet;
      case 'csv':
      case 'json':
        return FileTextIcon;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes?: bigint) => {
    if (!bytes) return 'Unknown';
    const numBytes = Number(bytes);
    if (numBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (report: ReportHistoryItem) => {
    try {
      // In a real implementation, this would trigger a download
      console.log('Downloading report:', report.id);
      
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update download count
      console.log('Download completed');
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDelete = async (report: ReportHistoryItem) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      // In a real implementation, this would delete from the database
      console.log('Deleting report:', report.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleShare = async (report: ReportHistoryItem) => {
    try {
      // In a real implementation, this would generate a share link
      console.log('Generating share link for report:', report.id);
      
      // Simulate generating share link
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Copy to clipboard
      const shareUrl = `${window.location.origin}/reports/share/${report.id}`;
      await navigator.clipboard.writeText(shareUrl);
      
      console.log('Share link copied to clipboard');
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleDuplicate = async (report: ReportHistoryItem) => {
    try {
      // In a real implementation, this would duplicate the report configuration
      console.log('Duplicating report:', report.id);
      
      // Navigate to reports page with the same configuration
      const params = new URLSearchParams();
      params.set('template', report.template);
      params.set('type', report.reportType);
      if (report.dateRange) {
        params.set('dateRange', 'custom');
        // You could also set custom start/end dates here
      }
      
      window.location.href = `/dashboard/reports?${params.toString()}`;
    } catch (error) {
      console.error('Error duplicating report:', error);
    }
  };

  const getTemplateDisplayName = (template: string) => {
    const templateNames: Record<string, string> = {
      'overview': 'Overview Report',
      'performance': 'Performance Report',
      'cost': 'Cost Analysis Report',
      'risks': 'Risk Assessment Report',
      'usage': 'Usage Report',
      'comprehensive': 'Comprehensive Report',
    };
    return templateNames[template] || template;
  };

  const getReportTypeDisplayName = (type: string) => {
    const typeNames: Record<string, string> = {
      'summary': 'Summary',
      'detailed': 'Detailed',
      'executive': 'Executive',
      'technical': 'Technical',
    };
    return typeNames[type] || type;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Report History</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Generated Reports</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {reportHistory.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No reports generated yet</p>
            <p className="text-sm text-gray-400">
              Generate your first report to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportHistory.map((report) => {
              const FileIcon = getFileIcon(report.template);
              
              return (
                <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {report.reportName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            <span className="mr-1">{getStatusIcon(report.status)}</span>
                            {report.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Template:</p>
                            <p className="font-medium text-gray-900">
                              {getTemplateDisplayName(report.template)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Type:</p>
                            <p className="font-medium text-gray-900">
                              {getReportTypeDisplayName(report.reportType)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Generated:</p>
                            <p className="font-medium text-gray-900">
                              {report.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Downloads:</p>
                            <p className="font-medium text-gray-900">
                              {report.downloadCount}
                            </p>
                          </div>
                        </div>
                        
                        {report.fileSize && (
                          <div className="mt-2 text-sm text-gray-500">
                            <span>File size: {formatFileSize(report.fileSize)}</span>
                          </div>
                        )}
                        
                        {report.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <p className="font-medium">Error:</p>
                            <p>{report.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {report.status === 'completed' && (
                        <>
                          <button
                            onClick={() => handleDownload(report)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShare(report)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(report)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {report.dateRange && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {report.dateRange.start.toLocaleDateString()} - {report.dateRange.end.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{report.createdAt.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Report
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedReport.reportName}"? This action cannot be undone.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedReport)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 