'use client';

import { useState } from 'react';
import { 
  Users, 
  Crown, 
  Shield, 
  User,
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';

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

interface MemberListProps {
  members: Member[];
  userMembership: UserMembership | null;
  onRemoveMember?: (memberId: string) => void;
  onRoleChange?: (memberId: string, newRole: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function MemberList({ 
  members, 
  userMembership, 
  onRemoveMember, 
  onRoleChange,
  showActions = true,
  compact = false
}: MemberListProps) {
  const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);

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

  const roleOptions = [
    { value: 'member', label: 'Member', description: 'Can view and contribute' },
    { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
    ...(isOwner ? [{ value: 'owner', label: 'Owner', description: 'Full control' }] : []),
  ];

  const handleRemoveMember = (memberId: string) => {
    if (onRemoveMember) {
      onRemoveMember(memberId);
    }
    setShowMemberMenu(null);
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    if (onRoleChange) {
      onRoleChange(memberId, newRole);
    }
    setShowMemberMenu(null);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {member.user.image ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={member.user.image}
                  alt={member.user.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {member.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {member.user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {member.user.email}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                {member.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
              {showActions && canManageMembers && (
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
                {showActions && canManageMembers && (
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
                            {member.role !== 'owner' && onRoleChange && (
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
                            {member.role !== 'owner' && onRemoveMember && (
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
  );
} 