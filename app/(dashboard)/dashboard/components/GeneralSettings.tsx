'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Clock, Monitor, Save, Loader2 } from 'lucide-react';
import { 
  SUPPORTED_TIMEZONES, 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_DATE_FORMATS, 
  SUPPORTED_TIME_FORMATS, 
  SUPPORTED_THEMES,
  detectTimezone 
} from '@/lib/utils/timezone';
import { useAutoSave } from '@/lib/utils/auto-save';
import { useTutorials } from '@/lib/utils/tutorials';
import { useSettingsSync } from '@/lib/utils/settings-sync';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GeneralSettingsProps {
  user: User;
}

interface GeneralSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  autoSave: boolean;
  showTutorials: boolean;
}

export default function GeneralSettings({ user }: GeneralSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<GeneralSettings>({
    timezone: detectTimezone(),
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'system',
    autoSave: true,
    showTutorials: true,
  });

  // Auto-save functionality
  const saveSettings = async (data: GeneralSettings) => {
    const response = await fetch('/api/user/general-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update settings');
    }

    return response.json();
  };

  const { isSaving, lastSaved, error: autoSaveError } = useAutoSave(settings, saveSettings, {
    delay: 2000, // Auto-save after 2 seconds of inactivity
    maxRetries: 3,
    retryDelay: 3000,
  });

  // Tutorial preferences
  const { preferences: tutorialPrefs, setShowTutorials } = useTutorials();

  // Settings synchronization
  const { isSyncing, lastSync, syncError, syncNow, deviceId } = useSettingsSync();

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/general-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading general settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/general-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setMessage({ type: 'success', text: 'General settings updated successfully!' });
      router.refresh();
    } catch (error) {
      console.error('Error updating general settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update general settings' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use utility constants for supported options

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timezone Settings */}
      <div className="space-y-4">
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {SUPPORTED_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language Settings */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Format */}
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            id="dateFormat"
            name="dateFormat"
            value={settings.dateFormat}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {SUPPORTED_DATE_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            id="timeFormat"
            name="timeFormat"
            value={settings.timeFormat}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {SUPPORTED_TIME_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme */}
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Monitor className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {SUPPORTED_THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-save</p>
              <p className="text-sm text-gray-500">Automatically save changes as you work</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.autoSave ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoSave ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Show tutorials</p>
              <p className="text-sm text-gray-500">Display helpful tips and tutorials</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newValue = !settings.showTutorials;
                setSettings(prev => ({ ...prev, showTutorials: newValue }));
                setShowTutorials(newValue);
              }}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.showTutorials ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.showTutorials ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-save Status */}
      {settings.autoSave && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {isSaving ? 'Saving...' : 'Auto-save enabled'}
            </span>
          </div>
          {lastSaved && (
            <span className="text-xs text-blue-600">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Auto-save Error */}
      {autoSaveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Auto-save failed: {autoSaveError.message}
          </p>
        </div>
      )}

      {/* Sync Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-gray-700">
            {isSyncing ? 'Syncing...' : 'Settings synced'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {lastSync && (
            <span className="text-xs text-gray-500">
              Last sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Sync now
          </button>
        </div>
      </div>

      {/* Sync Error */}
      {syncError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Sync failed: {syncError.message}
          </p>
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