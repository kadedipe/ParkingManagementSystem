// ============================================================================
// Type Definitions - Constants Type Definitions
// ============================================================================

// parking-management-system/mobile/src/types/constants.ts

import { COLORS, DARK_COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING } from '../constants/spacing';
import { BORDER_RADIUS } from '../constants/borderRadius';
import { SHADOWS } from '../constants/shadows';

export type ColorType = typeof COLORS;
export type DarkColorType = typeof DARK_COLORS;
export type TypographyType = typeof TYPOGRAPHY;
export type SpacingType = typeof SPACING;
export type BorderRadiusType = typeof BORDER_RADIUS;
export type ShadowType = typeof SHADOWS;

export interface ThemeType {
  colors: ColorType;
  typography: TypographyType;
  spacing: SpacingType;
  borderRadius: BorderRadiusType;
  shadows: ShadowType;
  isDark: boolean;
}

export type ThemeModeType = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeType;
  mode: ThemeModeType;
  toggleTheme: () => void;
  setTheme: (mode: ThemeModeType) => void;
}

export default ThemeType;