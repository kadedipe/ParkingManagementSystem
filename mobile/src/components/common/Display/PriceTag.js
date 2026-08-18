// ============================================================================
// PriceTag Component - Price Display Tag
// ============================================================================

// parking-management-system/mobile/src/components/common/Display/PriceTag.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

const PriceTag = ({
  amount,
  currency = '$',
  period = '/hr',
  variant = 'default',
  size = 'medium',
  color = COLORS.primary,
  strikethrough = false,
  style,
  amountStyle,
  periodStyle,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
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

  const formattedAmount = typeof amount === 'number' 
    ? amount.toFixed(2) 
    : amount;

  return (
    <View
      style={[
        styles.container,
        variantStyles,
        sizeStyles,
        { backgroundColor: variant === 'filled' ? color : 'transparent' },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.amount,
          sizeStyles,
          {
            color: variant === 'filled' ? '#FFFFFF' : color,
            textDecorationLine: strikethrough ? 'line-through' : 'none',
          },
          amountStyle,
        ]}
      >
        {currency}
        {formattedAmount}
      </Text>
      {period && (
        <Text
          style={[
            styles.period,
            sizeStyles,
            {
              color: variant === 'filled' ? 'rgba(255,255,255,0.8)' : COLORS.gray600,
            },
            periodStyle,
          ]}
        >
          {period}
        </Text>
      )}
    </View>
  );
};

PriceTag.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
  period: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  strikethrough: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  amountStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  periodStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

PriceTag.defaultProps = {
  currency: '$',
  period: '/hr',
  variant: 'default',
  size: 'medium',
  color: COLORS.primary,
  strikethrough: false,
  style: null,
  amountStyle: null,
  periodStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  default: {
    backgroundColor: 'transparent',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filled: {
    borderRadius: BORDER_RADIUS.round,
  },
  small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  amount: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  period: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginLeft: 2,
  },
});

export default PriceTag;