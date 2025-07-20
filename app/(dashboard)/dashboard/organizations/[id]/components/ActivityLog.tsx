'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Filter, 
  Download,
  User,
  FileText,
  Brain,
  Users,
  Settings,
  CreditCard,
  Building,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface UserMembership {
  role: string;
  permissions: string[];
}

interface ActivityLogProps {
  organizationId: string;
  userMembership: UserMembership | null;
}

interface ActivityEvent {
  id: string;
  type: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function ActivityLog({ organizationId, userMembership }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchActivityLog();
  }, [organizationId, filter, dateRange]);

  const fetchActivityLog = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        organizationId,
        filter,
        dateRange,
        limit: '50',
      });

      const response = await fetch(`/api/analytics/activity?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      setError('Failed to load activity log');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'analysis':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'member':
        return <Users className="w-4 h-4 text-orange-600" />;
      case 'settings':
        return <Settings className="w-4 h-4 text-gray-600" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-red-600" />;
      case 'organization':
        return <Building className="w-4 h-4 text-indigo-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-green-100 text-green-800';
      case 'analysis':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-orange-100 text-orange-800';
      case 'settings':
        return 'bg-gray-100 text-gray-800';
      case 'billing':
        return 'bg-red-100 text-red-800';
      case 'organization':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
      case 'uploaded':
      case 'completed':
      case 'joined':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'updated':
      case 'modified':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'deleted':
      case 'removed':
      case 'left':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'started':
      case 'initiated':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'user', label: 'User Activities' },
    { value: 'contract', label: 'Contract Activities' },
    { value: 'analysis', label: 'Analysis Activities' },
    { value: 'member', label: 'Member Activities' },
    { value: 'settings', label: 'Settings Changes' },
    { value: 'billing', label: 'Billing Activities' },
  ];

  const dateRangeOptions = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        filter,
        dateRange,
        format: 'csv',
      });

      const response = await fetch(`/api/analytics/activity/export?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export activity log');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${organizationId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting activity log:', error);
      alert('Failed to export activity log');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Activity Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No activity events match your current filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {activity.userName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {activity.action}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                          {activity.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {getStatusIcon(activity.action)}
                        <span>{formatDate(activity.createdAt)}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.description}
                    </p>
                    {activity.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {activity.ipAddress && (
                          <span className="mr-4">IP: {activity.ipAddress}</span>
                        )}
                        {activity.resourceType && (
                          <span className="mr-4">Resource: {activity.resourceType}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {activities.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Activity Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Events:</span>
              <span className="ml-2 font-medium text-gray-900">{activities.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Date Range:</span>
              <span className="ml-2 font-medium text-gray-900">
                {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Filter:</span>
              <span className="ml-2 font-medium text-gray-900">
                {filterOptions.find(opt => opt.value === filter)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900">
                {activities.length > 0 ? formatDate(activities[0].createdAt) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 