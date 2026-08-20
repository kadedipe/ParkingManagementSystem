// ============================================================================
// Production-safe frontend configuration
// ============================================================================

const env = import.meta.env;

const getBrowserOrigin = () => (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
const getBrowserWebSocket = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8000/ws';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

export const config = {
  app: {
    name: env.VITE_APP_NAME || 'Parking Management System',
    version: env.VITE_APP_VERSION || '1.0.0',
    description: env.VITE_APP_DESCRIPTION || 'A comprehensive parking management system',
    environment: env.VITE_ENVIRONMENT || (import.meta.env.PROD ? 'production' : 'development'),
    debug: env.VITE_DEBUG === 'true',
    url: env.VITE_APP_URL || getBrowserOrigin(),
  },

  api: {
    baseUrl: env.VITE_API_URL || getBrowserOrigin(),
    version: env.VITE_API_VERSION || 'v1',
    timeout: Number.parseInt(env.VITE_API_TIMEOUT || '30000', 10),
    maxRetries: Number.parseInt(env.VITE_API_MAX_RETRIES || '3', 10),
    withCredentials: true,
  },

  websocket: {
    url: env.VITE_WEBSOCKET_URL || getBrowserWebSocket(),
    reconnectAttempts: Number.parseInt(env.VITE_WEBSOCKET_RECONNECT_ATTEMPTS || '5', 10),
    reconnectDelay: Number.parseInt(env.VITE_WEBSOCKET_RECONNECT_DELAY || '3000', 10),
    heartbeatInterval: Number.parseInt(env.VITE_WEBSOCKET_HEARTBEAT_INTERVAL || '30000', 10),
  },

  auth: {
    tokenStorageKey: env.VITE_TOKEN_STORAGE_KEY || 'auth_token',
    refreshTokenStorageKey: env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'refresh_token',
    userStorageKey: env.VITE_USER_STORAGE_KEY || 'user_data',
    sessionTimeout: Number.parseInt(env.VITE_SESSION_TIMEOUT_MINUTES || '60', 10),
    sessionWarning: Number.parseInt(env.VITE_SESSION_WARNING_SECONDS || '60', 10),
  },

  features: {
    parkingReservations: env.VITE_FEATURE_PARKING_RESERVATIONS === 'true',
    evCharging: env.VITE_FEATURE_EV_CHARGING === 'true',
    dynamicPricing: env.VITE_FEATURE_DYNAMIC_PRICING === 'true',
    advancedAnalytics: env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true',
    notifications: env.VITE_FEATURE_NOTIFICATIONS === 'true',
    mobileResponsive: env.VITE_FEATURE_MOBILE_RESPONSIVE !== 'false',
    multiTenancy: env.VITE_FEATURE_MULTI_TENANCY === 'true',
  },

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

  payment: {
    stripePublishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    paypalClientId: env.VITE_PAYPAL_CLIENT_ID || '',
    testMode: env.VITE_PAYMENT_TEST_MODE === 'true',
    currency: env.VITE_PAYMENT_CURRENCY || 'USD',
    taxRate: Number.parseFloat(env.VITE_PAYMENT_TAX_RATE || '0'),
    serviceFee: Number.parseFloat(env.VITE_PAYMENT_SERVICE_FEE || '0'),
  },

  monitoring: {
    sentryDsn: env.VITE_SENTRY_DSN || '',
    sentryEnvironment: env.VITE_SENTRY_ENVIRONMENT || (import.meta.env.PROD ? 'production' : 'development'),
    googleAnalyticsId: env.VITE_GOOGLE_ANALYTICS_ID || '',
    analyticsEnabled: env.VITE_ANALYTICS_ENABLED === 'true',
    performanceMonitoringEnabled: env.VITE_PERFORMANCE_MONITORING_ENABLED === 'true',
  },

  map: {
    googleMapsApiKey: env.VITE_GOOGLE_MAPS_API_KEY || '',
    defaultLatitude: Number.parseFloat(env.VITE_MAP_DEFAULT_LATITUDE || '0.3476'),
    defaultLongitude: Number.parseFloat(env.VITE_MAP_DEFAULT_LONGITUDE || '32.5825'),
    defaultZoom: Number.parseInt(env.VITE_MAP_DEFAULT_ZOOM || '13', 10),
    provider: env.VITE_MAP_PROVIDER || 'google',
  },

  upload: {
    maxFileSize: Number.parseInt(env.VITE_MAX_FILE_SIZE || '5242880', 10),
    allowedFileTypes: (env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    maxFilesPerUpload: Number.parseInt(env.VITE_MAX_FILES_PER_UPLOAD || '5', 10),
    imageQuality: Number.parseFloat(env.VITE_IMAGE_QUALITY || '0.8'),
  },

  cache: {
    serviceWorkerEnabled: env.VITE_SERVICE_WORKER_ENABLED === 'true',
    cacheVersion: env.VITE_CACHE_VERSION || '1.0.0',
    apiCacheTtl: Number.parseInt(env.VITE_API_CACHE_TTL || '300000', 10),
    staticCacheDuration: Number.parseInt(env.VITE_STATIC_CACHE_DURATION || '86400', 10),
    maxCacheItems: Number.parseInt(env.VITE_MAX_CACHE_ITEMS || '100', 10),
  },

  security: {
    cspReportUri: env.VITE_CSP_REPORT_URI || '/csp-report',
    cspDevelopmentEnabled: env.VITE_CSP_DEVELOPMENT_ENABLED === 'true',
    cspProductionEnabled: env.VITE_CSP_PRODUCTION_ENABLED !== 'false',
    passwordMinLength: Number.parseInt(env.VITE_PASSWORD_MIN_LENGTH || '8', 10),
    maxLoginAttempts: Number.parseInt(env.VITE_MAX_LOGIN_ATTEMPTS || '5', 10),
    loginLockoutMinutes: Number.parseInt(env.VITE_LOGIN_LOCKOUT_MINUTES || '30', 10),
  },

  dev: {
    hmrEnabled: env.VITE_HMR_ENABLED !== 'false',
    sourceMapsEnabled: env.VITE_SOURCE_MAPS_ENABLED !== 'false',
    mockApiEnabled: env.VITE_MOCK_API_ENABLED === 'true',
    loggingEnabled: env.VITE_LOGGING_ENABLED !== 'false',
    devToolsEnabled: env.VITE_DEV_TOOLS_ENABLED !== 'false',
    storybookUrl: env.VITE_STORYBOOK_URL || 'http://localhost:6006',
  },

  notifications: {
    defaultDuration: Number.parseInt(env.VITE_NOTIFICATION_DEFAULT_DURATION || '5000', 10),
    maxStackSize: Number.parseInt(env.VITE_NOTIFICATION_MAX_STACK || '5', 10),
    position: env.VITE_NOTIFICATION_POSITION || 'top-right',
    soundEnabled: env.VITE_NOTIFICATION_SOUND_ENABLED === 'true',
  },

  datetime: {
    timezone: env.VITE_TIMEZONE || 'UTC',
    dateFormat: env.VITE_DATE_FORMAT || 'MM/dd/yyyy',
    timeFormat: env.VITE_TIME_FORMAT || 'HH:mm',
    dateTimeFormat: env.VITE_DATETIME_FORMAT || 'MM/dd/yyyy HH:mm',
    relativeTime: env.VITE_RELATIVE_TIME === 'true',
  },

  pagination: {
    defaultPageSize: Number.parseInt(env.VITE_DEFAULT_PAGE_SIZE || '20', 10),
    pageSizeOptions: (env.VITE_PAGE_SIZE_OPTIONS || '10,20,50,100').split(',').map(Number),
    maxPageSize: Number.parseInt(env.VITE_MAX_PAGE_SIZE || '100', 10),
  },
};

export const isDevelopment = config.app.environment === 'development';
export const isStaging = config.app.environment === 'staging';
export const isProduction = config.app.environment === 'production';
export const isTesting = config.app.environment === 'testing';
export const isDebug = config.app.debug;

export const getApiUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.api.baseUrl}/api/${config.api.version}${cleanPath}`;
};

export const getWebSocketUrl = () => config.websocket.url;
export const isFeatureEnabled = (feature) => config.features[feature] === true;
export const getConfig = (key) => key.split('.').reduce((obj, k) => obj?.[k], config);
export const getEnv = (key, defaultValue = null) => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

export default config;
