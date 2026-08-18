// ============================================================================
// IconButton Component - Button with Icon Only
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/IconButton.js

import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants/theme';

/**
 * IconButton Component - Circular button with icon only
 */
const IconButton = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  badge,
  ...props
}) => {
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles,
        variantStyles,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.iconContainer}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#FFFFFF' : COLORS.primary}
            size="small"
          />
        ) : (
          icon
        )}
      </View>
      {badge && <View style={styles.badge}>{badge}</View>}
    </TouchableOpacity>
  );
};

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  onPress: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'success',
  ]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  badge: PropTypes.node,
};

IconButton.defaultProps = {
  size: 'medium',
  variant: 'primary',
  disabled: false,
  loading: false,
  style: null,
  badge: null,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
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
  small: {
    width: 36,
    height: 36,
  },
  medium: {
    width: 48,
    height: 48,
  },
  large: {
    width: 56,
    height: 56,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  disabled: {
    backgroundColor: COLORS.gray300,
    borderColor: COLORS.gray300,
    opacity: 0.6,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});

export default IconButton;