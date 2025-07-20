'use client';

import { useState } from 'react';
import { 
  Building, 
  Calendar, 
  Users, 
  FileText, 
  Brain, 
  Globe,
  Edit,
  Save,
  X
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
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

interface OrganizationInfoProps {
  organization: Organization;
  userMembership: UserMembership | null;
  onUpdate: () => void;
}

export default function OrganizationInfo({ 
  organization, 
  userMembership, 
  onUpdate 
}: OrganizationInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || '',
    logoUrl: organization.logoUrl || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = userMembership?.role === 'owner' || userMembership?.role === 'admin';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          logoUrl: formData.logoUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating organization:', error);
      alert('Failed to update organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: organization.name,
      description: organization.description || '',
      logoUrl: organization.logoUrl || '',
    });
    setIsEditing(false);
  };

  const owner = organization.members.find(member => member.role === 'owner');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Organization Information</h2>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        )}
        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {organization.logoUrl ? (
                    <img
                      src={organization.logoUrl}
                      alt={organization.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="Logo URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {organization.logoUrl ? 'Logo URL set' : 'No logo set'}
                    </p>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{organization.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your organization..."
                  />
                ) : (
                  <p className="text-gray-700">
                    {organization.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Slug
                </label>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-700 font-mono">{organization.slug}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics and Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {organization._count.contracts}
                    </p>
                    <p className="text-sm text-gray-600">Contracts</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {organization._count.analysisResults}
                    </p>
                    <p className="text-sm text-gray-600">Analyses</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {organization.members.length}
                    </p>
                    <p className="text-sm text-gray-600">Members</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(organization.createdAt).split(',')[0]}
                    </p>
                    <p className="text-sm text-gray-600">Created</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">{formatDate(organization.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">{formatDate(organization.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Owner</span>
                <span className="text-sm text-gray-900">{owner?.user.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Your Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {userMembership?.role || 'Member'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 