// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Environment-specific configuration overrides.
 */

// ============================================================================
// Development Configuration
// ============================================================================

export const development = {
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
  },
  websocket: {
    url: 'ws://localhost:8000/ws',
  },
  monitoring: {
    analyticsEnabled: false,
    performanceMonitoringEnabled: false,
  },
  dev: {
    loggingEnabled: true,
    sourceMapsEnabled: true,
    devToolsEnabled: true,
    mockApiEnabled: false,
  },
};

// ============================================================================
// Staging Configuration
// ============================================================================

export const staging = {
  api: {
    baseUrl: 'https://api-staging.parking-system.com',
    timeout: 30000,
  },
  websocket: {
    url: 'wss://api-staging.parking-system.com/ws',
  },
  monitoring: {
    analyticsEnabled: true,
    performanceMonitoringEnabled: true,
  },
  dev: {
    loggingEnabled: true,
    sourceMapsEnabled: true,
    devToolsEnabled: true,
    mockApiEnabled: false,
  },
};

// ============================================================================
// Production Configuration
// ============================================================================

export const production = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    timeout: 30000,
  },
  websocket: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  },
  monitoring: {
    analyticsEnabled: true,
    performanceMonitoringEnabled: true,
  },
  dev: {
    loggingEnabled: false,
    sourceMapsEnabled: false,
    devToolsEnabled: false,
    mockApiEnabled: false,
  },
};

// ============================================================================
// Testing Configuration
// ============================================================================

export const testing = {
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
  },
  websocket: {
    url: 'ws://localhost:8000/ws',
  },
  monitoring: {
    analyticsEnabled: false,
    performanceMonitoringEnabled: false,
  },
  dev: {
    loggingEnabled: true,
    sourceMapsEnabled: true,
    devToolsEnabled: true,
    mockApiEnabled: true,
  },
};

// ============================================================================
// Environment Configuration Map
// ============================================================================

export const environmentConfigs = {
  development,
  staging,
  production,
  testing,
};

// ============================================================================
// Get Environment Configuration
// ============================================================================

export const getEnvironmentConfig = (environment) => {
  return environmentConfigs[environment] || development;
};

// ============================================================================
// Export
// ============================================================================

export default environmentConfigs;