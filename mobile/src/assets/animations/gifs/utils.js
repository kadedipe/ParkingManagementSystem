// ============================================================================
// GIF Utilities - Helper Functions
// ============================================================================

// parking-management-system/mobile/src/assets/animations/gifs/utils.js

import { Platform, Dimensions } from 'react-native';
import GifService from './service';
import Gifs from './index';

/**
 * GIF Utilities - Helper functions for GIF operations
 */
export const GifUtils = {
  /**
   * Get GIF source with fallback
   * @param {string} key - GIF key
   * @param {string} fallbackKey - Fallback GIF key
   * @returns {Object} GIF source
   */
  getGifSource: (key, fallbackKey = 'loading') => {
    try {
      const gif = Gifs[key];
      if (gif) {
        return gif;
      }
      return Gifs[fallbackKey] || null;
    } catch (error) {
      console.error('Error getting GIF source:', error);
      return Gifs.loading || null;
    }
  },

  /**
   * Check if GIF is supported on current platform
   * @param {string} key - GIF key
   * @returns {boolean} True if supported
   */
  isGifSupported: (key) => {
    // GIFs are supported on most platforms
    // Some older Android versions may have issues
    if (Platform.OS === 'android' && Platform.Version < 21) {
      return false;
    }
    return true;
  },

  /**
   * Get optimized GIF size for device
   * @param {number} baseSize - Base size
   * @param {number} maxSize - Maximum size
   * @returns {number} Optimized size
   */
  getOptimizedSize: (baseSize, maxSize = 400) => {
    const screenWidth = Dimensions.get('window').width;
    const scale = screenWidth / 375;
    const size = Math.round(baseSize * Math.min(scale, 1.5));
    return Math.min(size, maxSize);
  },

  /**
   * Get GIF categories
   * @returns {Object} Categorized GIFs
   */
  getGifCategories: () => {
    return {
      loading: ['loading', 'loadingDots', 'loadingSpinner', 'loadingPulse', 'loadingBars'],
      success: ['success', 'successCheck', 'successConfetti', 'successStars'],
      error: ['error', 'errorWarning', 'errorX'],
      parking: ['parking', 'parkingCar', 'parkingSpot'],
      charging: ['charging', 'chargingEV', 'batteryFull'],
      payment: ['payment', 'paymentSuccess'],
      booking: ['booking', 'bookingConfirm'],
      empty: ['empty', 'emptySearch', 'emptyNotifications'],
      celebration: ['celebration', 'fireworks', 'confetti'],
      user: ['profile', 'avatar', 'login'],
      map: ['mapPin', 'location', 'navigation']
    };
  },

  /**
   * Get random GIF from category
   * @param {string} category - GIF category
   * @returns {string} Random GIF key
   */
  getRandomGif: (category) => {
    const categories = GifUtils.getGifCategories();
    const categoryGifs = categories[category] || [];
    if (categoryGifs.length === 0) {
      return 'loading';
    }
    const randomIndex = Math.floor(Math.random() * categoryGifs.length);
    return categoryGifs[randomIndex];
  },

  /**
   * Validate GIF key
   * @param {string} key - GIF key
   * @returns {boolean} True if valid
   */
  isValidGifKey: (key) => {
    return key in Gifs;
  },

  /**
   * Get available GIF keys
   * @param {string} category - Optional category filter
   * @returns {Array} Array of GIF keys
   */
  getGifKeys: (category = null) => {
    const allKeys = Object.keys(Gifs);
    if (!category) {
      return allKeys;
    }
    const categories = GifUtils.getGifCategories();
    const categoryKeys = categories[category] || [];
    return allKeys.filter(key => categoryKeys.includes(key));
  },

  /**
   * Format GIF key for display
   * @param {string} key - GIF key
   * @returns {string} Formatted display name
   */
  formatGifName: (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  },

  /**
   * Get GIF file size (approximate)
   * @param {string} key - GIF key
   * @returns {number} Approximate file size in bytes
   */
  getGifSize: (key) => {
    // This is a rough estimate based on typical GIF sizes
    const sizes = {
      loading: 150 * 1024,
      loadingDots: 100 * 1024,
      success: 200 * 1024,
      error: 180 * 1024,
      parking: 250 * 1024,
      charging: 220 * 1024,
      payment: 300 * 1024,
      booking: 280 * 1024,
      profile: 150 * 1024,
      empty: 120 * 1024,
      celebration: 350 * 1024,
    };
    return sizes[key] || 150 * 1024;
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
  }
};

export default GifUtils;