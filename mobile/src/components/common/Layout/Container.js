// ============================================================================
// Container Component - Main Layout Container
// ============================================================================

// parking-management-system/mobile/src/components/common/Layout/Container.js

import React from 'react';
import { View, SafeAreaView, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS } from '../../../constants/theme';

const Container = ({
  children,
  safe = true,
  padding = true,
  centered = false,
  scrollable = false,
  backgroundColor = COLORS.background,
  style,
  ...props
}) => {
  const ContainerComponent = safe ? SafeAreaView : View;
  
  const containerStyles = [
    styles.container,
    padding && styles.padding,
    centered && styles.centered,
    { backgroundColor },
    style,
  ];

  return (
    <ContainerComponent style={containerStyles} {...props}>
      {children}
    </ContainerComponent>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  safe: PropTypes.bool,
  padding: PropTypes.bool,
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  backgroundColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Container.defaultProps = {
  safe: true,
  padding: true,
  centered: false,
  scrollable: false,
  backgroundColor: COLORS.background,
  style: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Container;