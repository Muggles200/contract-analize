'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Smartphone, Monitor, Save, Loader2, Zap, AlertTriangle, CheckCircle, Clock, Volume2, Vibrate } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationSettingsProps {
  user: User;
}

interface NotificationSettings {
  browser: boolean;
  email: boolean;
  push: boolean;
  analysisComplete: boolean;
  newFeatures: boolean;
  securityAlerts: boolean;
  billingUpdates: boolean;
  weeklyDigest: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export default function NotificationSettings({ user }: NotificationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    browser: true,
    email: true,
    push: false,
    analysisComplete: true,
    newFeatures: true,
    securityAlerts: true,
    billingUpdates: true,
    weeklyDigest: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC',
    },
    soundEnabled: true,
    vibrationEnabled: true,
  });

  // Load notification settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/notification-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleQuietHoursToggle = () => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours!,
        enabled: !prev.quietHours?.enabled,
      },
    }));
  };

  const handleQuietHoursChange = (field: 'start' | 'end' | 'timezone', value: string) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours!,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Notification settings updated successfully!' });
        router.refresh();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to update notification settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const notificationChannels = [
    {
      key: 'browser' as keyof NotificationSettings,
      title: 'Browser Notifications',
      description: 'Receive notifications in your browser when you\'re on the site',
      icon: Monitor,
    },
    {
      key: 'email' as keyof NotificationSettings,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Bell,
    },
    {
      key: 'push' as keyof NotificationSettings,
      title: 'Push Notifications',
      description: 'Receive push notifications on your device (requires permission)',
      icon: Smartphone,
    },
  ];

  const notificationTypes = [
    {
      key: 'analysisComplete' as keyof NotificationSettings,
      title: 'Analysis Complete',
      description: 'When your contract analysis is finished',
      icon: CheckCircle,
    },
    {
      key: 'newFeatures' as keyof NotificationSettings,
      title: 'New Features',
      description: 'When we release new features or improvements',
      icon: Zap,
    },
    {
      key: 'securityAlerts' as keyof NotificationSettings,
      title: 'Security Alerts',
      description: 'Important security updates and account activity',
      icon: AlertTriangle,
    },
    {
      key: 'billingUpdates' as keyof NotificationSettings,
      title: 'Billing Updates',
      description: 'Subscription changes, payment confirmations, and invoices',
      icon: Bell,
    },
    {
      key: 'weeklyDigest' as keyof NotificationSettings,
      title: 'Weekly Digest',
      description: 'Weekly summary of your contract analysis activity',
      icon: Bell,
    },
  ];

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification Channels */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Notification Channels
        </h3>
        <p className="text-sm text-gray-600">
          Choose how you'd like to receive notifications.
        </p>

        <div className="space-y-4">
          {notificationChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.key} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {channel.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {channel.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(channel.key)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        settings[channel.key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings[channel.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Notification Types
        </h3>
        <p className="text-sm text-gray-600">
          Choose which types of notifications you'd like to receive.
        </p>

        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.key} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {type.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {type.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(type.key)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        settings[type.key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings[type.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Quiet Hours
        </h3>
        <p className="text-sm text-gray-600">
          Set times when you don't want to receive notifications.
        </p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Enable Quiet Hours
                  </p>
                  <p className="text-sm text-gray-500">
                    Pause notifications during specific hours
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuietHoursToggle}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    settings.quietHours?.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.quietHours?.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {settings.quietHours?.enabled && (
            <div className="ml-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.quietHours.timezone}
                    onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                    disabled={isLoading}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-600">
          Customize how notifications are delivered.
        </p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Volume2 className="h-5 w-5 text-gray-400 mt-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sound Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Play sound for browser and push notifications
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('soundEnabled')}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Vibrate className="h-5 w-5 text-gray-400 mt-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Vibration
                  </p>
                  <p className="text-sm text-gray-500">
                    Vibrate device for push notifications
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('vibrationEnabled')}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    settings.vibrationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
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