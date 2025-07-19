'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenuClient() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="text-gray-700 hover:text-blue-600 p-2 transition-colors"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMenu}>
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={closeMenu}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-4">
                <Link
                  href="#features"
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#faq"
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  About
                </Link>
              </div>
              
              <div className="mt-8 space-y-4">
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="block text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={closeMenu}
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
} 