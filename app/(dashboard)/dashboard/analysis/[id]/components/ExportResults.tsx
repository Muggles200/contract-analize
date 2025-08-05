'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  FileJson,
  ChevronDown,
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportResultsProps {
  analysisId: string;
}

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Professional PDF report with all analysis results',
    icon: File,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    id: 'excel',
    name: 'Excel Spreadsheet',
    description: 'Structured data in Excel format for further analysis',
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Raw analysis data in JSON format for integration',
    icon: FileJson,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'summary',
    name: 'Executive Summary',
    description: 'Brief summary document with key findings',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

export default function ExportResults({ analysisId }: ExportResultsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setExporting(format);
    
    try {
      const response = await fetch(`/api/analysis/${analysisId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const formatInfo = exportFormats.find(f => f.id === format);
        const fileName = `analysis-${analysisId}-${format}.${format === 'json' ? 'json' : format === 'excel' ? 'xlsx' : 'pdf'}`;
        
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`${formatInfo?.name} exported successfully`);
        setIsOpen(false);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast.error('Failed to export analysis results');
    } finally {
      setExporting(null);
    }
  };

  const handleQuickExport = async () => {
    // Quick export as PDF
    await handleExport('pdf');
  };

  return (
    <div className="relative">
      {/* Quick Export Button */}
      <button
        onClick={handleQuickExport}
        disabled={exporting === 'pdf'}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {exporting === 'pdf' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export
      </button>

      {/* Export Options Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-2 inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Export Options</h3>
                <div className="space-y-6">
                  {/* Export Legal Disclaimer */}
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">
                          ⚠️ Export Disclaimer
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          Exported analysis results are for informational purposes only and do not constitute legal advice. 
                          <strong>Always consult with a qualified attorney before making legal decisions.</strong> 
                          The exported data may contain sensitive information - handle with appropriate care.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => handleExport(format.id)}
                      disabled={exporting === format.id}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        exporting === format.id
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      } ${format.bgColor} ${format.borderColor}`}
                    >
                      {exporting === format.id ? (
                        <Loader2 className={`w-5 h-5 ${format.color} animate-spin`} />
                      ) : (
                        <format.icon className={`w-5 h-5 ${format.color}`} />
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{format.name}</p>
                        <p className="text-xs text-gray-500">{format.description}</p>
                      </div>
                      {exporting === format.id && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 