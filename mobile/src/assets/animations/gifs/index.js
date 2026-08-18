// ============================================================================
// GIF Animation Management System
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/index.js

import { Image } from 'react-native';

/**
 * GIF Assets - Centralized GIF animation management
 * Note: These are placeholder references. Actual .gif files need to be 
 * downloaded and placed in the gifs directory
 */
export const Gifs = {
  // Loading animations
  loading: require('./loading.gif'),
  loadingDots: require('./loading-dots.gif'),
  loadingSpinner: require('./loading-spinner.gif'),
  loadingPulse: require('./loading-pulse.gif'),
  loadingBars: require('./loading-bars.gif'),
  
  // Success animations
  success: require('./success.gif'),
  successCheck: require('./success-check.gif'),
  successConfetti: require('./success-confetti.gif'),
  successStars: require('./success-stars.gif'),
  
  // Error animations
  error: require('./error.gif'),
  errorWarning: require('./error-warning.gif'),
  errorX: require('./error-x.gif'),
  
  // Parking animations
  parking: require('./parking.gif'),
  parkingCar: require('./parking-car.gif'),
  parkingSpot: require('./parking-spot.gif'),
  
  // Charging animations
  charging: require('./charging.gif'),
  chargingEV: require('./charging-ev.gif'),
  batteryFull: require('./battery-full.gif'),
  
  // Payment animations
  payment: require('./payment.gif'),
  paymentSuccess: require('./payment-success.gif'),
  
  // Booking animations
  booking: require('./booking.gif'),
  bookingConfirm: require('./booking-confirm.gif'),
  
  // Empty states
  empty: require('./empty.gif'),
  emptySearch: require('./empty-search.gif'),
  emptyNotifications: require('./empty-notifications.gif'),
  
  // Celebration animations
  celebration: require('./celebration.gif'),
  fireworks: require('./fireworks.gif'),
  confetti: require('./confetti.gif'),
  
  // User animations
  profile: require('./profile.gif'),
  avatar: require('./avatar.gif'),
  login: require('./login.gif'),
  
  // Map animations
  mapPin: require('./map-pin.gif'),
  location: require('./location.gif'),
  navigation: require('./navigation.gif')
};

export default Gifs;