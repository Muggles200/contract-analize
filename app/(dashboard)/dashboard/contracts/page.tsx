'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  FileText,
  Upload,
  Check,
  X,
  Brain,
  BarChart3,
  AlertTriangle,
  Eye,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import ContractTable from '../components/ContractTable';
import ContractGrid from '../components/ContractGrid';
import ContractFilters from '../components/ContractFilters';
import Pagination from '../components/Pagination';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  contractType?: string | null;
  fileSize: number;
  fileType: string;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  analysisResults: Array<{
    id: string;
    status: string;
  }>;
}

interface ContractsResponse {
  contracts: Contract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ANALYSIS_TYPES = {
  'comprehensive': {
    label: 'Comprehensive Analysis',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  'risk-assessment': {
    label: 'Risk Assessment',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  'clause-extraction': {
    label: 'Clause Extraction',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'basic': {
    label: 'Basic Analysis',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

export default function ContractsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filters and search
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc');
  
  // Analysis type from URL
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(searchParams.get('analysisType') || '');
  
  // View and selection
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { contractType: typeFilter }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/contracts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }

      const data: ContractsResponse = await response.json();
      setContracts(data.contracts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, typeFilter, sortBy, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    if (selectedAnalysisType) params.set('analysisType', selectedAnalysisType);

    const newUrl = `/dashboard/contracts${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [search, statusFilter, typeFilter, sortBy, sortOrder, pagination.page, selectedAnalysisType, router]);

  // Fetch contracts when dependencies change
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Clear analysis type selection
  const clearAnalysisType = () => {
    setSelectedAnalysisType('');
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedContracts.length === 0) {
      toast.error('Please select contracts to perform this action');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedContracts.length} contract(s)?`)) {
            await Promise.all(
              selectedContracts.map(id => 
                fetch(`/api/contracts/${id}`, { method: 'DELETE' })
              )
            );
            toast.success(`${selectedContracts.length} contract(s) deleted successfully`);
            setSelectedContracts([]);
            fetchContracts();
          }
          break;
        case 'export':
          // Implement export functionality
          try {
            const response = await fetch('/api/contracts/export', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contractIds: selectedContracts,
                format: 'csv',
              }),
            });

            if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `contracts-export-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              
              toast.success(`${selectedContracts.length} contract(s) exported successfully`);
              setSelectedContracts([]);
            } else {
              throw new Error('Export failed');
            }
          } catch (error) {
            toast.error('Failed to export contracts');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  // Handle individual contract actions
  const handleContractAction = async (contractId: string, action: string) => {
    try {
      switch (action) {
        case 'delete':
          if (confirm('Are you sure you want to delete this contract?')) {
            await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' });
            toast.success('Contract deleted successfully');
            fetchContracts();
          }
          break;
        case 'download':
          const response = await fetch(`/api/contracts/${contractId}/download`);
          if (response.ok) {
            const data = await response.json();
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started');
          }
          break;
        case 'analyze':
          // Start analysis with selected type
          const analysisType = selectedAnalysisType || 'comprehensive';
          const analysisResponse = await fetch('/api/analysis/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contractId,
              analysisType,
            }),
          });

          if (analysisResponse.ok) {
            toast.success(`${ANALYSIS_TYPES[analysisType as keyof typeof ANALYSIS_TYPES]?.label || 'Analysis'} started successfully`);
            // Navigate to analysis page or refresh
            router.push(`/dashboard/analysis`);
          } else {
            const errorData = await analysisResponse.json();
            throw new Error(errorData.error || 'Failed to start analysis');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to perform action');
    }
  };

  // Handle selection
  const handleSelectContract = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId) 
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContracts.length === contracts.length) {
      setSelectedContracts([]);
    } else {
      setSelectedContracts(contracts.map(c => c.id));
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Contracts</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchContracts}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your contract documents
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/upload')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Contract
          </button>
        </div>
      </div>

      {/* Analysis Type Selection Banner */}
      {selectedAnalysisType && (
        <div className={`${ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES]?.bgColor} border ${ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES]?.borderColor} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const Icon = ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES]?.icon || Brain;
                return <Icon className={`w-5 h-5 ${ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES]?.color}`} />;
              })()}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Analysis Type Selected: {ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES]?.label}
                </p>
                <p className="text-xs text-gray-600">
                  Click "Analyze" on any contract to start {ANALYSIS_TYPES[selectedAnalysisType as keyof typeof ANALYSIS_TYPES]?.label.toLowerCase()}
                </p>
              </div>
            </div>
            <button
              onClick={clearAnalysisType}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(statusFilter || typeFilter) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">
                {(statusFilter ? 1 : 0) + (typeFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ContractFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
          />
        )}
      </div>

      {/* Bulk Actions */}
      {selectedContracts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {selectedContracts.length} contract(s) selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction(e.target.value);
                    setBulkAction('');
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete Selected</option>
                <option value="export">Export Selected</option>
              </select>
              
              <button
                onClick={() => setSelectedContracts([])}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Data Retention Warning */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Data Retention Notice
              </p>
              <p className="text-sm text-blue-700">
                Your contracts and analysis data are retained according to your privacy settings. You can manage data retention preferences in your <a href="/dashboard/settings" className="underline">Privacy Settings</a>.
              </p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter || typeFilter 
                ? 'Try adjusting your search or filters'
                : 'Upload your first contract to get started'
              }
            </p>
            {!search && !statusFilter && !typeFilter && (
              <button
                onClick={() => router.push('/dashboard/upload')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Contract
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <ContractTable
                contracts={contracts}
                selectedContracts={selectedContracts}
                onSelectContract={handleSelectContract}
                onSelectAll={handleSelectAll}
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onAction={handleContractAction}
                selectedAnalysisType={selectedAnalysisType}
              />
            ) : (
              <ContractGrid
                contracts={contracts}
                selectedContracts={selectedContracts}
                onSelectContract={handleSelectContract}
                onAction={handleContractAction}
                selectedAnalysisType={selectedAnalysisType}
              />
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
} 