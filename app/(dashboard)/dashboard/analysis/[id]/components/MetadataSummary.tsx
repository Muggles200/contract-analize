'use client';

import { 
  FileText, 
  Calendar, 
  HardDrive, 
  Tag, 
  BarChart3,
  Clock,
  User,
  Building,
  Hash,
  Info
} from 'lucide-react';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  fileSize: number;
  fileType: string;
  createdAt: string;
  tags: string[];
}

interface Metadata {
  pageCount?: number;
  wordCount?: number;
  language?: string;
  documentType?: string;
  parties?: string[];
  effectiveDate?: string;
  expirationDate?: string;
  jurisdiction?: string;
  governingLaw?: string;
  contractValue?: string;
  currency?: string;
  [key: string]: any;
}

interface MetadataSummaryProps {
  metadata: Metadata;
  contract: Contract;
}

export default function MetadataSummary({ metadata, contract }: MetadataSummaryProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMetadataValue = (key: string) => {
    const value = metadata[key];
    if (value === undefined || value === null || value === '') {
      return 'Not specified';
    }
    return value;
  };

  const contractMetadata = [
    { label: 'File Name', value: contract.fileName, icon: FileText },
    { label: 'Contract Name', value: contract.contractName || 'Not specified', icon: FileText },
    { label: 'File Size', value: formatFileSize(Number(contract.fileSize)), icon: HardDrive },
    { label: 'File Type', value: contract.fileType.toUpperCase(), icon: FileText },
    { label: 'Upload Date', value: formatDate(contract.createdAt), icon: Calendar },
    { label: 'Tags', value: contract.tags.length > 0 ? contract.tags.join(', ') : 'No tags', icon: Tag }
  ];

  const analysisMetadata = [
    { label: 'Page Count', value: getMetadataValue('pageCount'), icon: FileText },
    { label: 'Word Count', value: getMetadataValue('wordCount'), icon: BarChart3 },
    { label: 'Language', value: getMetadataValue('language'), icon: Info },
    { label: 'Document Type', value: getMetadataValue('documentType'), icon: FileText },
    { label: 'Effective Date', value: getMetadataValue('effectiveDate'), icon: Calendar },
    { label: 'Expiration Date', value: getMetadataValue('expirationDate'), icon: Calendar },
    { label: 'Jurisdiction', value: getMetadataValue('jurisdiction'), icon: Building },
    { label: 'Governing Law', value: getMetadataValue('governingLaw'), icon: Building },
    { label: 'Contract Value', value: metadata.contractValue && metadata.currency ? 
      `${metadata.contractValue} ${metadata.currency}` : getMetadataValue('contractValue'), icon: BarChart3 }
  ];

  const parties = metadata.parties || [];
  const customFields = Object.entries(metadata).filter(([key, value]) => 
    !['pageCount', 'wordCount', 'language', 'documentType', 'parties', 'effectiveDate', 
      'expirationDate', 'jurisdiction', 'governingLaw', 'contractValue', 'currency'].includes(key) &&
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Metadata Summary</h2>
        <div className="p-2 bg-gray-50 rounded-lg">
          <Info className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Metadata */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Contract Information</span>
          </h3>
          <div className="space-y-3">
            {contractMetadata.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 max-w-xs truncate" title={item.value}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Metadata */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analysis Results</span>
          </h3>
          <div className="space-y-3">
            {analysisMetadata.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 max-w-xs truncate" title={item.value}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parties Section */}
      {parties.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Contract Parties</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parties.map((party, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">{party}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Fields */}
      {customFields.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <Hash className="w-4 h-4" />
            <span>Additional Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFields.map(([key, value], index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="text-sm font-medium text-gray-900 max-w-xs truncate" title={String(value)}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Document Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-blue-700">Pages:</span>
            <span className="ml-1 font-medium text-blue-900">{metadata.pageCount || 'N/A'}</span>
          </div>
          <div>
            <span className="text-blue-700">Words:</span>
            <span className="ml-1 font-medium text-blue-900">{metadata.wordCount || 'N/A'}</span>
          </div>
          <div>
            <span className="text-blue-700">Language:</span>
            <span className="ml-1 font-medium text-blue-900">{metadata.language || 'N/A'}</span>
          </div>
          <div>
            <span className="text-blue-700">Type:</span>
            <span className="ml-1 font-medium text-blue-900">{metadata.documentType || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 