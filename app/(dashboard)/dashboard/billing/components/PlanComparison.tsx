'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Zap, 
  Users, 
  Shield, 
  Star,
  ArrowRight,
  Crown,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  limits: {
    contracts: number;
    users: number;
    storage: string;
  };
  popular?: boolean;
  recommended?: boolean;
}

interface CurrentSubscription {
  plan: string;
  status: string;
  cancelAtPeriodEnd: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '2 contract analyses per month',
      'Basic AI analysis',
      'Standard support',
      'PDF export'
    ],
    limits: {
      contracts: 2,
      users: 1,
      storage: '100MB'
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    interval: 'month',
    features: [
      '10 contract analyses per month',
      'Advanced AI analysis',
      'Priority support',
      'PDF & Word export',
      'Email notifications',
      'Basic analytics'
    ],
    limits: {
      contracts: 10,
      users: 1,
      storage: '1GB'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    features: [
      '50 contract analyses per month',
      'Advanced AI analysis',
      'Priority support',
      'All export formats',
      'Advanced analytics',
      'Team collaboration',
      'Custom branding',
      'API access'
    ],
    limits: {
      contracts: 50,
      users: 5,
      storage: '10GB'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited contract analyses',
      'Advanced AI analysis',
      '24/7 priority support',
      'All export formats',
      'Advanced analytics',
      'Unlimited team members',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee'
    ],
    limits: {
      contracts: -1, // Unlimited
      users: -1, // Unlimited
      storage: '100GB'
    },
    recommended: true
  }
];

export default function PlanComparison() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [usageData, setUsageData] = useState<any>(null);

  useEffect(() => {
    fetchCurrentSubscription();
    fetchUsageData();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/billing/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: `price_${planId}_monthly`,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDowngrade = async (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDowngradeModal(true);
  };

  const confirmDowngrade = async () => {
    if (!selectedPlan) return;
    
    setLoading(selectedPlan.id);
    try {
      // In a real implementation, you would call Stripe API to change subscription
      const response = await fetch('/api/billing/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id
        })
      });

      if (response.ok) {
        setShowDowngradeModal(false);
        setSelectedPlan(null);
        // Refresh subscription data
        fetchCurrentSubscription();
      } else {
        console.error('Failed to downgrade plan');
      }
    } catch (error) {
      console.error('Error downgrading plan:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        fetchCurrentSubscription();
      } else {
        console.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      const response = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        fetchCurrentSubscription();
      } else {
        console.error('Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}/${plans[0].interval}`;
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    return limit.toString();
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan === planId;
  };

  const canDowngrade = (planId: string) => {
    if (!currentSubscription) return false;
    if (currentSubscription.plan === 'free') return false;
    
    const currentPlanIndex = plans.findIndex(p => p.id === currentSubscription.plan);
    const targetPlanIndex = plans.findIndex(p => p.id === planId);
    
    return targetPlanIndex < currentPlanIndex;
  };

  const getUsagePercentage = (planId: string) => {
    if (!usageData?.currentPeriod) return 0;
    
    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.limits.contracts === -1) return 0;
    
    return Math.min(100, (usageData.currentPeriod.contractsAnalyzed / plan.limits.contracts) * 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that best fits your contract analysis needs
        </p>
      </div>

      {/* Current Plan Notice */}
      {currentSubscription && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Current Plan:</strong> {plans.find(p => p.id === currentSubscription.plan)?.name || 'Unknown'}
                {currentSubscription.cancelAtPeriodEnd && (
                  <span className="ml-2 text-orange-600">
                    (Cancels at period end)
                  </span>
                )}
              </p>
              {currentSubscription.cancelAtPeriodEnd && (
                <button
                  onClick={handleReactivateSubscription}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Reactivate subscription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-6 ${
              isCurrentPlan(plan.id)
                ? 'border-green-500 bg-green-50' 
                : plan.popular 
                ? 'border-blue-500 bg-blue-50' 
                : plan.recommended
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Plan Badge */}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}
            {plan.popular && !isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            {plan.recommended && !isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Recommended
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {plan.id === 'enterprise' && <Crown className="h-5 w-5 text-purple-500" />}
                {plan.id === 'pro' && <Star className="h-5 w-5 text-blue-500" />}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Contract Analyses</span>
                <span className="font-medium text-gray-900">
                  {formatLimit(plan.limits.contracts)}/month
                </span>
              </div>
              {usageData && plan.limits.contracts !== -1 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Usage</span>
                    <span className="text-gray-500">
                      {usageData.currentPeriod.contractsAnalyzed} / {plan.limits.contracts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        getUsagePercentage(plan.id) > 80 ? 'bg-red-500' : 
                        getUsagePercentage(plan.id) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getUsagePercentage(plan.id)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Team Members</span>
                <span className="font-medium text-gray-900">
                  {formatLimit(plan.limits.users)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium text-gray-900">
                  {plan.limits.storage}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {plan.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
              {plan.features.length > 4 && (
                <div className="text-sm text-gray-500">
                  +{plan.features.length - 4} more features
                </div>
              )}
            </div>

            {/* CTA Button */}
            {isCurrentPlan(plan.id) ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
                {currentSubscription?.plan !== 'free' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full py-2 px-4 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => canDowngrade(plan.id) ? handleDowngrade(plan) : handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    canDowngrade(plan.id)
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.recommended
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {canDowngrade(plan.id) ? 'Downgrade' : 'Upgrade'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Downgrade
              </h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                You're about to downgrade to the <strong>{selectedPlan.name}</strong> plan. 
                This change will take effect at the end of your current billing period.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You may lose access to some features when you downgrade.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDowngradeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDowngrade}
                  disabled={loading === selectedPlan.id}
                  className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {loading === selectedPlan.id ? 'Processing...' : 'Confirm Downgrade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-4">
          All plans include secure data storage and GDPR compliance
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Secure & Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Fast Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Team Support</span>
          </div>
        </div>
      </div>
    </div>
  );
} 