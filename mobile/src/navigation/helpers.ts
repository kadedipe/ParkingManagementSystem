// ============================================================================
// Route Helpers - Navigation Helper Functions
// ============================================================================

// parking-management-system/mobile/src/navigation/helpers.ts

import { ROUTES } from '../constants/routes';
import { protectedRoutes } from './config';

/**
 * Check if a route requires authentication
 */
export const requiresAuth = (routeName: string): boolean => {
  return protectedRoutes.includes(routeName);
};

/**
 * Get the tab route from a screen route
 */
export const getTabFromRoute = (routeName: string): string | null => {
  const tabMap: Record<string, string> = {
    [ROUTES.PARKING.DETAILS]: ROUTES.APP.PARKING,
    [ROUTES.PARKING.MAP]: ROUTES.APP.PARKING,
    [ROUTES.PARKING.SPOT_SELECTOR]: ROUTES.APP.PARKING,
    [ROUTES.CHARGING.DETAILS]: ROUTES.APP.CHARGING,
    [ROUTES.CHARGING.SESSION]: ROUTES.APP.CHARGING,
    [ROUTES.BOOKING.DETAILS]: ROUTES.APP.BOOKINGS,
    [ROUTES.BOOKING.CREATE]: ROUTES.APP.BOOKINGS,
    [ROUTES.PAYMENT.METHODS]: ROUTES.APP.PROFILE,
    [ROUTES.PAYMENT.WALLET]: ROUTES.APP.PROFILE,
    [ROUTES.PROFILE.EDIT]: ROUTES.APP.PROFILE,
    [ROUTES.PROFILE.VEHICLES]: ROUTES.APP.PROFILE,
  };

  return tabMap[routeName] || null;
};

/**
 * Get the route group (feature/module) from a route name
 */
export const getRouteGroup = (routeName: string): string => {
  const groupMap: Record<string, string> = {
    [ROUTES.AUTH.LOGIN]: 'auth',
    [ROUTES.AUTH.REGISTER]: 'auth',
    [ROUTES.AUTH.FORGOT_PASSWORD]: 'auth',
    [ROUTES.AUTH.RESET_PASSWORD]: 'auth',
    [ROUTES.AUTH.VERIFY_EMAIL]: 'auth',
    [ROUTES.ONBOARDING.WELCOME]: 'onboarding',
    [ROUTES.PARKING.DETAILS]: 'parking',
    [ROUTES.PARKING.MAP]: 'parking',
    [ROUTES.PARKING.SPOT_SELECTOR]: 'parking',
    [ROUTES.PARKING.REVIEWS]: 'parking',
    [ROUTES.PARKING.ADD_REVIEW]: 'parking',
    [ROUTES.CHARGING.DETAILS]: 'charging',
    [ROUTES.CHARGING.SESSION]: 'charging',
    [ROUTES.CHARGING.HISTORY]: 'charging',
    [ROUTES.CHARGING.RESERVATION]: 'charging',
    [ROUTES.BOOKING.DETAILS]: 'booking',
    [ROUTES.BOOKING.CREATE]: 'booking',
    [ROUTES.BOOKING.CONFIRM]: 'booking',
    [ROUTES.BOOKING.QR_CODE]: 'booking',
    [ROUTES.PAYMENT.METHODS]: 'payment',
    [ROUTES.PAYMENT.PROCESS]: 'payment',
    [ROUTES.PAYMENT.HISTORY]: 'payment',
    [ROUTES.PAYMENT.RECEIPT]: 'payment',
    [ROUTES.PAYMENT.WALLET]: 'payment',
    [ROUTES.PROFILE.EDIT]: 'profile',
    [ROUTES.PROFILE.VEHICLES]: 'profile',
    [ROUTES.PROFILE.ADD_VEHICLE]: 'profile',
    [ROUTES.PROFILE.SETTINGS]: 'profile',
    [ROUTES.PROFILE.CHANGE_PASSWORD]: 'profile',
    [ROUTES.PROFILE.NOTIFICATION_SETTINGS]: 'profile',
    [ROUTES.PROFILE.LOYALTY]: 'profile',
  };

  return groupMap[routeName] || 'unknown';
};

/**
 * Get the route title
 */
export const getRouteTitle = (routeName: string): string => {
  const titleMap: Record<string, string> = {
    [ROUTES.AUTH.LOGIN]: 'Login',
    [ROUTES.AUTH.REGISTER]: 'Create Account',
    [ROUTES.AUTH.FORGOT_PASSWORD]: 'Forgot Password',
    [ROUTES.AUTH.RESET_PASSWORD]: 'Reset Password',
    [ROUTES.AUTH.VERIFY_EMAIL]: 'Verify Email',
    [ROUTES.ONBOARDING.WELCOME]: 'Welcome',
    [ROUTES.PARKING.DETAILS]: 'Parking Details',
    [ROUTES.PARKING.MAP]: 'Parking Map',
    [ROUTES.PARKING.SPOT_SELECTOR]: 'Select Spot',
    [ROUTES.PARKING.REVIEWS]: 'Reviews',
    [ROUTES.PARKING.ADD_REVIEW]: 'Add Review',
    [ROUTES.CHARGING.DETAILS]: 'Charging Station',
    [ROUTES.CHARGING.SESSION]: 'Charging Session',
    [ROUTES.CHARGING.HISTORY]: 'Charging History',
    [ROUTES.CHARGING.RESERVATION]: 'Reserve Station',
    [ROUTES.BOOKING.DETAILS]: 'Booking Details',
    [ROUTES.BOOKING.CREATE]: 'Create Booking',
    [ROUTES.BOOKING.CONFIRM]: 'Confirm Booking',
    [ROUTES.BOOKING.QR_CODE]: 'QR Code',
    [ROUTES.PAYMENT.METHODS]: 'Payment Methods',
    [ROUTES.PAYMENT.PROCESS]: 'Payment',
    [ROUTES.PAYMENT.HISTORY]: 'Payment History',
    [ROUTES.PAYMENT.RECEIPT]: 'Receipt',
    [ROUTES.PAYMENT.WALLET]: 'Wallet',
    [ROUTES.PROFILE.EDIT]: 'Edit Profile',
    [ROUTES.PROFILE.VEHICLES]: 'My Vehicles',
    [ROUTES.PROFILE.ADD_VEHICLE]: 'Add Vehicle',
    [ROUTES.PROFILE.SETTINGS]: 'Settings',
    [ROUTES.PROFILE.CHANGE_PASSWORD]: 'Change Password',
    [ROUTES.PROFILE.NOTIFICATION_SETTINGS]: 'Notification Settings',
    [ROUTES.PROFILE.LOYALTY]: 'Loyalty Points',
    [ROUTES.NOTIFICATION.LIST]: 'Notifications',
    [ROUTES.NOTIFICATION.DETAILS]: 'Notification',
  };

  return titleMap[routeName] || routeName;
};

/**
 * Get the tab icon name
 */
export const getTabIcon = (routeName: string): string => {
  const iconMap: Record<string, string> = {
    [ROUTES.APP.HOME]: 'home',
    [ROUTES.APP.PARKING]: 'grid',
    [ROUTES.APP.CHARGING]: 'zap',
    [ROUTES.APP.BOOKINGS]: 'calendar',
    [ROUTES.APP.PROFILE]: 'user',
  };

  return iconMap[routeName] || 'circle';
};

/**
 * Get the tab label
 */
export const getTabLabel = (routeName: string): string => {
  const labelMap: Record<string, string> = {
    [ROUTES.APP.HOME]: 'Home',
    [ROUTES.APP.PARKING]: 'Parking',
    [ROUTES.APP.CHARGING]: 'Charging',
    [ROUTES.APP.BOOKINGS]: 'Bookings',
    [ROUTES.APP.PROFILE]: 'Profile',
  };

  return labelMap[routeName] || routeName;
};

/**
 * Check if a route is a tab route
 */
export const isTabRoute = (routeName: string): boolean => {
  const tabRoutes = Object.values(ROUTES.APP);
  return tabRoutes.includes(routeName);
};

/**
 * Check if a route is a modal route
 */
export const isModalRoute = (routeName: string): boolean => {
  const modalRoutes = [
    ROUTES.PAYMENT.PROCESS,
    ROUTES.PAYMENT.METHODS,
    ROUTES.PROFILE.EDIT,
    ROUTES.PROFILE.ADD_VEHICLE,
    ROUTES.PROFILE.CHANGE_PASSWORD,
    ROUTES.BOOKING.QR_CODE,
  ];
  return modalRoutes.includes(routeName);
};

export default {
  requiresAuth,
  getTabFromRoute,
  getRouteGroup,
  getRouteTitle,
  getTabIcon,
  getTabLabel,
  isTabRoute,
  isModalRoute,
};