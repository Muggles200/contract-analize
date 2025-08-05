'use client';

import { useState } from 'react';
import { 
  FileText, 
  Eye, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Tag,
  Star,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Clause {
  id: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  pageNumber?: number;
  section?: string;
  extractedText?: string;
}

interface ClausesSectionProps {
  clauses: Clause[];
}

export default function ClausesSection({ clauses }: ClausesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  const categories = ['all', ...Array.from(new Set(clauses.map(clause => clause.category)))];
  const importanceLevels = ['all', 'high', 'medium', 'low'];

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Star className="w-4 h-4 text-red-500 fill-current" />;
      case 'medium':
        return <Star className="w-4 h-4 text-yellow-500 fill-current" />;
      case 'low':
        return <Star className="w-4 h-4 text-gray-300" />;
      default:
        return <Star className="w-4 h-4 text-gray-300" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
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
      case 'payment':
        return <Tag className="w-4 h-4 text-green-600" />;
      case 'termination':
        return <Tag className="w-4 h-4 text-red-600" />;
      case 'liability':
        return <Tag className="w-4 h-4 text-orange-600" />;
      case 'confidentiality':
        return <Tag className="w-4 h-4 text-blue-600" />;
      case 'intellectual property':
        return <Tag className="w-4 h-4 text-purple-600" />;
      default:
        return <Tag className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory;
    const matchesImportance = selectedImportance === 'all' || clause.importance === selectedImportance;
    
    return matchesSearch && matchesCategory && matchesImportance;
  });

  const toggleClauseExpansion = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Clause copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy clause');
    }
  };

  const getCategoryStats = () => {
    const stats = clauses.reduce((acc, clause) => {
      acc[clause.category] = (acc[clause.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / clauses.length) * 100)
    }));
  };

  if (clauses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Contract Clauses</h2>
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No clauses extracted</p>
          <p className="text-sm">This analysis didn't identify any specific clauses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Contract Clauses</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{filteredClauses.length} of {clauses.length}</span>
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={selectedImportance}
            onChange={(e) => setSelectedImportance(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {importanceLevels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Importance' : level.charAt(0).toUpperCase() + level.slice(1)}
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

      {/* Clauses Analysis */}
      <div className="space-y-6">
        {/* Legal Disclaimer for Clauses */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                ⚠️ Clause Analysis Disclaimer
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                The clause analysis provided is for informational purposes only. 
                <strong>This is not legal advice and should not replace consultation with a qualified attorney.</strong> 
                Legal interpretation may vary by jurisdiction and specific circumstances.
              </p>
            </div>
          </div>
        </div>
        {/* Clauses List */}
        <div className="space-y-4">
          {filteredClauses.map((clause) => (
            <div key={clause.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{clause.title}</h3>
                    {getImportanceIcon(clause.importance)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getImportanceColor(clause.importance)}`}>
                      {clause.importance.charAt(0).toUpperCase() + clause.importance.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(clause.category)}
                      <span>{clause.category}</span>
                    </div>
                    {clause.pageNumber && (
                      <span>Page {clause.pageNumber}</span>
                    )}
                    {clause.section && (
                      <span>Section {clause.section}</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {clause.description}
                  </p>

                  {expandedClauses.has(clause.id) && clause.extractedText && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Extracted Text</span>
                        <button
                          onClick={() => copyToClipboard(clause.extractedText!)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {clause.extractedText}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {clause.extractedText && (
                    <button
                      onClick={() => toggleClauseExpansion(clause.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title={expandedClauses.has(clause.id) ? 'Collapse' : 'Expand'}
                    >
                      {expandedClauses.has(clause.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(clause.description)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy clause"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClauses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No clauses found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 