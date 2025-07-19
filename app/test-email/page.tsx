'use client';
import { useState } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [testType, setTestType] = useState<'basic' | 'verification' | 'welcome'>('basic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      setConfigStatus({ error: 'Failed to check configuration' });
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      setResult({ error: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, testType }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to send test email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Test</h1>
            <p className="text-gray-600">Test your email sending configuration</p>
          </div>

          {/* Configuration Status */}
          <div className="mb-6">
            <button
              onClick={checkConfiguration}
              className="w-full mb-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Check Configuration
            </button>
            
            {configStatus && (
              <div className={`p-4 rounded-lg text-sm ${
                configStatus.configured 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="font-medium">
                  {configStatus.configured ? '✅ Configured' : '❌ Not Configured'}
                </div>
                <div className="mt-1">{configStatus.message}</div>
                {configStatus.apiKeyPrefix && (
                  <div className="mt-1">API Key: {configStatus.apiKeyPrefix}...</div>
                )}
              </div>
            )}
          </div>

          {/* Test Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                id="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="basic">Basic Test</option>
                <option value="verification">Verification Email</option>
                <option value="welcome">Welcome Email</option>
              </select>
            </div>

            <button
              onClick={sendTestEmail}
              disabled={loading || !email}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                'Send Test Email'
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6">
              <div className={`p-4 rounded-lg ${
                result.error 
                  ? 'bg-red-50 text-red-800 border border-red-200' 
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}>
                <div className="font-medium">
                  {result.error ? '❌ Error' : '✅ Success'}
                </div>
                <div className="mt-1">
                  {result.error || result.message}
                </div>
                {result.emailId && (
                  <div className="mt-2 text-xs">
                    Email ID: {result.emailId}
                  </div>
                )}
                {result.sentTo && (
                  <div className="mt-1 text-xs">
                    Sent to: {result.sentTo}
                  </div>
                )}
                {result.timestamp && (
                  <div className="mt-1 text-xs">
                    Sent at: {new Date(result.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Check your configuration first</li>
              <li>Enter your email address</li>
              <li>Select a test type</li>
              <li>Click "Send Test Email"</li>
              <li>Check your inbox for the test email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 