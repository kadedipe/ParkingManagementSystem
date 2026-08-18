// ============================================================================
// Constants
// ============================================================================

/**
 * Constants module for the parking management system.
 * 
 * This module provides:
 * - Application-wide constants
 * - Configuration values
 * - Enum definitions
 * - Status codes
 * - Error messages
 * - API endpoints
 * - Feature flags
 * - Default values
 */

// ============================================================================
// Application Constants
// ============================================================================

export const APP = {
  NAME: import.meta.env.VITE_APP_NAME || 'Parking Management System',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'A comprehensive parking management system',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws',
};

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  // Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,

  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,

  // Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // General
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  CANCELLED_ERROR: 'Request was cancelled.',

  // Authentication
  AUTH_REQUIRED: 'Please login to continue.',
  AUTH_INVALID: 'Invalid email or password.',
  AUTH_EXPIRED: 'Session expired. Please login again.',
  AUTH_FORBIDDEN: 'You do not have permission to perform this action.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  AUTH_ACCOUNT_LOCKED: 'Account locked. Please contact support.',
  AUTH_TOO_MANY_ATTEMPTS: 'Too many login attempts. Please try again later.',

  // Validation
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_LICENSE_PLATE: 'Please enter a valid license plate number.',
  INVALID_VIN: 'Please enter a valid VIN (17 characters).',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_TIME: 'Please enter a valid time.',
  INVALID_AMOUNT: 'Please enter a valid amount.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_REQUIREMENTS: 'Password must contain uppercase, lowercase, number, and special character.',

  // Parking
  PARKING_SPOT_NOT_FOUND: 'Parking spot not found.',
  PARKING_SPOT_UNAVAILABLE: 'Parking spot is not available.',
  PARKING_SPOT_OCCUPIED: 'Parking spot is already occupied.',
  PARKING_SESSION_NOT_FOUND: 'Parking session not found.',
  PARKING_SESSION_ACTIVE: 'Parking session is still active.',
  PARKING_RESERVATION_NOT_FOUND: 'Reservation not found.',
  PARKING_RESERVATION_CONFLICT: 'Reservation conflict detected.',
  PARKING_MAX_DURATION_EXCEEDED: 'Maximum parking duration exceeded.',
  PARKING_INVALID_RESERVATION: 'Invalid reservation request.',

  // Charging
  CHARGING_STATION_NOT_FOUND: 'Charging station not found.',
  CHARGING_STATION_UNAVAILABLE: 'Charging station is not available.',
  CHARGING_SESSION_NOT_FOUND: 'Charging session not found.',
  CHARGING_SESSION_ACTIVE: 'Charging session is still active.',
  CHARGING_INVALID_CONNECTOR: 'Invalid connector type.',
  CHARGING_RATE_NOT_FOUND: 'Charging rate not found.',

  // Payment
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PAYMENT_NOT_FOUND: 'Payment not found.',
  PAYMENT_ALREADY_PROCESSED: 'Payment already processed.',
  PAYMENT_INSUFFICIENT_FUNDS: 'Insufficient funds.',
  PAYMENT_METHOD_INVALID: 'Invalid payment method.',
  PAYMENT_DECLINED: 'Payment declined.',

  // Vehicle
  VEHICLE_NOT_FOUND: 'Vehicle not found.',
  VEHICLE_DUPLICATE: 'Vehicle already exists.',
  VEHICLE_INVALID_DATA: 'Invalid vehicle data.',
  VEHICLE_LICENSE_PLATE_EXISTS: 'License plate already registered.',
  VEHICLE_VIN_EXISTS: 'VIN already registered.',

  // User
  USER_NOT_FOUND: 'User not found.',
  USER_EMAIL_EXISTS: 'Email already registered.',
  USER_USERNAME_EXISTS: 'Username already taken.',
  USER_INVALID_DATA: 'Invalid user data.',

  // Notification
  NOTIFICATION_NOT_FOUND: 'Notification not found.',
  NOTIFICATION_FAILED: 'Failed to send notification.',
  NOTIFICATION_PREFERENCE_ERROR: 'Error updating notification preferences.',
};

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  REGISTER_SUCCESS: 'Registration successful! Please verify your email.',
  PASSWORD_RESET_SENT: 'Password reset email sent!',
  PASSWORD_RESET_SUCCESS: 'Password reset successful!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  EMAIL_VERIFICATION_SENT: 'Verification email sent!',

  // Parking
  PARKING_SPOT_CREATED: 'Parking spot created successfully!',
  PARKING_SPOT_UPDATED: 'Parking spot updated successfully!',
  PARKING_SPOT_DELETED: 'Parking spot deleted successfully!',
  PARKING_SESSION_STARTED: 'Parking session started!',
  PARKING_SESSION_ENDED: 'Parking session ended!',
  PARKING_RESERVATION_CREATED: 'Reservation created successfully!',
  PARKING_RESERVATION_CANCELLED: 'Reservation cancelled successfully!',

  // Charging
  CHARGING_SESSION_STARTED: 'Charging session started!',
  CHARGING_SESSION_ENDED: 'Charging session ended!',
  CHARGING_STATION_CREATED: 'Charging station created successfully!',
  CHARGING_STATION_UPDATED: 'Charging station updated successfully!',
  CHARGING_STATION_DELETED: 'Charging station deleted successfully!',

  // Payment
  PAYMENT_SUCCESS: 'Payment successful!',
  PAYMENT_REFUNDED: 'Payment refunded successfully!',
  PAYMENT_METHOD_ADDED: 'Payment method added successfully!',
  PAYMENT_METHOD_REMOVED: 'Payment method removed successfully!',

  // Vehicle
  VEHICLE_CREATED: 'Vehicle added successfully!',
  VEHICLE_UPDATED: 'Vehicle updated successfully!',
  VEHICLE_DELETED: 'Vehicle deleted successfully!',

  // User
  USER_PROFILE_UPDATED: 'Profile updated successfully!',
  USER_PASSWORD_CHANGED: 'Password changed successfully!',
  USER_AVATAR_UPLOADED: 'Avatar uploaded successfully!',

  // Notification
  NOTIFICATION_SENT: 'Notification sent successfully!',
  NOTIFICATION_PREFERENCES_UPDATED: 'Preferences updated successfully!',
};

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    SEND_VERIFICATION: '/auth/send-verification',
    PROFILE: '/auth/profile',
    AVATAR: '/auth/avatar',
    SESSIONS: '/auth/sessions',
    SOCIAL_LOGIN: '/auth/social',
    TWO_FACTOR: '/auth/2fa',
  },

  // Parking
  PARKING: {
    SPOTS: '/parking/spots',
    SPOT: '/parking/spots/:id',
    AVAILABLE: '/parking/spots/available',
    SESSIONS: '/parking/sessions',
    SESSION: '/parking/sessions/:id',
    SESSION_START: '/parking/sessions/start',
    SESSION_END: '/parking/sessions/:id/end',
    ACTIVE_SESSIONS: '/parking/sessions/active',
    SESSION_HISTORY: '/parking/sessions/history',
    RESERVATIONS: '/parking/reservations',
    RESERVATION: '/parking/reservations/:id',
    RESERVATION_CANCEL: '/parking/reservations/:id/cancel',
    UPCOMING_RESERVATIONS: '/parking/reservations/upcoming',
  },

  // Charging
  CHARGING: {
    STATIONS: '/charging/stations',
    STATION: '/charging/stations/:id',
    SESSIONS: '/charging/sessions',
    SESSION: '/charging/sessions/:id',
    SESSION_START: '/charging/sessions/start',
    SESSION_STOP: '/charging/sessions/:id/stop',
    ACTIVE_SESSIONS: '/charging/sessions/active',
    SESSION_HISTORY: '/charging/sessions/history',
  },

  // Vehicles
  VEHICLES: {
    LIST: '/vehicles',
    DETAIL: '/vehicles/:id',
    CREATE: '/vehicles',
    UPDATE: '/vehicles/:id',
    DELETE: '/vehicles/:id',
    VALIDATE_PLATE: '/vehicles/validate-plate',
  },

  // Payments
  PAYMENTS: {
    LIST: '/payments',
    DETAIL: '/payments/:id',
    CREATE: '/payments',
    PROCESS: '/payments/:id/process',
    REFUND: '/payments/:id/refund',
    HISTORY: '/payments/history',
    METHODS: '/payments/methods',
    METHOD: '/payments/methods/:id',
    SUMMARY: '/payments/summary',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: '/notifications/:id',
    READ: '/notifications/:id/read',
    READ_ALL: '/notifications/read-all',
    DELETE: '/notifications/:id',
    CLEAR: '/notifications/clear',
    UNREAD_COUNT: '/notifications/unread-count',
    PREFERENCES: '/notifications/preferences',
    PREFERENCE: '/notifications/preferences/:key',
  },

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: '/users/:id',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    ME: '/users/me',
  },

  // Reports
  REPORTS: {
    GENERATE: '/reports/generate',
    LIST: '/reports',
    DETAIL: '/reports/:id',
    STATUS: '/reports/:id/status',
    EXPORT: '/reports/export',
    DOWNLOAD: '/reports/:id/download',
  },

  // Webhooks
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe',
    PAYPAL: '/webhooks/paypal',
  },

  // Health
  HEALTH: {
    CHECK: '/health',
    READINESS: '/health/readiness',
    LIVENESS: '/health/liveness',
  },
};

// ============================================================================
// Vehicle Constants
// ============================================================================

export const VEHICLE = {
  TYPES: {
    SEDAN: 'sedan',
    SUV: 'suv',
    TRUCK: 'truck',
    VAN: 'van',
    COUPE: 'coupe',
    CONVERTIBLE: 'convertible',
    HATCHBACK: 'hatchback',
    WAGON: 'wagon',
    MINIVAN: 'minivan',
    PICKUP: 'pickup',
    MOTORCYCLE: 'motorcycle',
    EV: 'ev',
    HYBRID: 'hybrid',
    OTHER: 'other',
  },
  FUEL_TYPES: {
    GASOLINE: 'gasoline',
    DIESEL: 'diesel',
    ELECTRIC: 'electric',
    HYBRID: 'hybrid',
    PLUGIN_HYBRID: 'plugin_hybrid',
    HYDROGEN: 'hydrogen',
    OTHER: 'other',
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    DELETED: 'deleted',
    MAINTENANCE: 'maintenance',
    STOLEN: 'stolen',
    IMPOUNDED: 'impounded',
  },
  SIZES: {
    COMPACT: 'compact',
    STANDARD: 'standard',
    LARGE: 'large',
    EXTRA_LARGE: 'extra_large',
  },
  COLORS: [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue',
    'Green', 'Yellow', 'Orange', 'Brown', 'Beige', 'Gold',
    'Purple', 'Pink', 'Teal', 'Maroon', 'Navy', 'Charcoal',
  ],
  YEARS: Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
};

// ============================================================================
// Parking Constants
// ============================================================================

export const PARKING = {
  SPOT_TYPES: {
    STANDARD: 'standard',
    COMPACT: 'compact',
    HANDICAPPED: 'handicapped',
    EV_CHARGING: 'ev_charging',
    PREMIUM: 'premium',
    VALET: 'valet',
    RESERVED: 'reserved',
  },
  STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    MAINTENANCE: 'maintenance',
    OUT_OF_SERVICE: 'out_of_service',
  },
  SESSION_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    EXTENDED: 'extended',
  },
  RESERVATION_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    NO_SHOW: 'no_show',
  },
  ACCESS_LEVELS: {
    PUBLIC: 'public',
    RESTRICTED: 'restricted',
    PRIVATE: 'private',
    EMPLOYEE: 'employee',
    VIP: 'vip',
  },
  RATE_TYPES: {
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    FLAT: 'flat',
    DYNAMIC: 'dynamic',
  },
  MAX_DURATION: 24, // hours
  DEFAULT_GRACE_PERIOD: 15, // minutes
};

// ============================================================================
// Charging Constants
// ============================================================================

export const CHARGING = {
  CONNECTOR_TYPES: {
    CCS: 'CCS',
    CHAdeMO: 'CHAdeMO',
    TESLA: 'Tesla',
    TYPE2: 'Type2',
    GB_T: 'GB/T',
  },
  STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    OUT_OF_SERVICE: 'out_of_service',
  },
  SESSION_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  POWER_RATINGS: [22, 50, 75, 100, 150, 200, 250],
};

// ============================================================================
// Payment Constants
// ============================================================================

export const PAYMENT = {
  METHODS: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PAYPAL: 'paypal',
    APPLE_PAY: 'apple_pay',
    GOOGLE_PAY: 'google_pay',
    CRYPTO: 'crypto',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
  },
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
  },
  CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
};

// ============================================================================
// User Constants
// ============================================================================

export const USER = {
  ROLES: {
    USER: 'user',
    MANAGER: 'manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    OPERATOR: 'operator',
    VIEWER: 'viewer',
    GUEST: 'guest',
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    DELETED: 'deleted',
    PENDING: 'pending',
  },
};

// ============================================================================
// Notification Constants
// ============================================================================

export const NOTIFICATION = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    PARKING: 'parking',
    CHARGING: 'charging',
    PAYMENT: 'payment',
    SYSTEM: 'system',
    ALERT: 'alert',
    REMINDER: 'reminder',
  },
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
  },
  PRIORITIES: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
  },
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
  DATE_FORMATS: {
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_SHORT: 'MM/DD/YYYY',
    INPUT: 'YYYY-MM-DD',
    API: 'YYYY-MM-DD',
    DISPLAY_TIME: 'hh:mm A',
    DISPLAY_TIME_24: 'HH:mm',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 72,
  HEADER_HEIGHT: 64,
  MOBILE_HEADER_HEIGHT: 56,
};

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  PARKING_RESERVATIONS: import.meta.env.VITE_FEATURE_PARKING_RESERVATIONS === 'true',
  EV_CHARGING: import.meta.env.VITE_FEATURE_EV_CHARGING === 'true',
  DYNAMIC_PRICING: import.meta.env.VITE_FEATURE_DYNAMIC_PRICING === 'true',
  ADVANCED_ANALYTICS: import.meta.env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true',
  NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS === 'true',
  MOBILE_RESPONSIVE: import.meta.env.VITE_FEATURE_MOBILE_RESPONSIVE === 'true',
  MULTI_TENANCY: import.meta.env.VITE_FEATURE_MULTI_TENANCY === 'true',
};

// ============================================================================
// Regex Patterns
// ============================================================================

export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[\d\s-]{10,15}$/,
  LICENSE_PLATE: /^[A-Z0-9]{1,8}$/,
  VIN: /^[A-HJ-NPR-Z0-9]{17}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  CREDIT_CARD: /^\d{13,19}$/,
  CVV: /^\d{3,4}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    PAGE_SIZE: 20,
  },
  PRICE_RANGE: {
    MIN: 0,
    MAX: 100,
  },
  RADIUS: 5, // kilometers
  SESSION_TIMEOUT: 30, // minutes
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_COUNTRY: 'US',
  CURRENCY: 'USD',
  LANGUAGE: 'en',
  TIMEZONE: 'UTC',
  DATE_FORMAT: 'MM/DD/YYYY',
  TIME_FORMAT: '12h',
};

// ============================================================================
// Export All
// ============================================================================

export default {
  APP,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ENDPOINTS,
  VEHICLE,
  PARKING,
  CHARGING,
  PAYMENT,
  USER,
  NOTIFICATION,
  UI,
  FEATURES,
  REGEX,
  DEFAULTS,
};