'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Settings, Shield, BarChart3, Users, Eye } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      // Apply consent to third-party services
      applyConsentToServices(savedPreferences);
    }
  }, []);

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

      // Apply marketing consent
      if (prefs.marketing) {
        // Load marketing pixels/scripts
        loadMarketingScripts();
      } else {
        // Remove marketing scripts
        removeMarketingScripts();
      }

      // Apply functional consent
      if (prefs.functional) {
        // Enable functional cookies
        enableFunctionalCookies();
      }

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookieConsentChange', { 
        detail: prefs 
      }));
    }
  };

  const loadMarketingScripts = () => {
    // Load Facebook Pixel if configured
    if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) {
      // Implementation for Facebook Pixel
    }
    
    // Load other marketing scripts as needed
  };

  const removeMarketingScripts = () => {
    // Remove marketing scripts from DOM
    const marketingScripts = document.querySelectorAll('[data-cookie-type="marketing"]');
    marketingScripts.forEach(script => script.remove());
  };

  const enableFunctionalCookies = () => {
    // Enable functional features like chat widgets, preferences, etc.
  };

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = { 
      necessary: true, 
      analytics: true, 
      marketing: true, 
      functional: true 
    };
    await saveConsent(allAccepted);
    setPreferences(allAccepted);
    setShowBanner(false);
    applyConsentToServices(allAccepted);
  };

  const handleReject = async () => {
    const minimal: CookiePreferences = { 
      necessary: true, 
      analytics: false, 
      marketing: false, 
      functional: false 
    };
    await saveConsent(minimal);
    setPreferences(minimal);
    setShowBanner(false);
    applyConsentToServices(minimal);
  };

  const handleSavePreferences = async (prefs: CookiePreferences) => {
    await saveConsent(prefs);
    setPreferences(prefs);
    setShowBanner(false);
    setShowCustomizeModal(false);
    applyConsentToServices(prefs);
  };

  const saveConsent = async (prefs: CookiePreferences) => {
    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    
    // Save to server for logged-in users
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: prefs,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: null, // Will be captured server-side
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to save consent to server');
      }
    } catch (error) {
      console.warn('Failed to save consent to server:', error);
    }
  };

  const handleCustomizeToggle = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
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

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-6">
            <p className="text-sm mb-2">
              <strong>We respect your privacy</strong>
            </p>
            <p className="text-sm text-gray-300">
              We use cookies to enhance your experience. You can accept all cookies, reject non-essential ones, or customize your preferences.{' '}
              <Link href="/cookies" className="underline text-blue-300 hover:text-blue-200">
                Learn more in our Cookie Policy
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <button 
              onClick={handleAcceptAll} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Accept All
            </button>
            <button 
              onClick={handleReject} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Reject Non-Essential
            </button>
            <button 
              onClick={() => setShowCustomizeModal(true)} 
              className="border border-white text-white px-4 py-2 rounded hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Customize
            </button>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && (
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
                onClick={() => setShowCustomizeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                                  onClick={() => handleCustomizeToggle(type.key)}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    preferences[type.key] ? 'bg-blue-600' : 'bg-gray-200'
                                  }`}
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
                      You can change these preferences at any time by clicking the cookie preferences link in our footer or visiting your account settings. 
                      For more information, read our{' '}
                      <Link href="/privacy" className="underline font-medium">
                        Privacy Policy
                      </Link>
                      {' '}and{' '}
                      <Link href="/cookies" className="underline font-medium">
                        Cookie Policy
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Your preferences will be saved and applied immediately.
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePreferences(preferences)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 