// ============================================================================
// Theme Constants - Complete Theme Configuration
// ============================================================================

// parking-management-system/mobile/src/constants/theme.ts

import { COLORS, DARK_COLORS } from './colors';
import TYPOGRAPHY from './typography';
import SPACING from './spacing';
import BORDER_RADIUS from './borderRadius';
import SHADOWS from './shadows';

/**
 * Complete theme configuration
 */
export const THEME = {
  light: {
    colors: COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    isDark: false,
  },
  dark: {
    colors: DARK_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: {
      ...SHADOWS,
      xs: {
        ...SHADOWS.xs,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
      sm: {
        ...SHADOWS.sm,
        shadowColor: 'rgba(0, 0, 0, 0.4)',
      },
      md: {
        ...SHADOWS.md,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      lg: {
        ...SHADOWS.lg,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
      },
    },
    isDark: true,
  },
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Z-index levels
 */
export const Z_INDEX = {
  base: 1,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  loader: 90,
  notification: 100,
} as const;

/**
 * Animation durations
 */
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Device size thresholds
 */
export const DEVICE = {
  isSmall: (width: number) => width < 375,
  isMedium: (width: number) => width >= 375 && width < 768,
  isLarge: (width: number) => width >= 768,
} as const;

/**
 * Theme type
 */
export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof COLORS;
export type ThemeTypography = typeof TYPOGRAPHY;
export type ThemeSpacing = typeof SPACING;
export type ThemeBorderRadius = typeof BORDER_RADIUS;
export type ThemeShadows = typeof SHADOWS;

export default THEME;