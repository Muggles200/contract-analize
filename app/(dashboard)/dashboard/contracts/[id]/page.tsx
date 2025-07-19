'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  Share2, 
  Eye, 
  FileText, 
  Calendar, 
  HardDrive, 
  Tag, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MoreHorizontal,
  Copy,
  ExternalLink,
  Brain,
  BarChart3,
  History,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import ContractInfo from '../../components/ContractInfo';
import FilePreview from '../../components/FilePreview';
import AnalysisResults from '../../components/AnalysisResults';
import ContractMetadata from '../../components/ContractMetadataForm';
import TagsManager from '../../components/TagsManager';
import EditContractModal from '../../components/EditContractModal';
import ShareContractModal from '../../components/ShareContractModal';
import AnalysisHistory from '../../components/AnalysisHistory';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  contractType?: string | null;
  fileSize: number;
  fileType: string;
  blobUrl: string;
  status: string;
  tags: string[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
  analysisResults: Array<{
    id: string;
    status: string;
    analysisType: string;
    createdAt: string;
    processingTime?: number;
    confidenceScore?: number;
    summary?: string;
    risks?: any[];
    clauses?: any[];
    recommendations?: any[];
  }>;
}

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch contract data
  const fetchContract = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/contracts/${contractId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Contract not found');
        }
        throw new Error('Failed to fetch contract');
      }

      const data = await response.json();
      setContract(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  // Handle contract actions
  const handleAction = async (action: string) => {
    if (!contract) return;

    try {
      switch (action) {
        case 'download':
          const response = await fetch(`/api/contracts/${contractId}/download`);
          if (response.ok) {
            const data = await response.json();
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started');
          }
          break;

        case 'delete':
          if (confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
            const deleteResponse = await fetch(`/api/contracts/${contractId}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              toast.success('Contract deleted successfully');
              router.push('/dashboard/contracts');
            } else {
              throw new Error('Failed to delete contract');
            }
          }
          break;

        case 'edit':
          setShowEditModal(true);
          break;

        case 'share':
          setShowShareModal(true);
          break;

        case 'copy-link':
          const contractUrl = `${window.location.origin}/dashboard/contracts/${contractId}`;
          await navigator.clipboard.writeText(contractUrl);
          toast.success('Contract link copied to clipboard');
          break;

        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to perform action');
    }
  };

  // Handle contract update
  const handleContractUpdate = async (updatedData: Partial<Contract>) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedContract = await response.json();
        setContract(updatedContract);
        setShowEditModal(false);
        toast.success('Contract updated successfully');
      } else {
        throw new Error('Failed to update contract');
      }
    } catch (error) {
      toast.error('Failed to update contract');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Contract</h2>
          <p className="text-red-600 mb-4">{error || 'Contract not found'}</p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/contracts')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Contracts
            </button>
            <button
              onClick={fetchContract}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'analysis', label: 'Analysis', icon: Brain },
    { id: 'metadata', label: 'Metadata', icon: Settings },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/contracts')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contract.contractName || contract.fileName}
            </h1>
            <p className="text-gray-600">
              {contract.contractType ? contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1) : 'Contract'} • Uploaded {new Date(contract.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAction('download')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={() => handleAction('edit')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => handleAction('share')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button
            onClick={() => handleAction('delete')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Preview */}
              <FilePreview contract={contract} />
              
              {/* Contract Information */}
              <ContractInfo contract={contract} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction('copy-link')}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>Copy Link</span>
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/analysis/${contract.analysisResults[0]?.id || 'new'}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>View Analysis</span>
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(contract.blobUrl, '_blank')}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>Open File</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <TagsManager
                tags={contract.tags}
                onTagsChange={(tags) => handleContractUpdate({ tags })}
                isEditing={isEditing}
                onEditToggle={() => setIsEditing(!isEditing)}
              />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <AnalysisResults 
            analysisResults={contract.analysisResults}
            contractId={contract.id}
            onRefresh={fetchContract}
          />
        )}

        {activeTab === 'metadata' && (
          <ContractMetadata
            metadata={contract.metadata}
            onMetadataChange={(metadata) => handleContractUpdate({ metadata })}
          />
        )}

        {activeTab === 'history' && (
          <AnalysisHistory 
            analysisResults={contract.analysisResults}
            contractId={contract.id}
          />
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditContractModal
          contract={contract}
          onClose={() => setShowEditModal(false)}
          onSave={handleContractUpdate}
        />
      )}

      {showShareModal && (
        <ShareContractModal
          contract={contract}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
} 