'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Save, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  Users,
  FileText,
  Trash2,
  Info
} from 'lucide-react';

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
  dataRetention: number; // days
  gdprCompliance: boolean;
  dataPortability: boolean;
  rightToBeForgotten: boolean;
  privacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt?: Date;
  dataProcessingConsent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
  };
}

export default function PrivacySettings({ user }: PrivacySettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: false,
    analytics: true,
    marketing: false,
    dataRetention: 365,
    gdprCompliance: true,
    dataPortability: true,
    rightToBeForgotten: true,
    privacyPolicyAccepted: false,
    dataProcessingConsent: {
      necessary: true,
      analytics: false,
      marketing: false,
      thirdParty: false,
    },
  });

  // Load privacy settings on component mount
  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const response = await fetch('/api/user/privacy-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConsentToggle = (consentType: keyof PrivacySettings['dataProcessingConsent']) => {
    setSettings(prev => ({
      ...prev,
      dataProcessingConsent: {
        ...prev.dataProcessingConsent,
        [consentType]: !prev.dataProcessingConsent[consentType],
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
        router.refresh();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update privacy settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update privacy settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDataPortability = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'gdpr-portability',
          dataTypes: ['profile', 'contracts', 'analyses', 'settings'],
          format: 'json',
        }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Data export request submitted. You will receive an email when it\'s ready.' 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to request data export' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request data export' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDataDeletion = async () => {
    if (!confirm('Are you sure you want to request data deletion? This action cannot be undone and will permanently delete your account and all associated data.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'GDPR right to be forgotten',
          immediate: false,
        }),
      });

      if (response.ok) {
        setMessage({ 
          type: 'warning', 
          text: 'Data deletion request submitted. Your account will be deleted within 30 days.' 
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to request data deletion' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request data deletion' });
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
    { value: 1095, label: '3 years' },
  ];

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading privacy settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Data Processing Consent */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Data Processing Consent</h3>
        <p className="text-sm text-gray-600">
          Control how your data is processed and used by our application.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Necessary Data Processing</p>
                <p className="text-sm text-gray-500">Required for core functionality (contract analysis, account management)</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Always Active
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Analytics & Performance</p>
                <p className="text-sm text-gray-500">Help us improve our services and understand usage patterns</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleConsentToggle('analytics')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.dataProcessingConsent.analytics ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dataProcessingConsent.analytics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Marketing Communications</p>
                <p className="text-sm text-gray-500">Receive updates about new features and promotional offers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleConsentToggle('marketing')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.dataProcessingConsent.marketing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dataProcessingConsent.marketing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Third-Party Services</p>
                <p className="text-sm text-gray-500">Allow data sharing with trusted third-party services (payment processing, email delivery)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleConsentToggle('thirdParty')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.dataProcessingConsent.thirdParty ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dataProcessingConsent.thirdParty ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
        <p className="text-sm text-gray-600">
          Choose how long we keep your data after account deletion.
        </p>

        <div>
          <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 mb-2">
            Retention Period
          </label>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              id="dataRetention"
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
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Data will be automatically deleted after this period when you delete your account.
          </p>
        </div>
      </div>

      {/* GDPR Rights */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Your GDPR Rights</h3>
        <p className="text-sm text-gray-600">
          Exercise your rights under the General Data Protection Regulation (GDPR).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-medium text-gray-900">Data Portability</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Download a copy of all your personal data in a machine-readable format.
            </p>
            <button
              type="button"
              onClick={handleRequestDataPortability}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Request Data Export
                </>
              )}
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <h4 className="text-sm font-medium text-gray-900">Right to be Forgotten</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Request permanent deletion of all your personal data from our systems.
            </p>
            <button
              type="button"
              onClick={handleRequestDataDeletion}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Deletion
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Privacy Policy</h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Privacy Policy Acceptance</p>
              <p className="text-sm text-gray-500">
                {settings.privacyPolicyAccepted 
                  ? `Accepted on ${settings.privacyPolicyAcceptedAt ? new Date(settings.privacyPolicyAcceptedAt).toLocaleDateString() : 'Unknown date'}`
                  : 'You need to accept our privacy policy to continue using the service'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {settings.privacyPolicyAccepted ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Accepted
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleToggle('privacyPolicyAccepted')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Accept Policy
              </button>
            )}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Policy
            </a>
          </div>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Privacy Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Your data is processed in accordance with GDPR requirements</li>
                <li>You can withdraw consent at any time</li>
                <li>Data export requests are processed within 30 days</li>
                <li>Account deletion requests are processed within 30 days</li>
                <li>Contact us at privacy@contractanalize.com for privacy concerns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : message.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
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
              Save Privacy Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
} 