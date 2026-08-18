// ============================================================================
// Shared Utils - Main Export Index
// ============================================================================

// parking-management-system/shared/utils/src/index.ts

// Export all utility modules
export * from './date';
export * from './time';
export * from './number';
export * from './currency';
export * from './string';
export * from './slug';
export * from './validation';
export * from './validation/email';
export * from './validation/phone';
export * from './validation/password';
export * from './validation/credit-card';
export * from './security/jwt';
export * from './security/encryption';
export * from './security/hash';
export * from './formatting/date';
export * from './formatting/number';
export * from './formatting/currency';
export * from './formatting/phone';
export * from './array';
export * from './object';
export * from './url';
export * from './file';
export * from './browser';
export * from './async';
export * from './types';
export * from './api';
export * from './storage';
export * from './logger';
export * from './constants';

// Re-export commonly used functions
export { default as _ } from 'lodash';
export { format as formatDateFns, formatDistance, formatRelative } from 'date-fns';

// Export version
export const VERSION = '2.0.0';

// Export package name
export const PACKAGE_NAME = '@parking-system/utils';