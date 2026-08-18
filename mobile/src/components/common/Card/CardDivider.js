// ============================================================================
// CardDivider Component - Divider Line in Card
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/CardDivider.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING } from '../../../constants/theme';

/**
 * CardDivider Component - Separator line within a card
 */
const CardDivider = ({
  style,
  color = COLORS.gray200,
  thickness = 1,
  marginVertical = SPACING.sm,
  ...props
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical,
        },
        style,
      ]}
      {...props}
    />
  );
};

CardDivider.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  color: PropTypes.string,
  thickness: PropTypes.number,
  marginVertical: PropTypes.number,
};

CardDivider.defaultProps = {
  style: null,
  color: COLORS.gray200,
  thickness: 1,
  marginVertical: SPACING.sm,
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});

export default CardDivider;