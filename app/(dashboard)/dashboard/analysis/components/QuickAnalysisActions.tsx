'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Share2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const ANALYSIS_TYPES = [
  {
    name: 'Comprehensive Analysis',
    description: 'Full contract analysis with risks, clauses, and recommendations',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
    bgColor: 'hover:bg-purple-50',
    action: 'comprehensive',
    estimatedTime: '5-10 minutes',
    features: ['Risk Assessment', 'Clause Extraction', 'Recommendations', 'Metadata Analysis']
  },
  {
    name: 'Risk Assessment',
    description: 'Quick risk identification and severity analysis',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    bgColor: 'hover:bg-red-50',
    action: 'risk-assessment',
    estimatedTime: '3-5 minutes',
    features: ['Risk Identification', 'Severity Analysis', 'Risk Categories', 'Mitigation Suggestions']
  },
  {
    name: 'Clause Extraction',
    description: 'Extract and categorize important contract clauses',
    icon: Eye,
    color: 'bg-green-50 text-green-600',
    bgColor: 'hover:bg-green-50',
    action: 'clause-extraction',
    estimatedTime: '2-4 minutes',
    features: ['Clause Identification', 'Category Classification', 'Importance Scoring', 'Text Extraction']
  },
  {
    name: 'Basic Analysis',
    description: 'Quick overview and summary of contract content',
    icon: Zap,
    color: 'bg-orange-50 text-orange-600',
    bgColor: 'hover:bg-orange-50',
    action: 'basic',
    estimatedTime: '1-2 minutes',
    features: ['Contract Summary', 'Key Terms', 'Basic Overview', 'Quick Insights']
  }
];

const OTHER_ACTIONS = [
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
    name: 'Batch Analysis',
    description: 'Analyze multiple contracts at once',
    href: '/dashboard/analysis/batch',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
    bgColor: 'hover:bg-indigo-50',
    action: 'batch'
  },
  {
    name: 'Analysis Settings',
    description: 'Configure analysis parameters and preferences',
    href: '/dashboard/settings/analysis',
    icon: Settings,
    color: 'bg-gray-50 text-gray-600',
    bgColor: 'hover:bg-gray-50',
    action: 'settings'
  },
  {
    name: 'Export Results',
    description: 'Export analysis results in various formats',
    href: '/dashboard/analysis/export',
    icon: Download,
    color: 'bg-teal-50 text-teal-600',
    bgColor: 'hover:bg-teal-50',
    action: 'export'
  }
];

interface QuickAnalysisActionsProps {
  onAnalysisTypeSelect?: (analysisType: string) => void;
  showContractSelection?: boolean;
}

export default function QuickAnalysisActions({ 
  onAnalysisTypeSelect,
  showContractSelection = false 
}: QuickAnalysisActionsProps) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState<string | null>(null);

  const handleAnalysisTypeClick = async (action: string) => {
    if (onAnalysisTypeSelect) {
      onAnalysisTypeSelect(action);
      return;
    }

    if (showContractSelection) {
      // Navigate to contracts page with analysis type pre-selected
      router.push(`/dashboard/contracts?analysisType=${action}`);
      return;
    }

    // Default behavior - show toast and navigate to contracts
    setSelectedAction(action);
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`${action.replace('-', ' ')} analysis selected`);
      router.push(`/dashboard/contracts?analysisType=${action}`);
    } catch (error) {
      toast.error('Failed to select analysis type');
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  const handleOtherActionClick = async (action: string, href?: string) => {
    if (action === 'upload') {
      router.push('/dashboard/upload');
      return;
    }

    if (action === 'settings') {
      router.push('/dashboard/settings/analysis');
      return;
    }

    if (action === 'export') {
      router.push('/dashboard/analysis/export');
      return;
    }

    if (action === 'batch') {
      router.push('/dashboard/analysis/batch');
      return;
    }

    if (href) {
      router.push(href);
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

      {/* Analysis Types Section */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Analysis Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ANALYSIS_TYPES.map((action) => (
            <div key={action.name} className="relative">
              <button
                onClick={() => handleAnalysisTypeClick(action.action)}
                disabled={isProcessing && selectedAction === action.action}
                className={`w-full p-4 border border-gray-200 rounded-lg text-left transition-all duration-200 ${
                  isProcessing && selectedAction === action.action
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-gray-300 hover:shadow-sm'
                } ${action.bgColor}`}
                onMouseEnter={() => setShowAnalysisDetails(action.action)}
                onMouseLeave={() => setShowAnalysisDetails(null)}
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
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {action.name}
                      </h4>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        ⏱ {action.estimatedTime}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        Select
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Hover Details */}
              {showAnalysisDetails === action.action && (
                <div className="absolute z-10 left-full ml-2 top-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Features:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {action.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Estimated time: <span className="font-medium">{action.estimatedTime}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Other Actions Section */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Other Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {OTHER_ACTIONS.map((action) => (
            <button
              key={action.name}
              onClick={() => handleOtherActionClick(action.action, action.href)}
              className={`p-4 border border-gray-200 rounded-lg text-left transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${action.bgColor}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-4 h-4" />
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