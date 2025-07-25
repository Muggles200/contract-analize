'use client';

import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  FileJson,
  Clock,
  Calendar
} from 'lucide-react';

interface ExportActivity {
  id: string;
  activityType: string;
  description: string;
  createdAt: Date;
  metadata: any;
}

interface ExportHistoryProps {
  exportHistory: ExportActivity[];
}

const ACTIVITY_ICONS = {
  'analysis_exported': FileText,
  'contracts_exported': FileSpreadsheet,
  'reports_exported': File,
  'data_exported': FileJson,
};

const ACTIVITY_COLORS = {
  'analysis_exported': 'text-blue-600 bg-blue-50',
  'contracts_exported': 'text-green-600 bg-green-50',
  'reports_exported': 'text-purple-600 bg-purple-50',
  'data_exported': 'text-orange-600 bg-orange-50',
};

export default function ExportHistory({ exportHistory }: ExportHistoryProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    const IconComponent = ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS] || Download;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActivityColor = (type: string) => {
    return ACTIVITY_COLORS[type as keyof typeof ACTIVITY_COLORS] || 'text-gray-600 bg-gray-50';
  };

  const getExportFormat = (metadata: any) => {
    if (metadata?.format) {
      return metadata.format.toUpperCase();
    }
    return 'Unknown';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Export History</h2>
        <p className="text-sm text-gray-600">
          Recent export activities and downloads.
        </p>
      </div>

      {exportHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Download className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No export history found</p>
          <p className="text-sm">Your export activities will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exportHistory.map((activity) => (
            <div
              key={activity.id}
              className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.activityType)}`}>
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {getExportFormat(activity.metadata)}
                    </span>
                    {activity.metadata?.exportCount && (
                      <span>{activity.metadata.exportCount} items</span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Export Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• PDF exports include charts and professional formatting</li>
          <li>• Excel/CSV exports are perfect for data analysis</li>
          <li>• JSON exports contain raw data for integration</li>
          <li>• Export history is kept for 30 days</li>
        </ul>
      </div>
    </div>
  );
} 