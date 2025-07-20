'use client';

import { useState } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  FileText, 
  Lightbulb, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Download,
  RefreshCw,
  Play,
  ChevronDown,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  id: string;
  status: string;
  analysisType: string;
  createdAt: string;
  processingTime?: number;
  confidenceScore?: number;
  summary?: string;
  risks?: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }>;
  clauses?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    importance: 'low' | 'medium' | 'high';
  }>;
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
  }>;
}

interface AnalysisResultsProps {
  analysisResults: AnalysisResult[];
  contractId: string;
  onRefresh: () => void;
}

const ANALYSIS_TYPES = [
  {
    value: 'comprehensive',
    label: 'Comprehensive Analysis',
    description: 'Full contract analysis with risks, clauses, and recommendations',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    estimatedTime: '5-10 minutes'
  },
  {
    value: 'risk-assessment',
    label: 'Risk Assessment',
    description: 'Quick risk identification and severity analysis',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    estimatedTime: '3-5 minutes'
  },
  {
    value: 'clause-extraction',
    label: 'Clause Extraction',
    description: 'Extract and categorize important contract clauses',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    estimatedTime: '2-4 minutes'
  },
  {
    value: 'basic',
    label: 'Basic Analysis',
    description: 'Quick overview and summary of contract content',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    estimatedTime: '1-2 minutes'
  }
];

export default function AnalysisResults({ analysisResults, contractId, onRefresh }: AnalysisResultsProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(
    analysisResults[0] || null
  );
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('comprehensive');
  const [showAnalysisTypeDropdown, setShowAnalysisTypeDropdown] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    const analysisType = ANALYSIS_TYPES.find(t => t.value === type);
    return analysisType ? analysisType.label : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  const getAnalysisTypeIcon = (type: string) => {
    const analysisType = ANALYSIS_TYPES.find(t => t.value === type);
    return analysisType ? analysisType.icon : Brain;
  };

  const handleStartAnalysis = async () => {
    try {
      setIsStartingAnalysis(true);
      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          analysisType: selectedAnalysisType,
        }),
      });

      if (response.ok) {
        toast.success('Analysis started successfully');
        onRefresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start analysis');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start analysis');
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  const handleExportResults = async () => {
    if (!selectedAnalysis) return;

    try {
      const response = await fetch(`/api/analysis/${selectedAnalysis.id}/export`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analysis-${selectedAnalysis.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Analysis exported successfully');
      } else {
        throw new Error('Failed to export analysis');
      }
    } catch (error) {
      toast.error('Failed to export analysis');
    }
  };

  if (analysisResults.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Results</h3>
          <p className="text-gray-600 mb-6">
            This contract hasn't been analyzed yet. Choose an analysis type to get insights about your contract.
          </p>
          
          {/* Analysis Type Selection */}
          <div className="max-w-md mx-auto mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Analysis Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAnalysisTypeDropdown(!showAnalysisTypeDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center space-x-3">
                  {(() => {
                    const selectedType = ANALYSIS_TYPES.find(t => t.value === selectedAnalysisType);
                    const Icon = selectedType?.icon || Brain;
                    return <Icon className={`w-5 h-5 ${selectedType?.color || 'text-gray-500'}`} />;
                  })()}
                  <span className="text-gray-900">{getAnalysisTypeLabel(selectedAnalysisType)}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showAnalysisTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {ANALYSIS_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedAnalysisType(type.value);
                          setShowAnalysisTypeDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedAnalysisType === type.value ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${type.color}`} />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{type.estimatedTime}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={isStartingAnalysis}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStartingAnalysis ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isStartingAnalysis ? 'Starting...' : 'Start Analysis'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            {selectedAnalysis && selectedAnalysis.status === 'complete' && (
              <button
                onClick={handleExportResults}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
            
            {/* Analysis Type Selection for New Analysis */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAnalysisTypeDropdown(!showAnalysisTypeDropdown)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {(() => {
                  const selectedType = ANALYSIS_TYPES.find(t => t.value === selectedAnalysisType);
                  const Icon = selectedType?.icon || Brain;
                  return <Icon className={`w-4 h-4 mr-2 ${selectedType?.color || 'text-gray-500'}`} />;
                })()}
                {getAnalysisTypeLabel(selectedAnalysisType)}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {showAnalysisTypeDropdown && (
                <div className="absolute right-0 z-10 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {ANALYSIS_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedAnalysisType(type.value);
                          setShowAnalysisTypeDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedAnalysisType === type.value ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${type.color}`} />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{type.estimatedTime}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button
              onClick={handleStartAnalysis}
              disabled={isStartingAnalysis}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStartingAnalysis ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              New Analysis
            </button>
          </div>
        </div>

        {/* Analysis History */}
        <div className="space-y-2">
          {analysisResults.map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => setSelectedAnalysis(analysis)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedAnalysis?.id === analysis.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(analysis.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const Icon = getAnalysisTypeIcon(analysis.analysisType);
                        return <Icon className="w-4 h-4 text-gray-500" />;
                      })()}
                      <p className="text-sm font-medium text-gray-900">
                        {getAnalysisTypeLabel(analysis.analysisType)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(analysis.status)}`}>
                    {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                  </span>
                  {analysis.processingTime && (
                    <span className="text-sm text-gray-500">
                      {Math.round(analysis.processingTime / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Analysis Details */}
      {selectedAnalysis && (
        <div className="space-y-6">
          {/* Summary */}
          {selectedAnalysis.summary && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analysis Summary
              </h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{selectedAnalysis.summary}</p>
              </div>
            </div>
          )}

          {/* Risks */}
          {selectedAnalysis.risks && selectedAnalysis.risks.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Identified Risks ({selectedAnalysis.risks.length})
              </h4>
              <div className="space-y-4">
                {selectedAnalysis.risks.map((risk) => (
                  <div key={risk.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{risk.title}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}>
                        {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {risk.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clauses */}
          {selectedAnalysis.clauses && selectedAnalysis.clauses.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Key Clauses ({selectedAnalysis.clauses.length})
              </h4>
              <div className="space-y-4">
                {selectedAnalysis.clauses.map((clause) => (
                  <div key={clause.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{clause.title}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(clause.importance)}`}>
                        {clause.importance.charAt(0).toUpperCase() + clause.importance.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{clause.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {clause.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {selectedAnalysis.recommendations && selectedAnalysis.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Recommendations ({selectedAnalysis.recommendations.length})
              </h4>
              <div className="space-y-4">
                {selectedAnalysis.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{recommendation.title}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {recommendation.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 