// ============================================================================
// CardFooter Component - Footer Section of Card
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/CardFooter.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * CardFooter Component - Footer section of a card
 */
const CardFooter = ({
  children,
  text,
  style,
  textStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
      {children}
    </View>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node,
  text: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

CardFooter.defaultProps = {
  children: null,
  text: '',
  style: null,
  textStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

export default CardFooter;