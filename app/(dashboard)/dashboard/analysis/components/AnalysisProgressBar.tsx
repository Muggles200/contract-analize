'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AnalysisProgressBarProps {
  progress: number;
  status: string;
  estimatedTime?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AnalysisProgressBar({
  progress,
  status,
  estimatedTime,
  showDetails = true,
  size = 'md',
  className = ''
}: AnalysisProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const normalizedStatus = status.toLowerCase();

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          textColor: 'text-green-700'
        };
      case 'processing':
        return {
          color: 'bg-blue-500',
          bgColor: 'bg-blue-100',
          icon: Clock,
          textColor: 'text-blue-700'
        };
      case 'failed':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-100',
          icon: AlertTriangle,
          textColor: 'text-red-700'
        };
      case 'pending':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          textColor: 'text-yellow-700'
        };
      default:
        return {
          color: 'bg-gray-500',
          bgColor: 'bg-gray-100',
          icon: Clock,
          textColor: 'text-gray-700'
        };
    }
  };

  const config = getStatusConfig(normalizedStatus);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: {
      container: 'h-2',
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'h-3',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'h-4',
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const isCompleted = normalizedStatus === 'completed';
  const isProcessing = normalizedStatus === 'processing';
  const isFailed = normalizedStatus === 'failed';

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className={`${sizeClasses[size].icon} ${config.textColor}`} />
            <span className={`font-medium ${sizeClasses[size].text} ${config.textColor}`}>
              {isCompleted ? 'Completed' : isProcessing ? 'Processing' : isFailed ? 'Failed' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${sizeClasses[size].text} text-gray-600`}>
              {Math.round(animatedProgress)}%
            </span>
            {estimatedTime && isProcessing && (
              <span className={`${sizeClasses[size].text} text-gray-500`}>
                ~{estimatedTime}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`relative ${sizeClasses[size].container} ${config.bgColor} rounded-full overflow-hidden`}>
        <div
          className={`${config.color} h-full rounded-full transition-all duration-1000 ease-out ${
            isProcessing ? 'animate-pulse' : ''
          }`}
          style={{ 
            width: `${animatedProgress}%`,
            transition: 'width 1s ease-out'
          }}
        />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>

      {showDetails && isProcessing && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Analyzing contract...</span>
          <span>Step {Math.floor(progress / 25) + 1} of 4</span>
        </div>
      )}
    </div>
  );
} 