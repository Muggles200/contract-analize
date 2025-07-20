'use client';

import { 
  PieChart, 
  FileText, 
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ContractTypeData {
  contractType: string | null;
  _count: {
    contractType: number;
  };
}

interface ContractTypeDistributionProps {
  data: ContractTypeData[];
}

export default function ContractTypeDistribution({ data }: ContractTypeDistributionProps) {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const formatContractType = (type: string | null) => {
    if (!type) return 'Unspecified';
    
    switch (type) {
      case 'employment':
        return 'Employment';
      case 'service':
        return 'Service Agreement';
      case 'nda':
        return 'NDA';
      case 'lease':
        return 'Lease Agreement';
      case 'purchase':
        return 'Purchase Agreement';
      case 'partnership':
        return 'Partnership';
      case 'licensing':
        return 'Licensing';
      case 'consulting':
        return 'Consulting';
      case 'vendor':
        return 'Vendor Agreement';
      case 'other':
        return 'Other';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const chartData = data.map((item, index) => ({
    name: formatContractType(item.contractType),
    value: item._count.contractType,
    color: COLORS[index % COLORS.length],
    originalType: item.contractType
  }));

  const totalContracts = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalContracts) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} contracts ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-2 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600">
            {entry.value} ({((entry.payload.value / totalContracts) * 100).toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Contract Type Distribution</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <PieChart className="w-4 h-4" />
              <span>Popular Types</span>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No contract data available</p>
          <p className="text-sm text-gray-400">Upload contracts to see type distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Contract Type Distribution</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <PieChart className="w-4 h-4" />
            <span>Popular Types</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Stats */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
              <p className="text-sm text-gray-600">Total Contracts</p>
            </div>

            <div className="space-y-3">
              {chartData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((item.value / totalContracts) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {chartData.length > 5 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  +{chartData.length - 5} more types
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Contract Type */}
        {chartData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Most Popular</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {chartData[0].name}
              </p>
              <p className="text-sm text-gray-600">
                {chartData[0].value} contracts ({((chartData[0].value / totalContracts) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 