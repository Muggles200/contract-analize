'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      // For now, return mock data since Stripe is not fully integrated
      // In a real implementation, you would fetch from Stripe API
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'pm_1234567890',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025,
          isDefault: true
        }
      ];
      
      setPaymentMethods(mockPaymentMethods);
    } catch (err) {
      setError('Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    // In a real implementation, you would redirect to Stripe's payment method setup
    // or open a modal with Stripe Elements
    console.log('Adding payment method');
    setShowAddForm(false);
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      // In a real implementation, you would call Stripe API to set default
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          isDefault: pm.id === paymentMethodId
        }))
      );
    } catch (err) {
      console.error('Failed to set default payment method:', err);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      // In a real implementation, you would call Stripe API to delete
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Payment Methods
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPaymentMethods}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Methods
            </h3>
            <p className="text-sm text-gray-600">
              Manage your payment methods for billing
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg mb-6">
        <Lock className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">
          Your payment information is securely stored and encrypted
        </span>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Payment Methods
          </h3>
          <p className="text-gray-600 mb-6">
            Add a payment method to manage your subscription billing.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((paymentMethod) => (
            <div
              key={paymentMethod.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getCardIcon(paymentMethod.brand)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)} •••• {paymentMethod.last4}
                      </span>
                      {paymentMethod.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Expires {formatExpiry(paymentMethod.expMonth, paymentMethod.expYear)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!paymentMethod.isDefault && (
                    <button
                      onClick={() => handleSetDefault(paymentMethod.id)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Set as default"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => console.log('Edit payment method:', paymentMethod.id)}
                    className="text-gray-600 hover:text-gray-700 p-1"
                    title="Edit payment method"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete payment method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Payment Method Form (Modal-like) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Payment Method
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  In a real implementation, this would integrate with Stripe Elements
                  to securely collect payment information.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPaymentMethod}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Payment methods are securely stored by Stripe and never stored on our servers.
          </span>
        </div>
      </div>
    </div>
  );
} 