// ============================================================================
// API Index
// ============================================================================

/**
 * API module exports for the mobile app.
 * 
 * This file exports all API services and utilities for easy import
 * throughout the application.
 */

// Export services
export { default as authService } from './services/auth.service';
export { default as parkingService } from './services/parking.service';
export { default as vehicleService } from './services/vehicle.service';
export { default as chargingService } from './services/charging.service';
export { default as bookingService } from './services/booking.service';
export { default as paymentService } from './services/payment.service';
export { default as notificationService } from './services/notification.service';
export { default as userService } from './services/user.service';
export { default as reportService } from './services/report.service';
export { default as websocketService } from './services/websocket.service';

// Export client and endpoints
export { default as apiClient } from './client';
export { API_ENDPOINTS } from './endpoints';
export { default as api } from './client';

// Export interceptors
export { setupInterceptors } from './interceptors';

// ============================================================================
// Default Export
// ============================================================================

export default {
  authService,
  parkingService,
  vehicleService,
  chargingService,
  bookingService,
  paymentService,
  notificationService,
  userService,
  reportService,
  websocketService,
  apiClient,
  API_ENDPOINTS,
};