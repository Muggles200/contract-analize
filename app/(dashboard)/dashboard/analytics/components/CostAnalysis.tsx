'use client';

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface CostAnalysisProps {
  data: {
    _sum: {
      estimatedCost: number | null;
      tokensUsed: number | null;
    };
    _avg: {
      estimatedCost: number | null;
    };
    _count: {
      id: number;
    };
  };
  period: string;
}

export default function CostAnalysis({ data, period }: CostAnalysisProps) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return '0';
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'Last 7 Days';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  const getCostEfficiency = (avgCost: number | null, totalAnalyses: number) => {
    if (!avgCost || totalAnalyses === 0) return 'unknown';
    if (avgCost < 0.01) return 'excellent';
    if (avgCost < 0.05) return 'good';
    if (avgCost < 0.10) return 'fair';
    return 'poor';
  };

  const costEfficiency = getCostEfficiency(data._avg.estimatedCost, data._count.id);

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEfficiencyIcon = (efficiency: string) => {
    switch (efficiency) {
      case 'excellent':
        return <TrendingUp className="w-4 h-4" />;
      case 'good':
        return <Target className="w-4 h-4" />;
      case 'fair':
        return <Activity className="w-4 h-4" />;
      case 'poor':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const totalCost = data._sum.estimatedCost || 0;
  const totalTokens = data._sum.tokensUsed || 0;
  const avgCost = data._avg.estimatedCost || 0;
  const totalAnalyses = data._count.id;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cost Analysis</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <DollarSign className="w-4 h-4" />
            <span>AI Analysis Costs</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-gray-900">Cost Overview</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Cost</span>
                <span className="text-sm text-blue-600">
                  {formatCurrency(avgCost)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Analyses</span>
                <span className="text-sm text-gray-900">
                  {totalAnalyses}
                </span>
              </div>
            </div>

            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(costEfficiency)}`}>
              {getEfficiencyIcon(costEfficiency)}
              <span className="ml-1 capitalize">{costEfficiency} efficiency</span>
            </div>
          </div>

          {/* Token Usage */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-900">Token Usage</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Tokens</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatTokens(totalTokens)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg per Analysis</span>
                <span className="text-sm text-blue-600">
                  {totalAnalyses > 0 ? formatTokens(totalTokens / totalAnalyses) : '0'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost per 1K Tokens</span>
                <span className="text-sm text-gray-900">
                  {totalTokens > 0 ? formatCurrency((totalCost / totalTokens) * 1000) : '$0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Analysis Processing</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(totalCost * 0.8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Text Extraction</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(totalCost * 0.15)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage & Processing</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(totalCost * 0.05)}
              </span>
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">{getPeriodLabel()}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Cost</p>
          </div>
        </div>
      </div>
    </div>
  );
} 