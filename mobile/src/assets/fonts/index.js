// ============================================================================
// Font Assets - Font Management System
// ============================================================================

// parking-management-system/mobile/src/assets/fonts/index.js

import { Platform } from 'react-native';

/**
 * Font Configuration - Centralized font management
 */
export const Fonts = {
  // Font families
  families: {
    // Primary fonts
    primary: {
      regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System'
      }),
      medium: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
        default: 'System'
      }),
      bold: Platform.select({
        ios: 'System',
        android: 'Roboto-Bold',
        default: 'System'
      }),
      light: Platform.select({
        ios: 'System',
        android: 'Roboto-Light',
        default: 'System'
      }),
      thin: Platform.select({
        ios: 'System',
        android: 'Roboto-Thin',
        default: 'System'
      })
    },
    
    // Secondary fonts (custom)
    secondary: {
      regular: 'Montserrat-Regular',
      medium: 'Montserrat-Medium',
      bold: 'Montserrat-Bold',
      light: 'Montserrat-Light',
      semiBold: 'Montserrat-SemiBold',
      italic: 'Montserrat-Italic'
    },
    
    // Display fonts
    display: {
      regular: 'Poppins-Regular',
      medium: 'Poppins-Medium',
      bold: 'Poppins-Bold',
      semiBold: 'Poppins-SemiBold',
      light: 'Poppins-Light'
    },
    
    // Monospace fonts (for codes, etc.)
    monospace: {
      regular: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace'
      })
    }
  },

  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
    '7xl': 48,
    '8xl': 56,
    '9xl': 64,
    '10xl': 72
  },

  // Line heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6
  },

  // Font weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  /**
   * Get font family with weight and style
   * @param {string} family - Font family name
   * @param {string} weight - Font weight
   * @param {string} style - Font style (normal, italic)
   * @returns {string} Complete font family string
   */
  getFontFamily: (family = 'primary', weight = 'regular', style = 'normal') => {
    const fontFamily = Fonts.families[family];
    if (!fontFamily) return Fonts.families.primary.regular;
    
    const fontWeight = fontFamily[weight];
    if (!fontWeight) return fontFamily.regular;
    
    return style === 'italic' ? `${fontWeight}-Italic` : fontWeight;
  },

  /**
   * Get complete font style object
   * @param {Object} options - Font options
   * @param {string} options.family - Font family
   * @param {string} options.weight - Font weight
   * @param {number} options.size - Font size
   * @param {number} options.lineHeight - Line height
   * @param {number} options.letterSpacing - Letter spacing
   * @param {string} options.style - Font style
   * @returns {Object} Font style object
   */
  getFontStyle: ({
    family = 'primary',
    weight = 'regular',
    size = Fonts.sizes.base,
    lineHeight = Fonts.lineHeights.normal,
    letterSpacing = Fonts.letterSpacing.normal,
    style = 'normal',
    color
  } = {}) => {
    return {
      fontFamily: Fonts.getFontFamily(family, weight, style),
      fontSize: size,
      lineHeight: size * lineHeight,
      letterSpacing,
      color,
      ...(style === 'italic' && { fontStyle: 'italic' })
    };
  },

  /**
   * Predefined text styles
   */
  styles: {
    // Heading styles
    h1: {
      family: 'secondary',
      weight: 'bold',
      size: '5xl',
      lineHeight: 1.25,
      letterSpacing: -0.4
    },
    h2: {
      family: 'secondary',
      weight: 'bold',
      size: '4xl',
      lineHeight: 1.25,
      letterSpacing: -0.2
    },
    h3: {
      family: 'secondary',
      weight: 'semiBold',
      size: '3xl',
      lineHeight: 1.25,
      letterSpacing: 0
    },
    h4: {
      family: 'secondary',
      weight: 'semiBold',
      size: '2xl',
      lineHeight: 1.25,
      letterSpacing: 0
    },
    h5: {
      family: 'secondary',
      weight: 'medium',
      size: 'xl',
      lineHeight: 1.25,
      letterSpacing: 0.4
    },
    h6: {
      family: 'secondary',
      weight: 'medium',
      size: 'lg',
      lineHeight: 1.25,
      letterSpacing: 0.4
    },

    // Body styles
    body1: {
      family: 'primary',
      weight: 'normal',
      size: 'base',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    body2: {
      family: 'primary',
      weight: 'normal',
      size: 'md',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    body3: {
      family: 'primary',
      weight: 'normal',
      size: 'sm',
      lineHeight: 1.5,
      letterSpacing: 0
    },

    // Caption styles
    caption: {
      family: 'primary',
      weight: 'light',
      size: 'sm',
      lineHeight: 1.5,
      letterSpacing: 0.4
    },
    small: {
      family: 'primary',
      weight: 'light',
      size: 'xs',
      lineHeight: 1.5,
      letterSpacing: 0.4
    },

    // Button styles
    button: {
      family: 'secondary',
      weight: 'medium',
      size: 'md',
      lineHeight: 1.25,
      letterSpacing: 0.8
    },
    buttonLarge: {
      family: 'secondary',
      weight: 'semiBold',
      size: 'lg',
      lineHeight: 1.25,
      letterSpacing: 0.8
    },

    // Special styles
    display: {
      family: 'display',
      weight: 'bold',
      size: '7xl',
      lineHeight: 1.1,
      letterSpacing: -0.8
    },
    label: {
      family: 'secondary',
      weight: 'medium',
      size: 'sm',
      lineHeight: 1.25,
      letterSpacing: 0.8
    },
    error: {
      family: 'primary',
      weight: 'medium',
      size: 'sm',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    success: {
      family: 'primary',
      weight: 'medium',
      size: 'sm',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    warning: {
      family: 'primary',
      weight: 'medium',
      size: 'sm',
      lineHeight: 1.5,
      letterSpacing: 0
    },
    info: {
      family: 'primary',
      weight: 'medium',
      size: 'sm',
      lineHeight: 1.5,
      letterSpacing: 0
    }
  }
};

export default Fonts;