'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import CookiePreferencesModal from './CookiePreferencesModal';

interface CookiePreferencesLinkProps {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export default function CookiePreferencesLink({ 
  className = "text-blue-600 hover:text-blue-800 underline",
  children = "Cookie Preferences",
  showIcon = false 
}: CookiePreferencesLinkProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    // Optional: Add any additional handling when preferences are saved
    console.log('Cookie preferences updated');
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={className}
        type="button"
      >
        {showIcon && <Settings className="w-4 h-4 inline mr-1" />}
        {children}
      </button>
      
      <CookiePreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
} 