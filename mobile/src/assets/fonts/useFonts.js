// ============================================================================
// Font Integration - App Font Integration
// ============================================================================

// parking-management-system/mobile/src/assets/fonts/useFonts.js

import { useEffect, useState } from 'react';
import fontLoader from './loader';

/**
 * Custom hook for using fonts in components
 * @param {Object} options - Hook options
 * @param {boolean} options.loadOnMount - Load fonts on component mount
 * @param {Array} options.preloadFonts - Fonts to preload
 * @returns {Object} Font status and functions
 */
export const useFonts = ({
  loadOnMount = true,
  preloadFonts = []
} = {}) => {
  const [fontsLoaded, setFontsLoaded] = useState(fontLoader.isLoaded());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loadOnMount && !fontsLoaded) {
      loadFonts();
    }
  }, [loadOnMount]);

  const loadFonts = async () => {
    if (fontsLoaded || loading) return;
    
    setLoading(true);
    setError(null);

    try {
      await fontLoader.loadFonts({
        onProgress: (progress) => {
          // Handle progress
        },
        onComplete: () => {
          setFontsLoaded(true);
          setLoading(false);
          
          // Preload additional fonts if specified
          if (preloadFonts.length > 0) {
            fontLoader.preloadFonts(preloadFonts);
          }
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return {
    fontsLoaded,
    loading,
    error,
    loadFonts,
    isLoaded: fontLoader.isLoaded.bind(fontLoader),
    getStatus: fontLoader.getStatus.bind(fontLoader)
  };
};

export default useFonts;