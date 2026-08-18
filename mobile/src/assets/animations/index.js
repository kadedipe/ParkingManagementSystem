// ============================================================================
// Animation Assets - Animation Management System
// ============================================================================

// parking-management-system/mobile/src/assets/animations/index.js

import { Platform } from 'react-native';

/**
 * Animation Assets - Centralized animation management
 */
export const Animations = {
  // Lottie animations (JSON format)
  lottie: {
    // Loading animations
    loading: require('./lottie/loading.json'),
    loadingDots: require('./lottie/loading-dots.json'),
    loadingSpinner: require('./lottie/loading-spinner.json'),
    loadingCircle: require('./lottie/loading-circle.json'),
    loadingPulse: require('./lottie/loading-pulse.json'),
    
    // Success animations
    success: require('./lottie/success.json'),
    successCheck: require('./lottie/success-check.json'),
    successConfetti: require('./lottie/success-confetti.json'),
    successStars: require('./lottie/success-stars.json'),
    
    // Error animations
    error: require('./lottie/error.json'),
    errorX: require('./lottie/error-x.json'),
    errorWarning: require('./lottie/error-warning.json'),
    
    // Empty state animations
    empty: require('./lottie/empty.json'),
    emptySearch: require('./lottie/empty-search.json'),
    emptyNotifications: require('./lottie/empty-notifications.json'),
    emptyBookings: require('./lottie/empty-bookings.json'),
    emptyParking: require('./lottie/empty-parking.json'),
    
    // Parking animations
    parking: require('./lottie/parking.json'),
    parkingCar: require('./lottie/parking-car.json'),
    parkingSpot: require('./lottie/parking-spot.json'),
    valetParking: require('./lottie/valet-parking.json'),
    
    // Charging animations
    charging: require('./lottie/charging.json'),
    chargingEV: require('./lottie/charging-ev.json'),
    battery: require('./lottie/battery.json'),
    batteryCharging: require('./lottie/battery-charging.json'),
    batteryFull: require('./lottie/battery-full.json'),
    
    // Booking animations
    booking: require('./lottie/booking.json'),
    bookingConfirm: require('./lottie/booking-confirm.json'),
    bookingComplete: require('./lottie/booking-complete.json'),
    
    // Payment animations
    payment: require('./lottie/payment.json'),
    paymentSuccess: require('./lottie/payment-success.json'),
    paymentProcessing: require('./lottie/payment-processing.json'),
    wallet: require('./lottie/wallet.json'),
    
    // User animations
    profile: require('./lottie/profile.json'),
    userAvatar: require('./lottie/user-avatar.json'),
    login: require('./lottie/login.json'),
    register: require('./lottie/register.json'),
    
    // Navigation animations
    menu: require('./lottie/menu.json'),
    search: require('./lottie/search.json'),
    notifications: require('./lottie/notifications.json'),
    
    // Feature animations
    map: require('./lottie/map.json'),
    location: require('./lottie/location.json'),
    pin: require('./lottie/pin.json'),
    directions: require('./lottie/directions.json'),
    
    // Status animations
    connected: require('./lottie/connected.json'),
    disconnected: require('./lottie/disconnected.json'),
    syncing: require('./lottie/syncing.json'),
    processing: require('./lottie/processing.json'),
    
    // Celebrations
    celebrate: require('./lottie/celebrate.json'),
    fireworks: require('./lottie/fireworks.json'),
    confetti: require('./lottie/confetti.json'),
    party: require('./lottie/party.json')
  },

  // GIF animations
  gifs: {
    loading: require('./gifs/loading.gif'),
    loadingDots: require('./gifs/loading-dots.gif'),
    success: require('./gifs/success.gif'),
    error: require('./gifs/error.gif'),
    parking: require('./gifs/parking.gif'),
    charging: require('./gifs/charging.gif'),
    payment: require('./gifs/payment.gif'),
    celebration: require('./gifs/celebration.gif')
  }
};

export default Animations;