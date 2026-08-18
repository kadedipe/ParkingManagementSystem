// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Configuration constants for the application.
 */

// ============================================================================
// API Constants
// ============================================================================

export const API = {
  // Timeouts
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  
  // Status Codes
  STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  },
};

// ============================================================================
// Auth Constants
// ============================================================================

export const AUTH = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  REMEMBER_ME_KEY: 'remember_me',
  SESSION_TIMEOUT: 60 * 60, // 1 hour in seconds
};

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// ============================================================================
// UI Constants
// ============================================================================

export const UI = {
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  LAYOUT: {
    SIDEBAR_WIDTH: 240,
    SIDEBAR_COLLAPSED: 72,
    HEADER_HEIGHT: 64,
    MOBILE_HEADER_HEIGHT: 56,
  },
  BREAKPOINTS: {
    XS: 475,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
};

// ============================================================================
// Export
// ============================================================================

export default {
  API,
  AUTH,
  PAGINATION,
  UI,
};