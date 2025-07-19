'use client';

import { useState } from 'react';
import { 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Plus,
  Trash2,
  Calendar,
  User,
  Building,
  DollarSign,
  MapPin,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ContractMetadataProps {
  metadata: any;
  onMetadataChange: (metadata: any) => void;
}

export default function ContractMetadata({ metadata, onMetadataChange }: ContractMetadataProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<any>(metadata || {});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const commonFields = [
    { key: 'parties', label: 'Parties', icon: User, type: 'array' },
    { key: 'effectiveDate', label: 'Effective Date', icon: Calendar, type: 'date' },
    { key: 'expirationDate', label: 'Expiration Date', icon: Calendar, type: 'date' },
    { key: 'contractValue', label: 'Contract Value', icon: DollarSign, type: 'currency' },
    { key: 'currency', label: 'Currency', icon: DollarSign, type: 'text' },
    { key: 'location', label: 'Location', icon: MapPin, type: 'text' },
    { key: 'contractNumber', label: 'Contract Number', icon: FileText, type: 'text' },
    { key: 'department', label: 'Department', icon: Building, type: 'text' },
    { key: 'manager', label: 'Contract Manager', icon: User, type: 'text' },
    { key: 'vendor', label: 'Vendor', icon: Building, type: 'text' },
  ];

  const handleSave = () => {
    try {
      onMetadataChange(editedMetadata);
      setIsEditing(false);
      toast.success('Metadata updated successfully');
    } catch (error) {
      toast.error('Failed to update metadata');
    }
  };

  const handleCancel = () => {
    setEditedMetadata(metadata || {});
    setIsEditing(false);
    setNewKey('');
    setNewValue('');
  };

  const handleAddField = () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error('Please enter both key and value');
      return;
    }

    if (editedMetadata[newKey]) {
      toast.error('Field already exists');
      return;
    }

    setEditedMetadata({
      ...editedMetadata,
      [newKey]: newValue
    });
    setNewKey('');
    setNewValue('');
    toast.success('Field added successfully');
  };

  const handleRemoveField = (key: string) => {
    const newMetadata = { ...editedMetadata };
    delete newMetadata[key];
    setEditedMetadata(newMetadata);
    toast.success('Field removed successfully');
  };

  const handleUpdateField = (key: string, value: any) => {
    setEditedMetadata({
      ...editedMetadata,
      [key]: value
    });
  };

  const formatValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return '-';
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (type === 'currency' && value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(value));
    }

    return String(value);
  };

  const renderField = (key: string, value: any, type?: string) => {
    const field = commonFields.find(f => f.key === key);
    const Icon = field?.icon || FileText;

    if (isEditing) {
      return (
        <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
          <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field?.label || key}
            </label>
            {type === 'array' ? (
              <input
                type="text"
                value={Array.isArray(value) ? value.join(', ') : value || ''}
                onChange={(e) => handleUpdateField(key, e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter values separated by commas"
              />
            ) : type === 'date' ? (
              <input
                type="date"
                value={value || ''}
                onChange={(e) => handleUpdateField(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : type === 'currency' ? (
              <input
                type="number"
                step="0.01"
                value={value || ''}
                onChange={(e) => handleUpdateField(key, parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            ) : (
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleUpdateField(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter ${field?.label?.toLowerCase() || key}`}
              />
            )}
          </div>
          <button
            onClick={() => handleRemoveField(key)}
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
        <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">
            {field?.label || key}
          </p>
          <p className="text-sm text-gray-900">
            {formatValue(value, type)}
          </p>
        </div>
      </div>
    );
  };

  const allFields = { ...metadata, ...editedMetadata };
  const existingKeys = Object.keys(allFields);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Contract Metadata
        </h3>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="space-y-4">
        {existingKeys.length > 0 ? (
          existingKeys.map(key => {
            const field = commonFields.find(f => f.key === key);
            return renderField(key, allFields[key], field?.type);
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No metadata available</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Metadata
              </button>
            )}
          </div>
        )}

        {/* Add New Field */}
        {isEditing && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Field</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Field name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Field value"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddField}
              className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Common Fields */}
      {isEditing && existingKeys.length === 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Add Common Fields</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonFields.map(field => (
              <button
                key={field.key}
                onClick={() => {
                  setEditedMetadata({
                    ...editedMetadata,
                    [field.key]: field.type === 'array' ? [] : field.type === 'currency' ? 0 : ''
                  });
                }}
                disabled={editedMetadata[field.key]}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <field.icon className="w-4 h-4 mr-2" />
                {field.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 