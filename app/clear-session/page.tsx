'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function ClearSessionPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    clearedCookies?: string[];
  } | null>(null);
  const router = useRouter();

  const clearSession = async () => {
    setIsClearing(true);
    setResult(null);

    try {
      // First, try to clear cookies via API
      const response = await fetch('/api/clear-cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Also sign out from NextAuth
        await signOut({ redirect: false });
        
        setResult({
          success: true,
          message: `Successfully cleared ${data.cleared_cookies?.length || 0} auth cookies`,
          clearedCookies: data.cleared_cookies,
        });

        // Redirect to home page after a delay
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to clear cookies',
        });
      }
    } catch (error) {
      console.error('Error clearing session:', error);
      setResult({
        success: false,
        message: 'Network error while clearing cookies. Try refreshing the page and clearing cookies manually.',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const clearManually = () => {
    // Provide instructions for manual clearing
    alert(`Manual Cookie Clearing Instructions:

1. Open your browser's Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click on Cookies in the left sidebar
4. Select your domain
5. Delete all cookies starting with:
   - __Secure-authjs.session-token
   - authjs.session-token
   - __Host-authjs.csrf-token
   - _vercel_jwt

6. Refresh the page

Alternatively, you can:
- Use Incognito/Private browsing mode
- Clear all browser data for this site`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Clear Session Tokens
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This will fix the "REQUEST_HEADER_TOO_LARGE" error by clearing accumulated session tokens
            </p>
          </div>

          {!result && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-amber-800 mb-2">
                  What's causing this error?
                </h3>
                <p className="text-sm text-amber-700">
                  Your browser has accumulated too many session tokens, causing request headers to exceed the size limit. 
                  This commonly happens when session tokens become fragmented.
                </p>
              </div>

              <button
                onClick={clearSession}
                disabled={isClearing}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Clearing Session...
                  </>
                ) : (
                  'Clear Session Tokens'
                )}
              </button>

              <button
                onClick={clearManually}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manual Instructions
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message}
                    </p>
                    
                    {result.success && result.clearedCookies && result.clearedCookies.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-green-700 mb-1">Cleared cookies:</p>
                        <div className="max-h-32 overflow-y-auto">
                          {result.clearedCookies.map((cookie, index) => (
                            <div key={index} className="text-xs text-green-600 font-mono">
                              {cookie}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.success && (
                      <p className="text-xs text-green-700 mt-2">
                        Redirecting to home page in 3 seconds...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!result.success && (
                <div className="space-y-2">
                  <button
                    onClick={clearSession}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                  
                  <button
                    onClick={clearManually}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Manual Instructions
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 