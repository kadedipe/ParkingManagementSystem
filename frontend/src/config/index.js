// ============================================================================
// Configuration
// ============================================================================

/**
 * Application configuration for the parking management system.
 * 
 * This module provides:
 * - Environment variable loading
 * - Configuration validation
 * - Default values
 * - Environment-specific overrides
 * - Feature flags
 * - API configuration
 * - Authentication configuration
 * - UI configuration
 */

// ============================================================================
// Environment Variables
// ============================================================================

const env = import.meta.env;

// ============================================================================
// Configuration Validation
// ============================================================================

/**
 * Validate required environment variables
 */
const validateConfig = (config) => {
  const required = ['VITE_API_URL'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// ============================================================================
// Configuration Object
// ============================================================================

export const config = {
  // ==========================================================================
  // Application Configuration
  // ==========================================================================
  
  app: {
    name: env.VITE_APP_NAME || 'Parking Management System',
    version: env.VITE_APP_VERSION || '1.0.0',
    description: env.VITE_APP_DESCRIPTION || 'A comprehensive parking management system',
    environment: env.VITE_ENVIRONMENT || 'development',
    debug: env.VITE_DEBUG === 'true',
    url: env.VITE_APP_URL || 'http://localhost:5173',
  },
  
  // ==========================================================================
  // API Configuration
  // ==========================================================================
  
  api: {
    baseUrl: env.VITE_API_URL || 'http://localhost:8000',
    version: env.VITE_API_VERSION || 'v1',
    timeout: parseInt(env.VITE_API_TIMEOUT) || 30000,
    maxRetries: parseInt(env.VITE_API_MAX_RETRIES) || 3,
    withCredentials: true,
  },
  
  // ==========================================================================
  // WebSocket Configuration
  // ==========================================================================
  
  websocket: {
    url: env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws',
    reconnectAttempts: parseInt(env.VITE_WEBSOCKET_RECONNECT_ATTEMPTS) || 5,
    reconnectDelay: parseInt(env.VITE_WEBSOCKET_RECONNECT_DELAY) || 3000,
    heartbeatInterval: parseInt(env.VITE_WEBSOCKET_HEARTBEAT_INTERVAL) || 30000,
  },
  
  // ==========================================================================
  // Authentication Configuration
  // ==========================================================================
  
  auth: {
    tokenStorageKey: env.VITE_TOKEN_STORAGE_KEY || 'auth_token',
    refreshTokenStorageKey: env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'refresh_token',
    userStorageKey: env.VITE_USER_STORAGE_KEY || 'user_data',
    sessionTimeout: parseInt(env.VITE_SESSION_TIMEOUT_MINUTES) || 60,
    sessionWarning: parseInt(env.VITE_SESSION_WARNING_SECONDS) || 60,
  },
  
  // ==========================================================================
  // Feature Flags
  // ==========================================================================
  
  features: {
    parkingReservations: env.VITE_FEATURE_PARKING_RESERVATIONS === 'true',
    evCharging: env.VITE_FEATURE_EV_CHARGING === 'true',
    dynamicPricing: env.VITE_FEATURE_DYNAMIC_PRICING === 'true',
    advancedAnalytics: env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true',
    notifications: env.VITE_FEATURE_NOTIFICATIONS === 'true',
    mobileResponsive: env.VITE_FEATURE_MOBILE_RESPONSIVE === 'true',
    multiTenancy: env.VITE_FEATURE_MULTI_TENANCY === 'true',
  },
  
  // ==========================================================================
  // UI Configuration
  // ==========================================================================
  
  ui: {
    defaultTheme: env.VITE_DEFAULT_THEME || 'system',
    primaryColor: env.VITE_PRIMARY_COLOR || '#1976d2',
    secondaryColor: env.VITE_SECONDARY_COLOR || '#dc004e',
    defaultLocale: env.VITE_DEFAULT_LOCALE || 'en-US',
    dateFormat: env.VITE_DATE_FORMAT || 'MM/dd/yyyy',
    timeFormat: env.VITE_TIME_FORMAT || 'HH:mm',
    currencySymbol: env.VITE_CURRENCY_SYMBOL || '$',
    currencyCode: env.VITE_CURRENCY_CODE || 'USD',
  },
  
  // ==========================================================================
  // Payment Configuration
  // ==========================================================================
  
  payment: {
    stripePublishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    paypalClientId: env.VITE_PAYPAL_CLIENT_ID || '',
    testMode: env.VITE_PAYMENT_TEST_MODE === 'true',
    currency: env.VITE_PAYMENT_CURRENCY || 'USD',
    taxRate: parseFloat(env.VITE_PAYMENT_TAX_RATE) || 0,
    serviceFee: parseFloat(env.VITE_PAYMENT_SERVICE_FEE) || 0,
  },
  
  // ==========================================================================
  // Monitoring & Analytics
  // ==========================================================================
  
  monitoring: {
    sentryDsn: env.VITE_SENTRY_DSN || '',
    sentryEnvironment: env.VITE_SENTRY_ENVIRONMENT || 'development',
    googleAnalyticsId: env.VITE_GOOGLE_ANALYTICS_ID || '',
    analyticsEnabled: env.VITE_ANALYTICS_ENABLED === 'true',
    performanceMonitoringEnabled: env.VITE_PERFORMANCE_MONITORING_ENABLED === 'true',
  },
  
  // ==========================================================================
  // Map Configuration
  // ==========================================================================
  
  map: {
    googleMapsApiKey: env.VITE_GOOGLE_MAPS_API_KEY || '',
    defaultLatitude: parseFloat(env.VITE_MAP_DEFAULT_LATITUDE) || 37.7749,
    defaultLongitude: parseFloat(env.VITE_MAP_DEFAULT_LONGITUDE) || -122.4194,
    defaultZoom: parseInt(env.VITE_MAP_DEFAULT_ZOOM) || 13,
    provider: env.VITE_MAP_PROVIDER || 'google',
  },
  
  // ==========================================================================
  // File Upload Configuration
  // ==========================================================================
  
  upload: {
    maxFileSize: parseInt(env.VITE_MAX_FILE_SIZE) || 5242880, // 5MB
    allowedFileTypes: (env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    maxFilesPerUpload: parseInt(env.VITE_MAX_FILES_PER_UPLOAD) || 5,
    imageQuality: parseFloat(env.VITE_IMAGE_QUALITY) || 0.8,
  },
  
  // ==========================================================================
  // Caching Configuration
  // ==========================================================================
  
  cache: {
    serviceWorkerEnabled: env.VITE_SERVICE_WORKER_ENABLED === 'true',
    cacheVersion: env.VITE_CACHE_VERSION || '1.0.0',
    apiCacheTtl: parseInt(env.VITE_API_CACHE_TTL) || 300000, // 5 minutes
    staticCacheDuration: parseInt(env.VITE_STATIC_CACHE_DURATION) || 86400, // 24 hours
    maxCacheItems: parseInt(env.VITE_MAX_CACHE_ITEMS) || 100,
  },
  
  // ==========================================================================
  // Security Configuration
  // ==========================================================================
  
  security: {
    cspReportUri: env.VITE_CSP_REPORT_URI || '/csp-report',
    cspDevelopmentEnabled: env.VITE_CSP_DEVELOPMENT_ENABLED === 'true',
    cspProductionEnabled: env.VITE_CSP_PRODUCTION_ENABLED === 'true',
    passwordMinLength: parseInt(env.VITE_PASSWORD_MIN_LENGTH) || 8,
    maxLoginAttempts: parseInt(env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
    loginLockoutMinutes: parseInt(env.VITE_LOGIN_LOCKOUT_MINUTES) || 30,
  },
  
  // ==========================================================================
  // Development Configuration
  // ==========================================================================
  
  dev: {
    hmrEnabled: env.VITE_HMR_ENABLED !== 'false',
    sourceMapsEnabled: env.VITE_SOURCE_MAPS_ENABLED !== 'false',
    mockApiEnabled: env.VITE_MOCK_API_ENABLED === 'true',
    loggingEnabled: env.VITE_LOGGING_ENABLED !== 'false',
    devToolsEnabled: env.VITE_DEV_TOOLS_ENABLED !== 'false',
    storybookUrl: env.VITE_STORYBOOK_URL || 'http://localhost:6006',
  },
  
  // ==========================================================================
  // Notification Configuration
  // ==========================================================================
  
  notifications: {
    defaultDuration: parseInt(env.VITE_NOTIFICATION_DEFAULT_DURATION) || 5000,
    maxStackSize: parseInt(env.VITE_NOTIFICATION_MAX_STACK) || 5,
    position: env.VITE_NOTIFICATION_POSITION || 'top-right',
    soundEnabled: env.VITE_NOTIFICATION_SOUND_ENABLED === 'true',
  },
  
  // ==========================================================================
  // Date/Time Configuration
  // ==========================================================================
  
  datetime: {
    timezone: env.VITE_TIMEZONE || 'UTC',
    dateFormat: env.VITE_DATE_FORMAT || 'MM/dd/yyyy',
    timeFormat: env.VITE_TIME_FORMAT || 'HH:mm',
    dateTimeFormat: env.VITE_DATETIME_FORMAT || 'MM/dd/yyyy HH:mm',
    relativeTime: env.VITE_RELATIVE_TIME === 'true',
  },
  
  // ==========================================================================
  // Pagination Configuration
  // ==========================================================================
  
  pagination: {
    defaultPageSize: parseInt(env.VITE_DEFAULT_PAGE_SIZE) || 20,
    pageSizeOptions: (env.VITE_PAGE_SIZE_OPTIONS || '10,20,50,100').split(',').map(Number),
    maxPageSize: parseInt(env.VITE_MAX_PAGE_SIZE) || 100,
  },
};

// ============================================================================
// Validate Configuration
// ============================================================================

validateConfig(config);

// ============================================================================
// Environment Helpers
// ============================================================================

export const isDevelopment = config.app.environment === 'development';
export const isStaging = config.app.environment === 'staging';
export const isProduction = config.app.environment === 'production';
export const isTesting = config.app.environment === 'testing';
export const isDebug = config.app.debug;

// ============================================================================
// API URL Helpers
// ============================================================================

export const getApiUrl = (path = '') => {
  const baseUrl = config.api.baseUrl;
  const version = config.api.version;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api/${version}${cleanPath}`;
};

export const getWebSocketUrl = () => {
  return config.websocket.url;
};

// ============================================================================
// Feature Flag Helpers
// ============================================================================

export const isFeatureEnabled = (feature) => {
  return config.features[feature] === true;
};

// ============================================================================
// Configuration Helpers
// ============================================================================

export const getConfig = (key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], config);
};

export const getEnv = (key, defaultValue = null) => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// ============================================================================
// Export
// ============================================================================

export default config;