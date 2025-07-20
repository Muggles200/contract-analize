'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Building2, Filter } from 'lucide-react';

interface AnalyticsFiltersProps {
  period: string;
  organizationId?: string;
}

export default function AnalyticsFilters({ period, organizationId }: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const updateFilters = (newPeriod?: string, newOrganizationId?: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (newPeriod) {
      params.set('period', newPeriod);
    }
    
    if (newOrganizationId !== undefined) {
      if (newOrganizationId) {
        params.set('organizationId', newOrganizationId);
      } else {
        params.delete('organizationId');
      }
    }

    router.push(`/dashboard/analytics?${params.toString()}`);
  };

  const periods = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => updateFilters(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Organization Filter */}
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <select
            value={organizationId || ''}
            onChange={(e) => updateFilters(undefined, e.target.value || undefined)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(period !== 'month' || organizationId) && (
          <button
            onClick={() => updateFilters('month', undefined)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
} 