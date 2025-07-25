/**
 * Settings synchronization across devices
 */

export interface SyncableSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  autoSave: boolean;
  showTutorials: boolean;
}

export interface SyncEvent {
  type: 'settings_updated';
  userId: string;
  settings: Partial<SyncableSettings>;
  timestamp: Date;
  deviceId: string;
}

export class SettingsSync {
  private static instance: SettingsSync;
  private deviceId: string;
  private lastSync: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(event: SyncEvent) => void> = new Set();

  private constructor() {
    this.deviceId = this.generateDeviceId();
  }

  static getInstance(): SettingsSync {
    if (!SettingsSync.instance) {
      SettingsSync.instance = new SettingsSync();
    }
    return SettingsSync.instance;
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
  }

  /**
   * Subscribe to sync events
   */
  subscribe(listener: (event: SyncEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of sync events
   */
  private notifyListeners(event: SyncEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Start periodic synchronization
   */
  startSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncSettings();
    }, intervalMs);
  }

  /**
   * Stop periodic synchronization
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync settings with server
   */
  async syncSettings(): Promise<void> {
    try {
      const response = await fetch('/api/user/general-settings');
      if (response.ok) {
        const serverSettings = await response.json();
        this.lastSync = new Date();
        
        // Notify listeners of sync event
        this.notifyListeners({
          type: 'settings_updated',
          userId: 'current', // Will be replaced with actual user ID
          settings: serverSettings,
          timestamp: this.lastSync,
          deviceId: this.deviceId,
        });
      }
    } catch (error) {
      console.warn('Failed to sync settings:', error);
    }
  }

  /**
   * Push settings to server
   */
  async pushSettings(settings: Partial<SyncableSettings>): Promise<void> {
    try {
      const response = await fetch('/api/user/general-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        this.lastSync = new Date();
        
        // Notify listeners of local update
        this.notifyListeners({
          type: 'settings_updated',
          userId: 'current', // Will be replaced with actual user ID
          settings,
          timestamp: this.lastSync,
          deviceId: this.deviceId,
        });
      }
    } catch (error) {
      console.error('Failed to push settings:', error);
      throw error;
    }
  }

  /**
   * Get last sync timestamp
   */
  getLastSync(): Date | null {
    return this.lastSync;
  }

  /**
   * Get device ID
   */
  getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * Check if settings are in sync
   */
  async isInSync(): Promise<boolean> {
    try {
      const response = await fetch('/api/user/general-settings');
      if (response.ok) {
        const serverSettings = await response.json();
        const localSettings = this.getLocalSettings();
        
        // Compare key settings
        return (
          serverSettings.timezone === localSettings.timezone &&
          serverSettings.language === localSettings.language &&
          serverSettings.theme === localSettings.theme &&
          serverSettings.autoSave === localSettings.autoSave &&
          serverSettings.showTutorials === localSettings.showTutorials
        );
      }
    } catch (error) {
      console.warn('Failed to check sync status:', error);
    }
    return false;
  }

  /**
   * Get local settings from localStorage
   */
  private getLocalSettings(): Partial<SyncableSettings> {
    try {
      const stored = localStorage.getItem('user-settings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to get local settings:', error);
      return {};
    }
  }

  /**
   * Store settings locally
   */
  storeLocalSettings(settings: Partial<SyncableSettings>): void {
    try {
      localStorage.setItem('user-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to store local settings:', error);
    }
  }

  /**
   * Clear local settings
   */
  clearLocalSettings(): void {
    try {
      localStorage.removeItem('user-settings');
    } catch (error) {
      console.warn('Failed to clear local settings:', error);
    }
  }
}

/**
 * React hook for settings synchronization
 */
export function useSettingsSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const settingsSync = SettingsSync.getInstance();

  useEffect(() => {
    const unsubscribe = settingsSync.subscribe((event) => {
      setLastSync(event.timestamp);
      setSyncError(null);
    });

    // Initial sync
    settingsSync.syncSettings();

    // Start periodic sync
    settingsSync.startSync();

    return () => {
      unsubscribe();
      settingsSync.stopSync();
    };
  }, []);

  const syncNow = async () => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      await settingsSync.syncSettings();
    } catch (error) {
      setSyncError(error as Error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pushSettings = async (settings: Partial<SyncableSettings>) => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      await settingsSync.pushSettings(settings);
    } catch (error) {
      setSyncError(error as Error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSync,
    syncError,
    syncNow,
    pushSettings,
    deviceId: settingsSync.getDeviceId(),
  };
}

// Import React hooks
import { useState, useEffect } from 'react'; 