'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Trash2, AlertTriangle, Eye, EyeOff, Loader2, Clock, CheckCircle } from 'lucide-react';

export default function AccountDeletion() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmation: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletionStatus, setDeletionStatus] = useState<{
    isScheduledForDeletion: boolean;
    deletionDate?: string;
    daysRemaining?: number;
    reason?: string;
    status?: string;
    canRecover?: boolean;
  } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Check account deletion status on component mount
  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        const response = await fetch('/api/user/account');
        if (response.ok) {
          const data = await response.json();
          setDeletionStatus(data);
        }
      } catch (error) {
        console.error('Error checking deletion status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    checkDeletionStatus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (formData.confirmation !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password,
          confirmation: formData.confirmation,
          reason: 'User requested account deletion',
          exportData: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Account scheduled for deletion. You have ${data.gracePeriodDays} days to recover your account if this was a mistake. Redirecting...` 
        });
        
        // Sign out and redirect after a short delay
        setTimeout(() => {
          signOut({ callbackUrl: '/auth/login?message=account_deletion_scheduled' });
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to schedule account deletion' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while scheduling account deletion' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking deletion status
  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Checking account status...</span>
      </div>
    );
  }

  // Show account deletion status if scheduled
  if (deletionStatus?.isScheduledForDeletion) {
    return (
      <div className="space-y-6">
        {/* Account Scheduled for Deletion */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900">
                Account Scheduled for Deletion
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account is scheduled to be deleted on {new Date(deletionStatus.deletionDate!).toLocaleDateString()}. 
                You have {deletionStatus.daysRemaining} days remaining to recover your account.
              </p>
            </div>
          </div>
        </div>

        {/* Recovery Options */}
        {deletionStatus.canRecover && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-900">
                  Account Recovery Available
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  You can still recover your account during the grace period. 
                  Contact support or use the recovery link sent to your email.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Deletion Details:
          </h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Scheduled Date:</strong> {new Date(deletionStatus.deletionDate!).toLocaleString()}</p>
            <p><strong>Days Remaining:</strong> {deletionStatus.daysRemaining}</p>
            <p><strong>Status:</strong> {deletionStatus.status}</p>
            {deletionStatus.reason && (
              <p><strong>Reason:</strong> {deletionStatus.reason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Message */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-900">
              Delete Account
            </h3>
            <p className="text-sm text-red-700 mt-1">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
          </div>
        </div>
      </div>

      {/* What will be deleted */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          What will be deleted:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• All your contracts and analysis results</li>
          <li>• Your profile information and settings</li>
          <li>• All organization memberships</li>
          <li>• Billing and subscription data</li>
          <li>• Usage history and analytics</li>
        </ul>
      </div>

      {/* Delete Account Form */}
      {!showConfirmation ? (
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete My Account
        </button>
      ) : (
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          {/* Password Confirmation */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="block w-full pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmation Text */}
          <div>
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              id="confirmation"
              name="confirmation"
              value={formData.confirmation}
              onChange={handleInputChange}
              required
              className="block w-full py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Type DELETE"
            />
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowConfirmation(false);
                setFormData({ password: '', confirmation: '' });
                setMessage(null);
              }}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.confirmation !== 'DELETE' || !formData.password}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete Account
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 