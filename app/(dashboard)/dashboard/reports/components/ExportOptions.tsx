'use client';

import { useState } from 'react';
import { 
  Download, 
  Mail, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Share2,
  Copy,
  ExternalLink,
  Settings,
  Check,
  Clock
} from 'lucide-react';

interface ReportData {
  contracts: any[];
  analyses: any[];
  usage: any;
  cost: any;
  risks: any[];
  dateRange: {
    start: Date;
    end: Date;
    period: string;
  };
  template: string;
  reportType: string;
}

interface ExportOptionsProps {
  data: ReportData;
  template: string;
  dateRange: string;
}

export default function ExportOptions({ data, template, dateRange }: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedDelivery, setSelectedDelivery] = useState('download');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Professional document format',
      icon: File,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      extensions: ['.pdf'],
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Spreadsheet with data and charts',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      extensions: ['.xlsx', '.xls'],
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Raw data in comma-separated format',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      extensions: ['.csv'],
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data format',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      extensions: ['.json'],
    },
  ];

  const deliveryMethods = [
    {
      id: 'download',
      name: 'Download',
      description: 'Download directly to your device',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Send to email addresses',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'share',
      name: 'Share Link',
      description: 'Generate a shareable link',
      icon: Share2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const advancedOptions = [
    {
      id: 'includeCharts',
      name: 'Include Charts',
      description: 'Add visual charts and graphs',
      default: true,
    },
    {
      id: 'includeRawData',
      name: 'Include Raw Data',
      description: 'Include detailed data tables',
      default: false,
    },
    {
      id: 'includeMetadata',
      name: 'Include Metadata',
      description: 'Add report generation details',
      default: true,
    },
    {
      id: 'passwordProtect',
      name: 'Password Protect',
      description: 'Add password protection to PDF',
      default: false,
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Exporting report:', {
        format: selectedFormat,
        delivery: selectedDelivery,
        template,
        dateRange,
        emailRecipients,
        data: {
          contractsCount: data.contracts.length,
          analysesCount: data.analyses.length,
        }
      });
      
      // Handle different delivery methods
      switch (selectedDelivery) {
        case 'download':
          // Trigger download
          console.log('Downloading report...');
          break;
        case 'email':
          // Send email
          console.log('Sending email to:', emailRecipients);
          break;
        case 'share':
          // Generate share link
          console.log('Generating share link...');
          break;
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getCurrentFormat = () => {
    return exportFormats.find(f => f.id === selectedFormat) || exportFormats[0];
  };

  const getCurrentDelivery = () => {
    return deliveryMethods.find(d => d.id === selectedDelivery) || deliveryMethods[0];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimatedFileSize = {
    pdf: 250 * 1024, // 250KB
    excel: 180 * 1024, // 180KB
    csv: 50 * 1024, // 50KB
    json: 120 * 1024, // 120KB
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Export Options</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Download className="w-4 h-4" />
            <span>Export & Share</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Export Format Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Export Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormat === format.id;
              
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${format.bgColor}`}>
                      <Icon className={`w-5 h-5 ${format.color}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {format.name}
                      </p>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {format.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Est. size: {formatFileSize(estimatedFileSize[format.id as keyof typeof estimatedFileSize])}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Delivery Method Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Delivery Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedDelivery === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedDelivery(method.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${method.bgColor}`}>
                      <Icon className={`w-5 h-5 ${method.color}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {method.name}
                      </p>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Recipients (if email delivery selected) */}
        {selectedDelivery === 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Recipients
            </label>
            <input
              type="text"
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple email addresses with commas
            </p>
          </div>
        )}

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced Options</span>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              {advancedOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={option.id}
                    defaultChecked={option.default}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor={option.id} className="text-sm font-medium text-gray-700">
                      {option.name}
                    </label>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Export Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Format:</p>
              <p className="font-medium text-gray-900">{getCurrentFormat().name}</p>
            </div>
            <div>
              <p className="text-gray-600">Delivery:</p>
              <p className="font-medium text-gray-900">{getCurrentDelivery().name}</p>
            </div>
            <div>
              <p className="text-gray-600">Estimated Size:</p>
              <p className="font-medium text-gray-900">
                {formatFileSize(estimatedFileSize[selectedFormat as keyof typeof estimatedFileSize])}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Data Points:</p>
              <p className="font-medium text-gray-900">
                {data.contracts.length} contracts, {data.analyses.length} analyses
              </p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Ready to export your {getCurrentFormat().name} report?</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || (selectedDelivery === 'email' && !emailRecipients.trim())}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 