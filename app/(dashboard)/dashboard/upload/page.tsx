'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ContractMetadataForm from '../components/ContractMetadataForm';
import Link from 'next/link';

interface SelectedFile {
  file: File;
  id: string;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface ContractMetadata {
  contractName: string;
  contractType: string;
  tags: string[];
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState<ContractMetadata>({
    contractName: '',
    contractType: '',
    tags: []
  });

  const handleFileSelect = useCallback((files: File[]) => {
    files.forEach(file => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: SelectedFile = {
        file,
        id: fileId
      };

      setSelectedFiles(prev => [...prev, newFile]);
    });
  }, []);

  const removeSelectedFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    if (!metadata.contractName.trim()) {
      toast.error('Please enter a contract name');
      return;
    }

    setIsUploading(true);

    // Convert selected files to uploaded files with initial status
    const initialUploadedFiles: UploadedFile[] = selectedFiles.map(selectedFile => ({
      file: selectedFile.file,
      id: selectedFile.id,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(initialUploadedFiles);

    // Upload each file
    const uploadPromises = selectedFiles.map(selectedFile => 
      uploadFile(selectedFile, metadata)
    );

    try {
      await Promise.all(uploadPromises);
      toast.success('All files uploaded successfully!');
      
      // Redirect to contracts page after successful upload
      setTimeout(() => {
        router.push('/dashboard/contracts');
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Some files failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    setUploadedFiles([]);
    setMetadata({
      contractName: '',
      contractType: '',
      tags: []
    });
    toast.info('Upload cancelled');
  };

  const uploadFile = async (selectedFile: SelectedFile, metadata: ContractMetadata) => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile.file);
      formData.append('contractName', metadata.contractName || selectedFile.file.name);
      formData.append('contractType', metadata.contractType);
      formData.append('tags', JSON.stringify(metadata.tags));

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === selectedFile.id 
                ? { ...f, progress, status: progress === 100 ? 'processing' : 'uploading' }
                : f
            )
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === selectedFile.id 
                ? { ...f, status: 'complete' }
                : f
            )
          );
        } else {
          const error = JSON.parse(xhr.responseText);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === selectedFile.id 
                ? { ...f, status: 'error', error: error.error || 'Upload failed' }
                : f
            )
          );
          throw new Error(error.error || 'Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === selectedFile.id 
              ? { ...f, status: 'error', error: 'Network error' }
              : f
          )
        );
        throw new Error('Network error during upload');
      });

      xhr.open('POST', '/api/contracts/upload');
      xhr.send(formData);

      // Return a promise that resolves when the upload is complete
      return new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 201) {
            resolve(xhr.responseText);
          } else {
            reject(new Error('Upload failed'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error')));
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === selectedFile.id 
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
      throw error;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Contract</h1>
        <p className="text-gray-600 mt-2">Upload your contract documents for AI analysis</p>
      </div>

      {/* Contract Metadata Form */}
      <ContractMetadataForm
        metadata={metadata}
        onMetadataChange={setMetadata}
      />

      {/* File Selection */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Select Files</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose the contract files you want to upload
          </p>
        </div>

        <div className="p-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={removeSelectedFile}
            uploadedFiles={[]} // Don't show upload progress here
            multiple={true}
          />
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Selected Files</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedFiles.length} file(s) ready to upload
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {selectedFiles.map((selectedFile) => (
              <div key={selectedFile.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 flex items-center justify-center text-lg">
                    {getFileIcon(selectedFile.file.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(selectedFile.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upload Progress</h2>
          </div>
          
          <div className="p-6 space-y-4">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 flex items-center justify-center text-lg">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadedFile.status === 'uploading' && (
                      <>
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    )}
                    {uploadedFile.status === 'processing' && (
                      <>
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </>
                    )}
                    {uploadedFile.status === 'complete' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Complete</span>
                      </>
                    )}
                    {uploadedFile.status === 'error' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">{uploadedFile.error}</span>
                      </>
                    )}
                  </div>
                  
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadedFile.progress}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <div className="bg-red-50 p-4 rounded-lg mb-4 w-full">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">
                ⚠️ IMPORTANT: AI Analysis Disclaimer
              </p>
              <p className="text-red-700 text-sm mt-1">
                By uploading, you consent to AI processing of your contract. 
                <strong>The analysis results are for informational purposes only and do NOT constitute legal advice.</strong> 
                Always consult with a qualified attorney for legal matters. See our <Link href="/privacy" className="underline">Privacy Policy</Link> for details.
              </p>
              <label className="flex items-center mt-3">
                <input type="checkbox" className="mr-2" required />
                <span className="text-sm text-red-700">I understand this is not legal advice and will consult an attorney for legal matters</span>
              </label>
            </div>
          </div>
        </div>
        <button
          onClick={handleCancel}
          disabled={isUploading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isUploading || selectedFiles.length === 0 || !metadata.contractName.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Contracts</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 