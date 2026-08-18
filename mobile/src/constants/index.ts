// ============================================================================
// Constants Index - Export All Constants
// ============================================================================

// parking-management-system/mobile/src/constants/index.ts

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borderRadius';
export * from './shadows';
export * from './theme';

// Default exports
export { default as COLORS, DARK_COLORS } from './colors';
export { default as TYPOGRAPHY } from './typography';
export { default as SPACING, responsiveSpacing } from './spacing';
export { default as BORDER_RADIUS, responsiveRadius } from './borderRadius';
export { default as SHADOWS, getPlatformShadow } from './shadows';
export { default as THEME, BREAKPOINTS, Z_INDEX, ANIMATION_DURATIONS } from './theme';

// Combined theme for easy access
export const THEME_CONSTANTS = {
  colors: COLORS,
  darkColors: DARK_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  animationDurations: ANIMATION_DURATIONS,
} as const;

export default THEME_CONSTANTS;