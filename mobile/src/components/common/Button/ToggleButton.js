// ============================================================================
// ToggleButton Component - Toggle/Switch Button
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/ToggleButton.js

import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../constants/theme';

/**
 * ToggleButton Component - Toggleable button with active/inactive states
 */
const ToggleButton = ({
  title,
  activeTitle,
  inactiveTitle,
  isActive = false,
  onToggle,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  activeStyle,
  inactiveStyle,
  ...props
}) => {
  const [active, setActive] = useState(isActive);
  const [animation] = useState(new Animated.Value(isActive ? 1 : 0));

  const handlePress = () => {
    if (disabled) return;
    const newActive = !active;
    setActive(newActive);
    Animated.spring(animation, {
      toValue: newActive ? 1 : 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
    if (onToggle) {
      onToggle(newActive);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      case 'primary':
      default:
        return styles.primary;
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
  const sizeStyles = getSizeStyles();

  const activeBackgroundColor = {
    backgroundColor: active ? COLORS.primary : COLORS.gray300,
  };

  const activeTextColor = {
    color: active ? '#FFFFFF' : COLORS.gray600,
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles,
        variantStyles,
        activeBackgroundColor,
        disabled && styles.disabled,
        style,
        active ? styles.activeContainer : styles.inactiveContainer,
        active && activeStyle,
        !active && inactiveStyle,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [
              {
                translateX: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, size === 'small' ? 16 : size === 'large' ? 28 : 22],
                }),
              },
            ],
          },
        ]}
      />
      <Text style={[styles.text, activeTextColor, textStyle]}>
        {active ? activeTitle || title : inactiveTitle || title}
      </Text>
    </TouchableOpacity>
  );
};

ToggleButton.propTypes = {
  title: PropTypes.string.isRequired,
  activeTitle: PropTypes.string,
  inactiveTitle: PropTypes.string,
  isActive: PropTypes.bool,
  onToggle: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  activeStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inactiveStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

ToggleButton.defaultProps = {
  activeTitle: '',
  inactiveTitle: '',
  isActive: false,
  onToggle: null,
  variant: 'primary',
  size: 'medium',
  disabled: false,
  style: null,
  textStyle: null,
  activeStyle: null,
  inactiveStyle: null,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    minHeight: 32,
  },
  medium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minHeight: 44,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 52,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  disabled: {
    opacity: 0.6,
  },
  activeContainer: {
    backgroundColor: COLORS.primary,
  },
  inactiveContainer: {
    backgroundColor: COLORS.gray300,
  },
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ToggleButton;