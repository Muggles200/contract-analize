'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Download, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Brain
} from 'lucide-react';

interface UserMembership {
  role: string;
  permissions: string[];
}

interface BillingInfoProps {
  organizationId: string;
  userMembership: UserMembership | null;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripePriceId: string;
  stripeSubscriptionId: string;
}

interface Usage {
  contracts: number;
  analyses: number;
  members: number;
  storage: number;
  currentPeriod: {
    start: string;
    end: string;
  };
}

export default function BillingInfo({ organizationId, userMembership }: BillingInfoProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManageBilling = userMembership?.role === 'owner' || userMembership?.role === 'admin';

  useEffect(() => {
    fetchBillingInfo();
  }, [organizationId]);

  const fetchBillingInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch subscription info
      const subscriptionResponse = await fetch(`/api/billing/subscription?organizationId=${organizationId}`);
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setSubscription(subscriptionData);
      }

      // Fetch usage info
      const usageResponse = await fetch(`/api/billing/usage?organizationId=${organizationId}`);
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
      setError('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'incomplete':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'past_due':
        return <AlertTriangle className="w-4 h-4" />;
      case 'canceled':
        return <AlertTriangle className="w-4 h-4" />;
      case 'incomplete':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      alert('Failed to open billing portal');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-200 rounded-lg h-64"></div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
        {canManageBilling && subscription && (
          <button
            onClick={handleManageBilling}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage Billing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {getStatusIcon(subscription.status)}
                  <span className="capitalize">{subscription.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Period</span>
                <span className="text-sm text-gray-900">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Subscription will cancel at the end of the current period
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleManageBilling}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Subscription
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Subscription</h3>
              <p className="mt-1 text-sm text-gray-500">
                This organization doesn't have an active subscription.
              </p>
              {canManageBilling && (
                <div className="mt-4">
                  <button
                    onClick={handleManageBilling}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Usage Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Usage</h3>
          </div>

          {usage ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{usage.contracts}</p>
                      <p className="text-sm text-gray-600">Contracts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{usage.analyses}</p>
                      <p className="text-sm text-gray-600">Analyses</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{usage.members}</p>
                      <p className="text-sm text-gray-600">Members</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{usage.storage}GB</p>
                      <p className="text-sm text-gray-600">Storage</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Period</span>
                  <span className="text-gray-900">
                    {formatDate(usage.currentPeriod.start)} - {formatDate(usage.currentPeriod.end)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Usage Data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Usage information is not available.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      {subscription && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
            <button
              onClick={handleManageBilling}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoices
            </button>
          </div>
          
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Billing History</h3>
            <p className="mt-1 text-sm text-gray-500">
              Billing history will appear here once you have invoices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 