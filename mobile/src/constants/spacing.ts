// ============================================================================
// Spacing Constants - Design System Spacing
// ============================================================================

// parking-management-system/mobile/src/constants/spacing.ts

/**
 * Spacing configuration for the design system
 * Based on an 8-point grid system
 */
export const SPACING = {
  // Base spacing units
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
  '8xl': 80,
  '9xl': 96,
  '10xl': 120,

  // Aliases for common use cases
  padding: {
    screen: 16,
    card: 16,
    button: 12,
    input: 12,
    section: 20,
    modal: 24,
  },
  margin: {
    screen: 16,
    card: 16,
    button: 8,
    input: 8,
    section: 20,
    modal: 24,
    betweenElements: 12,
    betweenSections: 24,
  },
  gap: {
    betweenElements: 12,
    betweenSections: 24,
    betweenButtons: 8,
    betweenInputs: 16,
  },
} as const;

/**
 * Responsive spacing helper
 * @param {number} base - Base spacing value
 * @param {number} screenWidth - Screen width (default: 375)
 * @returns {number} Responsive spacing value
 */
export const responsiveSpacing = (base: number, screenWidth: number = 375): number => {
  const scale = screenWidth / 375;
  return Math.round(base * Math.min(scale, 1.5));
};

export type SpacingKey = keyof typeof SPACING;
export type SpacingValue = typeof SPACING[SpacingKey];

export default SPACING;