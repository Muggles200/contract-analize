'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Upload, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  Eye, 
  Zap,
  Settings,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

const quickActions = [
  {
    name: 'Upload & Analyze',
    description: 'Upload a new contract and start analysis immediately',
    href: '/dashboard/upload',
    icon: Upload,
    color: 'bg-blue-50 text-blue-600',
    bgColor: 'hover:bg-blue-50',
    action: 'upload'
  },
  {
    name: 'Comprehensive Analysis',
    description: 'Full contract analysis with risks, clauses, and recommendations',
    href: '#',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
    bgColor: 'hover:bg-purple-50',
    action: 'comprehensive'
  },
  {
    name: 'Risk Assessment',
    description: 'Quick risk identification and severity analysis',
    href: '#',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    bgColor: 'hover:bg-red-50',
    action: 'risk-assessment'
  },
  {
    name: 'Clause Extraction',
    description: 'Extract and categorize important contract clauses',
    href: '#',
    icon: Eye,
    color: 'bg-green-50 text-green-600',
    bgColor: 'hover:bg-green-50',
    action: 'clause-extraction'
  },
  {
    name: 'Basic Analysis',
    description: 'Quick overview and summary of contract content',
    href: '#',
    icon: Zap,
    color: 'bg-orange-50 text-orange-600',
    bgColor: 'hover:bg-orange-50',
    action: 'basic'
  },
  {
    name: 'Batch Analysis',
    description: 'Analyze multiple contracts at once',
    href: '#',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
    bgColor: 'hover:bg-indigo-50',
    action: 'batch'
  },
  {
    name: 'Analysis Settings',
    description: 'Configure analysis parameters and preferences',
    href: '#',
    icon: Settings,
    color: 'bg-gray-50 text-gray-600',
    bgColor: 'hover:bg-gray-50',
    action: 'settings'
  },
  {
    name: 'Export Results',
    description: 'Export analysis results in various formats',
    href: '#',
    icon: Download,
    color: 'bg-teal-50 text-teal-600',
    bgColor: 'hover:bg-teal-50',
    action: 'export'
  }
];

export default function QuickAnalysisActions() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleActionClick = async (action: string) => {
    if (action === 'upload') {
      // Navigate to upload page
      window.location.href = '/dashboard/upload';
      return;
    }

    if (action === 'settings') {
      toast.info('Analysis settings coming soon');
      return;
    }

    if (action === 'export') {
      toast.info('Export functionality coming soon');
      return;
    }

    if (action === 'batch') {
      toast.info('Batch analysis coming soon');
      return;
    }

    // For analysis types, show a modal or redirect to contract selection
    setSelectedAction(action);
    setIsProcessing(true);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${action.replace('-', ' ')} analysis started`);
      
      // In a real implementation, this would redirect to contract selection
      // or show a modal to select contracts
      if (action === 'comprehensive') {
        toast.info('Please select a contract to analyze');
      }
    } catch (error) {
      toast.error('Failed to start analysis');
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="p-2 bg-purple-50 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.name}
            onClick={() => handleActionClick(action.action)}
            disabled={isProcessing && selectedAction === action.action}
            className={`p-4 border border-gray-200 rounded-lg text-left transition-all duration-200 ${
              isProcessing && selectedAction === action.action
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-gray-300 hover:shadow-sm'
            } ${action.bgColor}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                {isProcessing && selectedAction === action.action ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <action.icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {action.name}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Comprehensive Analysis Completed</p>
              <p className="text-xs text-gray-500">Contract-2024-001.pdf • 2 minutes ago</p>
            </div>
            <Link
              href="#"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Risk Assessment Processing</p>
              <p className="text-xs text-gray-500">Service-Agreement.pdf • 5 minutes ago</p>
            </div>
            <span className="text-xs text-gray-500">75%</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <XCircle className="w-4 h-4 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Analysis Failed</p>
              <p className="text-xs text-gray-500">NDA-Template.pdf • 10 minutes ago</p>
            </div>
            <button className="text-xs text-red-600 hover:text-red-700 font-medium">
              Retry
            </button>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Analysis Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use Comprehensive Analysis for important contracts</li>
              <li>• Risk Assessment is perfect for quick reviews</li>
              <li>• Clause Extraction helps identify key terms</li>
              <li>• Processing time depends on document size and complexity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 