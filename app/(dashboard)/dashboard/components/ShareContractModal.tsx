'use client';

import { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Mail, 
  Link, 
  Users, 
  Lock, 
  Globe,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface Contract {
  id: string;
  fileName: string;
  contractName?: string | null;
  contractType?: string | null;
  fileSize: number;
  fileType: string;
  blobUrl: string;
  status: string;
  tags: string[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface ShareContractModalProps {
  contract: Contract;
  onClose: () => void;
}

export default function ShareContractModal({ contract, onClose }: ShareContractModalProps) {
  const [shareType, setShareType] = useState<'link' | 'email'>('link');
  const [emailAddresses, setEmailAddresses] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [permissions, setPermissions] = useState<'view' | 'edit' | 'admin'>('view');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const contractUrl = `${window.location.origin}/dashboard/contracts/${contract.id}`;
  const shareableUrl = isPublic ? contractUrl : `${contractUrl}?token=${generateToken()}`;

  function generateToken() {
    // In a real implementation, this would generate a secure token
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareViaEmail = async () => {
    if (!emailAddresses.trim()) {
      toast.error('Please enter email addresses');
      return;
    }

    const emails = emailAddresses.split(',').map(email => email.trim()).filter(email => email);
    
    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real implementation, this would send emails via your backend
      const response = await fetch('/api/contracts/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract.id,
          emails,
          message: shareMessage,
          permissions,
          shareableUrl,
        }),
      });

      if (response.ok) {
        toast.success(`Contract shared with ${emails.length} recipient${emails.length > 1 ? 's' : ''}`);
        onClose();
      } else {
        throw new Error('Failed to share contract');
      }
    } catch (error) {
      toast.error('Failed to share contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePublicLink = async () => {
    setIsSubmitting(true);
    try {
      // In a real implementation, this would update the contract's sharing settings
      const response = await fetch(`/api/contracts/${contract.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic,
          permissions,
        }),
      });

      if (response.ok) {
        toast.success(isPublic ? 'Public link generated' : 'Public link disabled');
      } else {
        throw new Error('Failed to update sharing settings');
      }
    } catch (error) {
      toast.error('Failed to update sharing settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Contract
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contract Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sharing Contract</h3>
            <p className="text-sm text-gray-900 font-medium">
              {contract.contractName || contract.fileName}
            </p>
            <p className="text-sm text-gray-500">
              {contract.contractType ? contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1) : 'Contract'} • Uploaded {new Date(contract.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Share Type Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setShareType('link')}
                className={`inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  shareType === 'link'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Link className="w-4 h-4 mr-2" />
                Share Link
              </button>
              <button
                onClick={() => setShareType('email')}
                className={`inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  shareType === 'email'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </button>
            </nav>
          </div>

          {/* Share Link Tab */}
          {shareType === 'link' && (
            <div className="space-y-4">
              {/* Public/Private Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isPublic ? 'Public Link' : 'Private Link'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isPublic 
                        ? 'Anyone with the link can view this contract' 
                        : 'Only people with the specific link can view this contract'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <select
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value as 'view' | 'edit' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="view">View only</option>
                  <option value="edit">Can edit</option>
                  <option value="admin">Full access</option>
                </select>
              </div>

              {/* Generated Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareableUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGeneratePublicLink}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    {isPublic ? 'Update Public Link' : 'Generate Public Link'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Share via Email Tab */}
          {shareType === 'email' && (
            <div className="space-y-4">
              {/* Email Addresses */}
              <div>
                <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses *
                </label>
                <textarea
                  id="emails"
                  value={emailAddresses}
                  onChange={(e) => setEmailAddresses(e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate multiple email addresses with commas
                </p>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <select
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value as 'view' | 'edit' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="view">View only</option>
                  <option value="edit">Can edit</option>
                  <option value="admin">Full access</option>
                </select>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShareViaEmail}
                disabled={isSubmitting || !emailAddresses.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Be careful when sharing contracts. Recipients will have access to view and potentially edit the contract based on the permissions you set.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 