// ============================================================================
// Environment Configuration
// ============================================================================

const sameOriginApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  return window.location.origin;
};

const sameOriginWebSocketUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8000/ws';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
};

export const development = {
  api: { baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000', timeout: 30000 },
  websocket: { url: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws' },
  monitoring: { analyticsEnabled: false, performanceMonitoringEnabled: false },
  dev: { loggingEnabled: true, sourceMapsEnabled: true, devToolsEnabled: true, mockApiEnabled: false },
};

export const staging = {
  api: { baseUrl: import.meta.env.VITE_API_URL || sameOriginApiUrl(), timeout: 30000 },
  websocket: { url: import.meta.env.VITE_WEBSOCKET_URL || sameOriginWebSocketUrl() },
  monitoring: { analyticsEnabled: true, performanceMonitoringEnabled: true },
  dev: { loggingEnabled: true, sourceMapsEnabled: true, devToolsEnabled: true, mockApiEnabled: false },
};

export const production = {
  // Railway/frontend deployments can use the same origin as the gateway by default.
  // Cross-origin URLs remain configurable through public VITE_* build variables.
  api: { baseUrl: import.meta.env.VITE_API_URL || sameOriginApiUrl(), timeout: 30000 },
  websocket: { url: import.meta.env.VITE_WEBSOCKET_URL || sameOriginWebSocketUrl() },
  monitoring: { analyticsEnabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true', performanceMonitoringEnabled: true },
  dev: { loggingEnabled: false, sourceMapsEnabled: false, devToolsEnabled: false, mockApiEnabled: false },
};

export const testing = {
  api: { baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000', timeout: 30000 },
  websocket: { url: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws' },
  monitoring: { analyticsEnabled: false, performanceMonitoringEnabled: false },
  dev: { loggingEnabled: true, sourceMapsEnabled: true, devToolsEnabled: true, mockApiEnabled: true },
};

export const environmentConfigs = { development, staging, production, testing };
export const getEnvironmentConfig = (environment) => environmentConfigs[environment] || development;
export default environmentConfigs;
