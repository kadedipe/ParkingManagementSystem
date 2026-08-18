// ============================================================================
// Constants - Application Constants
// ============================================================================

// parking-management-system/mobile/src/utils/constants.ts

import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Application Constants
 */
export const APP_CONSTANTS = {
  // App Information
  APP_NAME: 'Parking Management System',
  APP_VERSION: '2.0.0',
  APP_BUILD: '2024.08.10',
  BUNDLE_ID: 'com.parkingmanagement.app',
  
  // API Configuration
  API: {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8080',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // WebSocket Configuration
  WEBSOCKET: {
    URL: process.env.EXPO_PUBLIC_WS_URL || process.env.WS_URL || 'ws://localhost:8080/ws',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000,
    HEARTBEAT_INTERVAL: 15000,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
    THEME: 'theme',
    LANGUAGE: 'language',
    ONBOARDING_COMPLETE: 'onboardingComplete',
    NOTIFICATION_TOKEN: 'notificationToken',
    LAST_SYNC: 'lastSync',
  },
  
  // Screen Dimensions
  SCREEN: {
    WIDTH: width,
    HEIGHT: height,
    IS_SMALL: width < 375,
    IS_MEDIUM: width >= 375 && width < 768,
    IS_LARGE: width >= 768,
  },
  
  // Platform Information
  PLATFORM: {
    IS_IOS: Platform.OS === 'ios',
    IS_ANDROID: Platform.OS === 'android',
    IS_WEB: Platform.OS === 'web',
    VERSION: Platform.Version,
  },
  
  // Date & Time Formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_SHORT: 'MMM dd',
    DISPLAY_LONG: 'EEEE, MMMM dd, yyyy',
    TIME: 'h:mm a',
    TIME_SHORT: 'h:mm a',
    DATE_TIME: 'MMM dd, yyyy h:mm a',
    ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
    API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  },
  
  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  
  // Map Configuration
  MAP: {
    DEFAULT_LATITUDE: 37.78825,
    DEFAULT_LONGITUDE: -122.4324,
    DEFAULT_DELTA: 0.0922,
    MAX_DELTA: 0.5,
    MIN_DELTA: 0.01,
  },
  
  // Animation Durations
  ANIMATION: {
    FAST: 200,
    NORMAL: 400,
    SLOW: 600,
    VERY_SLOW: 1000,
  },
  
  // Debounce Delays
  DEBOUNCE: {
    SEARCH: 300,
    SAVE: 500,
    TYPING: 200,
  },
  
  // Upload Limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    MAX_IMAGES: 5,
  },
  
  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 32,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  
  // Phone Number Format
  PHONE: {
    DEFAULT_COUNTRY: 'US',
    DEFAULT_COUNTRY_CODE: '+1',
    MASK: '(999) 999-9999',
  },
  
  // Map of Country Codes
  COUNTRY_CODES: [
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  ],
  
  // Error Messages
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION: 'Please check your input.',
    UNKNOWN: 'An unexpected error occurred.',
  },
  
  // Success Messages
  SUCCESS: {
    SAVED: 'Saved successfully!',
    UPDATED: 'Updated successfully!',
    DELETED: 'Deleted successfully!',
    BOOKED: 'Booking confirmed!',
    PAYMENT: 'Payment successful!',
  },
  
  // Timeout Durations
  TIMEOUTS: {
    SPLASH: 2000,
    TOAST: 3000,
    ALERT: 5000,
    LOADING: 10000,
    REFRESH: 3000,
    LOCATION: 5000,
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_BIOMETRIC: true,
    ENABLE_SOCIAL_LOGIN: true,
    ENABLE_TWO_FACTOR: true,
    ENABLE_DARK_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_CHAT_SUPPORT: false,
  },
  
  // Default Settings
  DEFAULTS: {
    THEME: 'light',
    LANGUAGE: 'en',
    CURRENCY: 'USD',
    DISTANCE_UNIT: 'km',
    TIMEZONE: 'America/New_York',
  },
  
  // Supported Languages
  LANGUAGES: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
  ],
  
  // Currencies
  CURRENCIES: [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ],
  
  // Booking Statuses
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  
  // Payment Statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  
  // Parking Statuses
  PARKING_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    MAINTENANCE: 'maintenance',
  },
  
  // Charging Connector Types
  CHARGING_CONNECTOR_TYPES: {
    TYPE1: 'type1',
    TYPE2: 'type2',
    CCS: 'ccs',
    CHADEMO: 'chademo',
    TESLA: 'tesla',
  },
  
  // Charging Power Levels
  CHARGING_POWER: {
    STANDARD: 'standard',
    FAST: 'fast',
    RAPID: 'rapid',
  },
  
  // User Roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    MANAGER: 'manager',
  },
};

export default APP_CONSTANTS;