'use client';

import { useEffect, useState } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function ThirdPartyScripts() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    // Check for existing consent
    const checkConsent = () => {
      const consentData = localStorage.getItem('cookieConsent');
      if (consentData) {
        try {
          const preferences = JSON.parse(consentData);
          setConsent(preferences);
          loadScriptsBasedOnConsent(preferences);
        } catch (error) {
          console.error('Error parsing cookie consent:', error);
        }
      }
    };

    // Listen for consent changes
    const handleConsentChange = (event: CustomEvent) => {
      const preferences = event.detail as CookiePreferences;
      setConsent(preferences);
      loadScriptsBasedOnConsent(preferences);
    };

    checkConsent();
    window.addEventListener('cookieConsentChange', handleConsentChange as EventListener);

    return () => {
      window.removeEventListener('cookieConsentChange', handleConsentChange as EventListener);
    };
  }, []);

  const loadScriptsBasedOnConsent = (preferences: CookiePreferences) => {
    // Load marketing scripts if consent given
    if (preferences.marketing) {
      loadMarketingScripts();
    } else {
      removeMarketingScripts();
    }

    // Load functional scripts if consent given
    if (preferences.functional) {
      loadFunctionalScripts();
    } else {
      removeFunctionalScripts();
    }

    // Analytics is handled by the Analytics component
  };

  const loadMarketingScripts = () => {
    // Example: Load Facebook Pixel
    if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && !document.querySelector('[data-cookie-type="marketing"][data-script="facebook-pixel"]')) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      script.setAttribute('data-cookie-type', 'marketing');
      script.setAttribute('data-script', 'facebook-pixel');
      document.head.appendChild(script);
    }

    // Example: Load Google Ads conversion tracking
    if (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && !document.querySelector('[data-cookie-type="marketing"][data-script="google-ads"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`;
      script.setAttribute('data-cookie-type', 'marketing');
      script.setAttribute('data-script', 'google-ads');
      document.head.appendChild(script);

      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
      `;
      configScript.setAttribute('data-cookie-type', 'marketing');
      configScript.setAttribute('data-script', 'google-ads-config');
      document.head.appendChild(configScript);
    }

    console.log('Marketing scripts loaded');
  };

  const removeMarketingScripts = () => {
    // Remove all marketing scripts
    const marketingScripts = document.querySelectorAll('[data-cookie-type="marketing"]');
    marketingScripts.forEach(script => {
      script.remove();
    });
    
    // Clear Facebook Pixel if it exists
    if (typeof window !== 'undefined' && (window as any).fbq) {
      delete (window as any).fbq;
    }

    console.log('Marketing scripts removed');
  };

  const loadFunctionalScripts = () => {
    // Example: Load chat widget
    if (process.env.NEXT_PUBLIC_CHAT_WIDGET_ID && !document.querySelector('[data-cookie-type="functional"][data-script="chat-widget"]')) {
      // This is a placeholder for chat widget implementation
      console.log('Chat widget would be loaded here');
      
      // Example implementation:
      // const script = document.createElement('script');
      // script.src = `https://widget.intercom.io/widget/${process.env.NEXT_PUBLIC_CHAT_WIDGET_ID}`;
      // script.setAttribute('data-cookie-type', 'functional');
      // script.setAttribute('data-script', 'chat-widget');
      // document.head.appendChild(script);
    }

    // Example: Load user preference synchronization
    if (!document.querySelector('[data-cookie-type="functional"][data-script="preferences-sync"]')) {
      // Enable user preference synchronization across devices
      const script = document.createElement('script');
      script.innerHTML = `
        // Enable enhanced user experience features
        if (typeof window !== 'undefined') {
          window.functionalCookiesEnabled = true;
          // Initialize preference sync, theme persistence, etc.
          console.log('Functional cookies enabled - enhanced features available');
        }
      `;
      script.setAttribute('data-cookie-type', 'functional');
      script.setAttribute('data-script', 'preferences-sync');
      document.head.appendChild(script);
    }

    console.log('Functional scripts loaded');
  };

  const removeFunctionalScripts = () => {
    // Remove all functional scripts
    const functionalScripts = document.querySelectorAll('[data-cookie-type="functional"]');
    functionalScripts.forEach(script => {
      script.remove();
    });

    // Disable functional features
    if (typeof window !== 'undefined') {
      (window as any).functionalCookiesEnabled = false;
    }

    console.log('Functional scripts removed');
  };

  // This component doesn't render anything visible
  return null;
} 