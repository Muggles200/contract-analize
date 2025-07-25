'use client';

import { 
  FileText, 
  Brain, 
  TrendingUp, 
  Upload, 
  Activity,
  Users,
  Clock,
  Target
} from 'lucide-react';

interface UsageStat {
  action: string;
  _count: {
    action: number;
  };
}

interface AnalyticsOverviewProps {
  data: {
    totalContracts: number;
    totalAnalyses: number;
    contractsThisPeriod: number;
    analysesThisPeriod: number;
    usageStats: UsageStat[];
    trends?: {
      contracts: { current: number; previous: number; change: number; percentage: number; trend: 'up' | 'down' | 'stable' };
      analyses: { current: number; previous: number; change: number; percentage: number; trend: 'up' | 'down' | 'stable' };
      uploads: { current: number; previous: number; change: number; percentage: number; trend: 'up' | 'down' | 'stable' };
      views: { current: number; previous: number; change: number; percentage: number; trend: 'up' | 'down' | 'stable' };
    };
  };
  period: string;
}

export default function AnalyticsOverview({ data, period }: AnalyticsOverviewProps) {
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'contract_upload':
        return 'Uploads';
      case 'analysis_started':
        return 'Analyses';
      case 'analysis_completed':
        return 'Completed';
      case 'analysis_failed':
        return 'Failed';
      case 'contract_viewed':
        return 'Views';
      case 'export_generated':
        return 'Exports';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
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

  const uploadsThisPeriod = data.usageStats.find(stat => stat.action === 'contract_upload')?._count.action || 0;
  const analysesThisPeriod = data.usageStats.find(stat => stat.action === 'analysis_started')?._count.action || 0;
  const completedAnalyses = data.usageStats.find(stat => stat.action === 'analysis_completed')?._count.action || 0;
  const failedAnalyses = data.usageStats.find(stat => stat.action === 'analysis_failed')?._count.action || 0;

  const successRate = analysesThisPeriod > 0 ? ((completedAnalyses / analysesThisPeriod) * 100).toFixed(1) : '0';

  const getChangeType = (trend?: 'up' | 'down' | 'stable'): 'positive' | 'negative' | 'neutral' => {
    if (!trend) return 'positive';
    return trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral';
  };

  const stats = [
    {
      title: "Total Contracts",
      value: data.totalContracts,
      change: data.trends ? `${data.trends.contracts.trend === 'up' ? '+' : data.trends.contracts.trend === 'down' ? '-' : ''}${Math.abs(data.trends.contracts.percentage)}%` : `+${data.contractsThisPeriod} ${getPeriodLabel()}`,
      changeType: getChangeType(data.trends?.contracts.trend),
      icon: FileText,
      color: "blue",
      description: "All time contracts"
    },
    {
      title: "Total Analyses",
      value: data.totalAnalyses,
      change: data.trends ? `${data.trends.analyses.trend === 'up' ? '+' : data.trends.analyses.trend === 'down' ? '-' : ''}${Math.abs(data.trends.analyses.percentage)}%` : `+${data.analysesThisPeriod} ${getPeriodLabel()}`,
      changeType: getChangeType(data.trends?.analyses.trend),
      icon: Brain,
      color: "green",
      description: "All time analyses"
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      change: `${completedAnalyses} completed`,
      changeType: "positive" as const,
      icon: Target,
      color: "purple",
      description: "Analysis completion rate"
    },
    {
      title: "Activity Level",
      value: uploadsThisPeriod + analysesThisPeriod,
      change: `${getPeriodLabel()}`,
      changeType: "positive" as const,
      icon: Activity,
      color: "orange",
      description: "Total actions this period"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`w-4 h-4 text-${stat.changeType === 'positive' ? 'green' : 'red'}-500 mr-1`} />
              <span className={`text-sm font-medium text-${stat.changeType === 'positive' ? 'green' : 'red'}-600`}>
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
} 