'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    cookieConsent?: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
      functional: boolean;
    };
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Check for existing cookie consent
    const checkConsent = () => {
      const consent = localStorage.getItem('cookieConsent');
      if (consent) {
        try {
          const preferences = JSON.parse(consent);
          setAnalyticsEnabled(preferences.analytics);
          
          // Store consent globally for other components
          if (typeof window !== 'undefined') {
            window.cookieConsent = preferences;
          }
          
          return preferences.analytics;
        } catch (error) {
          console.error('Error parsing cookie consent:', error);
          return false;
        }
      }
      return false;
    };

    const hasAnalyticsConsent = checkConsent();

    // Listen for consent changes
    const handleConsentChange = (event: CustomEvent) => {
      const preferences = event.detail;
      setAnalyticsEnabled(preferences.analytics);
      
      if (preferences.analytics) {
        initializeAnalytics();
      } else {
        disableAnalytics();
      }
    };

    window.addEventListener('cookieConsentChange', handleConsentChange as EventListener);

    // Initialize analytics if consent is already given
    if (hasAnalyticsConsent) {
      initializeAnalytics();
    }

    return () => {
      window.removeEventListener('cookieConsentChange', handleConsentChange as EventListener);
    };
  }, []);

  useEffect(() => {
    // Track page views only if analytics is enabled
    if (analyticsEnabled && typeof window !== 'undefined' && window.gtag) {
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (gaId) {
        window.gtag('config', gaId, {
          page_path: pathname,
          anonymize_ip: true,
          allow_google_signals: window.cookieConsent?.marketing || false,
          allow_ad_personalization_signals: window.cookieConsent?.marketing || false,
        });
      }
    }
  }, [pathname, analyticsEnabled]);

  const initializeAnalytics = () => {
    if (typeof window === 'undefined') return;

    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!gaId) return;

    // Load Google Analytics script if not already loaded
    if (!window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialize gtag and dataLayer
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      
      window.gtag('js', new Date());
      window.gtag('config', gaId, {
        anonymize_ip: true,
        allow_google_signals: window.cookieConsent?.marketing || false,
        allow_ad_personalization_signals: window.cookieConsent?.marketing || false,
      });
    }
  };

  const disableAnalytics = () => {
    if (typeof window === 'undefined') return;

    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId && window.gtag) {
      // Disable analytics
      window.gtag('config', gaId, {
        send_page_view: false,
        anonymize_ip: true,
      });
    }
  };

  // Track custom events (only if analytics enabled)
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (analyticsEnabled && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Track CTA clicks
  const trackCTAClick = (ctaType: string) => {
    trackEvent('click', 'CTA', ctaType);
  };

  // Track feature section views
  const trackFeatureView = (featureName: string) => {
    trackEvent('view', 'Feature', featureName);
  };

  // Track pricing plan views
  const trackPricingView = (planName: string) => {
    trackEvent('view', 'Pricing', planName);
  };

  // Track form submissions
  const trackFormSubmission = (formType: string) => {
    trackEvent('submit', 'Form', formType);
  };

  // Track file uploads
  const trackFileUpload = (fileType: string) => {
    trackEvent('upload', 'File', fileType);
  };

  // Track search queries
  const trackSearch = (searchTerm: string) => {
    trackEvent('search', 'Site', searchTerm);
  };

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackCTAClick = trackCTAClick;
      (window as any).trackFeatureView = trackFeatureView;
      (window as any).trackPricingView = trackPricingView;
      (window as any).trackFormSubmission = trackFormSubmission;
      (window as any).trackFileUpload = trackFileUpload;
      (window as any).trackSearch = trackSearch;
    }
  }, [analyticsEnabled]);

  return null; // This component doesn't render anything
} 