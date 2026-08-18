// ============================================================================
// Spacer Component - Flexible Spacing
// ============================================================================

// parking-management-system/mobile/src/components/common/Layout/Spacer.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const Spacer = ({
  size = 8,
  horizontal = false,
  flex = false,
  style,
  ...props
}) => {
  const spacerStyles = [
    horizontal ? styles.horizontal : styles.vertical,
    flex && styles.flex,
    !flex && horizontal && { width: size },
    !flex && !horizontal && { height: size },
    style,
  ];

  return <View style={spacerStyles} {...props} />;
};

Spacer.propTypes = {
  size: PropTypes.number,
  horizontal: PropTypes.bool,
  flex: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Spacer.defaultProps = {
  size: 8,
  horizontal: false,
  flex: false,
  style: null,
};

const styles = StyleSheet.create({
  vertical: {},
  horizontal: {},
  flex: {
    flex: 1,
  },
});

export default Spacer;