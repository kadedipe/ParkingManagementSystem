// ============================================================================
// App Config - Application Configuration
// ============================================================================

// parking-management-system/mobile/src/config/app.config.ts

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const AppConfig = {
  // Application Information
  appName: 'Parking Management System',
  appVersion: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.android?.versionCode || Constants.expoConfig?.ios?.buildNumber || '1',
  bundleId: Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier || 'com.parkingapp',

  // Environment
  env: Constants.expoConfig?.extra?.env || 'development',
  isDevelopment: Constants.expoConfig?.extra?.env === 'development',
  isProduction: Constants.expoConfig?.extra?.env === 'production',
  isStaging: Constants.expoConfig?.extra?.env === 'staging',

  // API Configuration
  api: {
    baseUrl: Constants.expoConfig?.extra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
    wsUrl: Constants.expoConfig?.extra?.WS_URL || process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8080/ws',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Feature Flags
  features: {
    enableBiometric: true,
    enableSocialLogin: true,
    enableTwoFactor: true,
    enableDarkMode: true,
    enablePushNotifications: true,
    enableOfflineMode: true,
    enableChatSupport: false,
    enableAnalytics: true,
  },

  // Limits
  limits: {
    maxBookingsPerDay: 10,
    maxVehicles: 5,
    maxSearchRadius: 50,
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxImages: 5,
  },

  // Platform
  platform: {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
    version: Platform.Version,
  },

  // Third Party Keys
  keys: {
    googleMaps: Constants.expoConfig?.extra?.googleMapsApiKey || Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || '',
    stripe: Constants.expoConfig?.extra?.stripePublishableKey || '',
    sentry: Constants.expoConfig?.extra?.sentryDsn || '',
    mixpanel: Constants.expoConfig?.extra?.mixpanelToken || '',
  },
};

export default AppConfig;