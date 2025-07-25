/**
 * Tutorial preferences and management system
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean; // Whether to show only once
}

export interface TutorialPreferences {
  showTutorials: boolean;
  completedTutorials: string[];
  dismissedTutorials: string[];
  tutorialProgress: Record<string, number>; // tutorialId -> step number
}

export class TutorialManager {
  private static instance: TutorialManager;
  private preferences: TutorialPreferences;
  private listeners: Set<(prefs: TutorialPreferences) => void> = new Set();

  private constructor() {
    this.preferences = this.loadPreferences();
  }

  static getInstance(): TutorialManager {
    if (!TutorialManager.instance) {
      TutorialManager.instance = new TutorialManager();
    }
    return TutorialManager.instance;
  }

  /**
   * Load tutorial preferences from localStorage
   */
  private loadPreferences(): TutorialPreferences {
    try {
      const stored = localStorage.getItem('tutorial-preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load tutorial preferences:', error);
    }

    return {
      showTutorials: true,
      completedTutorials: [],
      dismissedTutorials: [],
      tutorialProgress: {},
    };
  }

  /**
   * Save tutorial preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('tutorial-preferences', JSON.stringify(this.preferences));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save tutorial preferences:', error);
    }
  }

  /**
   * Notify all listeners of preference changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.preferences));
  }

  /**
   * Subscribe to preference changes
   */
  subscribe(listener: (prefs: TutorialPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current preferences
   */
  getPreferences(): TutorialPreferences {
    return { ...this.preferences };
  }

  /**
   * Update tutorial visibility setting
   */
  setShowTutorials(show: boolean): void {
    this.preferences.showTutorials = show;
    this.savePreferences();
  }

  /**
   * Mark a tutorial as completed
   */
  markTutorialCompleted(tutorialId: string): void {
    if (!this.preferences.completedTutorials.includes(tutorialId)) {
      this.preferences.completedTutorials.push(tutorialId);
      this.savePreferences();
    }
  }

  /**
   * Mark a tutorial as dismissed
   */
  markTutorialDismissed(tutorialId: string): void {
    if (!this.preferences.dismissedTutorials.includes(tutorialId)) {
      this.preferences.dismissedTutorials.push(tutorialId);
      this.savePreferences();
    }
  }

  /**
   * Update tutorial progress
   */
  updateTutorialProgress(tutorialId: string, step: number): void {
    this.preferences.tutorialProgress[tutorialId] = step;
    this.savePreferences();
  }

  /**
   * Check if a tutorial should be shown
   */
  shouldShowTutorial(tutorialId: string, showOnce: boolean = false): boolean {
    if (!this.preferences.showTutorials) {
      return false;
    }

    if (this.preferences.completedTutorials.includes(tutorialId)) {
      return false;
    }

    if (showOnce && this.preferences.dismissedTutorials.includes(tutorialId)) {
      return false;
    }

    return true;
  }

  /**
   * Get tutorial progress
   */
  getTutorialProgress(tutorialId: string): number {
    return this.preferences.tutorialProgress[tutorialId] || 0;
  }

  /**
   * Reset tutorial progress
   */
  resetTutorialProgress(tutorialId: string): void {
    delete this.preferences.tutorialProgress[tutorialId];
    const completedIndex = this.preferences.completedTutorials.indexOf(tutorialId);
    if (completedIndex > -1) {
      this.preferences.completedTutorials.splice(completedIndex, 1);
    }
    const dismissedIndex = this.preferences.dismissedTutorials.indexOf(tutorialId);
    if (dismissedIndex > -1) {
      this.preferences.dismissedTutorials.splice(dismissedIndex, 1);
    }
    this.savePreferences();
  }

  /**
   * Reset all tutorial progress
   */
  resetAllTutorials(): void {
    this.preferences.completedTutorials = [];
    this.preferences.dismissedTutorials = [];
    this.preferences.tutorialProgress = {};
    this.savePreferences();
  }

  /**
   * Sync preferences with server
   */
  async syncWithServer(): Promise<void> {
    try {
      const response = await fetch('/api/user/general-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showTutorials: this.preferences.showTutorials,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync tutorial preferences');
      }
    } catch (error) {
      console.warn('Failed to sync tutorial preferences:', error);
    }
  }
}

/**
 * React hook for tutorial management
 */
export function useTutorials() {
  const [preferences, setPreferences] = useState<TutorialPreferences>(
    TutorialManager.getInstance().getPreferences()
  );

  useEffect(() => {
    const unsubscribe = TutorialManager.getInstance().subscribe(setPreferences);
    return unsubscribe;
  }, []);

  const tutorialManager = TutorialManager.getInstance();

  return {
    preferences,
    setShowTutorials: tutorialManager.setShowTutorials.bind(tutorialManager),
    markTutorialCompleted: tutorialManager.markTutorialCompleted.bind(tutorialManager),
    markTutorialDismissed: tutorialManager.markTutorialDismissed.bind(tutorialManager),
    updateTutorialProgress: tutorialManager.updateTutorialProgress.bind(tutorialManager),
    shouldShowTutorial: tutorialManager.shouldShowTutorial.bind(tutorialManager),
    getTutorialProgress: tutorialManager.getTutorialProgress.bind(tutorialManager),
    resetTutorialProgress: tutorialManager.resetTutorialProgress.bind(tutorialManager),
    resetAllTutorials: tutorialManager.resetAllTutorials.bind(tutorialManager),
    syncWithServer: tutorialManager.syncWithServer.bind(tutorialManager),
  };
}

// Import React hooks
import { useState, useEffect } from 'react'; 