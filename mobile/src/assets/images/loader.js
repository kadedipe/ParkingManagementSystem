// ============================================================================
// Image Loader - Image Loading and Caching
// ============================================================================

// parking-management-system/mobile/src/assets/images/loader.js

import { Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { IMAGE_CONSTANTS } from './constants';
import Images from './index';

/**
 * Image Loader - Handles image loading, caching, and manipulation
 */
class ImageLoader {
  constructor() {
    this.cache = new Map();
    this.pendingLoads = new Map();
    this.cacheDir = FileSystem.cacheDirectory + 'images/';
    this.initialized = false;
  }

  /**
   * Initialize image loader
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize image loader:', error);
    }
  }

  /**
   * Load image from source with caching
   * @param {string|Object} source - Image source
   * @param {Object} options - Loading options
   * @param {number} options.width - Desired width
   * @param {number} options.height - Desired height
   * @param {number} options.quality - Image quality (1-100)
   * @param {boolean} options.cache - Enable caching
   * @param {number} options.ttl - Cache TTL in ms
   * @returns {Promise} Image source
   */
  async loadImage(source, options = {}) {
    await this.initialize();

    const {
      width,
      height,
      quality = IMAGE_CONSTANTS.DEFAULTS.QUALITY,
      cache = true,
      ttl = IMAGE_CONSTANTS.CACHE_TTL.MEDIUM
    } = options;

    // Handle local images
    if (typeof source === 'number' || (typeof source === 'object' && source.uri)) {
      return source;
    }

    // Generate cache key
    const cacheKey = this.getCacheKey(source, { width, height, quality });

    // Check cache
    if (cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.uri;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Check pending loads
    if (this.pendingLoads.has(cacheKey)) {
      return this.pendingLoads.get(cacheKey);
    }

    // Start loading
    const loadPromise = this.loadImageFromSource(source, { width, height, quality });
    this.pendingLoads.set(cacheKey, loadPromise);

    try {
      const result = await loadPromise;
      
      // Cache the result
      if (cache) {
        this.cache.set(cacheKey, {
          uri: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } finally {
      this.pendingLoads.delete(cacheKey);
    }
  }

  /**
   * Load image from source
   * @param {string} source - Image source URL
   * @param {Object} options - Options
   * @returns {Promise} Image URI
   */
  async loadImageFromSource(source, options = {}) {
    const { width, height, quality } = options;

    try {
      // Download image to cache
      const fileName = this.getFileName(source);
      const localUri = this.cacheDir + fileName;
      
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        await FileSystem.downloadAsync(source, localUri);
      }

      // Manipulate image if dimensions are specified
      if (width || height) {
        const manipulations = [];
        
        if (width && height) {
          manipulations.push({
            resize: { width, height }
          });
        } else if (width) {
          manipulations.push({
            resize: { width }
          });
        } else if (height) {
          manipulations.push({
            resize: { height }
          });
        }

        if (quality < 100) {
          manipulations.push({
            compress: quality / 100
          });
        }

        if (manipulations.length > 0) {
          const result = await ImageManipulator.manipulateAsync(
            localUri,
            manipulations,
            { compress: quality / 100 }
          );
          return result.uri;
        }
      }

      return localUri;
    } catch (error) {
      console.error('Failed to load image from source:', error);
      return Images.placeholders.image;
    }
  }

  /**
   * Get cache key for image
   * @param {string} source - Image source
   * @param {Object} options - Options
   * @returns {string} Cache key
   */
  getCacheKey(source, options = {}) {
    const { width, height, quality } = options;
    return `${source}_${width || 0}_${height || 0}_${quality || 0}`;
  }

  /**
   * Get file name from URL
   * @param {string} url - Image URL
   * @returns {string} File name
   */
  getFileName(url) {
    const parts = url.split('/');
    let fileName = parts[parts.length - 1];
    
    // Add hash if no extension
    if (!fileName.includes('.')) {
      fileName += '.jpg';
    }
    
    return fileName;
  }

  /**
   * Clear image cache
   * @param {string} pattern - Optional pattern to match
   */
  async clearCache(pattern = null) {
    try {
      if (pattern) {
        // Clear specific cached images
        for (const [key] of this.cache) {
          if (key.includes(pattern)) {
            this.cache.delete(key);
          }
        }
      } else {
        // Clear all cache
        this.cache.clear();
        await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  }

  /**
   * Prefetch images
   * @param {Array} sources - Array of image sources
   * @param {Object} options - Prefetch options
   */
  async prefetchImages(sources, options = {}) {
    const promises = sources.map(source => 
      this.loadImage(source, { ...options, cache: true })
    );
    
    try {
      await Promise.all(promises);
      console.log('Images prefetched successfully');
    } catch (error) {
      console.error('Failed to prefetch images:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    let totalSize = 0;
    let totalCount = this.cache.size;

    for (const [key, value] of this.cache) {
      if (value.uri) {
        // Approximate size
        totalSize += 100 * 1024; // Assume 100KB per image
      }
    }

    return {
      totalCount,
      totalSize: Math.round(totalSize / (1024 * 1024)), // MB
      pendingLoads: this.pendingLoads.size
    };
  }

  /**
   * Optimize image for upload
   * @param {string} uri - Image URI
   * @param {Object} options - Optimization options
   * @returns {Promise} Optimized image URI
   */
  async optimizeImage(uri, options = {}) {
    const {
      maxWidth = IMAGE_CONSTANTS.DEFAULTS.MAX_WIDTH,
      maxHeight = IMAGE_CONSTANTS.DEFAULTS.MAX_HEIGHT,
      quality = IMAGE_CONSTANTS.DEFAULTS.QUALITY,
      format = IMAGE_CONSTANTS.DEFAULTS.FORMAT
    } = options;

    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight
            }
          }
        ],
        {
          compress: quality / 100,
          format: ImageManipulator.SaveFormat[format.toUpperCase()]
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Failed to optimize image:', error);
      return uri;
    }
  }

  /**
   * Get image from gallery
   * @param {Object} options - Picker options
   * @returns {Promise} Selected image
   */
  async getImageFromGallery(options = {}) {
    const {
      mediaTypes = 'photos',
      allowsEditing = true,
      quality = 0.8
    } = options;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing,
        quality
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to get image from gallery:', error);
      return null;
    }
  }

  /**
   * Get image from camera
   * @param {Object} options - Camera options
   * @returns {Promise} Captured image
   */
  async getImageFromCamera(options = {}) {
    const {
      allowsEditing = true,
      quality = 0.8
    } = options;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing,
        quality
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to get image from camera:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new ImageLoader();