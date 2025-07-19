'use client';

import { X } from 'lucide-react';

interface ContractFiltersProps {
  statusFilter: string;
  typeFilter: string;
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'complete', label: 'Complete' },
  { value: 'error', label: 'Error' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'employment', label: 'Employment' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'client', label: 'Client' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'nda', label: 'NDA' },
  { value: 'lease', label: 'Lease' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'service', label: 'Service' },
  { value: 'license', label: 'License' },
  { value: 'other', label: 'Other' },
];

export default function ContractFilters({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange
}: ContractFiltersProps) {
  const clearFilters = () => {
    onStatusChange('');
    onTypeChange('');
  };

  const hasActiveFilters = statusFilter || typeFilter;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Contract Type
            </label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Status: {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label}
              <button
                onClick={() => onStatusChange('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {typeFilter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Type: {TYPE_OPTIONS.find(opt => opt.value === typeFilter)?.label}
              <button
                onClick={() => onTypeChange('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 