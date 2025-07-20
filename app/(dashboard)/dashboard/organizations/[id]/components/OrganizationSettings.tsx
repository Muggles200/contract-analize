'use client';

import { useState } from 'react';
import { 
  Settings, 
  Save, 
  X, 
  Edit,
  Bell,
  Shield,
  Users,
  FileText,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

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

interface OrganizationSettingsProps {
  organization: Organization;
  userMembership: UserMembership | null;
  onUpdate: () => void;
}

export default function OrganizationSettings({ 
  organization, 
  userMembership, 
  onUpdate 
}: OrganizationSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      contractUploads: true,
      analysisComplete: true,
      memberInvites: true,
    },
    privacy: {
      publicProfile: false,
      showMembers: true,
      allowMemberInvites: true,
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
    },
    features: {
      enableAnalytics: true,
      enableExport: true,
      enableSharing: true,
    },
  });

  const canEdit = userMembership?.role === 'owner' || userMembership?.role === 'admin';

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset to original settings
    setSettings(organization.settings || {
      notifications: {
        emailNotifications: true,
        contractUploads: true,
        analysisComplete: true,
        memberInvites: true,
      },
      privacy: {
        publicProfile: false,
        showMembers: true,
        allowMemberInvites: true,
      },
      security: {
        requireTwoFactor: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
      },
      features: {
        enableAnalytics: true,
        enableExport: true,
        enableSharing: true,
      },
    });
    setIsEditing(false);
  };

  const toggleSetting = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !(prev[category as keyof typeof prev] as any)[setting],
      },
    }));
  };

  const updateSetting = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Organization Settings</h2>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Settings
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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

      <div className="space-y-8">
        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email notifications for important events</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'emailNotifications')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Contract Uploads</p>
                <p className="text-sm text-gray-500">Notify when new contracts are uploaded</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'contractUploads')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.contractUploads ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.contractUploads ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Analysis Complete</p>
                <p className="text-sm text-gray-500">Notify when contract analysis is complete</p>
              </div>
              <button
                onClick={() => toggleSetting('notifications', 'analysisComplete')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.analysisComplete ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.analysisComplete ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Public Profile</p>
                <p className="text-sm text-gray-500">Allow this organization to be discoverable</p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'publicProfile')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy.publicProfile ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy.publicProfile ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Show Members</p>
                <p className="text-sm text-gray-500">Display member list to other members</p>
              </div>
              <button
                onClick={() => toggleSetting('privacy', 'showMembers')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy.showMembers ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy.showMembers ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Require Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Enforce 2FA for all organization members</p>
              </div>
              <button
                onClick={() => toggleSetting('security', 'requireTwoFactor')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.security.requireTwoFactor ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                disabled={!isEditing}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Features</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Analytics</p>
                <p className="text-sm text-gray-500">Allow analytics and reporting features</p>
              </div>
              <button
                onClick={() => toggleSetting('features', 'enableAnalytics')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.features.enableAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.features.enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Export</p>
                <p className="text-sm text-gray-500">Allow exporting analysis results</p>
              </div>
              <button
                onClick={() => toggleSetting('features', 'enableExport')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.features.enableExport ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.features.enableExport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Sharing</p>
                <p className="text-sm text-gray-500">Allow sharing analysis results</p>
              </div>
              <button
                onClick={() => toggleSetting('features', 'enableSharing')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.features.enableSharing ? 'bg-blue-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.features.enableSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 