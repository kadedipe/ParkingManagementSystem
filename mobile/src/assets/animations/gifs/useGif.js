// ============================================================================
// GIF Hook - React Hook for GIF Management
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/useGif.js

import { useState, useEffect, useCallback } from 'react';
import GifService from './service';
import Gifs from './index';

/**
 * Hook for using GIFs in components
 * @param {string} gifKey - GIF key from Gifs object
 * @param {Object} options - Hook options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {boolean} options.autoLoad - Auto load GIF
 * @returns {Object} GIF state and functions
 */
export const useGif = (gifKey, options = {}) => {
  const {
    width,
    height,
    autoLoad = true
  } = options;

  const [gif, setGif] = useState(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: null, height: null });

  const loadGif = useCallback(async () => {
    if (!gifKey) {
      setError('No GIF key provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gifSource = GifService.getGif(gifKey, { width, height });
      
      if (gifSource) {
        setGif(gifSource);
        
        // Get dimensions
        const dims = await GifService.getGifDimensions(gifKey);
        if (dims) {
          setDimensions(dims);
        }
      } else {
        setError('GIF not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load GIF');
    } finally {
      setLoading(false);
    }
  }, [gifKey, width, height]);

  useEffect(() => {
    if (autoLoad) {
      loadGif();
    }
  }, [autoLoad, loadGif]);

  return {
    gif,
    loading,
    error,
    dimensions,
    reload: loadGif,
    exists: GifService.gifExists(gifKey),
    getDimensions: () => GifService.getGifDimensions(gifKey)
  };
};

/**
 * Hook for preloading GIFs
 * @param {Array} gifKeys - Array of GIF keys to preload
 * @param {Object} options - Hook options
 * @param {boolean} options.autoPreload - Auto preload
 * @returns {Object} Preload state
 */
export const useGifPreload = (gifKeys = [], options = {}) => {
  const { autoPreload = true } = options;

  const [preloaded, setPreloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const preload = useCallback(async () => {
    if (preloaded || loading || !gifKeys || gifKeys.length === 0) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      await GifService.preloadGifs(gifKeys, (progress) => {
        setProgress(progress);
      });
      setPreloaded(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [gifKeys, preloaded, loading]);

  useEffect(() => {
    if (autoPreload) {
      preload();
    }
  }, [autoPreload, preload]);

  return {
    preloaded,
    loading,
    progress,
    error,
    preload
  };
};

export default { useGif, useGifPreload };