// ============================================================================
// SocialButton Component - Social Login Buttons
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/SocialButton.js

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

/**
 * SocialButton Component - Button for social login providers
 */
const SocialButton = ({
  provider,
  onPress,
  title,
  icon,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const getProviderStyles = () => {
    switch (provider) {
      case 'google':
        return styles.google;
      case 'apple':
        return styles.apple;
      case 'facebook':
        return styles.facebook;
      case 'twitter':
        return styles.twitter;
      case 'github':
        return styles.github;
      default:
        return styles.default;
    }
  };

  const getProviderTextColor = () => {
    switch (provider) {
      case 'google':
        return styles.googleText;
      case 'apple':
        return styles.appleText;
      case 'facebook':
        return styles.facebookText;
      case 'twitter':
        return styles.twitterText;
      case 'github':
        return styles.githubText;
      default:
        return styles.defaultText;
    }
  };

  const providerStyles = getProviderStyles();
  const providerTextStyles = getProviderTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        providerStyles,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, providerTextStyles, textStyle]}>
          {title || `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

SocialButton.propTypes = {
  provider: PropTypes.oneOf([
    'google',
    'apple',
    'facebook',
    'twitter',
    'github',
    'default',
  ]).isRequired,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

SocialButton.defaultProps = {
  title: '',
  icon: null,
  disabled: false,
  style: null,
  textStyle: null,
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  google: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DB4437',
  },
  googleText: {
    color: '#DB4437',
  },
  apple: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleText: {
    color: '#FFFFFF',
  },
  facebook: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  facebookText: {
    color: '#FFFFFF',
  },
  twitter: {
    backgroundColor: '#1DA1F2',
    borderColor: '#1DA1F2',
  },
  twitterText: {
    color: '#FFFFFF',
  },
  github: {
    backgroundColor: '#24292E',
    borderColor: '#24292E',
  },
  githubText: {
    color: '#FFFFFF',
  },
  default: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  defaultText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default SocialButton;