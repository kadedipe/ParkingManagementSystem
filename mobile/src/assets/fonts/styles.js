// ============================================================================
// Font Styles - Typography System
// ============================================================================

// parking-management-system/mobile/src/assets/fonts/styles.js

import { StyleSheet } from 'react-native';
import Fonts from './index';

/**
 * Typography System - Predefined text styles
 */
export const Typography = StyleSheet.create({
  // Display styles
  displayLarge: {
    ...Fonts.getFontStyle({
      family: 'display',
      weight: 'bold',
      size: Fonts.sizes['7xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tighter
    })
  },
  displayMedium: {
    ...Fonts.getFontStyle({
      family: 'display',
      weight: 'bold',
      size: Fonts.sizes['6xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tight
    })
  },
  displaySmall: {
    ...Fonts.getFontStyle({
      family: 'display',
      weight: 'semiBold',
      size: Fonts.sizes['5xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tight
    })
  },

  // Heading styles
  h1: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'bold',
      size: Fonts.sizes['5xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tighter
    })
  },
  h2: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'bold',
      size: Fonts.sizes['4xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tight
    })
  },
  h3: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'semiBold',
      size: Fonts.sizes['3xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  h4: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'semiBold',
      size: Fonts.sizes['2xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  h5: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.xl,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wide
    })
  },
  h6: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.lg,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wide
    })
  },

  // Body styles
  bodyLarge: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'normal',
      size: Fonts.sizes.lg,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  body: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'normal',
      size: Fonts.sizes.base,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  bodySmall: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'normal',
      size: Fonts.sizes.md,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  bodyXSmall: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'normal',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },

  // Caption styles
  caption: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'light',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.relaxed,
      letterSpacing: Fonts.letterSpacing.wide
    })
  },
  captionSmall: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'light',
      size: Fonts.sizes.xs,
      lineHeight: Fonts.lineHeights.relaxed,
      letterSpacing: Fonts.letterSpacing.wide
    })
  },

  // Button styles
  buttonLarge: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'semiBold',
      size: Fonts.sizes.lg,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wide
    })
  },
  button: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.md,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wide
    })
  },
  buttonSmall: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wider
    })
  },

  // Label styles
  label: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wider
    })
  },
  labelSmall: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.xs,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.wider
    })
  },

  // Special styles
  error: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'medium',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  success: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'medium',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  warning: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'medium',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  info: {
    ...Fonts.getFontStyle({
      family: 'primary',
      weight: 'medium',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },

  // Code and monospace
  code: {
    ...Fonts.getFontStyle({
      family: 'monospace',
      weight: 'normal',
      size: Fonts.sizes.md,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },
  codeSmall: {
    ...Fonts.getFontStyle({
      family: 'monospace',
      weight: 'normal',
      size: Fonts.sizes.sm,
      lineHeight: Fonts.lineHeights.normal,
      letterSpacing: Fonts.letterSpacing.normal
    })
  },

  // Overline styles
  overline: {
    ...Fonts.getFontStyle({
      family: 'secondary',
      weight: 'medium',
      size: Fonts.sizes.xs,
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.widest
    }),
    textTransform: 'uppercase'
  },

  // Number styles (for prices, stats, etc.)
  number: {
    ...Fonts.getFontStyle({
      family: 'display',
      weight: 'bold',
      size: Fonts.sizes['3xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tight
    })
  },
  numberLarge: {
    ...Fonts.getFontStyle({
      family: 'display',
      weight: 'bold',
      size: Fonts.sizes['6xl'],
      lineHeight: Fonts.lineHeights.tight,
      letterSpacing: Fonts.letterSpacing.tight
    })
  }
});

export default Typography;