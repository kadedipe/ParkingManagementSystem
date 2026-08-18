// ============================================================================
// Image Hooks - React Hooks for Image Management
// ============================================================================

// parking-management-system/mobile/src/assets/images/useImage.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import imageLoader from './loader';
import Images from './index';

/**
 * Hook for loading and managing images
 * @param {string|Object} source - Image source
 * @param {Object} options - Hook options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {number} options.quality - Image quality
 * @param {boolean} options.cache - Enable caching
 * @param {number} options.ttl - Cache TTL
 * @param {boolean} options.autoLoad - Auto load on mount
 * @returns {Object} Image state and functions
 */
export const useImage = (source, options = {}) => {
  const {
    width,
    height,
    quality,
    cache = true,
    ttl,
    autoLoad = true
  } = options;

  const [uri, setUri] = useState(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const isMounted = useRef(true);

  // Calculate responsive dimensions
  const screenWidth = Dimensions.get('window').width;
  const responsiveWidth = width ? Math.min(width, screenWidth) : null;
  const responsiveHeight = height ? height : null;

  const loadImage = useCallback(async () => {
    if (!source) {
      setUri(Images.placeholders.image);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedUri = await imageLoader.loadImage(source, {
        width: responsiveWidth,
        height: responsiveHeight,
        quality,
        cache,
        ttl
      });

      if (isMounted.current) {
        setUri(loadedUri);
        
        // Get image dimensions
        if (loadedUri) {
          const dims = await imageLoader.getImageDimensions(loadedUri);
          setDimensions(dims);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        setUri(Images.placeholders.image);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [source, responsiveWidth, responsiveHeight, quality, cache, ttl]);

  useEffect(() => {
    if (autoLoad) {
      loadImage();
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoLoad, loadImage]);

  return {
    uri,
    loading,
    error,
    dimensions,
    loadImage,
    reload: loadImage
  };
};

/**
 * Hook for managing multiple images
 * @param {Array} sources - Array of image sources
 * @param {Object} options - Hook options
 * @returns {Object} Multiple images state
 */
export const useMultipleImages = (sources = [], options = {}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const loadImages = useCallback(async () => {
    if (!sources || sources.length === 0) {
      setImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const loadedImages = [];
      const total = sources.length;

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        try {
          const uri = await imageLoader.loadImage(source, options);
          loadedImages.push({ source, uri, error: null });
        } catch (err) {
          loadedImages.push({ 
            source, 
            uri: Images.placeholders.image, 
            error: err 
          });
        }
        setProgress((i + 1) / total * 100);
      }

      setImages(loadedImages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [sources, options]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return {
    images,
    loading,
    error,
    progress,
    reload: loadImages
  };
};

/**
 * Hook for image preloading
 * @param {Array} sources - Array of image sources
 * @param {Object} options - Hook options
 * @returns {Object} Preload state
 */
export const useImagePreload = (sources = [], options = {}) => {
  const [preloaded, setPreloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const preload = useCallback(async () => {
    if (preloaded || loading || !sources || sources.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      await imageLoader.prefetchImages(sources, options);
      setPreloaded(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [sources, options, preloaded, loading]);

  useEffect(() => {
    preload();
  }, [preload]);

  return {
    preloaded,
    loading,
    error,
    preload
  };
};

export default useImage;