// ============================================================================
// Date Utilities - Date Manipulation Functions
// ============================================================================

// parking-management-system/mobile/src/utils/date.ts

import { format, formatDistance, formatRelative, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes, addDays, addHours, addMinutes, subDays, subHours, subMinutes, isToday, isTomorrow, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO, isValid } from 'date-fns';

/**
 * Date Utilities
 */
export const DateUtils = {
  /**
   * Format a date with the specified format
   */
  format: (date: Date | string, formatString: string = 'MMM dd, yyyy'): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return format(parsed, formatString);
  },

  /**
   * Format date with time
   */
  formatDateTime: (date: Date | string): string => {
    return DateUtils.format(date, 'MMM dd, yyyy h:mm a');
  },

  /**
   * Format date with time (short)
   */
  formatDateTimeShort: (date: Date | string): string => {
    return DateUtils.format(date, 'MMM dd h:mm a');
  },

  /**
   * Format time only
   */
  formatTime: (date: Date | string): string => {
    return DateUtils.format(date, 'h:mm a');
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelative: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return formatRelative(parsed, new Date());
  },

  /**
   * Format distance to now (e.g., "2 days ago")
   */
  formatDistanceToNow: (date: Date | string, options?: { includeSeconds?: boolean }): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return formatDistanceToNow(parsed, options);
  },

  /**
   * Get date difference in days
   */
  daysBetween: (date1: Date | string, date2: Date | string): number => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d2, d1);
  },

  /**
   * Get date difference in hours
   */
  hoursBetween: (date1: Date | string, date2: Date | string): number => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInHours(d2, d1);
  },

  /**
   * Get date difference in minutes
   */
  minutesBetween: (date1: Date | string, date2: Date | string): number => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInMinutes(d2, d1);
  },

  /**
   * Add days to a date
   */
  addDays: (date: Date | string, amount: number): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return addDays(parsed, amount);
  },

  /**
   * Add hours to a date
   */
  addHours: (date: Date | string, amount: number): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return addHours(parsed, amount);
  },

  /**
   * Add minutes to a date
   */
  addMinutes: (date: Date | string, amount: number): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return addMinutes(parsed, amount);
  },

  /**
   * Subtract days from a date
   */
  subDays: (date: Date | string, amount: number): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return subDays(parsed, amount);
  },

  /**
   * Subtract hours from a date
   */
  subHours: (date: Date | string, amount: number): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return subHours(parsed, amount);
  },

  /**
   * Subtract minutes from a date
   */
  subMinutes: (date: Date | string, amount: number): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return subMinutes(parsed, amount);
  },

  /**
   * Check if date is today
   */
  isToday: (date: Date | string): boolean => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isToday(parsed);
  },

  /**
   * Check if date is tomorrow
   */
  isTomorrow: (date: Date | string): boolean => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isTomorrow(parsed);
  },

  /**
   * Check if date is yesterday
   */
  isYesterday: (date: Date | string): boolean => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isYesterday(parsed);
  },

  /**
   * Check if date is this week
   */
  isThisWeek: (date: Date | string): boolean => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isThisWeek(parsed);
  },

  /**
   * Check if date is this month
   */
  isThisMonth: (date: Date | string): boolean => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isThisMonth(parsed);
  },

  /**
   * Check if date is this year
   */
  isThisYear: (date: Date | string): boolean => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return isThisYear(parsed);
  },

  /**
   * Parse date string to Date object
   */
  parse: (date: string): Date | null => {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  },

  /**
   * Check if date is valid
   */
  isValid: (date: any): boolean => {
    if (date instanceof Date) return isValid(date);
    if (typeof date === 'string') return isValid(parseISO(date));
    return false;
  },

  /**
   * Get start of day
   */
  startOfDay: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of day
   */
  endOfDay: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Get start of week (Monday)
   */
  startOfWeek: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of week (Sunday)
   */
  endOfWeek: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Get start of month
   */
  startOfMonth: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of month
   */
  endOfMonth: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Get start of year
   */
  startOfYear: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    d.setMonth(0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of year
   */
  endOfYear: (date: Date | string): Date => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    const d = new Date(parsed);
    d.setMonth(11);
    d.setDate(31);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Get friendly date string
   */
  friendlyDate: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    
    if (isToday(parsed)) return 'Today';
    if (isTomorrow(parsed)) return 'Tomorrow';
    if (isYesterday(parsed)) return 'Yesterday';
    
    if (isThisWeek(parsed)) {
      return format(parsed, 'EEEE');
    }
    
    if (isThisMonth(parsed)) {
      return format(parsed, 'MMM dd');
    }
    
    return format(parsed, 'MMM dd, yyyy');
  },

  /**
   * Get human-readable time remaining
   */
  timeRemaining: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    
    const now = new Date();
    if (parsed <= now) return 'Time expired';
    
    const diff = parsed.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  /**
   * Get human-readable time elapsed
   */
  timeElapsed: (date: Date | string): string => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return formatDistanceToNow(parsed, { addSuffix: true });
  },
};

export default DateUtils;