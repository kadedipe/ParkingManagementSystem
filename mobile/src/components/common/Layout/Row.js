// ============================================================================
// Row Component - Flex Row Layout
// ============================================================================

// parking-management-system/mobile/src/components/common/Layout/Row.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const Row = ({
  children,
  spacing = 8,
  wrap = false,
  align = 'center',
  justify = 'flex-start',
  style,
  ...props
}) => {
  const childCount = React.Children.count(children);
  
  const rowStyles = [
    styles.row,
    { justifyContent: justify },
    { alignItems: align },
    wrap && styles.wrap,
    style,
  ];

  return (
    <View style={rowStyles} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        return (
          <View
            style={[
              styles.child,
              index < childCount - 1 && { marginRight: spacing },
            ]}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};

Row.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  wrap: PropTypes.bool,
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

Row.defaultProps = {
  spacing: 8,
  wrap: false,
  align: 'center',
  justify: 'flex-start',
  style: null,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  child: {
    flexShrink: 1,
  },
});

export default Row;