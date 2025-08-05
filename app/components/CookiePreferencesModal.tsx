'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Shield, BarChart3, Users, Eye, Save, Loader2 } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (preferences: CookiePreferences) => void;
}

export default function CookiePreferencesModal({ 
  isOpen, 
  onClose, 
  onSave 
}: CookiePreferencesModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    if (isOpen) {
      // Load current preferences from localStorage
      const consent = localStorage.getItem('cookieConsent');
      if (consent) {
        try {
          const savedPreferences = JSON.parse(consent);
          setPreferences(savedPreferences);
        } catch (error) {
          console.error('Error parsing saved preferences:', error);
        }
      }
    }
  }, [isOpen]);

  const handleToggle = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const applyConsentToServices = (prefs: CookiePreferences) => {
    // Apply analytics consent
    if (typeof window !== 'undefined') {
      (window as any).cookieConsent = prefs;
      
      // Trigger analytics initialization if consent given
      if (prefs.analytics && window.gtag) {
        const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (gaId) {
          window.gtag('config', gaId, {
            anonymize_ip: true,
            allow_google_signals: prefs.marketing,
            allow_ad_personalization_signals: prefs.marketing,
          });
        }
      } else if (window.gtag) {
        // Disable analytics if not consented
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
          send_page_view: false,
        });
      }

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentChange', { 
        detail: prefs 
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('cookieConsent', JSON.stringify(preferences));
      localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
      
      // Save to server for logged-in users
      try {
        const response = await fetch('/api/consent', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences,
          }),
        });
        
        if (!response.ok) {
          console.warn('Failed to save consent to server');
        }
      } catch (error) {
        console.warn('Failed to save consent to server:', error);
      }

      // Apply consent to services
      applyConsentToServices(preferences);

      // Call onSave callback if provided
      if (onSave) {
        onSave(preferences);
      }

      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawAll = async () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    setPreferences(minimalPreferences);
    
    // Auto-save the withdrawal
    localStorage.setItem('cookieConsent', JSON.stringify(minimalPreferences));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    
    try {
      await fetch('/api/consent', {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Failed to record consent withdrawal on server:', error);
    }

    applyConsentToServices(minimalPreferences);
    
    if (onSave) {
      onSave(minimalPreferences);
    }

    onClose();
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cannot be disabled.',
      icon: Shield,
      required: true,
      examples: ['Authentication', 'Security', 'Session management', 'Load balancing'],
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      icon: BarChart3,
      required: false,
      examples: ['Google Analytics', 'Page views', 'User behavior', 'Performance metrics'],
    },
    {
      key: 'functional' as keyof CookiePreferences,
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization.',
      icon: Settings,
      required: false,
      examples: ['Language preferences', 'Theme settings', 'Chat widgets', 'User preferences'],
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements and track campaign effectiveness.',
      icon: Users,
      required: false,
      examples: ['Facebook Pixel', 'Google Ads', 'Retargeting', 'Campaign tracking'],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cookie Preferences</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your cookie preferences and privacy settings
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-6">
            {cookieTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {type.title}
                          </h3>
                          {type.required ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Always Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggle(type.key)}
                              disabled={isLoading}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                preferences[type.key] ? 'bg-blue-600' : 'bg-gray-200'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  preferences[type.key] ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {type.description}
                        </p>
                        <div className="bg-gray-50 rounded p-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Examples:</h4>
                          <div className="flex flex-wrap gap-1">
                            {type.examples.map((example, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-700"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <Eye className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Privacy Notice</h4>
                <p className="text-sm text-blue-800">
                  You can change these preferences at any time. Changes will take effect immediately.
                  For more information, read our{' '}
                  <a href="/privacy" className="underline font-medium" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a href="/cookies" className="underline font-medium" target="_blank" rel="noopener noreferrer">
                    Cookie Policy
                  </a>.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Withdrawal Notice */}
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-900 mb-2">Withdraw All Consent</h4>
            <p className="text-sm text-red-800 mb-3">
              You have the right to withdraw your consent at any time. This will disable all non-essential cookies.
            </p>
            <button
              onClick={handleWithdrawAll}
              disabled={isLoading}
              className="text-sm text-red-700 hover:text-red-900 underline font-medium disabled:opacity-50"
            >
              Withdraw All Non-Essential Cookies
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Last updated: {localStorage.getItem('cookieConsentTimestamp') 
              ? new Date(localStorage.getItem('cookieConsentTimestamp')!).toLocaleString()
              : 'Not set'
            }
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
} 