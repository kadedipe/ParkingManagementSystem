// ============================================================================
// Col Component - Flex Column Layout
// ============================================================================

// parking-management-system/mobile/src/components/common/Layout/Col.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const Col = ({
  children,
  flex = 1,
  align = 'stretch',
  justify = 'flex-start',
  style,
  ...props
}) => {
  const colStyles = [
    styles.col,
    { flex },
    { alignItems: align },
    { justifyContent: justify },
    style,
  ];

  return (
    <View style={colStyles} {...props}>
      {children}
    </View>
  );
};

Col.propTypes = {
  children: PropTypes.node.isRequired,
  flex: PropTypes.number,
  align: PropTypes.oneOf(['flex-start', 'center', 'flex-end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf([
    'flex-start',
    'center',
    'flex-end',
    'space-between',
    'space-around',
    'space-evenly',
  ]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Col.defaultProps = {
  flex: 1,
  align: 'stretch',
  justify: 'flex-start',
  style: null,
};

const styles = StyleSheet.create({
  col: {
    flexDirection: 'column',
  },
});

export default Col;