'use client';

import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Calendar,
  Activity,
  Upload,
  Brain,
  Eye,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeSeriesData {
  [date: string]: {
    [action: string]: number;
  };
}

interface TimeSeriesChartsProps {
  data: TimeSeriesData;
  period: string;
}

export default function TimeSeriesCharts({ data, period }: TimeSeriesChartsProps) {
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'contract_upload':
        return 'Uploads';
      case 'analysis_started':
        return 'Analyses Started';
      case 'analysis_completed':
        return 'Analyses Completed';
      case 'analysis_failed':
        return 'Analyses Failed';
      case 'contract_viewed':
        return 'Contract Views';
      case 'export_generated':
        return 'Exports';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'contract_upload':
        return '#3B82F6';
      case 'analysis_started':
        return '#10B981';
      case 'analysis_completed':
        return '#059669';
      case 'analysis_failed':
        return '#EF4444';
      case 'contract_viewed':
        return '#F59E0B';
      case 'export_generated':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'contract_upload':
        return <Upload className="w-4 h-4" />;
      case 'analysis_started':
        return <Brain className="w-4 h-4" />;
      case 'analysis_completed':
        return <Activity className="w-4 h-4" />;
      case 'analysis_failed':
        return <Activity className="w-4 h-4" />;
      case 'contract_viewed':
        return <Eye className="w-4 h-4" />;
      case 'export_generated':
        return <Download className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Process data for charts
  const processChartData = () => {
    const dates = Object.keys(data).sort();
    const allActions = new Set<string>();
    
    // Collect all unique actions
    Object.values(data).forEach(dayData => {
      Object.keys(dayData).forEach(action => allActions.add(action));
    });

    const chartData = dates.map(date => {
      const dayData: any = { date };
      allActions.forEach(action => {
        dayData[action] = data[date]?.[action] || 0;
      });
      return dayData;
    });

    return { chartData, actions: Array.from(allActions) };
  };

  const { chartData, actions } = processChartData();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {getActionLabel(entry.dataKey)}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-3 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600">
            {getActionLabel(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Usage Trends</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <LineChartIcon className="w-4 h-4" />
              <span>Time Series</span>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <LineChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No usage data available</p>
          <p className="text-sm text-gray-400">Start using the platform to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Usage Trends</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <LineChartIcon className="w-4 h-4" />
            <span>Time Series</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Main Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {actions.map((action, index) => (
                <Line
                  key={action}
                  type="monotone"
                  dataKey={action}
                  stroke={getActionColor(action)}
                  strokeWidth={2}
                  dot={{ fill: getActionColor(action), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.slice(0, 4).map((action, index) => {
            const total = chartData.reduce((sum, day) => sum + (day[action] || 0), 0);
            const avg = chartData.length > 0 ? total / chartData.length : 0;
            
            return (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${getActionColor(action)}20` }}
                  >
                    {getActionIcon(action)}
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{total}</p>
                <p className="text-sm text-gray-600">{getActionLabel(action)}</p>
                <p className="text-xs text-gray-500">
                  Avg: {avg.toFixed(1)}/day
                </p>
              </div>
            );
          })}
        </div>

        {/* Trend Indicators */}
        {actions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Trend Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actions.slice(0, 4).map((action, index) => {
                const values = chartData.map(day => day[action] || 0);
                const firstHalf = values.slice(0, Math.floor(values.length / 2));
                const secondHalf = values.slice(Math.floor(values.length / 2));
                const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
                const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
                const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${getActionColor(action)}20` }}
                      >
                        {getActionIcon(action)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getActionLabel(action)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      trend === 'up' ? 'text-green-600' : 
                      trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 