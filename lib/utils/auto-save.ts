/**
 * Auto-save utility for form data
 */

interface AutoSaveOptions {
  delay?: number; // Delay in milliseconds before saving
  maxRetries?: number; // Maximum number of retry attempts
  retryDelay?: number; // Delay between retries in milliseconds
  onSave?: (data: any) => Promise<void>; // Save function
  onError?: (error: Error) => void; // Error handler
  onSuccess?: (data: any) => void; // Success handler
}

export class AutoSave {
  private timer: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private lastData: any = null;
  private options: Required<AutoSaveOptions>;

  constructor(options: AutoSaveOptions) {
    this.options = {
      delay: 1000,
      maxRetries: 3,
      retryDelay: 2000,
      onSave: async () => {},
      onError: () => {},
      onSuccess: () => {},
      ...options,
    };
  }

  /**
   * Schedule auto-save with debouncing
   */
  schedule(data: any): void {
    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Store the data
    this.lastData = data;

    // Schedule new save
    this.timer = setTimeout(() => {
      this.save(data);
    }, this.options.delay);
  }

  /**
   * Immediately save data
   */
  async saveImmediately(data: any): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    await this.save(data);
  }

  /**
   * Cancel pending auto-save
   */
  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Get the last saved data
   */
  getLastData(): any {
    return this.lastData;
  }

  /**
   * Reset retry count
   */
  resetRetryCount(): void {
    this.retryCount = 0;
  }

  private async save(data: any): Promise<void> {
    try {
      await this.options.onSave(data);
      this.retryCount = 0;
      this.lastData = data;
      this.options.onSuccess(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.options.onError(error as Error);
      
      // Retry if we haven't exceeded max retries
      if (this.retryCount < this.options.maxRetries) {
        this.retryCount++;
        setTimeout(() => {
          this.save(data);
        }, this.options.retryDelay);
      }
    }
  }
}

/**
 * Hook for auto-saving form data
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: Omit<AutoSaveOptions, 'onSave'> = {}
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const autoSave = useMemo(() => {
    return new AutoSave({
      ...options,
      onSave: async (data: T) => {
        setIsSaving(true);
        setError(null);
        await saveFunction(data);
        setLastSaved(new Date());
      },
      onError: (error: Error) => {
        setError(error);
      },
      onSuccess: () => {
        setIsSaving(false);
      },
    });
  }, [saveFunction, options]);

  useEffect(() => {
    autoSave.schedule(data);
    return () => autoSave.cancel();
  }, [data, autoSave]);

  const saveImmediately = useCallback(async () => {
    await autoSave.saveImmediately(data);
  }, [autoSave, data]);

  return {
    isSaving,
    lastSaved,
    error,
    saveImmediately,
  };
}

// Import React hooks
import { useState, useEffect, useMemo, useCallback } from 'react'; 