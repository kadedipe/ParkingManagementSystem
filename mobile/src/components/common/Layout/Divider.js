// ============================================================================
// Divider Component - Separator Line
// ============================================================================

// parking-management-system/mobile/src/components/common/Layout/Divider.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING } from '../../../constants/theme';

const Divider = ({
  orientation = 'horizontal',
  thickness = 1,
  color = COLORS.gray200,
  margin = SPACING.sm,
  style,
  ...props
}) => {
  const dividerStyles = [
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
    {
      backgroundColor: color,
    },
    orientation === 'horizontal'
      ? { height: thickness, marginVertical: margin }
      : { width: thickness, marginHorizontal: margin },
    style,
  ];

  return <View style={dividerStyles} {...props} />;
};

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  thickness: PropTypes.number,
  color: PropTypes.string,
  margin: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Divider.defaultProps = {
  orientation: 'horizontal',
  thickness: 1,
  color: COLORS.gray200,
  margin: SPACING.sm,
  style: null,
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});

export default Divider;