// ============================================================================
// Date Utilities - Date Manipulation Functions
// ============================================================================

// parking-management-system/shared/utils/src/date.ts

import {
  format,
  parse,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  subDays,
  subHours,
  subMonths,
  subYears,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isValid,
  compareAsc,
  compareDesc,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

/**
 * Format a date with the specified format
 */
export function formatDate(
  date: Date | string,
  formatString: string = 'MMM dd, yyyy'
): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return format(parsed, formatString);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMM dd, yyyy h:mm a');
}

/**
 * Format date with time (short)
 */
export function formatDateTimeShort(date: Date | string): string {
  return formatDate(date, 'MMM dd h:mm a');
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, 'h:mm a');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  const now = new Date();
  const diffSeconds = differenceInSeconds(now, parsed);
  const diffMinutes = differenceInMinutes(now, parsed);
  const diffHours = differenceInHours(now, parsed);
  const diffDays = differenceInDays(now, parsed);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(parsed);
}

/**
 * Get date difference in days
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
}

/**
 * Get date difference in hours
 */
export function hoursBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInHours(d2, d1);
}

/**
 * Get date difference in minutes
 */
export function minutesBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInMinutes(d2, d1);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsed, amount);
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return addHours(parsed, amount);
}

/**
 * Add minutes to a date
 */
export function addMinutesToDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return addMinutes(parsed, amount);
}

/**
 * Add months to a date
 */
export function addMonthsToDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(parsed, amount);
}

/**
 * Add years to a date
 */
export function addYearsToDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return addYears(parsed, amount);
}

/**
 * Subtract days from a date
 */
export function subDaysFromDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return subDays(parsed, amount);
}

/**
 * Subtract hours from a date
 */
export function subHoursFromDate(date: Date | string, amount: number): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return subHours(parsed, amount);
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isToday(parsed);
}

/**
 * Check if date is tomorrow
 */
export function isDateTomorrow(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isTomorrow(parsed);
}

/**
 * Check if date is yesterday
 */
export function isDateYesterday(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isYesterday(parsed);
}

/**
 * Check if date is this week
 */
export function isDateThisWeek(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isThisWeek(parsed);
}

/**
 * Check if date is this month
 */
export function isDateThisMonth(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isThisMonth(parsed);
}

/**
 * Check if date is this year
 */
export function isDateThisYear(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isThisYear(parsed);
}

/**
 * Check if date is in the past
 */
export function isDatePast(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isPast(parsed);
}

/**
 * Check if date is in the future
 */
export function isDateFuture(date: Date | string): boolean {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isFuture(parsed);
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(parsed);
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(parsed);
}

/**
 * Get start of week (Monday)
 */
export function getStartOfWeek(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return startOfWeek(parsed, { weekStartsOn: 1 });
}

/**
 * Get end of week (Sunday)
 */
export function getEndOfWeek(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return endOfWeek(parsed, { weekStartsOn: 1 });
}

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return startOfMonth(parsed);
}

/**
 * Get end of month
 */
export function getEndOfMonth(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return endOfMonth(parsed);
}

/**
 * Get start of year
 */
export function getStartOfYear(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return startOfYear(parsed);
}

/**
 * Get end of year
 */
export function getEndOfYear(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return endOfYear(parsed);
}

/**
 * Parse date string to Date object
 */
export function parseDate(date: string): Date | null {
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : null;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  if (date instanceof Date) return isValid(date);
  if (typeof date === 'string') return isValid(parseISO(date));
  return false;
}

/**
 * Get friendly date string (Today, Tomorrow, Yesterday, etc.)
 */
export function getFriendlyDate(date: Date | string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  if (isToday(parsed)) return 'Today';
  if (isTomorrow(parsed)) return 'Tomorrow';
  if (isYesterday(parsed)) return 'Yesterday';
  if (isThisWeek(parsed)) return format(parsed, 'EEEE');
  if (isThisMonth(parsed)) return format(parsed, 'MMM dd');
  return format(parsed, 'MMM dd, yyyy');
}

/**
 * Convert UTC date to local timezone
 */
export function utcToLocal(date: Date | string, timezone: string = 'UTC'): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return utcToZonedTime(parsed, timezone);
}

/**
 * Convert local date to UTC
 */
export function localToUtc(date: Date | string, timezone: string = 'UTC'): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return zonedTimeToUtc(parsed, timezone);
}

/**
 * Get human-readable time remaining
 */
export function getTimeRemaining(date: Date | string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  const now = new Date();
  if (parsed <= now) return 'Time expired';
  
  const diff = parsed.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Get human-readable time elapsed
 */
export function getTimeElapsed(date: Date | string): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  const now = new Date();
  const diff = now.getTime() - parsed.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ago`;
  if (hours > 0) return `${hours}h ${minutes}m ago`;
  return `${minutes}m ago`;
}