// ============================================================================
// Number Utilities - Number Manipulation Functions
// ============================================================================

// parking-management-system/mobile/src/utils/numbers.ts

/**
 * Number Utilities
 */
export const NumberUtils = {
  /**
   * Format number with comma separators
   */
  format: (num: number, decimals: number = 0): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  /**
   * Format percentage
   */
  formatPercentage: (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * Format distance
   */
  formatDistance: (meters: number, unit: 'km' | 'mi' = 'km'): string => {
    if (unit === 'km') {
      const km = meters / 1000;
      if (km >= 10) return `${km.toFixed(0)} km`;
      if (km >= 1) return `${km.toFixed(1)} km`;
      return `${Math.round(meters)} m`;
    } else {
      const miles = meters / 1609.344;
      if (miles >= 10) return `${miles.toFixed(0)} mi`;
      if (miles >= 1) return `${miles.toFixed(1)} mi`;
      return `${Math.round(meters)} m`;
    }
  },

  /**
   * Format duration in seconds to readable string
   */
  formatDuration: (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  },

  /**
   * Format time in hours:minutes
   */
  formatTime: (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  },

  /**
   * Round to nearest decimal
   */
  round: (num: number, decimals: number = 0): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  },

  /**
   * Clamp number between min and max
   */
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
  },

  /**
   * Check if number is between min and max
   */
  isBetween: (num: number, min: number, max: number): boolean => {
    return num >= min && num <= max;
  },

  /**
   * Random number between min and max
   */
  random: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Random decimal between min and max
   */
  randomDecimal: (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  },

  /**
   * Sum array of numbers
   */
  sum: (numbers: number[]): number => {
    return numbers.reduce((acc, curr) => acc + curr, 0);
  },

  /**
   * Average array of numbers
   */
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return NumberUtils.sum(numbers) / numbers.length;
  },

  /**
   * Get min value from array
   */
  min: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return Math.min(...numbers);
  },

  /**
   * Get max value from array
   */
  max: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return Math.max(...numbers);
  },

  /**
   * Format number with ordinal suffix (1st, 2nd, 3rd)
   */
  ordinal: (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
  },

  /**
   * Check if number is even
   */
  isEven: (num: number): boolean => {
    return num % 2 === 0;
  },

  /**
   * Check if number is odd
   */
  isOdd: (num: number): boolean => {
    return num % 2 !== 0;
  },

  /**
   * Check if number is integer
   */
  isInteger: (num: number): boolean => {
    return Number.isInteger(num);
  },

  /**
   * Check if number is float
   */
  isFloat: (num: number): boolean => {
    return !Number.isInteger(num);
  },

  /**
   * Convert string to number safely
   */
  toNumber: (value: string | number, fallback: number = 0): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  },

  /**
   * Format number with leading zeros
   */
  pad: (num: number, length: number): string => {
    return String(num).padStart(length, '0');
  },

  /**
   * Abbreviate large numbers (1k, 1m, 1b)
   */
  abbreviate: (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}b`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}m`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}k`;
    return num.toString();
  },

  /**
   * Get percentage difference between two numbers
   */
  percentChange: (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  /**
   * Format number with + sign for positive numbers
   */
  formatWithSign: (num: number): string => {
    if (num > 0) return `+${num}`;
    if (num < 0) return `${num}`;
    return '0';
  },
};

export default NumberUtils;