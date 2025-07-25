'use client';

import { useState } from 'react';
import { 
  FileText, 
  Brain, 
  AlertTriangle, 
  Eye, 
  Zap, 
  CheckCircle,
  Loader2,
  Upload,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Contract {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  metadata: any;
  analysisResults: Array<{
    id: string;
    status: string;
    analysisType: string;
    createdAt: Date;
  }>;
}

interface BatchAnalysisFormProps {
  contracts: Contract[];
}

const ANALYSIS_TYPES = [
  {
    id: 'comprehensive',
    name: 'Comprehensive Analysis',
    description: 'Full contract analysis with risks, clauses, and recommendations',
    icon: Brain,
    color: 'bg-purple-50 text-purple-600',
    estimatedTime: '5-10 minutes per contract',
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Quick risk identification and severity analysis',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    estimatedTime: '3-5 minutes per contract',
  },
  {
    id: 'clause-extraction',
    name: 'Clause Extraction',
    description: 'Extract and categorize important contract clauses',
    icon: Eye,
    color: 'bg-green-50 text-green-600',
    estimatedTime: '2-4 minutes per contract',
  },
  {
    id: 'basic',
    name: 'Basic Analysis',
    description: 'Quick overview and summary of contract content',
    icon: Zap,
    color: 'bg-orange-50 text-orange-600',
    estimatedTime: '1-2 minutes per contract',
  },
];

export default function BatchAnalysisForm({ contracts }: BatchAnalysisFormProps) {
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('comprehensive');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter contracts based on search and status
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'analyzed' && contract.analysisResults.length > 0) ||
      (filterStatus === 'not-analyzed' && contract.analysisResults.length === 0);
    
    return matchesSearch && matchesStatus;
  });

  const handleContractToggle = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId) 
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContracts.length === filteredContracts.length) {
      setSelectedContracts([]);
    } else {
      setSelectedContracts(filteredContracts.map(c => c.id));
    }
  };

  const handleStartBatchAnalysis = async () => {
    if (selectedContracts.length === 0) {
      toast.error('Please select at least one contract for analysis');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/analysis/batch/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractIds: selectedContracts,
          analysisType: selectedAnalysisType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Batch analysis started for ${selectedContracts.length} contract(s)`);
        setSelectedContracts([]);
      } else {
        throw new Error('Failed to start batch analysis');
      }
    } catch (error) {
      toast.error('Failed to start batch analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  const getAnalysisTypeInfo = () => {
    return ANALYSIS_TYPES.find(type => type.id === selectedAnalysisType) || ANALYSIS_TYPES[0];
  };

  const estimatedTotalTime = () => {
    const timePerContract = getAnalysisTypeInfo().estimatedTime;
    const timeInMinutes = parseInt(timePerContract.split(' ')[0]);
    const totalMinutes = timeInMinutes * selectedContracts.length;
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Batch Analysis Configuration</h2>
        <p className="text-sm text-gray-600">
          Select contracts and analysis type to start batch processing.
        </p>
      </div>

      {/* Analysis Type Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Analysis Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ANALYSIS_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAnalysisType(type.id)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedAnalysisType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{type.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{type.estimatedTime}</p>
                </div>
                {selectedAnalysisType === type.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contract Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Select Contracts</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedContracts.length === filteredContracts.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-500">
              {selectedContracts.length} of {filteredContracts.length} selected
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Contracts</option>
            <option value="analyzed">Already Analyzed</option>
            <option value="not-analyzed">Not Analyzed</option>
          </select>
        </div>

        {/* Contract List */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredContracts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No contracts found matching your criteria.
            </div>
          ) : (
            filteredContracts.map((contract) => {
              const hasAnalysis = contract.analysisResults.length > 0;
              const lastAnalysis = contract.analysisResults[0];
              
              return (
                <div
                  key={contract.id}
                  className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    selectedContracts.includes(contract.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedContracts.includes(contract.id)}
                      onChange={() => handleContractToggle(contract.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contract.fileName}
                        </p>
                        {hasAnalysis && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Analyzed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{(contract.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                        {hasAnalysis && lastAnalysis && (
                          <span>{lastAnalysis.analysisType.replace('-', ' ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary and Start Button */}
      {selectedContracts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Batch Analysis Summary
              </p>
              <p className="text-sm text-gray-600">
                {selectedContracts.length} contract(s) • {getAnalysisTypeInfo().name} • 
                Estimated time: {estimatedTotalTime()}
              </p>
            </div>
            <button
              onClick={handleStartBatchAnalysis}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Batch Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 