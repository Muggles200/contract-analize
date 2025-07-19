'use client';

import { useState } from 'react';
import { 
  Download, 
  Eye, 
  FileText, 
  Image, 
  Video, 
  Music,
  Archive,
  File,
  ExternalLink,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  fileSize: number;
  fileType: string;
  blobUrl: string;
  status: string;
}

interface FilePreviewProps {
  contract: Contract;
}

export default function FilePreview({ contract }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <Archive className="w-8 h-8" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const canPreview = () => {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/html'
    ];
    return previewableTypes.includes(contract.fileType);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/contracts/${contract.id}/download`);
      if (response.ok) {
        const data = await response.json();
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(contract.blobUrl, '_blank');
  };

  const renderPreview = () => {
    if (contract.fileType.startsWith('image/')) {
      return (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={contract.blobUrl}
            alt={contract.fileName}
            className="w-full h-auto max-h-96 object-contain"
            style={{ transform: `scale(${zoom})` }}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
              className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
              className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    if (contract.fileType === 'application/pdf') {
      return (
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={`${contract.blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-96"
            title={contract.fileName}
          />
        </div>
      );
    }

    if (contract.fileType.startsWith('text/')) {
      return (
        <div className="bg-gray-100 rounded-lg p-4">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-auto">
            {/* For text files, you might want to fetch and display the content */}
            <p className="text-gray-500">Text file preview not available</p>
          </pre>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          {getFileIcon(contract.fileType)}
        </div>
        <p className="text-gray-600">Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">File Preview</h3>
        <div className="flex items-center space-x-2">
          {canPreview() && (
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewOpen ? 'Hide' : 'Preview'}
            </button>
          )}
          <button
            onClick={handleOpenInNewTab}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4">
        <div className="text-gray-400">
          {getFileIcon(contract.fileType)}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{contract.fileName}</h4>
          <p className="text-sm text-gray-500">
            {formatFileSize(contract.fileSize)} • {contract.fileType}
          </p>
        </div>
      </div>

      {/* Preview */}
      {isPreviewOpen && canPreview() && (
        <div className="mt-4">
          {renderPreview()}
        </div>
      )}

      {/* Preview Placeholder */}
      {!isPreviewOpen && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            {getFileIcon(contract.fileType)}
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">{contract.fileName}</h4>
          <p className="text-sm text-gray-500 mb-4">
            {formatFileSize(contract.fileSize)} • {contract.fileType}
          </p>
          {canPreview() ? (
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview File
            </button>
          ) : (
            <p className="text-sm text-gray-500">Preview not available for this file type</p>
          )}
        </div>
      )}
    </div>
  );
} 