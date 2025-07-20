'use client';

import { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Mail, 
  Settings, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Plus,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  template: string;
  reportType: string;
  frequency: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay?: string;
  recipients?: string[];
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
}

interface ScheduledReportsProps {
  scheduledReports: ScheduledReport[];
  organizationId?: string;
}

export default function ScheduledReports({ scheduledReports, organizationId }: ScheduledReportsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', description: 'Every day' },
    { value: 'weekly', label: 'Weekly', description: 'Once a week' },
    { value: 'monthly', label: 'Monthly', description: 'Once a month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
  ];

  const dayOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const templateOptions = [
    { value: 'overview', label: 'Overview Report' },
    { value: 'performance', label: 'Performance Report' },
    { value: 'cost', label: 'Cost Analysis Report' },
    { value: 'risks', label: 'Risk Assessment Report' },
    { value: 'usage', label: 'Usage Report' },
    { value: 'comprehensive', label: 'Comprehensive Report' },
  ];

  const getFrequencyLabel = (frequency: string) => {
    const option = frequencyOptions.find(f => f.value === frequency);
    return option ? option.label : frequency;
  };

  const getNextRunLabel = (nextRunAt?: Date) => {
    if (!nextRunAt) return 'Not scheduled';
    const now = new Date();
    const diff = nextRunAt.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return nextRunAt.toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  const handleToggleSchedule = async (reportId: string, isActive: boolean) => {
    try {
      // In a real implementation, this would update the database
      console.log('Toggling schedule:', { reportId, isActive });
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleDeleteSchedule = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;

    try {
      // In a real implementation, this would delete from the database
      console.log('Deleting scheduled report:', reportId);
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
    }
  };

  const handleEditSchedule = (report: ScheduledReport) => {
    setEditingReport(report);
    setShowCreateModal(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Scheduled Reports</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Report</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {scheduledReports.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No scheduled reports</p>
            <p className="text-sm text-gray-400 mb-4">
              Create automated reports that are delivered on schedule
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Schedule Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.isActive)}`}>
                        {report.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    
                    {report.description && (
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Template:</p>
                        <p className="font-medium text-gray-900">
                          {templateOptions.find(t => t.value === report.template)?.label || report.template}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Frequency:</p>
                        <p className="font-medium text-gray-900">{getFrequencyLabel(report.frequency)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Run:</p>
                        <p className="font-medium text-gray-900">{getNextRunLabel(report.nextRunAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Recipients:</p>
                        <p className="font-medium text-gray-900">
                          {report.recipients?.length || 0} email(s)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleSchedule(report.id, !report.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        report.isActive 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={report.isActive ? 'Pause' : 'Activate'}
                    >
                      {report.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditSchedule(report)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(report.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {report.lastRunAt && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last run: {report.lastRunAt.toLocaleDateString()} at {report.lastRunAt.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingReport ? 'Edit Scheduled Report' : 'Schedule New Report'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name
                  </label>
                  <input
                    type="text"
                    defaultValue={editingReport?.name || ''}
                    placeholder="Enter report name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {templateOptions.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {frequencyOptions.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label} - {freq.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients (comma-separated emails)
                  </label>
                  <input
                    type="text"
                    defaultValue={editingReport?.recipients?.join(', ') || ''}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReport(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real implementation, this would save to the database
                    console.log('Saving scheduled report');
                    setShowCreateModal(false);
                    setEditingReport(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingReport ? 'Update' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 