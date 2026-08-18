// ============================================================================
// Environment Type Definitions
// ============================================================================

/**
 * Environment configuration types
 */

export interface EnvConfig {
  app: {
    name: string;
    version: string;
    description: string;
    environment: 'development' | 'staging' | 'production' | 'testing';
    debug: boolean;
    url: string;
  };
  
  api: {
    url: string;
    version: string;
    timeout: number;
    maxRetries: number;
  };
  
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
  };
  
  auth: {
    tokenStorageKey: string;
    refreshTokenStorageKey: string;
    userStorageKey: string;
    sessionTimeout: number;
    sessionWarning: number;
  };
  
  features: {
    parkingReservations: boolean;
    evCharging: boolean;
    dynamicPricing: boolean;
    advancedAnalytics: boolean;
    notifications: boolean;
    mobileResponsive: boolean;
    multiTenancy: boolean;
  };
  
  ui: {
    defaultTheme: 'light' | 'dark' | 'system';
    primaryColor: string;
    secondaryColor: string;
    defaultLocale: string;
    dateFormat: string;
    timeFormat: string;
    currencySymbol: string;
    currencyCode: string;
  };
  
  payment: {
    stripePublishableKey: string;
    paypalClientId: string;
    testMode: boolean;
    currency: string;
    taxRate: number;
    serviceFee: number;
  };
  
  monitoring: {
    sentryDsn: string;
    sentryEnvironment: string;
    googleAnalyticsId: string;
    analyticsEnabled: boolean;
    performanceMonitoringEnabled: boolean;
  };
  
  map: {
    googleMapsApiKey: string;
    defaultLatitude: number;
    defaultLongitude: number;
    defaultZoom: number;
    provider: string;
  };
  
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
    maxFilesPerUpload: number;
    imageQuality: number;
  };
  
  cache: {
    serviceWorkerEnabled: boolean;
    cacheVersion: string;
    apiCacheTtl: number;
    staticCacheDuration: number;
    maxCacheItems: number;
  };
  
  security: {
    cspReportUri: string;
    cspDevelopmentEnabled: boolean;
    cspProductionEnabled: boolean;
    passwordMinLength: number;
    maxLoginAttempts: number;
    loginLockoutMinutes: number;
  };
  
  dev: {
    hmrEnabled: boolean;
    sourceMapsEnabled: boolean;
    mockApiEnabled: boolean;
    loggingEnabled: boolean;
    devToolsEnabled: boolean;
    storybookUrl: string;
  };
  
  notifications: {
    defaultDuration: number;
    maxStackSize: number;
    position: string;
    soundEnabled: boolean;
  };
  
  datetime: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    relativeTime: boolean;
  };
  
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
    maxPageSize: number;
  };
}

export const env: EnvConfig;
export default env;