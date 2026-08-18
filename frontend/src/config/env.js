// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Environment configuration for the parking management system.
 * 
 * This module provides:
 * - Environment variable loading and validation
 * - Type-safe environment access
 * - Default values for all environments
 * - Environment detection helpers
 * - Runtime environment configuration
 */

// ============================================================================
// Environment Variables Interface
// ============================================================================

/**
 * @typedef {Object} EnvConfig
 * @property {string} APP_NAME - Application name
 * @property {string} APP_VERSION - Application version
 * @property {string} APP_DESCRIPTION - Application description
 * @property {string} ENVIRONMENT - Current environment (development, staging, production, testing)
 * @property {boolean} DEBUG - Debug mode enabled
 * @property {string} API_URL - Backend API URL
 * @property {string} API_VERSION - API version
 * @property {number} API_TIMEOUT - API timeout in milliseconds
 * @property {number} API_MAX_RETRIES - Maximum API retry attempts
 * @property {string} WEBSOCKET_URL - WebSocket URL
 * @property {number} WEBSOCKET_RECONNECT_ATTEMPTS - WebSocket reconnection attempts
 * @property {number} WEBSOCKET_RECONNECT_DELAY - WebSocket reconnection delay in ms
 * @property {string} TOKEN_STORAGE_KEY - Token storage key
 * @property {string} REFRESH_TOKEN_STORAGE_KEY - Refresh token storage key
 * @property {number} SESSION_TIMEOUT_MINUTES - Session timeout in minutes
 * @property {number} SESSION_WARNING_SECONDS - Session warning in seconds
 * @property {string} DEFAULT_THEME - Default theme (light, dark, system)
 * @property {string} PRIMARY_COLOR - Primary color
 * @property {string} SECONDARY_COLOR - Secondary color
 * @property {string} DEFAULT_LOCALE - Default locale
 * @property {string} DATE_FORMAT - Date format
 * @property {string} TIME_FORMAT - Time format
 * @property {string} CURRENCY_SYMBOL - Currency symbol
 * @property {string} CURRENCY_CODE - Currency code
 * @property {string} STRIPE_PUBLISHABLE_KEY - Stripe publishable key
 * @property {string} PAYPAL_CLIENT_ID - PayPal client ID
 * @property {boolean} PAYMENT_TEST_MODE - Payment test mode enabled
 * @property {string} SENTRY_DSN - Sentry DSN
 * @property {string} SENTRY_ENVIRONMENT - Sentry environment
 * @property {string} GOOGLE_ANALYTICS_ID - Google Analytics ID
 * @property {boolean} ANALYTICS_ENABLED - Analytics enabled
 * @property {boolean} PERFORMANCE_MONITORING_ENABLED - Performance monitoring enabled
 * @property {string} GOOGLE_MAPS_API_KEY - Google Maps API key
 * @property {number} MAP_DEFAULT_LATITUDE - Default map latitude
 * @property {number} MAP_DEFAULT_LONGITUDE - Default map longitude
 * @property {number} MAP_DEFAULT_ZOOM - Default map zoom
 * @property {number} MAX_FILE_SIZE - Maximum file size in bytes
 * @property {string[]} ALLOWED_FILE_TYPES - Allowed file types
 * @property {number} MAX_FILES_PER_UPLOAD - Maximum files per upload
 * @property {boolean} SERVICE_WORKER_ENABLED - Service worker enabled
 * @property {string} CACHE_VERSION - Cache version
 * @property {number} API_CACHE_TTL - API cache TTL in milliseconds
 * @property {number} STATIC_CACHE_DURATION - Static cache duration in seconds
 * @property {boolean} CSP_DEVELOPMENT_ENABLED - CSP development enabled
 * @property {boolean} CSP_PRODUCTION_ENABLED - CSP production enabled
 * @property {boolean} HMR_ENABLED - HMR enabled
 * @property {boolean} SOURCE_MAPS_ENABLED - Source maps enabled
 * @property {boolean} MOCK_API_ENABLED - Mock API enabled
 * @property {boolean} LOGGING_ENABLED - Logging enabled
 * @property {boolean} DEV_TOOLS_ENABLED - Dev tools enabled
 */

// ============================================================================
// Environment Variables
// ============================================================================

const {
  // Application
  VITE_APP_NAME = 'Parking Management System',
  VITE_APP_VERSION = '1.0.0',
  VITE_APP_DESCRIPTION = 'A comprehensive parking management system',
  VITE_ENVIRONMENT = 'development',
  VITE_DEBUG = 'false',
  VITE_APP_URL = 'http://localhost:5173',

  // API
  VITE_API_URL = 'http://localhost:8000',
  VITE_API_VERSION = 'v1',
  VITE_API_TIMEOUT = '30000',
  VITE_API_MAX_RETRIES = '3',

  // WebSocket
  VITE_WEBSOCKET_URL = 'ws://localhost:8000/ws',
  VITE_WEBSOCKET_RECONNECT_ATTEMPTS = '5',
  VITE_WEBSOCKET_RECONNECT_DELAY = '3000',
  VITE_WEBSOCKET_HEARTBEAT_INTERVAL = '30000',

  // Authentication
  VITE_TOKEN_STORAGE_KEY = 'auth_token',
  VITE_REFRESH_TOKEN_STORAGE_KEY = 'refresh_token',
  VITE_USER_STORAGE_KEY = 'user_data',
  VITE_SESSION_TIMEOUT_MINUTES = '60',
  VITE_SESSION_WARNING_SECONDS = '60',

  // Features
  VITE_FEATURE_PARKING_RESERVATIONS = 'true',
  VITE_FEATURE_EV_CHARGING = 'true',
  VITE_FEATURE_DYNAMIC_PRICING = 'false',
  VITE_FEATURE_ADVANCED_ANALYTICS = 'true',
  VITE_FEATURE_NOTIFICATIONS = 'true',
  VITE_FEATURE_MOBILE_RESPONSIVE = 'true',
  VITE_FEATURE_MULTI_TENANCY = 'false',

  // UI
  VITE_DEFAULT_THEME = 'system',
  VITE_PRIMARY_COLOR = '#1976d2',
  VITE_SECONDARY_COLOR = '#dc004e',
  VITE_DEFAULT_LOCALE = 'en-US',
  VITE_DATE_FORMAT = 'MM/dd/yyyy',
  VITE_TIME_FORMAT = 'HH:mm',
  VITE_CURRENCY_SYMBOL = '$',
  VITE_CURRENCY_CODE = 'USD',

  // Payment
  VITE_STRIPE_PUBLISHABLE_KEY = '',
  VITE_PAYPAL_CLIENT_ID = '',
  VITE_PAYMENT_TEST_MODE = 'true',
  VITE_PAYMENT_CURRENCY = 'USD',
  VITE_PAYMENT_TAX_RATE = '0',
  VITE_PAYMENT_SERVICE_FEE = '0',

  // Monitoring
  VITE_SENTRY_DSN = '',
  VITE_SENTRY_ENVIRONMENT = 'development',
  VITE_GOOGLE_ANALYTICS_ID = '',
  VITE_ANALYTICS_ENABLED = 'false',
  VITE_PERFORMANCE_MONITORING_ENABLED = 'true',

  // Map
  VITE_GOOGLE_MAPS_API_KEY = '',
  VITE_MAP_DEFAULT_LATITUDE = '37.7749',
  VITE_MAP_DEFAULT_LONGITUDE = '-122.4194',
  VITE_MAP_DEFAULT_ZOOM = '13',
  VITE_MAP_PROVIDER = 'google',

  // File Upload
  VITE_MAX_FILE_SIZE = '5242880',
  VITE_ALLOWED_FILE_TYPES = 'image/jpeg,image/png,image/gif,image/webp',
  VITE_MAX_FILES_PER_UPLOAD = '5',
  VITE_IMAGE_QUALITY = '0.8',

  // Cache
  VITE_SERVICE_WORKER_ENABLED = 'true',
  VITE_CACHE_VERSION = '1.0.0',
  VITE_API_CACHE_TTL = '300000',
  VITE_STATIC_CACHE_DURATION = '86400',
  VITE_MAX_CACHE_ITEMS = '100',

  // Security
  VITE_CSP_REPORT_URI = '/csp-report',
  VITE_CSP_DEVELOPMENT_ENABLED = 'false',
  VITE_CSP_PRODUCTION_ENABLED = 'true',
  VITE_PASSWORD_MIN_LENGTH = '8',
  VITE_MAX_LOGIN_ATTEMPTS = '5',
  VITE_LOGIN_LOCKOUT_MINUTES = '30',

  // Development
  VITE_HMR_ENABLED = 'true',
  VITE_SOURCE_MAPS_ENABLED = 'true',
  VITE_MOCK_API_ENABLED = 'false',
  VITE_LOGGING_ENABLED = 'true',
  VITE_DEV_TOOLS_ENABLED = 'true',
  VITE_STORYBOOK_URL = 'http://localhost:6006',

  // Notifications
  VITE_NOTIFICATION_DEFAULT_DURATION = '5000',
  VITE_NOTIFICATION_MAX_STACK = '5',
  VITE_NOTIFICATION_POSITION = 'top-right',
  VITE_NOTIFICATION_SOUND_ENABLED = 'false',

  // Date/Time
  VITE_TIMEZONE = 'UTC',
  VITE_DATETIME_FORMAT = 'MM/dd/yyyy HH:mm',
  VITE_RELATIVE_TIME = 'true',

  // Pagination
  VITE_DEFAULT_PAGE_SIZE = '20',
  VITE_PAGE_SIZE_OPTIONS = '10,20,50,100',
  VITE_MAX_PAGE_SIZE = '100',
} = import.meta.env;

// ============================================================================
// Parse Environment Variables
// ============================================================================

/**
 * Parse boolean from string
 */
const parseBool = (value) => {
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
};

/**
 * Parse number from string
 */
const parseNumber = (value, defaultValue = 0) => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse array from string
 */
const parseArray = (value, separator = ',') => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return value.split(separator).map(item => item.trim());
};

// ============================================================================
// Environment Configuration Object
// ============================================================================

export const env = {
  // ==========================================================================
  // Application Configuration
  // ==========================================================================

  app: {
    name: VITE_APP_NAME,
    version: VITE_APP_VERSION,
    description: VITE_APP_DESCRIPTION,
    environment: VITE_ENVIRONMENT,
    debug: parseBool(VITE_DEBUG),
    url: VITE_APP_URL,
  },

  // ==========================================================================
  // API Configuration
  // ==========================================================================

  api: {
    url: VITE_API_URL,
    version: VITE_API_VERSION,
    timeout: parseNumber(VITE_API_TIMEOUT, 30000),
    maxRetries: parseNumber(VITE_API_MAX_RETRIES, 3),
  },

  // ==========================================================================
  // WebSocket Configuration
  // ==========================================================================

  websocket: {
    url: VITE_WEBSOCKET_URL,
    reconnectAttempts: parseNumber(VITE_WEBSOCKET_RECONNECT_ATTEMPTS, 5),
    reconnectDelay: parseNumber(VITE_WEBSOCKET_RECONNECT_DELAY, 3000),
    heartbeatInterval: parseNumber(VITE_WEBSOCKET_HEARTBEAT_INTERVAL, 30000),
  },

  // ==========================================================================
  // Authentication Configuration
  // ==========================================================================

  auth: {
    tokenStorageKey: VITE_TOKEN_STORAGE_KEY,
    refreshTokenStorageKey: VITE_REFRESH_TOKEN_STORAGE_KEY,
    userStorageKey: VITE_USER_STORAGE_KEY,
    sessionTimeout: parseNumber(VITE_SESSION_TIMEOUT_MINUTES, 60),
    sessionWarning: parseNumber(VITE_SESSION_WARNING_SECONDS, 60),
  },

  // ==========================================================================
  // Feature Flags
  // ==========================================================================

  features: {
    parkingReservations: parseBool(VITE_FEATURE_PARKING_RESERVATIONS),
    evCharging: parseBool(VITE_FEATURE_EV_CHARGING),
    dynamicPricing: parseBool(VITE_FEATURE_DYNAMIC_PRICING),
    advancedAnalytics: parseBool(VITE_FEATURE_ADVANCED_ANALYTICS),
    notifications: parseBool(VITE_FEATURE_NOTIFICATIONS),
    mobileResponsive: parseBool(VITE_FEATURE_MOBILE_RESPONSIVE),
    multiTenancy: parseBool(VITE_FEATURE_MULTI_TENANCY),
  },

  // ==========================================================================
  // UI Configuration
  // ==========================================================================

  ui: {
    defaultTheme: VITE_DEFAULT_THEME,
    primaryColor: VITE_PRIMARY_COLOR,
    secondaryColor: VITE_SECONDARY_COLOR,
    defaultLocale: VITE_DEFAULT_LOCALE,
    dateFormat: VITE_DATE_FORMAT,
    timeFormat: VITE_TIME_FORMAT,
    currencySymbol: VITE_CURRENCY_SYMBOL,
    currencyCode: VITE_CURRENCY_CODE,
  },

  // ==========================================================================
  // Payment Configuration
  // ==========================================================================

  payment: {
    stripePublishableKey: VITE_STRIPE_PUBLISHABLE_KEY,
    paypalClientId: VITE_PAYPAL_CLIENT_ID,
    testMode: parseBool(VITE_PAYMENT_TEST_MODE),
    currency: VITE_PAYMENT_CURRENCY,
    taxRate: parseNumber(VITE_PAYMENT_TAX_RATE, 0),
    serviceFee: parseNumber(VITE_PAYMENT_SERVICE_FEE, 0),
  },

  // ==========================================================================
  // Monitoring & Analytics
  // ==========================================================================

  monitoring: {
    sentryDsn: VITE_SENTRY_DSN,
    sentryEnvironment: VITE_SENTRY_ENVIRONMENT,
    googleAnalyticsId: VITE_GOOGLE_ANALYTICS_ID,
    analyticsEnabled: parseBool(VITE_ANALYTICS_ENABLED),
    performanceMonitoringEnabled: parseBool(VITE_PERFORMANCE_MONITORING_ENABLED),
  },

  // ==========================================================================
  // Map Configuration
  // ==========================================================================

  map: {
    googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY,
    defaultLatitude: parseNumber(VITE_MAP_DEFAULT_LATITUDE, 37.7749),
    defaultLongitude: parseNumber(VITE_MAP_DEFAULT_LONGITUDE, -122.4194),
    defaultZoom: parseNumber(VITE_MAP_DEFAULT_ZOOM, 13),
    provider: VITE_MAP_PROVIDER,
  },

  // ==========================================================================
  // File Upload Configuration
  // ==========================================================================

  upload: {
    maxFileSize: parseNumber(VITE_MAX_FILE_SIZE, 5242880),
    allowedFileTypes: parseArray(VITE_ALLOWED_FILE_TYPES),
    maxFilesPerUpload: parseNumber(VITE_MAX_FILES_PER_UPLOAD, 5),
    imageQuality: parseNumber(VITE_IMAGE_QUALITY, 0.8),
  },

  // ==========================================================================
  // Caching Configuration
  // ==========================================================================

  cache: {
    serviceWorkerEnabled: parseBool(VITE_SERVICE_WORKER_ENABLED),
    cacheVersion: VITE_CACHE_VERSION,
    apiCacheTtl: parseNumber(VITE_API_CACHE_TTL, 300000),
    staticCacheDuration: parseNumber(VITE_STATIC_CACHE_DURATION, 86400),
    maxCacheItems: parseNumber(VITE_MAX_CACHE_ITEMS, 100),
  },

  // ==========================================================================
  // Security Configuration
  // ==========================================================================

  security: {
    cspReportUri: VITE_CSP_REPORT_URI,
    cspDevelopmentEnabled: parseBool(VITE_CSP_DEVELOPMENT_ENABLED),
    cspProductionEnabled: parseBool(VITE_CSP_PRODUCTION_ENABLED),
    passwordMinLength: parseNumber(VITE_PASSWORD_MIN_LENGTH, 8),
    maxLoginAttempts: parseNumber(VITE_MAX_LOGIN_ATTEMPTS, 5),
    loginLockoutMinutes: parseNumber(VITE_LOGIN_LOCKOUT_MINUTES, 30),
  },

  // ==========================================================================
  // Development Configuration
  // ==========================================================================

  dev: {
    hmrEnabled: parseBool(VITE_HMR_ENABLED),
    sourceMapsEnabled: parseBool(VITE_SOURCE_MAPS_ENABLED),
    mockApiEnabled: parseBool(VITE_MOCK_API_ENABLED),
    loggingEnabled: parseBool(VITE_LOGGING_ENABLED),
    devToolsEnabled: parseBool(VITE_DEV_TOOLS_ENABLED),
    storybookUrl: VITE_STORYBOOK_URL,
  },

  // ==========================================================================
  // Notification Configuration
  // ==========================================================================

  notifications: {
    defaultDuration: parseNumber(VITE_NOTIFICATION_DEFAULT_DURATION, 5000),
    maxStackSize: parseNumber(VITE_NOTIFICATION_MAX_STACK, 5),
    position: VITE_NOTIFICATION_POSITION,
    soundEnabled: parseBool(VITE_NOTIFICATION_SOUND_ENABLED),
  },

  // ==========================================================================
  // Date/Time Configuration
  // ==========================================================================

  datetime: {
    timezone: VITE_TIMEZONE,
    dateFormat: VITE_DATE_FORMAT,
    timeFormat: VITE_TIME_FORMAT,
    dateTimeFormat: VITE_DATETIME_FORMAT,
    relativeTime: parseBool(VITE_RELATIVE_TIME),
  },

  // ==========================================================================
  // Pagination Configuration
  // ==========================================================================

  pagination: {
    defaultPageSize: parseNumber(VITE_DEFAULT_PAGE_SIZE, 20),
    pageSizeOptions: parseArray(VITE_PAGE_SIZE_OPTIONS).map(Number),
    maxPageSize: parseNumber(VITE_MAX_PAGE_SIZE, 100),
  },
};

// ============================================================================
// Environment Helpers
// ============================================================================

/**
 * Check if running in development environment
 */
export const isDevelopment = env.app.environment === 'development';

/**
 * Check if running in staging environment
 */
export const isStaging = env.app.environment === 'staging';

/**
 * Check if running in production environment
 */
export const isProduction = env.app.environment === 'production';

/**
 * Check if running in testing environment
 */
export const isTesting = env.app.environment === 'testing';

/**
 * Check if debug mode is enabled
 */
export const isDebug = env.app.debug;

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = env.monitoring.analyticsEnabled;

/**
 * Check if performance monitoring is enabled
 */
export const isPerformanceMonitoringEnabled = env.monitoring.performanceMonitoringEnabled;

/**
 * Check if mock API is enabled
 */
export const isMockApiEnabled = env.dev.mockApiEnabled;

/**
 * Check if logging is enabled
 */
export const isLoggingEnabled = env.dev.loggingEnabled;

// ============================================================================
// Environment Configuration Accessors
// ============================================================================

/**
 * Get environment configuration
 */
export const getEnv = (key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], env);
};

/**
 * Get API URL
 */
export const getApiUrl = (path = '') => {
  const baseUrl = env.api.url;
  const version = env.api.version;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api/${version}${cleanPath}`;
};

/**
 * Get WebSocket URL
 */
export const getWebSocketUrl = () => {
  return env.websocket.url;
};

/**
 * Get feature flag status
 */
export const isFeatureEnabled = (feature) => {
  return env.features[feature] === true;
};

/**
 * Get environment name
 */
export const getEnvironment = () => {
  return env.app.environment;
};

/**
 * Get application name
 */
export const getAppName = () => {
  return env.app.name;
};

/**
 * Get application version
 */
export const getAppVersion = () => {
  return env.app.version;
};

// ============================================================================
// Environment Validation
// ============================================================================

/**
 * Validate required environment variables
 */
export const validateEnv = () => {
  const required = [
    'app.environment',
    'api.url',
    'auth.tokenStorageKey',
    'auth.refreshTokenStorageKey',
  ];

  const missing = required.filter(key => {
    const value = getEnv(key);
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing required environment variables: ${missing.join(', ')}`
    );
    return false;
  }

  return true;
};

/**
 * Log environment configuration (for debugging)
 */
export const logEnvironment = () => {
  console.log('========================================');
  console.log('🚀 Environment Configuration');
  console.log('========================================');
  console.log(`📦 App: ${env.app.name} (v${env.app.version})`);
  console.log(`🌍 Environment: ${env.app.environment}`);
  console.log(`🐛 Debug: ${env.app.debug}`);
  console.log(`🔗 API URL: ${env.api.url}`);
  console.log(`🔌 WebSocket URL: ${env.websocket.url}`);
  console.log(`📊 Analytics: ${env.monitoring.analyticsEnabled}`);
  console.log(`⚡ Features:`, env.features);
  console.log('========================================');
};

// ============================================================================
// Export
// ============================================================================

export default env;