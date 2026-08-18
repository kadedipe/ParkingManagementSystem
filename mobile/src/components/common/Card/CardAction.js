// ============================================================================
// CardAction Component - Action Area in Card
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/CardAction.js

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * CardAction Component - Interactive action area within a card
 */
const CardAction = ({
  label,
  icon,
  onPress,
  variant = 'text',
  color = COLORS.primary,
  style,
  labelStyle,
  disabled = false,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
      case 'contained':
        return styles.contained;
      case 'text':
      default:
        return styles.text;
    }
  };

  const variantStyles = getVariantStyles();

  const actionStyles = [
    styles.container,
    variantStyles,
    { borderColor: color },
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.label,
    { color: variant === 'text' || variant === 'outlined' ? color : '#FFFFFF' },
    labelStyle,
  ];

  return (
    <TouchableOpacity
      style={actionStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      {label && <Text style={textStyles}>{label}</Text>}
    </TouchableOpacity>
  );
};

CardAction.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.node,
  onPress: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  disabled: PropTypes.bool,
};

CardAction.defaultProps = {
  label: '',
  icon: null,
  variant: 'text',
  color: COLORS.primary,
  style: null,
  labelStyle: null,
  disabled: false,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 4,
  },
  text: {
    backgroundColor: 'transparent',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  contained: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textAlign: 'center',
  },
});

export default CardAction;