// ============================================================================
// Image Utilities - Image Helper Functions
// ============================================================================

// parking-management-system/mobile/src/assets/images/utils.js

import { Image, Platform } from 'react-native';
import { IMAGE_CONSTANTS } from './constants';

/**
 * Image Utilities - Helper functions for image operations
 */
export const ImageUtils = {
  /**
   * Get image URL with fallback
   * @param {string} uri - Image URI
   * @param {string} fallback - Fallback image
   * @returns {string} Image URL
   */
  getImageUrl: (uri, fallback = 'https://via.placeholder.com/300') => {
    if (!uri) return fallback;
    return uri;
  },

  /**
   * Get image source with fallback
   * @param {string|Object} source - Image source
   * @param {string|Object} fallback - Fallback image
   * @returns {Object} Image source
   */
  getImageSource: (source, fallback = require('./placeholders/image.png')) => {
    if (typeof source === 'number') {
      return source;
    }
    
    if (source && typeof source === 'object' && source.uri) {
      return source;
    }
    
    if (typeof source === 'string' && source.startsWith('http')) {
      return { uri: source };
    }
    
    return fallback;
  },

  /**
   * Get image dimensions from URI
   * @param {string} uri - Image URI
   * @returns {Promise} Image dimensions
   */
  getImageDimensions: (uri) => {
    return new Promise((resolve, reject) => {
      if (!uri) {
        reject(new Error('No image URI provided'));
        return;
      }

      if (typeof uri === 'number') {
        // Handle static assets
        const asset = Image.resolveAssetSource(uri);
        if (asset) {
          resolve({ width: asset.width, height: asset.height });
        } else {
          reject(new Error('Failed to get asset dimensions'));
        }
        return;
      }

      Image.getSize(
        uri,
        (width, height) => {
          resolve({ width, height });
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  /**
   * Get aspect ratio
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {number} Aspect ratio
   */
  getAspectRatio: (width, height) => {
    if (!width || !height || height === 0) return 1;
    return width / height;
  },

  /**
   * Scale image to fit dimensions
   * @param {Object} original - Original dimensions
   * @param {Object} target - Target dimensions
   * @returns {Object} Scaled dimensions
   */
  scaleToFit: (original, target) => {
    const { width: origWidth, height: origHeight } = original;
    const { width: targetWidth, height: targetHeight } = target;

    if (!origWidth || !origHeight || !targetWidth || !targetHeight) {
      return original;
    }

    const ratio = Math.min(targetWidth / origWidth, targetHeight / origHeight);
    
    return {
      width: Math.round(origWidth * ratio),
      height: Math.round(origHeight * ratio)
    };
  },

  /**
   * Scale image to fill dimensions
   * @param {Object} original - Original dimensions
   * @param {Object} target - Target dimensions
   * @returns {Object} Scaled dimensions
   */
  scaleToFill: (original, target) => {
    const { width: origWidth, height: origHeight } = original;
    const { width: targetWidth, height: targetHeight } = target;

    if (!origWidth || !origHeight || !targetWidth || !targetHeight) {
      return original;
    }

    const ratio = Math.max(targetWidth / origWidth, targetHeight / origHeight);
    
    return {
      width: Math.round(origWidth * ratio),
      height: Math.round(origHeight * ratio)
    };
  },

  /**
   * Get thumbnail dimensions
   * @param {number} width - Original width
   * @param {number} height - Original height
   * @param {number} maxSize - Maximum size
   * @returns {Object} Thumbnail dimensions
   */
  getThumbnailDimensions: (width, height, maxSize = 200) => {
    if (!width || !height) {
      return { width: maxSize, height: maxSize };
    }

    const aspectRatio = width / height;
    
    if (width > height) {
      return {
        width: maxSize,
        height: Math.round(maxSize / aspectRatio)
      };
    } else {
      return {
        width: Math.round(maxSize * aspectRatio),
        height: maxSize
      };
    }
  },

  /**
   * Get image placeholder color
   * @param {string} seed - Seed for color generation
   * @returns {string} Color string
   */
  getPlaceholderColor: (seed = '') => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];
    
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  },

  /**
   * Check if image is valid
   * @param {string} uri - Image URI
   * @returns {Promise} Validation result
   */
  validateImage: (uri) => {
    return new Promise((resolve) => {
      if (!uri) {
        resolve(false);
        return;
      }

      Image.getSize(
        uri,
        () => resolve(true),
        () => resolve(false)
      );
    });
  },

  /**
   * Get image file size (approximate)
   * @param {string} uri - Image URI
   * @returns {Promise} File size in bytes
   */
  getImageSize: async (uri) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob.size;
      } else {
        // For React Native, use FileSystem
        const info = await FileSystem.getInfoAsync(uri);
        return info.size || 0;
      }
    } catch (error) {
      console.error('Failed to get image size:', error);
      return 0;
    }
  },

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get image file extension from URI
   * @param {string} uri - Image URI
   * @returns {string} File extension
   */
  getFileExtension: (uri) => {
    if (!uri) return '';
    const parts = uri.split('.');
    return parts[parts.length - 1].toLowerCase();
  },

  /**
   * Check if image is animated
   * @param {string} uri - Image URI
   * @returns {boolean} True if animated
   */
  isAnimated: (uri) => {
    const ext = ImageUtils.getFileExtension(uri);
    return ['gif', 'webp'].includes(ext);
  },

  /**
   * Get image source for different platforms
   * @param {string} uri - Image URI
   * @param {Object} options - Platform options
   * @returns {Object} Platform-specific source
   */
  getPlatformSource: (uri, options = {}) => {
    const {
      ios = {},
      android = {},
      web = {}
    } = options;

    if (Platform.OS === 'ios') {
      return { uri, ...ios };
    } else if (Platform.OS === 'android') {
      return { uri, ...android };
    } else {
      return { uri, ...web };
    }
  }
};

export default ImageUtils;