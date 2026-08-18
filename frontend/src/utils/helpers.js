// ============================================================================
// Helpers
// ============================================================================

/**
 * Helper functions for the parking management system.
 * 
 * This module provides:
 * - General utility functions
 * - Data formatting utilities
 * - Validation helpers
 * - String manipulation
 * - Date/time helpers
 * - Number utilities
 * - Array/object utilities
 * - File utilities
 * - Browser utilities
 */

import { REGEX, UI } from './constants';

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in a string
 */
export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Truncate a string to a specified length
 */
export const truncate = (str, length = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
};

/**
 * Slugify a string
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate a random string
 */
export const randomString = (length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a random ID
 */
export const generateId = () => {
  return `${Date.now()}_${randomString(6)}`;
};

/**
 * Mask sensitive data (e.g., credit card, phone, email)
 */
export const maskData = (data, type = 'credit_card') => {
  if (!data) return '';

  switch (type) {
    case 'credit_card':
      if (data.length <= 4) return data;
      return '****' + data.slice(-4);
    case 'phone':
      if (data.length <= 4) return data;
      return '***-***-' + data.slice(-4);
    case 'email':
      const parts = data.split('@');
      if (parts.length !== 2) return data;
      const masked = parts[0].slice(0, 2) + '***';
      return `${masked}@${parts[1]}`;
    default:
      return data;
  }
};

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Round to specified decimal places
 */
export const round = (number, decimals = 2) => {
  if (number === null || number === undefined) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
};

/**
 * Clamp a number between min and max
 */
export const clamp = (number, min, max) => {
  return Math.max(min, Math.min(max, number));
};

/**
 * Get random number between min and max
 */
export const randomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Check if value is a number
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

// ============================================================================
// Date/Time Utilities
// ============================================================================

/**
 * Format date
 */
export const formatDate = (date, format = UI.DATE_FORMATS.DISPLAY) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

/**
 * Format time
 */
export const formatTime = (date, format = UI.DATE_FORMATS.DISPLAY_TIME) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format date for input
 */
export const formatDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Format time for input
 */
export const formatTimeInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toTimeString().slice(0, 5);
};

/**
 * Get time ago string
 */
export const timeAgo = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  return d.getTime() > new Date().getTime();
};

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < new Date().getTime();
};

/**
 * Add days to date
 */
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Subtract days from date
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return REGEX.EMAIL.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  return REGEX.PHONE.test(phone);
};

/**
 * Validate license plate
 */
export const isValidLicensePlate = (plate) => {
  if (!plate) return false;
  return REGEX.LICENSE_PLATE.test(plate.toUpperCase());
};

/**
 * Validate VIN
 */
export const isValidVIN = (vin) => {
  if (!vin) return false;
  return REGEX.VIN.test(vin.toUpperCase());
};

/**
 * Validate URL
 */
export const isValidURL = (url) => {
  if (!url) return false;
  return REGEX.URL.test(url);
};

/**
 * Validate UUID
 */
export const isValidUUID = (uuid) => {
  if (!uuid) return false;
  return REGEX.UUID.test(uuid);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true, message: 'Password is strong' };
};

// ============================================================================
// Object/Array Utilities
// ============================================================================

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get nested object value by path
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  return current !== undefined ? current : defaultValue;
};

/**
 * Set nested object value by path
 */
export const setNestedValue = (obj, path, value) => {
  if (!obj || !path) return obj;
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
  return obj;
};

/**
 * Pick specific keys from an object
 */
export const pick = (obj, keys) => {
  if (!obj || !keys) return {};
  const result = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
};

/**
 * Omit specific keys from an object
 */
export const omit = (obj, keys) => {
  if (!obj) return {};
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  if (!array || !key) return {};
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  if (!array || !key) return array;
  return [...array].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (typeof valA === 'string') {
      return order === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    return order === 'asc' ? valA - valB : valB - valA;
  });
};

/**
 * Filter array by search term
 */
export const filterBySearch = (array, searchTerm, keys) => {
  if (!array || !searchTerm || !keys) return array;
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = getNestedValue(item, key);
      return value && String(value).toLowerCase().includes(term);
    });
  });
};

/**
 * Remove duplicates from array
 */
export const unique = (array, key) => {
  if (!array) return [];
  if (!key) return [...new Set(array)];
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// ============================================================================
// File Utilities
// ============================================================================

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Check if file is an image
 */
export const isImageFile = (file) => {
  if (!file) return false;
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (file.type) return imageTypes.includes(file.type);
  const ext = getFileExtension(file.name);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

/**
 * Check if file is a video
 */
export const isVideoFile = (file) => {
  if (!file) return false;
  const videoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (file.type) return videoTypes.includes(file.type);
  const ext = getFileExtension(file.name);
  return ['mp4', 'webm', 'ogg'].includes(ext);
};

/**
 * Check if file is a document
 */
export const isDocumentFile = (file) => {
  if (!file) return false;
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (file.type) return docTypes.includes(file.type);
  const ext = getFileExtension(file.name);
  return ['pdf', 'doc', 'docx'].includes(ext);
};

/**
 * Read file as base64
 */
export const readFileAsBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Read file as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// ============================================================================
// Browser Utilities
// ============================================================================

/**
 * Get browser name
 */
export const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if device is touch enabled
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Check if browser is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

/**
 * Get query parameter from URL
 */
export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

/**
 * Set query parameter in URL
 */
export const setQueryParam = (param, value) => {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
};

/**
 * Remove query parameter from URL
 */
export const removeQueryParam = (param) => {
  const url = new URL(window.location);
  url.searchParams.delete(param);
  window.history.pushState({}, '', url);
};

/**
 * Scroll to element
 */
export const scrollToElement = (elementId, options = { behavior: 'smooth' }) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView(options);
    return true;
  }
  return false;
};

/**
 * Scroll to top
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
};

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Generate random color
 */
export const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    active: '#4caf50',
    inactive: '#9e9e9e',
    pending: '#ff9800',
    completed: '#2196f3',
    cancelled: '#f44336',
    failed: '#f44336',
    available: '#4caf50',
    occupied: '#f44336',
    reserved: '#ff9800',
    maintenance: '#9e9e9e',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  };
  return colors[status] || '#9e9e9e';
};

/**
 * Get status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    maintenance: 'Maintenance',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
  };
  return labels[status] || status;
};

// ============================================================================
// Export
// ============================================================================

export default {
  // String Utilities
  capitalize,
  capitalizeWords,
  truncate,
  slugify,
  randomString,
  generateId,
  maskData,

  // Number Utilities
  formatCurrency,
  formatNumber,
  formatPercentage,
  round,
  clamp,
  randomNumber,
  isNumber,

  // Date/Time Utilities
  formatDate,
  formatTime,
  formatDateTime,
  formatDateInput,
  formatTimeInput,
  timeAgo,
  isToday,
  isFuture,
  isPast,
  addDays,
  subtractDays,

  // Validation Utilities
  isValidEmail,
  isValidPhone,
  isValidLicensePlate,
  isValidVIN,
  isValidURL,
  isValidUUID,
  validatePassword,

  // Object/Array Utilities
  deepClone,
  isEmpty,
  getNestedValue,
  setNestedValue,
  pick,
  omit,
  groupBy,
  sortBy,
  filterBySearch,
  unique,

  // File Utilities
  getFileExtension,
  formatFileSize,
  isImageFile,
  isVideoFile,
  isDocumentFile,
  readFileAsBase64,
  readFileAsText,

  // Browser Utilities
  getBrowser,
  isMobile,
  isTouchDevice,
  isOnline,
  copyToClipboard,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  scrollToElement,
  scrollToTop,

  // Color Utilities
  randomColor,
  getStatusColor,
  getStatusLabel,
};