'use client';

import { useState } from 'react';
import { X, UserPlus, Mail, Shield, User } from 'lucide-react';

interface InviteMemberModalProps {
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteMemberModal({
  organizationId,
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = [
    {
      value: 'member',
      label: 'Member',
      description: 'Can view and contribute to organization resources',
      icon: User,
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage members and organization settings',
      icon: Shield,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite member');
      }

      // Reset form
      setFormData({ email: '', role: 'member' });
      onSuccess();
    } catch (error) {
      console.error('Error inviting member:', error);
      setError(error instanceof Error ? error.message : 'Failed to invite member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ email: '', role: 'member' });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Invite Member
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Role
                </label>
                <div className="space-y-2">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.role === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={formData.role === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          className="sr-only"
                          disabled={isSubmitting}
                        />
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${
                            formData.role === option.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.description}
                            </div>
                          </div>
                          {formData.role === option.value && (
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.email.trim()}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Inviting...' : 'Send Invitation'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 