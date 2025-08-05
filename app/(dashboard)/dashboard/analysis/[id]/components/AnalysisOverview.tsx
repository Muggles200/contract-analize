'use client';

import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  FileText,
  Lightbulb
} from 'lucide-react';

interface AnalysisOverviewProps {
  summary: string;
  totalClauses: number;
  totalRisks: number;
  totalRecommendations: number;
  highRiskCount: number;
  criticalRiskCount: number;
  confidenceScore?: number | null;
  processingTime: number;
}

export default function AnalysisOverview({
  summary,
  totalClauses,
  totalRisks,
  totalRecommendations,
  highRiskCount,
  criticalRiskCount,
  confidenceScore,
  processingTime
}: AnalysisOverviewProps) {
  const formatDuration = (milliseconds: number) => {
    if (!milliseconds) return 'N/A';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getRiskLevel = () => {
    if (criticalRiskCount > 0) return 'Critical';
    if (highRiskCount > 0) return 'High';
    if (totalRisks > 0) return 'Medium';
    return 'Low';
  };

  const getRiskLevelColor = () => {
    const level = getRiskLevel();
    switch (level) {
      case 'Critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'High':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskLevelIcon = () => {
    const level = getRiskLevel();
    switch (level) {
      case 'Critical':
      case 'High':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Medium':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const stats = [
    {
      title: "Total Clauses",
      value: totalClauses,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      description: "Extracted clauses"
    },
    {
      title: "Total Risks",
      value: totalRisks,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      description: "Identified risks"
    },
    {
      title: "Recommendations",
      value: totalRecommendations,
      icon: Lightbulb,
      color: "bg-green-50 text-green-600",
      description: "Action items"
    },
    {
      title: "Processing Time",
      value: formatDuration(processingTime),
      icon: Clock,
      color: "bg-purple-50 text-purple-600",
      description: "Analysis duration"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Analysis Overview</h2>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor()}`}>
            {getRiskLevelIcon()}
            <span className="ml-1">Risk Level: {getRiskLevel()}</span>
          </span>
        </div>
      </div>

      {/* Analysis Overview Content */}
      <div className="space-y-6">
        {/* Legal Disclaimer */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                ⚠️ LEGAL DISCLAIMER
              </p>
              <p className="text-sm text-red-700 mt-1">
                This AI analysis is provided for informational purposes only and does not constitute legal advice. 
                <strong>Always consult with a qualified attorney for legal matters.</strong> 
                The analysis may contain errors, omissions, or inaccuracies and should not be relied upon for legal decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Executive Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        )}

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Risk Breakdown */}
        {totalRisks > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Risk Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Critical</span>
                </div>
                <span className="text-lg font-bold text-red-600">{criticalRiskCount}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">High</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{highRiskCount}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Medium/Low</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{totalRisks - highRiskCount - criticalRiskCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {confidenceScore && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Confidence</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(confidenceScore * 100)}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(confidenceScore * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Confidence level based on document quality and analysis accuracy
            </p>
          </div>
        )}

        {/* Quick Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Insights</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            {totalClauses > 0 && (
              <li>• {totalClauses} important clauses identified and categorized</li>
            )}
            {totalRisks > 0 && (
              <li>• {totalRisks} potential risks detected with {criticalRiskCount + highRiskCount} high-priority items</li>
            )}
            {totalRecommendations > 0 && (
              <li>• {totalRecommendations} actionable recommendations provided</li>
            )}
            <li>• Analysis completed in {formatDuration(processingTime)}</li>
            {confidenceScore && (
              <li>• Analysis confidence: {Math.round(confidenceScore * 100)}%</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
} 