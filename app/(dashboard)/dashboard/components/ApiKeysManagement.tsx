'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Save, Loader2, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeysManagementProps {
  user: User;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export default function ApiKeysManagement({ user }: ApiKeysManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_1234567890abcdef',
      permissions: ['read', 'write'],
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
      isActive: true,
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk_test_abcdef1234567890',
      permissions: ['read'],
      createdAt: '2024-01-10',
      isActive: true,
    },
  ]);

  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    permissions: [] as string[],
  });

  const availablePermissions = [
    { value: 'read', label: 'Read Access', description: 'View contracts and analysis results' },
    { value: 'write', label: 'Write Access', description: 'Upload contracts and start analyses' },
    { value: 'delete', label: 'Delete Access', description: 'Delete contracts and analyses' },
    { value: 'admin', label: 'Admin Access', description: 'Full administrative access' },
  ];

  const handleCreateKey = async () => {
    if (!newKeyForm.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for the API key' });
      return;
    }

    if (newKeyForm.permissions.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one permission' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, you'd call an API to create the key
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyForm.name,
        key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        permissions: newKeyForm.permissions,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyForm({ name: '', permissions: [] });
      setShowCreateForm(false);
      setMessage({ type: 'success', text: 'API key created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create API key' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, you'd call an API to delete the key
      await new Promise(resolve => setTimeout(resolve, 500));

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setMessage({ type: 'success', text: 'API key deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete API key' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (permission: string) => {
    setNewKeyForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setMessage({ type: 'success', text: 'API key copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy API key' });
    }
  };

  const formatPermissions = (permissions: string[]) => {
    return permissions.map(p => {
      const permission = availablePermissions.find(ap => ap.value === p);
      return permission?.label || p;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* API Keys List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Your API Keys</h3>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
            <p className="text-gray-600 mb-4">
              Create your first API key to start integrating with our services.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created {apiKey.createdAt}
                      {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showKey === apiKey.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">API Key</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {showKey === apiKey.id ? apiKey.key : `${apiKey.key.substring(0, 12)}...`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permissions</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatPermissions(apiKey.permissions)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      apiKey.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New API Key Form */}
      {showCreateForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New API Key</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                Key Name
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyForm.name}
                onChange={(e) => setNewKeyForm(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Production API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <label key={permission.value} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={newKeyForm.permissions.includes(permission.value)}
                      onChange={() => handleTogglePermission(permission.value)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{permission.label}</p>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Important Security Notice
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    API keys have full access to your account. Keep them secure and never share them publicly.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCreateKey}
                disabled={isLoading || !newKeyForm.name.trim() || newKeyForm.permissions.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create API Key
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyForm({ name: '', permissions: [] });
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
} 