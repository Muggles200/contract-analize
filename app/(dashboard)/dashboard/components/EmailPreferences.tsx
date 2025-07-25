'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Bell, Shield, Save, Loader2, Clock, Globe } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailPreferencesProps {
  user: User;
}

interface EmailSettings {
  marketing: boolean;
  security: boolean;
  analysis: boolean;
  billing: boolean;
  weekly: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  timezone: string;
}

export default function EmailPreferences({ user }: EmailPreferencesProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<EmailSettings>({
    marketing: true,
    security: true,
    analysis: true,
    billing: true,
    weekly: false,
    frequency: 'immediate',
    timezone: 'UTC',
  });

  // Load email preferences on component mount
  useEffect(() => {
    loadEmailPreferences();
  }, []);

  const loadEmailPreferences = async () => {
    try {
      const response = await fetch('/api/user/email-preferences');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading email preferences:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleToggle = (key: keyof EmailSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly') => {
    setSettings(prev => ({
      ...prev,
      frequency,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Email preferences updated successfully!' });
        router.refresh();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to update email preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update email preferences' });
    } finally {
      setIsLoading(false);
    }
  };

  const emailOptions = [
    {
      key: 'marketing' as keyof EmailSettings,
      title: 'Marketing & Promotional',
      description: 'Receive updates about new features, tips, and promotional offers',
      icon: Mail,
    },
    {
      key: 'security' as keyof EmailSettings,
      title: 'Security Alerts',
      description: 'Get notified about important security updates and account activity',
      icon: Shield,
    },
    {
      key: 'analysis' as keyof EmailSettings,
      title: 'Analysis Notifications',
      description: 'Receive notifications when your contract analysis is complete',
      icon: Bell,
    },
    {
      key: 'billing' as keyof EmailSettings,
      title: 'Billing & Subscription',
      description: 'Get invoices, payment confirmations, and subscription updates',
      icon: Mail,
    },
    {
      key: 'weekly' as keyof EmailSettings,
      title: 'Weekly Summary',
      description: 'Receive a weekly digest of your contract analysis activity',
      icon: Bell,
    },
  ];

  const frequencyOptions = [
    {
      value: 'immediate' as const,
      label: 'Immediate',
      description: 'Receive emails as soon as they are sent',
    },
    {
      value: 'daily' as const,
      label: 'Daily Digest',
      description: 'Receive a daily summary of all emails',
    },
    {
      value: 'weekly' as const,
      label: 'Weekly Digest',
      description: 'Receive a weekly summary of all emails',
    },
  ];

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading email preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Email Address: {user.email}
            </h3>
            <p className="text-sm text-blue-700">
              {user.emailVerified 
                ? 'Your email is verified and you can receive notifications'
                : 'Please verify your email to receive notifications'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Email Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Email Preferences
        </h3>
        <p className="text-sm text-gray-600">
          Choose which types of emails you'd like to receive from us.
        </p>

        <div className="space-y-4">
          {emailOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.key} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {option.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(option.key)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings[option.key] ? 'translate-x-5' : 'translate-x-0'
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

      {/* Email Frequency */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            Email Frequency
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Choose how often you'd like to receive emails.
        </p>

        <div className="space-y-3">
          {frequencyOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <input
                type="radio"
                id={option.value}
                name="frequency"
                value={option.value}
                checked={settings.frequency === option.value}
                onChange={() => handleFrequencyChange(option.value)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <label htmlFor={option.value} className="text-sm font-medium text-gray-900 cursor-pointer">
                  {option.label}
                </label>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            Timezone
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Your timezone for email delivery timing.
        </p>

        <div>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
            disabled={isLoading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Australia/Sydney">Sydney</option>
          </select>
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
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
} 