'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

interface RealTimeUpdatesProps {
  enabled?: boolean;
  onRefresh?: () => void;
  refreshInterval?: number;
}

export default function RealTimeUpdates({ 
  enabled = true, 
  onRefresh,
  refreshInterval = 10000 
}: RealTimeUpdatesProps) {
  const [isAutoRefresh, setIsAutoRefresh] = useState(enabled);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setLastUpdate(new Date());
      
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default behavior: fetch latest data via API
        const response = await fetch('/api/analysis/status?limit=50');
        if (response.ok) {
          // Force a page refresh to update all components with new data
          window.location.reload();
        } else {
          throw new Error('Failed to fetch latest data');
        }
      }
      
      toast.success('Analysis data updated');
    } catch (error) {
      toast.error('Failed to update analysis data');
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, handleRefresh, refreshInterval]);

  const toggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
    toast.success(isAutoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        title="Refresh analysis data"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
      
      <button
        onClick={toggleAutoRefresh}
        className={`p-2 rounded-lg transition-colors ${
          isAutoRefresh 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isAutoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
      >
        {isAutoRefresh ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      </button>
      
      <span className="text-xs text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </span>
    </div>
  );
} 