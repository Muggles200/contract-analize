'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Upload, Brain, FileText, Clock } from 'lucide-react';

interface UsageStat {
  action: string;
  _count: {
    action: number;
  };
}

interface UsageMetricsProps {
  usageStats: UsageStat[];
}

const getActionLabel = (action: string) => {
  switch (action) {
    case 'contract_upload':
      return 'Uploads';
    case 'analysis_started':
      return 'Analyses';
    case 'contract_view':
      return 'Views';
    case 'analysis_view':
      return 'Analysis Views';
    default:
      return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'contract_upload':
      return <Upload className="w-4 h-4" />;
    case 'analysis_started':
      return <Brain className="w-4 h-4" />;
    case 'contract_view':
      return <FileText className="w-4 h-4" />;
    case 'analysis_view':
      return <Brain className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function UsageMetrics({ usageStats }: UsageMetricsProps) {
  // Prepare data for chart
  const chartData = usageStats.map(stat => ({
    name: getActionLabel(stat.action),
    value: stat._count.action,
    action: stat.action
  }));

  const totalUsage = usageStats.reduce((sum, stat) => sum + stat._count.action, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Usage Metrics</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>This Month</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {usageStats.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No usage data yet</p>
            <p className="text-sm">Start using the platform to see your metrics</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total Actions</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">{totalUsage}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Analyses</span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {usageStats.find(stat => stat.action === 'analysis_started')?._count.action || 0}
                </p>
              </div>
            </div>

            {/* Usage Breakdown */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-gray-900">Activity Breakdown</h3>
              {usageStats.map((stat) => (
                <div key={stat.action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      {getActionIcon(stat.action)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getActionLabel(stat.action)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stat._count.action}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Usage Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tick={{ fill: '#6B7280' }}
                      />
                      <YAxis 
                        fontSize={12}
                        tick={{ fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 