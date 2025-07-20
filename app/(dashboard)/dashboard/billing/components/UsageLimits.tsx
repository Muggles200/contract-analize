'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  FileText,
  Users,
  HardDrive,
  Info
} from 'lucide-react';

interface UsageData {
  currentPeriod: {
    contractsAnalyzed: number;
    totalCost: number;
    averageProcessingTime: number;
    period: string;
  };
}

interface Subscription {
  plan: string;
  status: string;
  cancelAtPeriodEnd: boolean;
}

interface UsageLimits {
  contracts: number;
  users: number;
  storage: string;
}

const planLimits: Record<string, UsageLimits> = {
  free: {
    contracts: 2,
    users: 1,
    storage: '100MB'
  },
  basic: {
    contracts: 10,
    users: 1,
    storage: '1GB'
  },
  pro: {
    contracts: 50,
    users: 5,
    storage: '10GB'
  },
  enterprise: {
    contracts: -1, // Unlimited
    users: -1, // Unlimited
    storage: '100GB'
  }
};

export default function UsageLimits() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usageRes, subscriptionRes] = await Promise.all([
        fetch('/api/billing/usage'),
        fetch('/api/billing/subscription')
      ]);

      if (usageRes.ok) {
        const usage = await usageRes.json();
        setUsageData(usage);
      }

      if (subscriptionRes.ok) {
        const sub = await subscriptionRes.json();
        setSubscription(sub.subscription);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLimits = (): UsageLimits => {
    if (!subscription) return planLimits.free;
    return planLimits[subscription.plan] || planLimits.free;
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(100, (used / limit) * 100);
  };

  const getUsageStatus = (percentage: number): 'good' | 'warning' | 'critical' => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const formatLimit = (limit: number): string => {
    if (limit === -1) return 'Unlimited';
    return limit.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const limits = getCurrentLimits();
  const contractsUsed = usageData?.currentPeriod.contractsAnalyzed || 0;
  const contractsPercentage = getUsagePercentage(contractsUsed, limits.contracts);
  const contractsStatus = getUsageStatus(contractsPercentage);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Usage Limits
            </h3>
            <p className="text-sm text-gray-600">
              {subscription ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan` : 'Free Plan'}
            </p>
          </div>
        </div>
        {subscription?.cancelAtPeriodEnd && (
          <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            Cancels at period end
          </div>
        )}
      </div>

      {/* Contract Analyses Usage */}
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium text-gray-900">Contract Analyses</h4>
                <p className="text-sm text-gray-600">
                  {contractsUsed} of {formatLimit(limits.contracts)} used this month
                </p>
              </div>
            </div>
            {getStatusIcon(contractsStatus)}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium text-gray-900">
                {contractsUsed} / {formatLimit(limits.contracts)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  contractsStatus === 'critical' ? 'bg-red-500' : 
                  contractsStatus === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${contractsPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {contractsStatus === 'critical' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">
                  You've used {contractsPercentage.toFixed(0)}% of your monthly limit. 
                  Consider upgrading your plan for more analyses.
                </span>
              </div>
            </div>
          )}

          {contractsStatus === 'warning' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  You've used {contractsPercentage.toFixed(0)}% of your monthly limit.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium text-gray-900">Team Members</h4>
                <p className="text-sm text-gray-600">
                  {formatLimit(limits.users)} allowed
                </p>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="text-sm text-gray-600">
            {limits.users === -1 ? (
              <span className="text-green-600 font-medium">Unlimited team members</span>
            ) : (
              <span>Up to {limits.users} team member{limits.users !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Storage */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium text-gray-900">Storage</h4>
                <p className="text-sm text-gray-600">
                  {limits.storage} available
                </p>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="text-sm text-gray-600">
            Store contracts and analysis results
          </div>
        </div>
      </div>

      {/* Plan Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Plan Details</p>
            <ul className="space-y-1">
              <li>• Usage resets monthly on your billing date</li>
              <li>• Unused analyses don't carry over to next month</li>
              <li>• Upgrade anytime to get more analyses immediately</li>
              {subscription?.cancelAtPeriodEnd && (
                <li className="text-orange-600">• Your subscription will end at the current billing period</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {contractsStatus === 'critical' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Need More Analyses?</h4>
              <p className="text-sm text-blue-700">
                Upgrade your plan to get more contract analyses per month.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard/billing#plans'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              View Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 