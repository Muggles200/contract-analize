'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building, 
  Users, 
  Settings, 
  CreditCard, 
  Activity,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import OrganizationInfo from './components/OrganizationInfo';
import MemberManagement from './components/MemberManagement';
import OrganizationSettings from './components/OrganizationSettings';
import BillingInfo from './components/BillingInfo';
import ActivityLog from './components/ActivityLog';
import DeleteOrganizationModal from './components/DeleteOrganizationModal';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  settings: any;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    role: string;
    joinedAt: string;
  }>;
  _count: {
    contracts: number;
    analysisResults: number;
  };
}

interface UserMembership {
  role: string;
  permissions: string[];
}

const tabs = [
  { id: 'info', name: 'Organization Info', icon: Building },
  { id: 'members', name: 'Member Management', icon: Users },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'billing', name: 'Billing Info', icon: CreditCard },
  { id: 'activity', name: 'Activity Log', icon: Activity },
];

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/organizations/${organizationId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Organization not found');
        } else if (response.status === 403) {
          setError('You do not have access to this organization');
        } else {
          setError('Failed to load organization');
        }
        return;
      }
      
      const data = await response.json();
      setOrganization(data);
      
      // Find current user's membership
      const currentUserMembership = data.members.find(
        (member: any) => member.user.id === 'current-user-id' // This should be replaced with actual user ID
      );
      setUserMembership(currentUserMembership || { role: 'member', permissions: [] });
    } catch (error) {
      console.error('Error fetching organization:', error);
      setError('Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }

      setShowDeleteModal(false);
      router.push('/dashboard/organizations');
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization');
    }
  };

  const canEdit = userMembership?.role === 'owner' || userMembership?.role === 'admin';
  const canDelete = userMembership?.role === 'owner';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="flex space-x-8 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Link
                href="/dashboard/organizations"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/organizations"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                {organization.logoUrl ? (
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="w-8 h-8 rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                  {organization.description && (
                    <p className="text-sm text-gray-600">{organization.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {canEdit && (
                <Link
                  href={`/dashboard/organizations/${organizationId}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'info' && (
            <OrganizationInfo 
              organization={organization} 
              userMembership={userMembership}
              onUpdate={fetchOrganization}
            />
          )}
          {activeTab === 'members' && (
            <MemberManagement 
              organizationId={organizationId}
              members={organization.members}
              userMembership={userMembership}
              onUpdate={fetchOrganization}
            />
          )}
          {activeTab === 'settings' && (
            <OrganizationSettings 
              organization={organization}
              userMembership={userMembership}
              onUpdate={fetchOrganization}
            />
          )}
          {activeTab === 'billing' && (
            <BillingInfo 
              organizationId={organizationId}
              userMembership={userMembership}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityLog 
              organizationId={organizationId}
              userMembership={userMembership}
            />
          )}
        </div>
      </div>

      {/* Delete Organization Modal */}
      {showDeleteModal && (
        <DeleteOrganizationModal
          organization={organization}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteOrganization}
        />
      )}
    </div>
  );
} 