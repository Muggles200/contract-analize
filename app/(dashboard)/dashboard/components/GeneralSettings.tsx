'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Clock, Monitor, Save, Loader2 } from 'lucide-react';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<GeneralSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'system',
    autoSave: true,
    showTutorials: true,
  });

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
      // In a real app, you'd have an API endpoint for general settings
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'General settings updated successfully!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update general settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  ];

  const timeFormats = [
    { value: '12h', label: '12-hour (AM/PM)' },
    { value: '24h', label: '24-hour' },
  ];

  const themes = [
    { value: 'system', label: 'System Default' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

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
              {timezones.map((tz) => (
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
              {languages.map((lang) => (
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
            {dateFormats.map((format) => (
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
            {timeFormats.map((format) => (
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
              {themes.map((theme) => (
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
              onClick={() => setSettings(prev => ({ ...prev, showTutorials: !prev.showTutorials }))}
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