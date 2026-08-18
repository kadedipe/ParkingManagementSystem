// ============================================================================
// FloatingActionButton Component - FAB with Extended Variants
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/FloatingActionButton.js

import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../constants/theme';

/**
 * FloatingActionButton Component - Floating action button with extended options
 */
const FloatingActionButton = ({
  icon,
  label,
  onPress,
  position = 'bottomRight',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  labelStyle,
  actions = [],
  onActionPress,
  ...props
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'topLeft':
        return styles.topLeft;
      case 'topRight':
        return styles.topRight;
      case 'bottomLeft':
        return styles.bottomLeft;
      case 'bottomRight':
      default:
        return styles.bottomRight;
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

  const handleActionPress = (action) => {
    if (onActionPress) {
      onActionPress(action);
    }
    toggleExpand();
  };

  const positionStyles = getPositionStyles();
  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const renderActions = () => {
    if (!expanded || actions.length === 0) return null;

    const actionStyle = {
      transform: [
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ],
    };

    return actions.map((action, index) => (
      <Animated.View
        key={action.id || index}
        style={[
          styles.actionItem,
          actionStyle,
          {
            transform: [
              ...actionStyle.transform,
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -(index + 1) * 60],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleActionPress(action)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIcon, { backgroundColor: action.color || COLORS.primary }]}>
            {action.icon}
          </View>
          {action.label && (
            <Text style={styles.actionLabel}>{action.label}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    ));
  };

  return (
    <View style={[styles.container, positionStyles]}>
      {renderActions()}
      <TouchableOpacity
        style={[
          styles.fab,
          sizeStyles,
          variantStyles,
          disabled && styles.disabled,
          style,
        ]}
        onPress={actions.length > 0 ? toggleExpand : onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        {label && !actions.length && (
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

FloatingActionButton.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  onPress: PropTypes.func,
  position: PropTypes.oneOf([
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
  ]),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      icon: PropTypes.node.isRequired,
      label: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  onActionPress: PropTypes.func,
};

FloatingActionButton.defaultProps = {
  icon: null,
  label: '',
  onPress: null,
  position: 'bottomRight',
  variant: 'primary',
  size: 'medium',
  disabled: false,
  style: null,
  labelStyle: null,
  actions: [],
  onActionPress: null,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
  },
  bottomRight: {
    bottom: SPACING.xl,
    right: SPACING.xl,
  },
  bottomLeft: {
    bottom: SPACING.xl,
    left: SPACING.xl,
  },
  topRight: {
    top: SPACING.xl,
    right: SPACING.xl,
  },
  topLeft: {
    top: SPACING.xl,
    left: SPACING.xl,
  },
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  small: {
    width: 44,
    height: 44,
  },
  medium: {
    width: 56,
    height: 56,
  },
  large: {
    width: 64,
    height: 64,
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
    backgroundColor: COLORS.gray300,
    opacity: 0.6,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: SPACING.xs,
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  actionItem: {
    position: 'absolute',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionLabel: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
    color: '#FFFFFF',
  },
});

export default FloatingActionButton;