/**
 * Utility functions for timezone detection and validation
 */

export const SUPPORTED_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

export const SUPPORTED_DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

export const SUPPORTED_TIME_FORMATS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
];

export const SUPPORTED_THEMES = [
  { value: 'system', label: 'System Default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * Detect the user's timezone
 */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to detect timezone, falling back to UTC:', error);
    return 'UTC';
  }
}

/**
 * Validate if a timezone is supported
 */
export function isValidTimezone(timezone: string): boolean {
  return SUPPORTED_TIMEZONES.some(tz => tz.value === timezone);
}

/**
 * Validate if a language is supported
 */
export function isValidLanguage(language: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.value === language);
}

/**
 * Validate if a date format is supported
 */
export function isValidDateFormat(dateFormat: string): boolean {
  return SUPPORTED_DATE_FORMATS.some(format => format.value === dateFormat);
}

/**
 * Validate if a time format is supported
 */
export function isValidTimeFormat(timeFormat: string): boolean {
  return SUPPORTED_TIME_FORMATS.some(format => format.value === timeFormat);
}

/**
 * Validate if a theme is supported
 */
export function isValidTheme(theme: string): boolean {
  return SUPPORTED_THEMES.some(t => t.value === theme);
}

/**
 * Format a date according to the user's preferences
 */
export function formatDate(
  date: Date | string,
  dateFormat: string = 'MM/DD/YYYY',
  timezone: string = 'UTC'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: dateFormat.includes('MM') ? '2-digit' : 'numeric',
      day: '2-digit',
    });
    
    const formatted = formatter.format(dateObj);
    
    // Apply custom formatting
    if (dateFormat === 'DD/MM/YYYY') {
      const parts = formatted.split('/');
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    } else if (dateFormat === 'YYYY-MM-DD') {
      const parts = formatted.split('/');
      return `${parts[2]}-${parts[0]}-${parts[1]}`;
    }
    
    return formatted;
  } catch (error) {
    console.warn('Failed to format date:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format a time according to the user's preferences
 */
export function formatTime(
  date: Date | string,
  timeFormat: string = '12h',
  timezone: string = 'UTC'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
    
    return formatter.format(dateObj);
  } catch (error) {
    console.warn('Failed to format time:', error);
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  try {
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (0 * 60000));
    const targetOffset = targetTime.toLocaleString('en-US', { timeZone: timezone });
    const targetDate = new Date(targetOffset);
    return (targetDate.getTime() - utc) / 60000;
  } catch (error) {
    console.warn('Failed to get timezone offset:', error);
    return 0;
  }
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || timezone;
  } catch (error) {
    console.warn('Failed to get timezone abbreviation:', error);
    return timezone;
  }
} 