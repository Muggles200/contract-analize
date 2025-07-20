'use client';

import { 
  AlertTriangle, 
  TrendingUp, 
  BarChart3,
  Shield,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskData {
  type: string;
  count: number;
}

interface CommonRisksProps {
  data: RiskData[];
}

export default function CommonRisks({ data }: CommonRisksProps) {
  const formatRiskType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'financial':
        return 'Financial Risk';
      case 'legal':
        return 'Legal Risk';
      case 'operational':
        return 'Operational Risk';
      case 'compliance':
        return 'Compliance Risk';
      case 'reputation':
        return 'Reputation Risk';
      case 'security':
        return 'Security Risk';
      case 'privacy':
        return 'Privacy Risk';
      case 'intellectual_property':
        return 'IP Risk';
      case 'data_protection':
        return 'Data Protection';
      case 'termination':
        return 'Termination Risk';
      case 'liability':
        return 'Liability Risk';
      case 'payment':
        return 'Payment Risk';
      case 'delivery':
        return 'Delivery Risk';
      case 'quality':
        return 'Quality Risk';
      case 'confidentiality':
        return 'Confidentiality';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getRiskColor = (type: string) => {
    const riskType = type.toLowerCase();
    if (riskType.includes('financial') || riskType.includes('payment')) return '#EF4444';
    if (riskType.includes('legal') || riskType.includes('liability')) return '#F59E0B';
    if (riskType.includes('compliance') || riskType.includes('regulatory')) return '#8B5CF6';
    if (riskType.includes('security') || riskType.includes('privacy')) return '#06B6D4';
    if (riskType.includes('operational') || riskType.includes('delivery')) return '#10B981';
    return '#6B7280';
  };

  const getRiskIcon = (type: string) => {
    const riskType = type.toLowerCase();
    if (riskType.includes('financial') || riskType.includes('payment')) return <XCircle className="w-4 h-4" />;
    if (riskType.includes('legal') || riskType.includes('liability')) return <AlertTriangle className="w-4 h-4" />;
    if (riskType.includes('compliance') || riskType.includes('regulatory')) return <Shield className="w-4 h-4" />;
    if (riskType.includes('security') || riskType.includes('privacy')) return <AlertCircle className="w-4 h-4" />;
    return <BarChart3 className="w-4 h-4" />;
  };

  const chartData = data.map(item => ({
    name: formatRiskType(item.type),
    count: item.count,
    color: getRiskColor(item.type),
    originalType: item.type
  }));

  const totalRisks = chartData.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.count / totalRisks) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.count} occurrences ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Common Risks</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <AlertTriangle className="w-4 h-4" />
              <span>Risk Analysis</span>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No risk data available</p>
          <p className="text-sm text-gray-400">Complete analyses to see risk patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Common Risks</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4" />
            <span>Risk Analysis</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk List */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalRisks}</p>
              <p className="text-sm text-gray-600">Total Risk Occurrences</p>
            </div>

            <div className="space-y-3">
              {chartData.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      {getRiskIcon(item.originalType)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((item.count / totalRisks) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {chartData.length > 6 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  +{chartData.length - 6} more risk types
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Risk */}
        {chartData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Most Common Risk</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${chartData[0].color}20` }}
                >
                  {getRiskIcon(chartData[0].originalType)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {chartData[0].name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {chartData[0].count} occurrences ({((chartData[0].count / totalRisks) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 