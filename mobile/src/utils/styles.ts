// ============================================================================
// Constants Usage Examples
// ============================================================================

// parking-management-system/mobile/src/utils/styles.ts

import { StyleSheet } from 'react-native';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../constants';

/**
 * Example of using constants in styles
 */
export const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      padding: SPACING.lg,
    },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: BORDER_RADIUS.card,
      padding: SPACING.card,
      ...SHADOWS.md,
    },
    title: {
      ...TYPOGRAPHY.styles.h2,
      color: COLORS.text,
      marginBottom: SPACING.sm,
    },
    body: {
      ...TYPOGRAPHY.styles.body,
      color: COLORS.textSecondary,
    },
    button: {
      backgroundColor: COLORS.primary,
      borderRadius: BORDER_RADIUS.button,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
    },
    buttonText: {
      ...TYPOGRAPHY.styles.button,
      color: COLORS.buttonPrimaryText,
    },
    input: {
      backgroundColor: COLORS.inputBackground,
      borderColor: COLORS.inputBorder,
      borderRadius: BORDER_RADIUS.input,
      borderWidth: 1,
      padding: SPACING.input,
    },
    inputFocused: {
      borderColor: COLORS.inputFocus,
    },
    inputError: {
      borderColor: COLORS.inputError,
    },
    statusBadge: {
      backgroundColor: COLORS.statusAvailable,
      borderRadius: BORDER_RADIUS.full,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    statusText: {
      ...TYPOGRAPHY.styles.caption,
      color: COLORS.white,
    },
    gradient: {
      start: COLORS.gradientStart,
      end: COLORS.gradientEnd,
    },
    shadow: SHADOWS.md,
    overlay: {
      backgroundColor: COLORS.overlay,
    },
  });

/**
 * Example of using responsive spacing
 */
export const getResponsivePadding = (screenWidth: number) => ({
  paddingHorizontal: screenWidth < 375 ? SPACING.md : SPACING.lg,
  paddingVertical: screenWidth < 375 ? SPACING.sm : SPACING.md,
});

/**
 * Example of using theme colors dynamically
 */
export const getThemeColor = (isDark: boolean) => ({
  background: isDark ? COLORS.backgroundDark : COLORS.background,
  text: isDark ? COLORS.textInverse : COLORS.text,
  card: isDark ? COLORS.gray800 : COLORS.card,
});