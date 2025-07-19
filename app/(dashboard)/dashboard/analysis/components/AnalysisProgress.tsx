'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileText,
  Brain,
  BarChart3,
  Download
} from 'lucide-react';

interface AnalysisStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  estimatedTime?: number;
  startTime?: Date;
  endTime?: Date;
}

interface AnalysisProgressProps {
  analysisId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
  steps?: AnalysisStep[];
  onCancel?: () => void;
  onView?: () => void;
  className?: string;
}

const defaultSteps: AnalysisStep[] = [
  {
    id: 'upload',
    name: 'Document Upload',
    status: 'completed'
  },
  {
    id: 'extract',
    name: 'Text Extraction',
    status: 'completed'
  },
  {
    id: 'analyze',
    name: 'AI Analysis',
    status: 'processing'
  },
  {
    id: 'process',
    name: 'Result Processing',
    status: 'pending'
  },
  {
    id: 'complete',
    name: 'Analysis Complete',
    status: 'pending'
  }
];

export default function AnalysisProgress({
  analysisId,
  status,
  progress = 0,
  currentStep,
  estimatedTimeRemaining,
  steps = defaultSteps,
  onCancel,
  onView,
  className = ''
}: AnalysisProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(status === 'processing');

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulating && status === 'processing') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Simulate progress updates
        if (currentProgress < 95) {
          setCurrentProgress(prev => {
            const increment = Math.random() * 2;
            return Math.min(prev + increment, 95);
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSimulating, status, currentProgress]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStatusIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCurrentStepName = () => {
    if (currentStep) {
      return currentStep;
    }
    
    const processingStep = steps.find(step => step.status === 'processing');
    return processingStep?.name || 'Processing...';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analysis Progress</h3>
            <p className="text-sm text-gray-500">ID: {analysisId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getOverallStatusColor()}`}>
            {getOverallStatusIcon()}
            <span className="ml-1">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {getCurrentStepName()}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(currentProgress)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Elapsed: {formatTime(elapsedTime)}</span>
          {estimatedTimeRemaining && (
            <span>ETA: {formatTime(estimatedTimeRemaining)}</span>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getStatusIcon(step.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{step.name}</span>
                {step.progress !== undefined && step.status === 'processing' && (
                  <span className="text-xs text-gray-500">{step.progress}%</span>
                )}
              </div>
              {step.status === 'processing' && step.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>Document Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4" />
            <span>AI Processing</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status === 'processing' && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {status === 'completed' && onView && (
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 