'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface ContractMetadata {
  contractName: string;
  contractType: string;
  tags: string[];
}

interface ContractMetadataFormProps {
  metadata: ContractMetadata;
  onMetadataChange: (metadata: ContractMetadata) => void;
  className?: string;
}

const CONTRACT_TYPES = [
  'employment',
  'vendor',
  'client',
  'partnership',
  'nda',
  'lease',
  'purchase',
  'service',
  'license',
  'other'
];

export default function ContractMetadataForm({
  metadata,
  onMetadataChange,
  className = ''
}: ContractMetadataFormProps) {
  const [newTag, setNewTag] = useState('');

  const updateMetadata = useCallback((updates: Partial<ContractMetadata>) => {
    onMetadataChange({ ...metadata, ...updates });
  }, [metadata, onMetadataChange]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      updateMetadata({
        tags: [...metadata.tags, newTag.trim()]
      });
      setNewTag('');
    }
  }, [newTag, metadata.tags, updateMetadata]);

  const removeTag = useCallback((tagToRemove: string) => {
    updateMetadata({
      tags: metadata.tags.filter(tag => tag !== tagToRemove)
    });
  }, [metadata.tags, updateMetadata]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contractName" className="block text-sm font-medium text-gray-700 mb-2">
            Contract Name
          </label>
          <input
            type="text"
            id="contractName"
            value={metadata.contractName}
            onChange={(e) => updateMetadata({ contractName: e.target.value })}
            placeholder="Enter contract name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-2">
            Contract Type
          </label>
          <select
            id="contractType"
            value={metadata.contractType}
            onChange={(e) => updateMetadata({ contractType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select contract type</option>
            {CONTRACT_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {metadata.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
} 