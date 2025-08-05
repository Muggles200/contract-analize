'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
    // Trigger analytics if accepted
  };

  const handleReject = () => {
    const minimal = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem('cookieConsent', JSON.stringify(minimal));
    setPreferences(minimal);
    setShowBanner(false);
  };

  const handleSavePreferences = (prefs: { necessary: boolean; analytics: boolean; marketing: boolean }) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm mb-4 md:mb-0">
          We use cookies to enhance your experience. By continuing, you agree to our 
          <Link href="/cookies" className="underline">Cookie Policy</Link>.
        </p>
        <div className="flex space-x-4">
          <button onClick={handleAcceptAll} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Accept All</button>
          <button onClick={handleReject} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Reject Non-Essential</button>
          <button onClick={() => {/* Open customize modal - implement if needed */}} className="border border-white text-white px-4 py-2 rounded hover:bg-white/10">Customize</button>
        </div>
      </div>
    </div>
  );
} 