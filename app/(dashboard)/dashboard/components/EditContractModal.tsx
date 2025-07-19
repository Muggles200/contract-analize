'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  Building,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

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
}

interface EditContractModalProps {
  contract: Contract;
  onClose: () => void;
  onSave: (updatedData: Partial<Contract>) => void;
}

export default function EditContractModal({ contract, onClose, onSave }: EditContractModalProps) {
  const [formData, setFormData] = useState({
    contractName: contract.contractName || '',
    contractType: contract.contractType || '',
    tags: contract.tags || [],
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contractTypes = [
    'vendor',
    'client',
    'employment',
    'partnership',
    'service',
    'license',
    'nda',
    'msa',
    'sow',
    'other'
  ];

  const suggestedTags = [
    'important', 'urgent', 'review', 'approved', 'pending',
    'vendor', 'client', 'partnership', 'employment', 'service',
    'confidential', 'public', 'draft', 'final', 'archived'
  ];

  useEffect(() => {
    // Reset form when contract changes
    setFormData({
      contractName: contract.contractName || '',
      contractType: contract.contractType || '',
      tags: contract.tags || [],
    });
    setErrors({});
  }, [contract]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contractName.trim()) {
      newErrors.contractName = 'Contract name is required';
    }

    if (formData.contractName.length > 100) {
      newErrors.contractName = 'Contract name must be less than 100 characters';
    }

    if (formData.contractType && formData.contractType.length > 50) {
      newErrors.contractType = 'Contract type must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        contractName: formData.contractName.trim() || null,
        contractType: formData.contractType.trim() || null,
        tags: formData.tags,
      });
      onClose();
    } catch (error) {
      toast.error('Failed to update contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      toast.error('Please enter a tag');
      return;
    }

    if (formData.tags.includes(trimmedTag)) {
      toast.error('Tag already exists');
      return;
    }

    setFormData({
      ...formData,
      tags: [...formData.tags, trimmedTag]
    });
    setNewTag('');
    toast.success('Tag added successfully');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
    toast.success('Tag removed successfully');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const filteredSuggestedTags = suggestedTags.filter(
    tag => !formData.tags.includes(tag)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Edit Contract
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contract Name */}
          <div>
            <label htmlFor="contractName" className="block text-sm font-medium text-gray-700 mb-2">
              Contract Name *
            </label>
            <input
              type="text"
              id="contractName"
              value={formData.contractName}
              onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contractName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter contract name"
              maxLength={100}
            />
            {errors.contractName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.contractName}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.contractName.length}/100 characters
            </p>
          </div>

          {/* Contract Type */}
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-2">
              Contract Type
            </label>
            <select
              id="contractType"
              value={formData.contractType}
              onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contractType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select contract type</option>
              {contractTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.contractType && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.contractType}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              Tags
            </label>
            
            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Current Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter tag name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Suggested Tags */}
            {filteredSuggestedTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Suggested Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestedTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, tag]
                        });
                        toast.success(`Added tag: ${tag}`);
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* File Information (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">File Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">File Name</p>
                <p className="text-gray-900 font-medium">{contract.fileName}</p>
              </div>
              <div>
                <p className="text-gray-500">File Size</p>
                <p className="text-gray-900 font-medium">
                  {(Number(contract.fileSize) / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div>
                <p className="text-gray-500">File Type</p>
                <p className="text-gray-900 font-medium">{contract.fileType}</p>
              </div>
              <div>
                <p className="text-gray-500">Upload Date</p>
                <p className="text-gray-900 font-medium">
                  {new Date(contract.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 