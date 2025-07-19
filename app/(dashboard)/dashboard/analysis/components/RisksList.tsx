'use client';

import { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  Shield
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
  confidence?: number;
}

interface RisksListProps {
  risks: Risk[];
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  maxItems?: number;
  onRiskClick?: (risk: Risk) => void;
  onCopy?: (risk: Risk) => void;
  className?: string;
}

type SortField = 'title' | 'category' | 'severity' | 'pageNumber';
type SortDirection = 'asc' | 'desc';

export default function RisksList({
  risks,
  title = 'Risk Assessment',
  showFilters = true,
  showSearch = true,
  showSorting = true,
  maxItems,
  onRiskClick,
  onCopy,
  className = ''
}: RisksListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(risks.map(risk => risk.category)))], 
    [risks]
  );
  
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
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'legal':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'operational':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
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

  const filteredAndSortedRisks = useMemo(() => {
    let filtered = risks.filter(risk => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = selectedSeverity === 'all' || risk.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'all' || risk.category === selectedCategory;
      
      return matchesSearch && matchesSeverity && matchesCategory;
    });

    // Sort risks
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'severity':
          aValue = getSeverityPriority(a.severity);
          bValue = getSeverityPriority(b.severity);
          break;
        case 'pageNumber':
          aValue = a.pageNumber || 0;
          bValue = b.pageNumber || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return maxItems ? filtered.slice(0, maxItems) : filtered;
  }, [risks, searchTerm, selectedSeverity, selectedCategory, sortField, sortDirection, maxItems]);

  const toggleRiskExpansion = (riskId: string) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(riskId)) {
      newExpanded.delete(riskId);
    } else {
      newExpanded.add(riskId);
    }
    setExpandedRisks(newExpanded);
  };

  const handleCopy = async (risk: Risk) => {
    try {
      const textToCopy = `${risk.title}\n\n${risk.description}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Risk details copied to clipboard');
      onCopy?.(risk);
    } catch (error) {
      toast.error('Failed to copy risk details');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <SortAsc className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4 text-blue-600" /> : 
      <SortDesc className="w-4 h-4 text-blue-600" />;
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
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No risks identified</p>
          <p className="text-sm">No significant risks have been detected</p>
        </div>
      </div>
    );
  }

  const riskStats = getRiskStats();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredAndSortedRisks.length} of {risks.length}
            </span>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

        {/* Filters and Search */}
        {(showSearch || showFilters) && (
          <div className="space-y-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search risks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex items-center space-x-4">
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
            )}

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
        )}
      </div>

      {/* Risks List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedRisks.map((risk) => (
          <div key={risk.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getSeverityIcon(risk.severity)}
                  <h4 
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-red-600"
                    onClick={() => onRiskClick?.(risk)}
                  >
                    {risk.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(risk.severity)}`}>
                    {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                  </span>
                  {risk.confidence && (
                    <span className="text-xs text-gray-500">
                      {Math.round(risk.confidence * 100)}% confidence
                    </span>
                  )}
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
                            onClick={() => handleCopy(risk)}
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
                            onClick={() => handleCopy(risk)}
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
                            onClick={() => handleCopy(risk)}
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
                  onClick={() => handleCopy(risk)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy risk details"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {onRiskClick && (
                  <button
                    onClick={() => onRiskClick(risk)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedRisks.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No risks found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
} 