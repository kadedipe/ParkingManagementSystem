// ============================================================================
// Badge Component - Status Badge
// ============================================================================

// parking-management-system/mobile/src/components/common/Feedback/Badge.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

const Badge = ({
  text,
  variant = 'primary',
  size = 'medium',
  rounded = false,
  dot = false,
  style,
  textStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'success':
        return styles.success;
      case 'danger':
        return styles.danger;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      case 'dark':
        return styles.dark;
      case 'outline':
        return styles.outline;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'secondary':
        return styles.secondaryText;
      case 'success':
        return styles.successText;
      case 'danger':
        return styles.dangerText;
      case 'warning':
        return styles.warningText;
      case 'info':
        return styles.infoText;
      case 'dark':
        return styles.darkText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      case 'medium':
      default:
        return styles.medium;
    }
  };

  const variantStyles = getVariantStyles();
  const textStyles = getTextStyles();
  const sizeStyles = getSizeStyles();

  if (dot) {
    return <View style={[styles.dot, variantStyles, sizeStyles, style]} {...props} />;
  }

  return (
    <View
      style={[
        styles.container,
        variantStyles,
        sizeStyles,
        rounded && styles.rounded,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, textStyles, textStyle]}>{text}</Text>
    </View>
  );
};

Badge.propTypes = {
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'dark',
    'outline',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  rounded: PropTypes.bool,
  dot: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Badge.defaultProps = {
  variant: 'primary',
  size: 'medium',
  rounded: false,
  dot: false,
  style: null,
  textStyle: null,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  rounded: {
    borderRadius: BORDER_RADIUS.round,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  dot: {
    borderRadius: BORDER_RADIUS.round,
  },
  // Sizes
  small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
  },
  medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  success: {
    backgroundColor: COLORS.success,
  },
  successText: {
    color: '#FFFFFF',
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  warning: {
    backgroundColor: COLORS.warning,
  },
  warningText: {
    color: '#FFFFFF',
  },
  info: {
    backgroundColor: COLORS.info,
  },
  infoText: {
    color: '#FFFFFF',
  },
  dark: {
    backgroundColor: COLORS.dark,
  },
  darkText: {
    color: '#FFFFFF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export default Badge;