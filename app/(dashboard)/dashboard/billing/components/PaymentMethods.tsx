'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/payment-methods');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      setError('Failed to fetch payment methods');
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setIsProcessing(true);
      
      // Create setup intent
      const setupResponse = await fetch('/api/billing/payment-methods/setup-intent', {
        method: 'POST',
      });
      
      if (!setupResponse.ok) {
        throw new Error('Failed to create setup intent');
      }
      
      const { clientSecret } = await setupResponse.json();
      
      // Redirect to Stripe's payment method setup
      // In a real implementation, you would use Stripe Elements here
      // For now, we'll redirect to the customer portal
      const portalResponse = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });
      
      if (portalResponse.ok) {
        const { url } = await portalResponse.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (err) {
      toast.error('Failed to add payment method');
      console.error('Error adding payment method:', err);
    } finally {
      setIsProcessing(false);
      setShowAddForm(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setAsDefault: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
      
      // Refresh payment methods to get updated data
      await fetchPaymentMethods();
      toast.success('Default payment method updated');
    } catch (err) {
      toast.error('Failed to set default payment method');
      console.error('Error setting default payment method:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }
      
      // Refresh payment methods
      await fetchPaymentMethods();
      toast.success('Payment method deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete payment method');
      console.error('Error deleting payment method:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPaymentMethod = async (paymentMethodId: string) => {
    try {
      // Redirect to Stripe customer portal for editing
      const portalResponse = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });
      
      if (portalResponse.ok) {
        const { url } = await portalResponse.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (err) {
      toast.error('Failed to edit payment method');
      console.error('Error editing payment method:', err);
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading payment methods...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">
            Manage your payment methods for automatic billing
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isProcessing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h4>
          <p className="text-gray-600 mb-4">
            Add a payment method to enable automatic billing for your subscription.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((paymentMethod) => (
            <div
              key={paymentMethod.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getCardIcon(paymentMethod.brand)}</div>
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
                    disabled={isProcessing}
                    className="text-blue-600 hover:text-blue-700 p-1 disabled:opacity-50"
                    title="Set as default"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleEditPaymentMethod(paymentMethod.id)}
                  disabled={isProcessing}
                  className="text-gray-600 hover:text-gray-700 p-1 disabled:opacity-50"
                  title="Edit payment method"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePaymentMethod(paymentMethod.id)}
                  disabled={isProcessing}
                  className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                  title="Delete payment method"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  You'll be redirected to Stripe's secure payment method setup.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPaymentMethod}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Continue to Stripe'
                    )}
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
          <Lock className="h-4 w-4" />
          <span>
            Payment methods are securely stored by Stripe and never stored on our servers.
          </span>
        </div>
      </div>
    </div>
  );
} 