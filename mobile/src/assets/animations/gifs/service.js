// ============================================================================
// GIF Service - GIF Loading and Management
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/service.js

import { Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Gifs from './index';

/**
 * GIF Service - Handles GIF loading, caching, and management
 */
class GifService {
  constructor() {
    this.cache = new Map();
    this.cacheDir = FileSystem.cacheDirectory + 'gifs/';
    this.initialized = false;
  }

  /**
   * Initialize GIF service
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize GIF service:', error);
    }
  }

  /**
   * Get GIF source
   * @param {string} key - GIF key from Gifs object
   * @param {Object} options - Options for GIF
   * @param {number} options.width - Desired width
   * @param {number} options.height - Desired height
   * @param {boolean} options.cache - Enable caching
   * @returns {Object} GIF source
   */
  getGif(key, options = {}) {
    const { width, height, cache = true } = options;
    
    try {
      const gifSource = Gifs[key];
      
      if (!gifSource) {
        console.warn(`GIF with key "${key}" not found`);
        return Gifs.loading || null;
      }

      // For local GIFs, return the source directly
      if (typeof gifSource === 'number') {
        return gifSource;
      }

      // For remote GIFs, return with options
      return {
        uri: gifSource,
        ...(width && { width }),
        ...(height && { height })
      };
    } catch (error) {
      console.error('Error getting GIF:', error);
      return Gifs.loading || null;
    }
  }

  /**
   * Preload GIFs for faster rendering
   * @param {Array} gifKeys - Array of GIF keys to preload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Promise that resolves when all GIFs are preloaded
   */
  async preloadGifs(gifKeys = [], onProgress = null) {
    await this.initialize();

    const keysToLoad = gifKeys.length > 0 ? gifKeys : Object.keys(Gifs);
    const total = keysToLoad.length;
    let loaded = 0;

    const preloadPromises = keysToLoad.map(async (key) => {
      try {
        const gif = Gifs[key];
        if (gif && typeof gif === 'number') {
          // For local GIFs, we can preload using Image.prefetch
          if (Image.prefetch) {
            // Not all React Native versions support prefetch for local images
            // We'll just mark as loaded
            loaded++;
            if (onProgress) {
              onProgress((loaded / total) * 100);
            }
          }
        }
        loaded++;
        if (onProgress) {
          onProgress((loaded / total) * 100);
        }
      } catch (error) {
        console.error(`Failed to preload GIF: ${key}`, error);
        loaded++;
        if (onProgress) {
          onProgress((loaded / total) * 100);
        }
      }
    });

    await Promise.all(preloadPromises);
    console.log('GIFs preloaded successfully');
  }

  /**
   * Get GIF as base64 (for sharing or saving)
   * @param {string} key - GIF key
   * @returns {Promise} Promise with base64 string
   */
  async getGifAsBase64(key) {
    try {
      const gif = Gifs[key];
      if (!gif) {
        throw new Error(`GIF with key "${key}" not found`);
      }

      // For local GIFs, we need to read the file
      if (typeof gif === 'number') {
        // This is a workaround for getting the file path
        // In a real app, you might need to use a different approach
        const gifPath = Image.resolveAssetSource(gif);
        if (gifPath && gifPath.uri) {
          const base64 = await FileSystem.readAsStringAsync(gifPath.uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          return base64;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting GIF as base64:', error);
      return null;
    }
  }

  /**
   * Clear GIF cache
   * @param {string} pattern - Optional pattern to match
   */
  async clearCache(pattern = null) {
    try {
      if (pattern) {
        for (const [key] of this.cache) {
          if (key.includes(pattern)) {
            this.cache.delete(key);
          }
        }
      } else {
        this.cache.clear();
      }
      console.log('GIF cache cleared');
    } catch (error) {
      console.error('Failed to clear GIF cache:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      totalCount: this.cache.size,
      cachedKeys: Array.from(this.cache.keys())
    };
  }

  /**
   * Check if GIF exists
   * @param {string} key - GIF key
   * @returns {boolean} True if GIF exists
   */
  gifExists(key) {
    return !!Gifs[key];
  }

  /**
   * Get all available GIF keys
   * @returns {Array} Array of GIF keys
   */
  getAvailableGifs() {
    return Object.keys(Gifs);
  }

  /**
   * Get GIF dimensions
   * @param {string} key - GIF key
   * @returns {Promise} Promise with dimensions
   */
  async getGifDimensions(key) {
    try {
      const gif = Gifs[key];
      if (!gif) {
        return null;
      }

      return new Promise((resolve) => {
        if (typeof gif === 'number') {
          const source = Image.resolveAssetSource(gif);
          if (source) {
            resolve({ width: source.width, height: source.height });
          } else {
            resolve(null);
          }
        } else {
          Image.getSize(
            gif,
            (width, height) => resolve({ width, height }),
            () => resolve(null)
          );
        }
      });
    } catch (error) {
      console.error('Error getting GIF dimensions:', error);
      return null;
    }
  }

  /**
   * Get responsive GIF size
   * @param {number} baseSize - Base size
   * @param {number} screenWidth - Screen width
   * @returns {number} Responsive size
   */
  getResponsiveSize(baseSize, screenWidth = 375) {
    const scale = screenWidth / 375;
    return Math.round(baseSize * Math.min(scale, 1.5));
  }
}

// Export singleton instance
export default new GifService();