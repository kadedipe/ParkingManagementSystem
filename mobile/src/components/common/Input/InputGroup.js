// ============================================================================
// InputGroup Component - Group of Related Inputs
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/InputGroup.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * InputGroup Component - Groups related inputs with a label
 */
const InputGroup = ({
  label,
  children,
  required,
  error,
  helper,
  style,
  labelStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={styles.childrenContainer}>{children}</View>
      {(helper || error) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

InputGroup.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  helper: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

InputGroup.defaultProps = {
  label: '',
  required: false,
  error: '',
  helper: '',
  style: null,
  labelStyle: null,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.danger,
  },
  childrenContainer: {
    // Contains child inputs
  },
  helperText: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  errorText: {
    color: COLORS.danger,
  },
});

export default InputGroup;