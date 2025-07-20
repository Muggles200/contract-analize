'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building, 
  Users, 
  FileText, 
  Brain, 
  MoreVertical, 
  Settings, 
  UserPlus, 
  Calendar,
  ExternalLink
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: string;
  members: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    role: string;
  }>;
  _count: {
    contracts: number;
    analysisResults: number;
  };
}

interface OrganizationCardProps {
  organization: Organization;
  onUpdate: () => void;
}

export default function OrganizationCard({ organization, onUpdate }: OrganizationCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const owner = organization.members.find(member => member.role === 'owner');
  const memberCount = organization.members.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {organization.name}
              </h3>
              {organization.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {organization.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <Link
                    href={`/dashboard/organizations/${organization.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    href={`/dashboard/organizations/${organization.id}/settings`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <Link
                    href={`/dashboard/organizations/${organization.id}/members`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Manage Members
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Contracts</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization._count.contracts}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Analyses</p>
              <p className="text-lg font-semibold text-gray-900">
                {organization._count.analysisResults}
              </p>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Member Avatars */}
          <div className="flex items-center space-x-2">
            {organization.members.slice(0, 3).map((member) => (
              <div key={member.id} className="relative">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 px-1 py-0.5 text-xs rounded-full ${getRoleColor(member.role)}`}
                >
                  {member.role}
                </span>
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{memberCount - 3}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Created {formatDate(organization.createdAt)}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Owner: {owner?.user.name || 'Unknown'}
          </div>
          <Link
            href={`/dashboard/organizations/${organization.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
} 