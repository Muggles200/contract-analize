'use client';

import { useState } from 'react';
import { Mail, Shield, User, UserPlus } from 'lucide-react';

interface InviteFormProps {
  organizationId: string;
  onSubmit: (data: { email: string; role: string }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  className?: string;
}

export default function InviteForm({
  organizationId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
  className = ''
}: InviteFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
  });

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
      return;
    }

    try {
      await onSubmit({
        email: formData.email.trim(),
        role: formData.role,
      });
      
      // Reset form on success
      setFormData({ email: '', role: 'member' });
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleCancel = () => {
    setFormData({ email: '', role: 'member' });
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">
          Invite Member
        </h3>
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

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.email.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Inviting...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 