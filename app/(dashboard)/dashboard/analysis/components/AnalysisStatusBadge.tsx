'use client';

import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Play,
  Pause
} from 'lucide-react';

interface AnalysisStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function AnalysisStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true,
  className = ''
}: AnalysisStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-700 bg-green-50 border-green-200',
          label: 'Completed'
        };
      case 'processing':
        return {
          icon: Play,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          label: 'Processing'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
          label: 'Pending'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-700 bg-red-50 border-red-200',
          label: 'Failed'
        };
      case 'cancelled':
        return {
          icon: Pause,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          label: 'Cancelled'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const config = getStatusConfig(normalizedStatus);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium border rounded-full
        ${config.color}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} mr-1.5`} />
      )}
      {config.label}
    </span>
  );
} 