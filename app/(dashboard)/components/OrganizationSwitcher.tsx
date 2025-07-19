'use client';

import { useState, useEffect } from 'react';
import { Building, ChevronDown, Plus, Users, Settings } from 'lucide-react';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
}

interface OrganizationSwitcherProps {
  currentOrgId?: string;
  userId: string;
}

export default function OrganizationSwitcher({ currentOrgId, userId }: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchOrganizations = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockOrgs: Organization[] = [
          {
            id: 'org-1',
            name: 'Acme Corporation',
            slug: 'acme-corp',
            description: 'Main organization'
          },
          {
            id: 'org-2',
            name: 'Startup Ventures',
            slug: 'startup-ventures',
            description: 'Side project'
          }
        ];

        setOrganizations(mockOrgs);
        
        // Set current organization
        if (currentOrgId) {
          const org = mockOrgs.find(o => o.id === currentOrgId);
          setCurrentOrg(org || mockOrgs[0]);
        } else {
          setCurrentOrg(mockOrgs[0]);
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [currentOrgId]);

  const handleOrgSwitch = (org: Organization) => {
    setCurrentOrg(org);
    setIsOpen(false);
    // In a real app, this would update the session/context
    // and potentially redirect to the org-specific dashboard
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-gray-600">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="px-3 py-2">
        <Link
          href="/dashboard/organizations"
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Organization</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors w-full"
      >
        {currentOrg?.logoUrl ? (
          <img
            src={currentOrg.logoUrl}
            alt={currentOrg.name}
            className="w-5 h-5 rounded"
          />
        ) : (
          <Building className="w-5 h-5 text-gray-600" />
        )}
        <span className="font-medium truncate">{currentOrg?.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Switch Organization</h3>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgSwitch(org)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  currentOrg?.id === org.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {org.logoUrl ? (
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    className="w-6 h-6 rounded"
                  />
                ) : (
                  <Building className="w-6 h-6 text-gray-600" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  {org.description && (
                    <p className="text-xs text-gray-500 truncate">{org.description}</p>
                  )}
                </div>
                {currentOrg?.id === org.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 space-y-2">
            <Link
              href="/dashboard/organizations"
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Manage Organizations</span>
            </Link>
            <Link
              href="/dashboard/organizations/settings"
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Organization Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 