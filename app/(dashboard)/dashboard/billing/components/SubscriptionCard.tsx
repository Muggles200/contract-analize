'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  Settings
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripePriceId: string;
}

interface Usage {
  contractsThisMonth: number;
  contractsLimit: number;
  remainingContracts: number;
  plan: string;
}

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionRes, usageRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/usage')
      ]);

      if (subscriptionRes.ok) {
        const data = await subscriptionRes.json();
        setSubscription(data.subscription);
        setUsage(data.usage);
      } else {
        setError('Failed to fetch subscription data');
      }
    } catch (err) {
      setError('Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to create portal session:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trialing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'trialing':
        return 'text-yellow-600 bg-yellow-50';
      case 'past_due':
        return 'text-red-600 bg-red-50';
      case 'canceled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'Free Plan';
      case 'basic':
        return 'Basic Plan';
      case 'pro':
        return 'Pro Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      default:
        return 'Unknown Plan';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Subscription
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubscriptionData}
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
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Current Subscription
            </h2>
            <p className="text-gray-600">
              {subscription ? 'Active subscription' : 'No active subscription'}
            </p>
          </div>
        </div>
        {subscription && (
          <button
            onClick={handleManageSubscription}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Settings className="h-4 w-4" />
            <span>Manage</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </div>

      {subscription ? (
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">
                {getPlanDisplayName(subscription.plan)}
              </h3>
              <p className="text-gray-600">
                {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Active subscription'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(subscription.status)}
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Billing Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Current Period</p>
                <p className="font-medium text-gray-900">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="font-medium text-gray-900">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {/* Usage Info */}
          {usage && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Usage This Month</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {usage.contractsThisMonth} of {usage.contractsLimit === -1 ? '∞' : usage.contractsLimit} contracts
                </span>
                <span className="text-sm text-gray-500">
                  {usage.remainingContracts === -1 ? 'Unlimited' : `${usage.remainingContracts} remaining`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${usage.contractsLimit === -1 ? 0 : Math.min(100, (usage.contractsThisMonth / usage.contractsLimit) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 mb-6">
            You're currently on the free plan. Upgrade to unlock more features.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            View Plans
          </button>
        </div>
      )}
    </div>
  );
} 