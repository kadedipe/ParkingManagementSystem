// ============================================================================
// Chip Component - Selectable Chip/Tag
// ============================================================================

// parking-management-system/mobile/src/components/common/Feedback/Chip.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

const Chip = ({
  label,
  icon,
  onPress,
  onClose,
  selected = false,
  disabled = false,
  variant = 'default',
  size = 'medium',
  style,
  labelStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return styles.outline;
      case 'filled':
        return styles.filled;
      case 'default':
      default:
        return styles.default;
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

  const chipStyles = [
    styles.container,
    variantStyles,
    sizeStyles,
    selected && styles.selected,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.label,
    selected && styles.selectedText,
    disabled && styles.disabledText,
    labelStyle,
  ];

  return (
    <TouchableOpacity
      style={chipStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={textStyles}>{label}</Text>
      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          disabled={disabled}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  onPress: PropTypes.func,
  onClose: PropTypes.func,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'outline', 'filled']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Chip.defaultProps = {
  icon: null,
  onPress: null,
  onClose: null,
  selected: false,
  disabled: false,
  variant: 'default',
  size: 'medium',
  style: null,
  labelStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: '#FFFFFF',
  },
  default: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.gray300,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  filled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 24,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 32,
  },
  large: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 40,
  },
  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: COLORS.gray500,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  closeButton: {
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.xs / 2,
  },
  closeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray600,
    fontWeight: 'bold',
  },
});

export default Chip;