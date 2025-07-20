'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, FileText, DollarSign, Clock } from 'lucide-react';

interface UsageData {
  currentPeriod: {
    contractsAnalyzed: number;
    totalCost: number;
    averageProcessingTime: number;
    period: string;
  };
  history: Array<{
    month: string;
    contractsAnalyzed: number;
    totalCost: number;
  }>;
}

export default function UsageMeter() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/billing/usage?period=month');
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      } else {
        setError('Failed to fetch usage data');
      }
    } catch (err) {
      setError('Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Usage Data Unavailable
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsageData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Usage Data
          </h3>
          <p className="text-gray-600">
            Start analyzing contracts to see your usage statistics.
          </p>
        </div>
      </div>
    );
  }

  const { currentPeriod } = usageData;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Usage This Month
          </h3>
          <p className="text-sm text-gray-600">
            {currentPeriod.period} statistics
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contracts Analyzed */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Contracts Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPeriod.contractsAnalyzed}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">This month</div>
            <div className="text-lg font-semibold text-blue-600">
              {currentPeriod.contractsAnalyzed > 0 ? 'Active' : 'No activity'}
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentPeriod.totalCost)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">This month</div>
            <div className="text-lg font-semibold text-green-600">
              {currentPeriod.totalCost > 0 ? 'Billed' : 'No charges'}
            </div>
          </div>
        </div>

        {/* Average Processing Time */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(currentPeriod.averageProcessingTime)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Per contract</div>
            <div className="text-lg font-semibold text-yellow-600">
              {currentPeriod.averageProcessingTime < 60 ? 'Fast' : 'Standard'}
            </div>
          </div>
        </div>

        {/* Usage Trend */}
        {usageData.history.length > 1 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Usage Trend</h4>
            <div className="space-y-2">
              {usageData.history.slice(-3).reverse().map((month, index) => (
                <div key={`${month.month}-${index}`} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {month.contractsAnalyzed} contracts
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(month.totalCost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 