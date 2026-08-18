// ============================================================================
// Performance Hook
// ============================================================================

import { useCallback } from 'react';

/**
 * Custom hook for performance monitoring
 */
export const usePerformance = () => {
  const trackPerformance = useCallback((event, data = {}) => {
    // Only track in production
    if (import.meta.env.PROD) {
      // Send to analytics if enabled
      if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true' && window.gtag) {
        window.gtag('event', event, {
          ...data,
          event_category: 'Performance',
          non_interaction: true,
        });
      }

      // Log in development
      if (import.meta.env.DEV) {
        console.log(`⚡ Performance Event: ${event}`, data);
      }
    }
  }, []);

  const measureTime = useCallback((label, callback) => {
    const start = performance.now();
    const result = callback();
    const duration = performance.now() - start;
    
    trackPerformance('timing', {
      label,
      duration: Math.round(duration),
    });
    
    return result;
  }, [trackPerformance]);

  return { trackPerformance, measureTime };
};

export default usePerformance;