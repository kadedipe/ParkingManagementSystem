// ============================================================================
// Analytics Utility
// ============================================================================

import { Platform } from 'react-native';
import { logger } from './logger';
import config from '../../config';

export const trackAppOpen = () => {
  logger.track('app_open', {
    platform: Platform.OS,
    version: config.app.version,
    environment: config.app.environment,
  });
};

export const trackScreenView = (screenName, properties = {}) => {
  logger.track('screen_view', {
    screen: screenName,
    ...properties,
  });
};

export const trackEvent = (eventName, properties = {}) => {
  logger.track(eventName, properties);
};

export const trackError = (error, context = {}) => {
  logger.error('Error tracked:', error, context);
  // Send to error tracking service
};

export default {
  trackAppOpen,
  trackScreenView,
  trackEvent,
  trackError,
};