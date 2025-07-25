'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  FileJson,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Analysis {
  id: string;
  status: string;
  analysisType: string;
  createdAt: Date;
  contract: {
    fileName: string;
    fileSize: number;
    metadata: any;
  };
}

interface AnalysisExportFormProps {
  analyses: Analysis[];
}

const EXPORT_FORMATS = [
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Professional PDF report with charts and formatting',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'excel',
    name: 'Excel Spreadsheet',
    description: 'Structured data in Excel format',
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'csv',
    name: 'CSV File',
    description: 'Comma-separated values for data analysis',
    icon: File,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Raw data in JSON format',
    icon: FileJson,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

export default function AnalysisExportForm({ analyses }: AnalysisExportFormProps) {
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Filter analyses based on search and filters
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.contract.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || analysis.status === filterStatus;
    const matchesType = filterType === 'all' || analysis.analysisType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAnalysisToggle = (analysisId: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId) 
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnalyses.length === filteredAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(filteredAnalyses.map(a => a.id));
    }
  };

  const handleExport = async () => {
    if (selectedAnalyses.length === 0) {
      toast.error('Please select at least one analysis for export');
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch('/api/analysis/export/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisIds: selectedAnalyses,
          format: selectedFormat,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const formatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat);
        const fileName = `analysis-export-${new Date().toISOString().split('T')[0]}.${selectedFormat === 'json' ? 'json' : selectedFormat === 'excel' ? 'xlsx' : selectedFormat}`;
        
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${formatInfo?.name} exported successfully`);
        setSelectedAnalyses([]);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export analysis results');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatInfo = () => {
    return EXPORT_FORMATS.find(f => f.id === selectedFormat) || EXPORT_FORMATS[0];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Export Configuration</h2>
        <p className="text-sm text-gray-600">
          Select analyses and export format to generate reports.
        </p>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXPORT_FORMATS.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedFormat === format.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${format.bgColor}`}>
                  <format.icon className={`w-5 h-5 ${format.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{format.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                </div>
                {selectedFormat === format.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Select Analyses</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedAnalyses.length === filteredAnalyses.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-500">
              {selectedAnalyses.length} of {filteredAnalyses.length} selected
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="risk-assessment">Risk Assessment</option>
            <option value="clause-extraction">Clause Extraction</option>
            <option value="basic">Basic</option>
          </select>
        </div>

        {/* Analysis List */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredAnalyses.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No analyses found matching your criteria.
            </div>
          ) : (
            filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                  selectedAnalyses.includes(analysis.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedAnalyses.includes(analysis.id)}
                    onChange={() => handleAnalysisToggle(analysis.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {analysis.contract.fileName}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                        analysis.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {analysis.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{analysis.analysisType.replace('-', ' ')}</span>
                      <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                      <span>{(analysis.contract.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export Button */}
      {selectedAnalyses.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Export Summary
              </p>
              <p className="text-sm text-gray-600">
                {selectedAnalyses.length} analysis(s) • {getFormatInfo().name}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {getFormatInfo().name}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 