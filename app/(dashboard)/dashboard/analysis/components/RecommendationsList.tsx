'use client';

import { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  SortAsc,
  SortDesc,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  implementation?: string;
  timeline?: string;
  effort?: string;
  impact?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  dueDate?: string;
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  maxItems?: number;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  onCopy?: (recommendation: Recommendation) => void;
  onStatusChange?: (recommendationId: string, status: string) => void;
  className?: string;
}

type SortField = 'title' | 'category' | 'priority' | 'timeline' | 'status';
type SortDirection = 'asc' | 'desc';

export default function RecommendationsList({
  recommendations,
  title = 'Recommendations',
  showFilters = true,
  showSearch = true,
  showSorting = true,
  maxItems,
  onRecommendationClick,
  onCopy,
  onStatusChange,
  className = ''
}: RecommendationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(recommendations.map(rec => rec.category)))], 
    [recommendations]
  );
  
  const priorityLevels = ['all', 'high', 'medium', 'low'];
  const statusLevels = ['all', 'pending', 'in-progress', 'completed'];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-600 fill-current" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600 fill-current" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600 fill-current" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-600" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-700 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'legal':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'financial':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'operational':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'compliance':
        return <CheckCircle className="w-4 h-4 text-orange-600" />;
      case 'risk mitigation':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityPriority = (priority: string) => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getStatusPriority = (status: string) => {
    switch (status) {
      case 'completed': return 3;
      case 'in-progress': return 2;
      case 'pending': return 1;
      default: return 0;
    }
  };

  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = selectedPriority === 'all' || rec.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || rec.status === selectedStatus;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });

    // Sort recommendations
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
        case 'priority':
          aValue = getPriorityPriority(a.priority);
          bValue = getPriorityPriority(b.priority);
          break;
        case 'timeline':
          aValue = a.timeline || '';
          bValue = b.timeline || '';
          break;
        case 'status':
          aValue = getStatusPriority(a.status || 'pending');
          bValue = getStatusPriority(b.status || 'pending');
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
  }, [recommendations, searchTerm, selectedPriority, selectedCategory, selectedStatus, sortField, sortDirection, maxItems]);

  const toggleRecommendationExpansion = (recId: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(recId)) {
      newExpanded.delete(recId);
    } else {
      newExpanded.add(recId);
    }
    setExpandedRecommendations(newExpanded);
  };

  const handleCopy = async (recommendation: Recommendation) => {
    try {
      const textToCopy = `${recommendation.title}\n\n${recommendation.description}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Recommendation copied to clipboard');
      onCopy?.(recommendation);
    } catch (error) {
      toast.error('Failed to copy recommendation');
    }
  };

  const handleStatusChange = (recommendationId: string, newStatus: string) => {
    onStatusChange?.(recommendationId, newStatus);
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

  const getRecommendationStats = () => {
    const stats = recommendations.reduce((acc, rec) => {
      acc[rec.priority] = (acc[rec.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
      total: recommendations.length
    };
  };

  const getCategoryStats = () => {
    const stats = recommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / recommendations.length) * 100)
    }));
  };

  if (recommendations.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No recommendations</p>
          <p className="text-sm">No actionable recommendations have been generated</p>
        </div>
      </div>
    );
  }

  const recStats = getRecommendationStats();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredAndSortedRecommendations.length} of {recommendations.length}
            </span>
            <div className="p-2 bg-green-50 rounded-lg">
              <Lightbulb className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-lg font-bold text-red-600">{recStats.high}</p>
            <p className="text-xs text-red-700">High Priority</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-lg font-bold text-yellow-600">{recStats.medium}</p>
            <p className="text-xs text-yellow-700">Medium Priority</p>
          </div>
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-lg font-bold text-green-600">{recStats.low}</p>
            <p className="text-xs text-green-700">Low Priority</p>
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
                  placeholder="Search recommendations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {priorityLevels.map(priority => (
                    <option key={priority} value={priority}>
                      {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {statusLevels.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
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

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        {filteredAndSortedRecommendations.map((rec) => (
          <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(rec.priority)}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                </span>
                {rec.status && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rec.status)}`}>
                    {rec.status.charAt(0).toUpperCase() + rec.status.slice(1).replace('-', ' ')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {(rec.implementation || rec.timeline || rec.effort || rec.impact) && (
                  <button
                    onClick={() => toggleRecommendationExpansion(rec.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={expandedRecommendations.has(rec.id) ? 'Collapse' : 'Expand'}
                  >
                    {expandedRecommendations.has(rec.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleCopy(rec)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy recommendation"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {onRecommendationClick && (
                  <button
                    onClick={() => onRecommendationClick(rec)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              {getCategoryIcon(rec.category)}
              <span className="text-xs text-gray-500">{rec.category}</span>
            </div>
            
            <h4 
              className="text-sm font-medium text-gray-900 mb-2 cursor-pointer hover:text-green-600"
              onClick={() => onRecommendationClick?.(rec)}
            >
              {rec.title}
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              {rec.description}
            </p>

            {expandedRecommendations.has(rec.id) && (
              <div className="mt-3 space-y-2">
                {rec.implementation && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <span className="font-medium text-blue-700">Implementation:</span>
                    <p className="text-blue-600 mt-1">{rec.implementation}</p>
                  </div>
                )}
                
                {rec.timeline && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                    <span className="font-medium text-green-700">Timeline:</span>
                    <p className="text-green-600 mt-1">{rec.timeline}</p>
                  </div>
                )}
                
                {rec.effort && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <span className="font-medium text-yellow-700">Effort:</span>
                    <p className="text-yellow-600 mt-1">{rec.effort}</p>
                  </div>
                )}
                
                {rec.impact && (
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                    <span className="font-medium text-purple-700">Impact:</span>
                    <p className="text-purple-600 mt-1">{rec.impact}</p>
                  </div>
                )}

                {onStatusChange && (
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="text-xs text-gray-600">Status:</span>
                    <select
                      value={rec.status || 'pending'}
                      onChange={(e) => handleStatusChange(rec.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedRecommendations.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No recommendations found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
} 