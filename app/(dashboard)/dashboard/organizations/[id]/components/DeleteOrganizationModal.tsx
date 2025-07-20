'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2, Building } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    role: string;
    joinedAt: string;
  }>;
  _count: {
    contracts: number;
    analysisResults: number;
  };
}

interface DeleteOrganizationModalProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteOrganizationModal({
  organization,
  isOpen,
  onClose,
  onConfirm,
}: DeleteOrganizationModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (confirmationText !== organization.name) {
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting organization:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
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
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Organization
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Warning Message */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </span>
                </div>
                <p className="mt-2 text-sm text-red-700">
                  Deleting this organization will permanently remove all associated data including contracts, analyses, and member information.
                </p>
              </div>

              {/* Organization Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                {organization.logoUrl ? (
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{organization.name}</h4>
                  <p className="text-sm text-gray-600">
                    {organization.members.length} member{organization.members.length !== 1 ? 's' : ''} • {organization._count.contracts} contracts • {organization._count.analysisResults} analyses
                  </p>
                </div>
              </div>

              {/* What will be deleted */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">The following will be permanently deleted:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All organization contracts and files</li>
                  <li>• All analysis results and reports</li>
                  <li>• All member associations</li>
                  <li>• Organization settings and configurations</li>
                  <li>• Billing and subscription information</li>
                  <li>• Activity logs and audit trails</li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div>
                <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  To confirm deletion, type the organization name: <span className="font-semibold text-gray-900">{organization.name}</span>
                </label>
                <input
                  type="text"
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Enter organization name to confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  disabled={isDeleting}
                />
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmationText !== organization.name || isDeleting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Organization
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
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