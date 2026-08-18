// ============================================================================
// Analytics Utilities
// ============================================================================

import { config } from '../config';

/**
 * Track page view
 */
export const trackPageView = (path) => {
  if (config.monitoring.analyticsEnabled) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', config.monitoring.googleAnalyticsId, {
        page_path: path,
      });
    }
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`📊 Page View: ${path}`);
    }
  }
};

/**
 * Track event
 */
export const trackEvent = (category, action, label = null, value = null) => {
  if (config.monitoring.analyticsEnabled) {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
    
    if (import.meta.env.DEV) {
      console.log(`📊 Event: ${category} - ${action}`, { label, value });
    }
  }
};

/**
 * Track error
 */
export const trackError = (error, context = {}) => {
  console.error('Error:', error, context);
  
  // Send to Sentry if configured
  if (config.monitoring.sentryDsn && window.Sentry) {
    window.Sentry.captureException(error, {
      extra: context,
    });
  }
};

export default {
  trackPageView,
  trackEvent,
  trackError,
};