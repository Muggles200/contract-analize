'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Activity,
  Plus,
  Filter,
  RefreshCw,
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

interface ReportGeneratorProps {
  data: ReportData;
  template: string;
  dateRange: string;
  organizationId?: string;
  reportType: string;
}

export default function ReportGenerator({ 
  data, 
  template, 
  dateRange, 
  organizationId, 
  reportType 
}: ReportGeneratorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const reportTemplates = [
    {
      id: 'overview',
      name: 'Overview Report',
      description: 'High-level summary of contracts and analyses',
      icon: BarChart3,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Analysis performance and processing metrics',
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      id: 'cost',
      name: 'Cost Analysis Report',
      description: 'Detailed cost breakdown and token usage',
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      id: 'risks',
      name: 'Risk Assessment Report',
      description: 'Risk analysis and mitigation recommendations',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      id: 'usage',
      name: 'Usage Report',
      description: 'User activity and feature utilization',
      icon: Activity,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete analysis with all metrics and insights',
      icon: FileText,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
  ];

  const reportTypes = [
    { id: 'summary', name: 'Summary', description: 'Key metrics and highlights' },
    { id: 'detailed', name: 'Detailed', description: 'Comprehensive analysis with charts' },
    { id: 'executive', name: 'Executive', description: 'High-level insights for leadership' },
    { id: 'technical', name: 'Technical', description: 'Technical details and performance data' },
  ];

  const dateRanges = [
    { id: 'week', name: 'Last 7 Days', description: 'Past week' },
    { id: 'month', name: 'This Month', description: 'Current month' },
    { id: 'quarter', name: 'This Quarter', description: 'Current quarter' },
    { id: 'year', name: 'This Year', description: 'Current year' },
    { id: 'custom', name: 'Custom Range', description: 'Select specific dates' },
  ];

  const updateReportParams = (newTemplate?: string, newDateRange?: string, newType?: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (newTemplate) {
      params.set('template', newTemplate);
    }
    
    if (newDateRange) {
      params.set('dateRange', newDateRange);
    }

    if (newType) {
      params.set('type', newType);
    }

    router.push(`/dashboard/reports?${params.toString()}`);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call an API to generate the report
      console.log('Generating report with:', {
        template,
        dateRange,
        reportType,
        organizationId,
        customStartDate,
        customEndDate
      });
      
      // Navigate to report preview or download
      router.push(`/dashboard/reports/preview?template=${template}&dateRange=${dateRange}&type=${reportType}`);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentTemplate = () => {
    return reportTemplates.find(t => t.id === template) || reportTemplates[0];
  };

  const getCurrentReportType = () => {
    return reportTypes.find(t => t.id === reportType) || reportTypes[0];
  };

  const getCurrentDateRange = () => {
    return dateRanges.find(d => d.id === dateRange) || dateRanges[1];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Generate Report</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Report Builder</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Report Template Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Report Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((temp) => {
              const Icon = temp.icon;
              const isSelected = template === temp.id;
              
              return (
                <button
                  key={temp.id}
                  onClick={() => updateReportParams(temp.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${temp.color} bg-opacity-10`}>
                      <Icon className={`w-5 h-5 ${temp.textColor}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {temp.name}
                      </p>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {temp.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Type Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((type) => {
              const isSelected = reportType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => updateReportParams(undefined, undefined, type.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {type.name}
                  </p>
                  <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dateRanges.map((range) => {
              const isSelected = dateRange === range.id;
              
              return (
                <button
                  key={range.id}
                  onClick={() => updateReportParams(undefined, range.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {range.name}
                      </p>
                      <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {range.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Inputs */}
          {dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Report Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Template:</p>
              <p className="font-medium text-gray-900">{getCurrentTemplate().name}</p>
            </div>
            <div>
              <p className="text-gray-600">Type:</p>
              <p className="font-medium text-gray-900">{getCurrentReportType().name}</p>
            </div>
            <div>
              <p className="text-gray-600">Period:</p>
              <p className="font-medium text-gray-900">{getCurrentDateRange().name}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>This report will include data from {data.contracts.length} contracts and {data.analyses.length} analyses.</p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>Ready to generate your {getCurrentTemplate().name.toLowerCase()} report?</p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 