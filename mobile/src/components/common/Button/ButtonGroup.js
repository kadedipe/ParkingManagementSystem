// ============================================================================
// ButtonGroup Component - Group of Buttons
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/ButtonGroup.js

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../constants/theme';

/**
 * ButtonGroup Component - Group of buttons with single selection
 */
const ButtonGroup = ({
  options,
  selectedIndex,
  onSelect,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  buttonStyle,
  textStyle,
  ...props
}) => {
  const [selected, setSelected] = useState(selectedIndex || 0);

  const handlePress = (index) => {
    if (disabled) return;
    setSelected(index);
    if (onSelect) {
      onSelect(index);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
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

  return (
    <View style={[styles.container, style]} {...props}>
      {options.map((option, index) => {
        const isSelected = index === selected;
        return (
          <TouchableOpacity
            key={option.value || index}
            style={[
              styles.button,
              sizeStyles,
              variantStyles,
              isSelected && styles.selected,
              index === 0 && styles.firstButton,
              index === options.length - 1 && styles.lastButton,
              buttonStyle,
              disabled && styles.disabled,
            ]}
            onPress={() => handlePress(index)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                isSelected ? styles.selectedText : styles.unselectedText,
                textStyle,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

ButtonGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
    })
  ).isRequired,
  selectedIndex: PropTypes.number,
  onSelect: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  buttonStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

ButtonGroup.defaultProps = {
  selectedIndex: 0,
  onSelect: null,
  variant: 'primary',
  size: 'medium',
  disabled: false,
  style: null,
  buttonStyle: null,
  textStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
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
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: 'transparent',
    borderColor: COLORS.danger,
  },
  success: {
    backgroundColor: 'transparent',
    borderColor: COLORS.success,
  },
  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  firstButton: {
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomLeftRadius: BORDER_RADIUS.md,
  },
  lastButton: {
    borderTopRightRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
  },
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: COLORS.text,
  },
});

export default ButtonGroup;