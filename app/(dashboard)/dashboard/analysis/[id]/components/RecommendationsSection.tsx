'use client';

import { useState } from 'react';
import { 
  Lightbulb, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  TrendingUp,
  Calendar
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
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

export default function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

  const categories = ['all', ...Array.from(new Set(recommendations.map(rec => rec.category)))];
  const priorityLevels = ['all', 'high', 'medium', 'low'];

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

  const filteredRecommendations = recommendations
    .filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = selectedPriority === 'all' || rec.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
      
      return matchesSearch && matchesPriority && matchesCategory;
    })
    .sort((a, b) => getPriorityPriority(b.priority) - getPriorityPriority(a.priority));

  const toggleRecommendationExpansion = (recId: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(recId)) {
      newExpanded.delete(recId);
    } else {
      newExpanded.add(recId);
    }
    setExpandedRecommendations(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Recommendation copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy recommendation');
    }
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          <div className="p-2 bg-green-50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No recommendations</p>
          <p className="text-sm">This analysis didn't generate any specific recommendations</p>
        </div>
      </div>
    );
  }

  const recStats = getRecommendationStats();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{filteredRecommendations.length} of {recommendations.length}</span>
          <div className="p-2 bg-green-50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recommendation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recommendations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
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

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecommendations.map((rec) => (
          <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(rec.priority)}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                </span>
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
                  onClick={() => copyToClipboard(rec.description)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy recommendation"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              {getCategoryIcon(rec.category)}
              <span className="text-xs text-gray-500">{rec.category}</span>
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 mb-2">{rec.title}</h3>
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
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No recommendations found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
} 