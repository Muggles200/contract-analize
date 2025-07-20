'use client';

import { AlertTriangle, RefreshCw, Home, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Check if this is a header size error
  const isHeaderSizeError = 
    error.message?.includes('REQUEST_HEADER_TOO_LARGE') ||
    error.message?.includes('494') ||
    error.message?.includes('header') ||
    window.location.href.includes('494') ||
    document.title?.includes('494');

  if (isHeaderSizeError) {
    return (
      <html>
        <body>
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Cookie className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Request Headers Too Large
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Your session tokens have accumulated and need to be cleared
              </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">
                    What happened?
                  </h3>
                  <p className="text-sm text-amber-700">
                    Your browser has too many session cookies, causing request headers to exceed the size limit. 
                    This commonly happens when session tokens become fragmented.
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/clear-session"
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Cookie className="w-4 h-4 mr-2" />
                    Clear Session Tokens
                  </Link>
                  
                  <button
                    onClick={() => {
                      // Try to clear cookies client-side as fallback
                      document.cookie.split(";").forEach((c) => {
                        const eqPos = c.indexOf("=");
                        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                        if (name.trim().includes('authjs') || name.trim().includes('session-token')) {
                          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
                          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                        }
                      });
                      window.location.reload();
                    }}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Quick Fix & Reload
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Or open in{" "}
                      <a 
                        href={window.location.origin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Incognito/Private mode
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Default error handling for other errors
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We encountered an unexpected error. Please try again.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <button
                  onClick={reset}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <Link
                  href="/"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <summary className="text-sm font-medium text-gray-900 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                    {error.digest && `\n\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 