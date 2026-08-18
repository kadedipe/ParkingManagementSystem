// ============================================================================
// Font Utilities - Font Helper Functions
// ============================================================================

// parking-management-system/mobile/src/assets/fonts/utils.js

import { Platform } from 'react-native';
import Fonts from './index';

/**
 * Font Utilities - Helper functions for font operations
 */
export const FontUtils = {
  /**
   * Get responsive font size based on screen width
   * @param {number} size - Base font size
   * @param {number} screenWidth - Screen width (default: 375)
   * @returns {number} Responsive font size
   */
  getResponsiveSize: (size, screenWidth = 375) => {
    const baseWidth = 375; // iPhone SE/8 base width
    const scale = screenWidth / baseWidth;
    return Math.round(size * Math.min(scale, 1.5));
  },

  /**
   * Get font weight value
   * @param {string} weight - Font weight name
   * @returns {string} Font weight value
   */
  getWeightValue: (weight) => {
    const weights = {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    };
    return weights[weight] || '400';
  },

  /**
   * Get platform-specific font family
   * @param {string} fontFamily - Font family name
   * @param {string} weight - Font weight
   * @returns {string} Platform-specific font family
   */
  getPlatformFont: (fontFamily, weight = 'normal') => {
    if (Platform.OS === 'ios') {
      return `${fontFamily}-${weight.charAt(0).toUpperCase() + weight.slice(1)}`;
    } else if (Platform.OS === 'android') {
      return `${fontFamily}-${weight.charAt(0).toUpperCase() + weight.slice(1)}`;
    }
    return fontFamily;
  },

  /**
   * Get font style for accessibility
   * @param {Object} style - Font style object
   * @param {number} fontSize - Base font size
   * @param {number} scale - Accessibility scale
   * @returns {Object} Scaled font style
   */
  getAccessibleFont: (style, fontSize, scale = 1.0) => {
    return {
      ...style,
      fontSize: Math.round(fontSize * scale),
      lineHeight: Math.round((fontSize * scale) * 1.5)
    };
  },

  /**
   * Validate font family exists
   * @param {string} family - Font family name
   * @returns {boolean} True if font family exists
   */
  isValidFontFamily: (family) => {
    return Object.keys(Fonts.families).includes(family);
  },

  /**
   * Get font from config with fallback
   * @param {Object} config - Font configuration
   * @param {string} config.family - Font family
   * @param {string} config.weight - Font weight
   * @param {number} config.size - Font size
   * @param {string} config.color - Font color
   * @returns {Object} Font style object
   */
  getFont: ({ family = 'primary', weight = 'normal', size = 16, color = '#000000' }) => {
    const baseStyle = Fonts.getFontStyle({
      family,
      weight,
      size,
      color
    });

    // Add platform-specific adjustments
    if (Platform.OS === 'android') {
      // Android-specific adjustments
      baseStyle.includeFontPadding = false;
    }

    return baseStyle;
  },

  /**
   * Merge multiple font styles
   * @param {...Object} styles - Font style objects to merge
   * @returns {Object} Merged font style
   */
  mergeFontStyles: (...styles) => {
    return Object.assign({}, ...styles);
  },

  /**
   * Get fallback font if primary font fails
   * @param {string} family - Font family
   * @param {string} weight - Font weight
   * @returns {string} Fallback font family
   */
  getFallbackFont: (family, weight = 'normal') => {
    const fallbacks = {
      primary: {
        ios: 'System',
        android: 'Roboto',
        default: 'sans-serif'
      },
      secondary: {
        ios: 'System',
        android: 'Roboto',
        default: 'sans-serif'
      },
      display: {
        ios: 'System',
        android: 'Roboto',
        default: 'sans-serif'
      },
      monospace: {
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace'
      }
    };

    const platformFallback = fallbacks[family] || fallbacks.primary;
    return platformFallback[Platform.OS] || platformFallback.default;
  }
};

export default FontUtils;