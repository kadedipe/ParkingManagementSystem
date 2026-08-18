// ============================================================================
// Border Radius Constants - Design System Border Radius
// ============================================================================

// parking-management-system/mobile/src/constants/borderRadius.ts

/**
 * Border radius configuration for the design system
 */
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,

  // Aliases for common use cases
  button: 8,
  card: 12,
  input: 8,
  modal: 20,
  sheet: 20,
  avatar: 9999,
  badge: 9999,
  chip: 9999,
} as const;

/**
 * Responsive border radius helper
 * @param {number} base - Base border radius value
 * @param {number} screenWidth - Screen width (default: 375)
 * @returns {number} Responsive border radius value
 */
export const responsiveRadius = (base: number, screenWidth: number = 375): number => {
  const scale = screenWidth / 375;
  return Math.round(base * Math.min(scale, 1.2));
};

export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type BorderRadiusValue = typeof BORDER_RADIUS[BorderRadiusKey];

export default BORDER_RADIUS;