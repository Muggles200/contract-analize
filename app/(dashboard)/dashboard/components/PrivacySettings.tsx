'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Shield, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrivacySettingsProps {
  user: User;
}

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdPartyServices: boolean;
  dataRetention: number;
  gdprCompliance: boolean;
  dataPortability: boolean;
  rightToBeForgotten: boolean;
}

export default function PrivacySettings({ user }: PrivacySettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: false,
    analytics: true,
    marketing: false,
    thirdPartyServices: false,
    dataRetention: 365,
    gdprCompliance: true,
    dataPortability: true,
    rightToBeForgotten: true,
  });

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, you'd have an API endpoint for privacy settings
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update privacy settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDataPortability = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd call an API to generate a data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Data export request submitted. You will receive an email when it\'s ready.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request data export' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd call an API to initiate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Account deletion request submitted. You will receive a confirmation email.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request account deletion' });
    } finally {
      setIsLoading(false);
    }
  };

  const dataRetentionOptions = [
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '6 months' },
    { value: 365, label: '1 year' },
    { value: 730, label: '2 years' },
    { value: 0, label: 'Until account deletion' },
  ];

  return (
    <div className="space-y-8">
      {/* Data Sharing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Data Sharing</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Share usage data</p>
              <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage statistics</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('dataSharing')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dataSharing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Analytics tracking</p>
              <p className="text-sm text-gray-500">Allow us to collect analytics to improve our service</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('analytics')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.analytics ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.analytics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Marketing communications</p>
              <p className="text-sm text-gray-500">Receive marketing emails and promotional content</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('marketing')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.marketing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.marketing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Third-party services</p>
              <p className="text-sm text-gray-500">Allow data sharing with trusted third-party services</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('thirdPartyServices')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.thirdPartyServices ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.thirdPartyServices ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
        
        <div>
          <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 mb-2">
            Data retention period
          </label>
          <select
            id="dataRetention"
            name="dataRetention"
            value={settings.dataRetention}
            onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {dataRetentionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            How long we keep your data after account deletion
          </p>
        </div>
      </div>

      {/* GDPR Compliance */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">GDPR Compliance</h3>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">
                GDPR Compliant
              </p>
              <p className="text-sm text-green-700">
                We are fully compliant with GDPR regulations and respect your data rights
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">GDPR compliance mode</p>
              <p className="text-sm text-gray-500">Enable strict GDPR compliance settings</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('gdprCompliance')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.gdprCompliance ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.gdprCompliance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Data portability</p>
              <p className="text-sm text-gray-500">Allow you to export your data in a portable format</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('dataPortability')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.dataPortability ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dataPortability ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Right to be forgotten</p>
              <p className="text-sm text-gray-500">Allow complete data deletion upon request</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('rightToBeForgotten')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.rightToBeForgotten ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.rightToBeForgotten ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Your Data Rights</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Export my data</p>
              <p className="text-sm text-gray-500">Download all your data in a portable format</p>
            </div>
            <button
              type="button"
              onClick={handleRequestDataPortability}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                'Request Export'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete my account</p>
              <p className="text-sm text-gray-500">Permanently delete all your data and account</p>
            </div>
            <button
              type="button"
              onClick={handleRequestDeletion}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                'Request Deletion'
              )}
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