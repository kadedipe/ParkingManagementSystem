// ============================================================================
// Avatar Component - User Avatar
// ============================================================================

// parking-management-system/mobile/src/components/common/Display/Avatar.js

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

const Avatar = ({
  source,
  name,
  size = 'medium',
  variant = 'circle',
  backgroundColor,
  borderColor,
  borderWidth = 2,
  showStatus = false,
  statusColor = COLORS.success,
  style,
  ...props
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      case 'xlarge':
        return styles.xlarge;
      case 'medium':
      default:
        return styles.medium;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'square':
        return styles.square;
      case 'rounded':
        return styles.rounded;
      case 'circle':
      default:
        return styles.circle;
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarStyles = [
    styles.container,
    sizeStyles,
    variantStyles,
    backgroundColor && { backgroundColor },
    borderColor && { borderColor, borderWidth },
    style,
  ];

  const textStyles = [
    styles.text,
    size === 'small'
      ? styles.smallText
      : size === 'large'
      ? styles.largeText
      : size === 'xlarge'
      ? styles.xlargeText
      : styles.mediumText,
  ];

  return (
    <View style={avatarStyles} {...props}>
      {source ? (
        <Image source={source} style={[styles.image, variantStyles]} />
      ) : (
        <Text style={textStyles}>{getInitials()}</Text>
      )}
      {showStatus && (
        <View style={[styles.status, { backgroundColor: statusColor }]} />
      )}
    </View>
  );
};

Avatar.propTypes = {
  source: PropTypes.oneOfType([
    PropTypes.shape({ uri: PropTypes.string }),
    PropTypes.number,
  ]),
  name: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['circle', 'square', 'rounded']),
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
  showStatus: PropTypes.bool,
  statusColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Avatar.defaultProps = {
  source: null,
  name: '',
  size: 'medium',
  variant: 'circle',
  backgroundColor: COLORS.primary,
  borderColor: null,
  borderWidth: 2,
  showStatus: false,
  statusColor: COLORS.success,
  style: null,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  circle: {
    borderRadius: 999,
  },
  square: {
    borderRadius: 0,
  },
  rounded: {
    borderRadius: 8,
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 48,
    height: 48,
  },
  large: {
    width: 64,
    height: 64,
  },
  xlarge: {
    width: 96,
    height: 96,
  },
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  largeText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
  },
  xlargeText: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default Avatar;