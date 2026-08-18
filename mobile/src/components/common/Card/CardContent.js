// ============================================================================
// CardContent Component - Main Content Area of Card
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/CardContent.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { SPACING } from '../../../constants/theme';

/**
 * CardContent Component - Main content area of a card
 */
const CardContent = ({ children, style, ...props }) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

CardContent.defaultProps = {
  style: null,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
});

export default CardContent;