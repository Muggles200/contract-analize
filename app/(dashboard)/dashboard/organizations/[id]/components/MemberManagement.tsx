'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Crown, 
  Shield, 
  User,
  Mail,
  Calendar,
  Trash2,
  Edit
} from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';

interface Member {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  role: string;
  joinedAt: string;
}

interface UserMembership {
  role: string;
  permissions: string[];
}

interface MemberManagementProps {
  organizationId: string;
  members: Member[];
  userMembership: UserMembership | null;
  onUpdate: () => void;
}

export default function MemberManagement({ 
  organizationId, 
  members, 
  userMembership, 
  onUpdate 
}: MemberManagementProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);

  const canInvite = userMembership?.role === 'owner' || userMembership?.role === 'admin';
  const canManageMembers = userMembership?.role === 'owner' || userMembership?.role === 'admin';
  const isOwner = userMembership?.role === 'owner';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'member':
        return <User className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      onUpdate();
      setShowMemberMenu(null);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      onUpdate();
      setShowMemberMenu(null);
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Failed to update member role');
    }
  };

  const roleOptions = [
    { value: 'member', label: 'Member', description: 'Can view and contribute' },
    { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
    ...(isOwner ? [{ value: 'owner', label: 'Owner', description: 'Full control' }] : []),
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Member Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} in this organization
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                {canManageMembers && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.user.image ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={member.user.image}
                            alt={member.user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(member.joinedAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{member.user.email}</span>
                    </div>
                  </td>
                  {canManageMembers && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowMemberMenu(showMemberMenu === member.id ? null : member.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {showMemberMenu === member.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              {/* Role Change Options */}
                              {member.role !== 'owner' && (
                                <div className="px-3 py-2 border-b border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    Change Role
                                  </p>
                                  {roleOptions
                                    .filter(option => option.value !== member.role)
                                    .map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => handleRoleChange(member.id, option.value)}
                                        className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                      >
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-gray-500">{option.description}</div>
                                      </button>
                                    ))}
                                </div>
                              )}
                              
                              {/* Remove Member */}
                              {member.role !== 'owner' && (
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="block w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Trash2 className="w-4 h-4" />
                                    <span>Remove Member</span>
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Owner</p>
              <p className="text-xs text-gray-500">Full control, can delete organization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Can manage members and settings</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Member</p>
              <p className="text-xs text-gray-500">Can view and contribute</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          organizationId={organizationId}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
} 