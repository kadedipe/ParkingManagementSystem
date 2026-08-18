// ============================================================================
// CardHeader Component - Card Header with Title and Actions
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/CardHeader.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * CardHeader Component - Header section of a card
 */
const CardHeader = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightContent,
  style,
  titleStyle,
  subtitleStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.leftContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightContainer}>
        {rightContent}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </View>
  );
};

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  rightContent: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  titleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  subtitleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

CardHeader.defaultProps = {
  title: '',
  subtitle: '',
  leftIcon: null,
  rightIcon: null,
  rightContent: null,
  style: null,
  titleStyle: null,
  subtitleStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.gray600,
    marginTop: SPACING.xs / 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
});

export default CardHeader;