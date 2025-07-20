'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Monitor, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SecuritySettingsProps {
  user: User;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number;
  requirePasswordForChanges: boolean;
  allowApiAccess: boolean;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 30,
    requirePasswordForChanges: true,
    allowApiAccess: false,
  });

  const [sessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows 10',
      location: 'New York, NY, USA',
      lastActive: '2 minutes ago',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, NY, USA',
      lastActive: '1 hour ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Firefox on MacBook',
      location: 'San Francisco, CA, USA',
      lastActive: '2 days ago',
      isCurrent: false,
    },
  ]);

  const handleToggle = (key: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, you'd have an API endpoint for security settings
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Security settings updated successfully!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update security settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // In a real app, you'd call an API to terminate the session
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage({ type: 'success', text: 'Session terminated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate session' });
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      // In a real app, you'd call an API to terminate all sessions
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'All sessions terminated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to terminate sessions' });
    }
  };

  const sessionTimeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' },
  ];

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('twoFactorEnabled')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.twoFactorEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Two-factor authentication is enabled
                </p>
                <p className="text-sm text-blue-700">
                  Your account is protected with an additional security layer
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Security Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Login notifications</p>
              <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('loginNotifications')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.loginNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Suspicious activity alerts</p>
              <p className="text-sm text-gray-500">Get alerted about unusual account activity</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('suspiciousActivityAlerts')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.suspiciousActivityAlerts ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.suspiciousActivityAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
          <button
            type="button"
            onClick={handleTerminateAllSessions}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Terminate all sessions
          </button>
        </div>

        <div>
          <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
            Session timeout
          </label>
          <select
            id="sessionTimeout"
            name="sessionTimeout"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {sessionTimeoutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.device}</p>
                  <p className="text-sm text-gray-500">{session.location} • {session.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.isCurrent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Current
                  </span>
                )}
                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Security */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Security</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Require password for changes</p>
              <p className="text-sm text-gray-500">Ask for password when making account changes</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('requirePasswordForChanges')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.requirePasswordForChanges ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.requirePasswordForChanges ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">API access</p>
              <p className="text-sm text-gray-500">Allow API access to your account data</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('allowApiAccess')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.allowApiAccess ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.allowApiAccess ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
} 