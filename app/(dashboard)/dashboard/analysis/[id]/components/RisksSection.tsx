'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  impact?: string;
  probability?: string;
  mitigation?: string;
  pageNumber?: number;
  section?: string;
}

interface RisksSectionProps {
  risks: Risk[];
}

export default function RisksSection({ risks }: RisksSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  const categories = ['all', ...Array.from(new Set(risks.map(risk => risk.category)))];
  const severityLevels = ['all', 'critical', 'high', 'medium', 'low'];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600 fill-current" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600 fill-current" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 fill-current" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-green-600 fill-current" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'legal':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'operational':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'compliance':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'reputational':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityPriority = (severity: string) => {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const filteredRisks = risks
    .filter(risk => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = selectedSeverity === 'all' || risk.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'all' || risk.category === selectedCategory;
      
      return matchesSearch && matchesSeverity && matchesCategory;
    })
    .sort((a, b) => getSeverityPriority(b.severity) - getSeverityPriority(a.severity));

  const toggleRiskExpansion = (riskId: string) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(riskId)) {
      newExpanded.delete(riskId);
    } else {
      newExpanded.add(riskId);
    }
    setExpandedRisks(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Risk details copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy risk details');
    }
  };

  const getRiskStats = () => {
    const stats = risks.reduce((acc, risk) => {
      acc[risk.severity] = (acc[risk.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      critical: stats.critical || 0,
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
      total: risks.length
    };
  };

  const getCategoryStats = () => {
    const stats = risks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / risks.length) * 100)
    }));
  };

  if (risks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No risks identified</p>
          <p className="text-sm">This analysis didn't detect any significant risks</p>
        </div>
      </div>
    );
  }

  const riskStats = getRiskStats();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{filteredRisks.length} of {risks.length}</span>
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-lg font-bold text-red-600">{riskStats.critical}</p>
          <p className="text-xs text-red-700">Critical</p>
        </div>
        <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-lg font-bold text-orange-600">{riskStats.high}</p>
          <p className="text-xs text-orange-700">High</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-lg font-bold text-yellow-600">{riskStats.medium}</p>
          <p className="text-xs text-yellow-700">Medium</p>
        </div>
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-lg font-bold text-green-600">{riskStats.low}</p>
          <p className="text-xs text-green-700">Low</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {severityLevels.map(severity => (
              <option key={severity} value={severity}>
                {severity === 'all' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Category Statistics */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Categories:</span>
          {getCategoryStats().map(({ category, count, percentage }) => (
            <span key={category} className="flex items-center space-x-1">
              {getCategoryIcon(category)}
              <span>{category} ({count}, {percentage}%)</span>
            </span>
          ))}
        </div>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => (
          <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getSeverityIcon(risk.severity)}
                  <h3 className="text-sm font-medium text-gray-900">{risk.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}>
                    {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon(risk.category)}
                    <span>{risk.category}</span>
                  </div>
                  {risk.pageNumber && (
                    <span>Page {risk.pageNumber}</span>
                  )}
                  {risk.section && (
                    <span>Section {risk.section}</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {risk.description}
                </p>

                {expandedRisks.has(risk.id) && (
                  <div className="mt-3 space-y-3">
                    {risk.impact && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-red-700">Impact</span>
                          <button
                            onClick={() => copyToClipboard(risk.impact!)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-red-600 leading-relaxed">
                          {risk.impact}
                        </p>
                      </div>
                    )}
                    
                    {risk.probability && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-yellow-700">Probability</span>
                          <button
                            onClick={() => copyToClipboard(risk.probability!)}
                            className="text-xs text-yellow-600 hover:text-yellow-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-yellow-600 leading-relaxed">
                          {risk.probability}
                        </p>
                      </div>
                    )}
                    
                    {risk.mitigation && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-green-700">Mitigation Strategy</span>
                          <button
                            onClick={() => copyToClipboard(risk.mitigation!)}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-green-600 leading-relaxed">
                          {risk.mitigation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {(risk.impact || risk.probability || risk.mitigation) && (
                  <button
                    onClick={() => toggleRiskExpansion(risk.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={expandedRisks.has(risk.id) ? 'Collapse' : 'Expand'}
                  >
                    {expandedRisks.has(risk.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(risk.description)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy risk details"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRisks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No risks found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
} 