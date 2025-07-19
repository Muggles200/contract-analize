'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    if (typeof window !== 'undefined' && window.gtag) {
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (gaId) {
        window.gtag('config', gaId, {
          page_path: pathname,
        });
      }
    }
  }, [pathname]);

  // Track custom events
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
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

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackCTAClick = trackCTAClick;
      (window as any).trackFeatureView = trackFeatureView;
      (window as any).trackPricingView = trackPricingView;
    }
  }, []);

  return null; // This component doesn't render anything
} 