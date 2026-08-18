// ============================================================================
// API Endpoints
// ============================================================================

/**
 * API endpoints for the mobile app.
 * 
 * This module defines all API endpoint URLs for the application.
 * Endpoints are organized by feature/module.
 */

export const API_ENDPOINTS = {
  // ==========================================================================
  // Authentication
  // ==========================================================================
  
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    sendVerification: '/auth/send-verification',
    profile: '/auth/profile',
    avatar: '/auth/avatar',
    sessions: '/auth/sessions',
    socialLogin: '/auth/social',
    twoFactor: '/auth/2fa',
  },

  // ==========================================================================
  // Parking
  // ==========================================================================
  
  parking: {
    spots: '/parking/spots',
    spot: (id) => `/parking/spots/${id}`,
    available: '/parking/spots/available',
    sessions: '/parking/sessions',
    session: (id) => `/parking/sessions/${id}`,
    sessionStart: '/parking/sessions/start',
    sessionEnd: (id) => `/parking/sessions/${id}/end`,
    activeSessions: '/parking/sessions/active',
    sessionHistory: '/parking/sessions/history',
    reservations: '/parking/reservations',
    reservation: (id) => `/parking/reservations/${id}`,
    reservationCancel: (id) => `/parking/reservations/${id}/cancel`,
    upcomingReservations: '/parking/reservations/upcoming',
    rates: '/parking/rates',
    rate: (id) => `/parking/rates/${id}`,
  },

  // ==========================================================================
  // Charging
  // ==========================================================================
  
  charging: {
    stations: '/charging/stations',
    station: (id) => `/charging/stations/${id}`,
    sessions: '/charging/sessions',
    session: (id) => `/charging/sessions/${id}`,
    sessionStart: '/charging/sessions/start',
    sessionStop: (id) => `/charging/sessions/${id}/stop`,
    activeSessions: '/charging/sessions/active',
    sessionHistory: '/charging/sessions/history',
    rates: '/charging/rates',
    rate: (id) => `/charging/rates/${id}`,
  },

  // ==========================================================================
  // Vehicles
  // ==========================================================================
  
  vehicles: {
    list: '/vehicles',
    detail: (id) => `/vehicles/${id}`,
    create: '/vehicles',
    update: (id) => `/vehicles/${id}`,
    delete: (id) => `/vehicles/${id}`,
    validatePlate: '/vehicles/validate-plate',
    history: (id) => `/vehicles/${id}/history`,
  },

  // ==========================================================================
  // Payments
  // ==========================================================================
  
  payments: {
    list: '/payments',
    detail: (id) => `/payments/${id}`,
    create: '/payments',
    process: (id) => `/payments/${id}/process`,
    refund: (id) => `/payments/${id}/refund`,
    history: '/payments/history',
    methods: '/payments/methods',
    method: (id) => `/payments/methods/${id}`,
    summary: '/payments/summary',
    webhook: '/payments/webhook',
  },

  // ==========================================================================
  // Notifications
  // ==========================================================================
  
  notifications: {
    list: '/notifications',
    detail: (id) => `/notifications/${id}`,
    read: (id) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
    delete: (id) => `/notifications/${id}`,
    clear: '/notifications/clear',
    unreadCount: '/notifications/unread-count',
    preferences: '/notifications/preferences',
    preference: (key) => `/notifications/preferences/${key}`,
  },

  // ==========================================================================
  // Users
  // ==========================================================================
  
  users: {
    list: '/users',
    detail: (id) => `/users/${id}`,
    create: '/users',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    me: '/users/me',
    preferences: '/users/preferences',
    activity: '/users/activity',
  },

  // ==========================================================================
  // Reports
  // ==========================================================================
  
  reports: {
    generate: '/reports/generate',
    list: '/reports',
    detail: (id) => `/reports/${id}`,
    status: (id) => `/reports/${id}/status`,
    export: '/reports/export',
    download: (id) => `/reports/${id}/download`,
    parking: '/reports/parking',
    revenue: '/reports/revenue',
    charging: '/reports/charging',
    occupancy: '/reports/occupancy',
  },

  // ==========================================================================
  // Webhooks
  // ==========================================================================
  
  webhooks: {
    stripe: '/webhooks/stripe',
    paypal: '/webhooks/paypal',
  },

  // ==========================================================================
  // Health
  // ==========================================================================
  
  health: {
    check: '/health',
    readiness: '/health/readiness',
    liveness: '/health/liveness',
  },

  // ==========================================================================
  // Dashboard
  // ==========================================================================
  
  dashboard: {
    stats: '/dashboard/stats',
    occupancy: '/dashboard/occupancy',
    revenue: '/dashboard/revenue',
    activity: '/dashboard/activity',
    reservations: '/dashboard/reservations',
    summary: '/dashboard/summary',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build URL with parameters
 */
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    if (url.includes(`:${key}`)) {
      url = url.replace(`:${key}`, params[key]);
      delete params[key];
    }
  });
  
  // Add query parameters
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

/**
 * Get full URL
 */
export const getFullUrl = (endpoint, params = {}) => {
  return buildUrl(endpoint, params);
};

export default API_ENDPOINTS;