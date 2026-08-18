// ============================================================================
// Card Component - Reusable Card with Multiple Variants
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/Card.js

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants/theme';

/**
 * Card Component - Primary reusable card with multiple variants
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant (default, elevated, outlined, flat)
 * @param {string} props.padding - Card padding size (none, small, medium, large)
 * @param {boolean} props.pressable - Make card pressable
 * @param {function} props.onPress - Press handler
 * @param {function} props.onLongPress - Long press handler
 * @param {ReactNode} props.children - Card content
 * @param {Object} props.style - Additional styles
 * @param {Object} props.contentStyle - Additional content styles
 * @param {string} props.backgroundColor - Custom background color
 * @param {string} props.borderColor - Custom border color
 */
const Card = ({
  variant = 'elevated',
  padding = 'medium',
  pressable = false,
  onPress,
  onLongPress,
  children,
  style,
  contentStyle,
  backgroundColor,
  borderColor,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlinedCard;
      case 'flat':
        return styles.flatCard;
      case 'default':
        return styles.defaultCard;
      case 'elevated':
      default:
        return styles.elevatedCard;
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'small':
        return styles.paddingSmall;
      case 'large':
        return styles.paddingLarge;
      case 'medium':
      default:
        return styles.paddingMedium;
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();

  const cardStyles = [
    styles.card,
    variantStyles,
    paddingStyles,
    backgroundColor && { backgroundColor },
    borderColor && { borderColor },
    pressable && styles.pressable,
    style,
  ];

  const contentStyles = [styles.content, contentStyle];

  const renderContent = () => (
    <View style={cardStyles} {...props}>
      <View style={contentStyles}>{children}</View>
    </View>
  );

  if (pressable) {
    return (
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  pressable: PropTypes.bool,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  contentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
};

Card.defaultProps = {
  variant: 'elevated',
  padding: 'medium',
  pressable: false,
  onPress: null,
  onLongPress: null,
  style: null,
  contentStyle: null,
  backgroundColor: null,
  borderColor: null,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  // Variant styles
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  elevatedCard: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.gray300,
  },
  flatCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  // Padding styles
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: SPACING.sm,
  },
  paddingMedium: {
    padding: SPACING.lg,
  },
  paddingLarge: {
    padding: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  touchable: {
    width: '100%',
  },
  pressable: {
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
});

export default Card;