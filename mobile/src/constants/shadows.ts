// ============================================================================
// Shadow Constants - Design System Shadows
// ============================================================================

// parking-management-system/mobile/src/constants/shadows.ts

import { Platform } from 'react-native';
import { COLORS } from './colors';

/**
 * Shadow configuration for the design system
 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  '3xl': {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },

  // Platform-specific shadow adjustments
  ios: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
} as const;

/**
 * Create shadow style for specific platform
 * @param {string} shadowKey - Shadow key (e.g., 'md', 'lg')
 * @param {string} platform - Platform ('ios' or 'android')
 * @returns {Object} Platform-specific shadow style
 */
export const getPlatformShadow = (shadowKey: keyof typeof SHADOWS, platform: 'ios' | 'android' = Platform.OS as 'ios' | 'android'): any => {
  const shadow = SHADOWS[shadowKey] || SHADOWS.md;
  
  if (platform === 'ios') {
    return {
      shadowColor: shadow.shadowColor,
      shadowOffset: shadow.shadowOffset,
      shadowOpacity: shadow.shadowOpacity,
      shadowRadius: shadow.shadowRadius,
    };
  }
  
  return {
    elevation: shadow.elevation || 4,
  };
};

export type ShadowKey = keyof typeof SHADOWS;
export type ShadowValue = typeof SHADOWS[ShadowKey];

export default SHADOWS;