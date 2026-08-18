// ============================================================================
// Typography Constants - Design System Typography
// ============================================================================

// parking-management-system/mobile/src/constants/typography.ts

import { Platform } from 'react-native';

/**
 * Typography configuration for the design system
 */
export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    // System fonts (fallback)
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'System',
      android: 'Roboto-Light',
      default: 'System',
    }),
    thin: Platform.select({
      ios: 'System',
      android: 'Roboto-Thin',
      default: 'System',
    }),
    italic: Platform.select({
      ios: 'System',
      android: 'Roboto-Italic',
      default: 'System',
    }),

    // Custom fonts (if loaded)
    primary: 'System',
    secondary: 'System',
    display: 'System',
    monospace: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font sizes (in pixels)
  fontSize: {
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
    '10xl': 72,
  } as const,

  // Line heights (multipliers)
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  } as const,

  // Letter spacing (in pixels)
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  } as const,

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  } as const,

  /**
   * Predefined text styles
   */
  styles: {
    // Display styles
    displayLarge: {
      fontSize: 72,
      lineHeight: 80,
      fontWeight: '700',
      letterSpacing: -0.8,
    },
    displayMedium: {
      fontSize: 56,
      lineHeight: 64,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    displaySmall: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '600',
      letterSpacing: -0.2,
    },

    // Heading styles
    h1: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '500',
      letterSpacing: 0.4,
    },
    h6: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '500',
      letterSpacing: 0.4,
    },

    // Body styles
    bodyLarge: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400',
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0,
    },
    bodyXSmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0,
    },

    // Caption styles
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0.4,
    },
    captionSmall: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '400',
      letterSpacing: 0.4,
    },

    // Button styles
    buttonLarge: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: 0.8,
    },
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.8,
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      letterSpacing: 0.8,
    },

    // Label styles
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0.8,
    },
    labelSmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 0.8,
    },

    // Overline
    overline: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '500',
      letterSpacing: 1.6,
      textTransform: 'uppercase',
    },

    // Number styles
    number: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    numberLarge: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '700',
      letterSpacing: -0.8,
    },
    numberSmall: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
  } as const,
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;
export type FontSizeKey = keyof typeof TYPOGRAPHY.fontSize;

export default TYPOGRAPHY;