// ============================================================================
// Button Component - Reusable Button with Multiple Variants
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/Button.js

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

/**
 * Button Component - Primary reusable button with multiple variants
 * @param {Object} props - Component props
 * @param {string} props.title - Button text
 * @param {function} props.onPress - Press handler
 * @param {string} props.variant - Button variant (primary, secondary, outline, ghost, danger, success)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.iconLeft - Left icon name (from icon library)
 * @param {string} props.iconRight - Right icon name (from icon library)
 * @param {ReactNode} props.children - Custom children
 * @param {Object} props.style - Additional styles
 * @param {Object} props.textStyle - Additional text styles
 * @param {string} props.testID - Test ID for testing
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  children,
  style,
  textStyle,
  testID,
  ...props
}) => {
  // Determine button styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: styles.secondaryButton,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          button: styles.outlineButton,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          button: styles.ghostButton,
          text: styles.ghostText,
        };
      case 'danger':
        return {
          button: styles.dangerButton,
          text: styles.dangerText,
        };
      case 'success':
        return {
          button: styles.successButton,
          text: styles.successText,
        };
      case 'warning':
        return {
          button: styles.warningButton,
          text: styles.warningText,
        };
      case 'primary':
      default:
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
        };
    }
  };

  // Determine size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      case 'medium':
      default:
        return styles.mediumButton;
    }
  };

  // Determine text size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      case 'medium':
      default:
        return styles.mediumText;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();

  // Combine all styles
  const buttonStyles = [
    styles.button,
    variantStyles.button,
    sizeStyles,
    disabled && styles.disabledButton,
    loading && styles.loadingButton,
    style,
  ];

  const textStyles = [
    styles.text,
    variantStyles.text,
    textSize,
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={variant === 'primary' ? '#FFFFFF' : COLORS.primary}
            size="small"
          />
          {title && <Text style={textStyles}>{title}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        {children || (title && <Text style={textStyles}>{title}</Text>)}
        {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      testID={testID || 'button'}
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

Button.propTypes = {
  title: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'success',
    'warning',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

Button.defaultProps = {
  title: '',
  variant: 'primary',
  size: 'medium',
  loading: false,
  disabled: false,
  iconLeft: null,
  iconRight: null,
  children: null,
  style: null,
  textStyle: null,
  testID: null,
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  warningButton: {
    backgroundColor: COLORS.warning,
  },
  // Size styles
  smallButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 56,
  },
  // Text styles
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  successText: {
    color: '#FFFFFF',
  },
  warningText: {
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
  },
  largeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: TYPOGRAPHY.lineHeight.lg,
  },
  // Disabled styles
  disabledButton: {
    backgroundColor: COLORS.gray300,
    borderColor: COLORS.gray300,
  },
  disabledText: {
    color: COLORS.gray500,
  },
  // Loading styles
  loadingButton: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },
});

export default Button;