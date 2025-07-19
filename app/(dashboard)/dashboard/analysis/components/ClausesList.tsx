'use client';

import { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Tag,
  Star,
  Copy,
  Eye,
  SortAsc,
  SortDesc
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
  confidence?: number;
}

interface ClausesListProps {
  clauses: Clause[];
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  maxItems?: number;
  onClauseClick?: (clause: Clause) => void;
  onCopy?: (clause: Clause) => void;
  className?: string;
}

type SortField = 'title' | 'category' | 'importance' | 'pageNumber';
type SortDirection = 'asc' | 'desc';

export default function ClausesList({
  clauses,
  title = 'Contract Clauses',
  showFilters = true,
  showSearch = true,
  showSorting = true,
  maxItems,
  onClauseClick,
  onCopy,
  className = ''
}: ClausesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [sortField, setSortField] = useState<SortField>('importance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(clauses.map(clause => clause.category)))], 
    [clauses]
  );
  
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

  const getImportancePriority = (importance: string) => {
    switch (importance) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const filteredAndSortedClauses = useMemo(() => {
    let filtered = clauses.filter(clause => {
      const matchesSearch = clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clause.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           clause.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory;
      const matchesImportance = selectedImportance === 'all' || clause.importance === selectedImportance;
      
      return matchesSearch && matchesCategory && matchesImportance;
    });

    // Sort clauses
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
        case 'importance':
          aValue = getImportancePriority(a.importance);
          bValue = getImportancePriority(b.importance);
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
  }, [clauses, searchTerm, selectedCategory, selectedImportance, sortField, sortDirection, maxItems]);

  const toggleClauseExpansion = (clauseId: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseId)) {
      newExpanded.delete(clauseId);
    } else {
      newExpanded.add(clauseId);
    }
    setExpandedClauses(newExpanded);
  };

  const handleCopy = async (clause: Clause) => {
    try {
      const textToCopy = `${clause.title}\n\n${clause.description}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Clause copied to clipboard');
      onCopy?.(clause);
    } catch (error) {
      toast.error('Failed to copy clause');
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
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No clauses found</p>
          <p className="text-sm">No contract clauses have been extracted yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredAndSortedClauses.length} of {clauses.length}
            </span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
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
                  placeholder="Search clauses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {showFilters && (
              <div className="flex items-center space-x-4">
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

      {/* Clauses List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedClauses.map((clause) => (
          <div key={clause.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => onClauseClick?.(clause)}
                  >
                    {clause.title}
                  </h4>
                  {getImportanceIcon(clause.importance)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getImportanceColor(clause.importance)}`}>
                    {clause.importance.charAt(0).toUpperCase() + clause.importance.slice(1)}
                  </span>
                  {clause.confidence && (
                    <span className="text-xs text-gray-500">
                      {Math.round(clause.confidence * 100)}% confidence
                    </span>
                  )}
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
                        onClick={() => handleCopy(clause)}
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
                  onClick={() => handleCopy(clause)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy clause"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {onClauseClick && (
                  <button
                    onClick={() => onClauseClick(clause)}
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

      {filteredAndSortedClauses.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No clauses found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
} 