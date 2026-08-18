// ============================================================================
// TextArea Component - Multi-line Text Input
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/TextArea.js

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Input from './Input';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * TextArea Component - Multi-line text input with character counter
 */
const TextArea = ({
  value,
  onChangeText,
  label = 'Description',
  placeholder = 'Enter text...',
  error,
  helper,
  disabled = false,
  required = false,
  maxLength = 500,
  rows = 4,
  size = 'medium',
  variant = 'outlined',
  style,
  inputStyle,
  showCounter = true,
  ...props
}) => {
  const [characterCount, setCharacterCount] = useState(value ? value.length : 0);

  const handleChangeText = (text) => {
    if (maxLength && text.length > maxLength) {
      text = text.substring(0, maxLength);
    }
    setCharacterCount(text.length);
    if (onChangeText) onChangeText(text);
  };

  const isNearLimit = characterCount / maxLength > 0.8;

  return (
    <View style={[styles.container, style]}>
      <Input
        value={value}
        onChangeText={handleChangeText}
        label={label}
        placeholder={placeholder}
        error={error}
        helper={helper}
        disabled={disabled}
        required={required}
        size={size}
        variant={variant}
        multiline={true}
        numberOfLines={rows}
        style={[styles.inputContainer, style]}
        inputStyle={[
          styles.input,
          inputStyle,
          { minHeight: rows * 24 },
        ]}
        {...props}
      />
      {showCounter && maxLength && (
        <View style={styles.counterContainer}>
          <Text
            style={[
              styles.counterText,
              isNearLimit && styles.counterWarning,
              characterCount >= maxLength && styles.counterLimit,
            ]}
          >
            {characterCount} / {maxLength}
          </Text>
        </View>
      )}
    </View>
  );
};

TextArea.propTypes = {
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helper: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outlined', 'filled', 'underlined']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  showCounter: PropTypes.bool,
};

TextArea.defaultProps = {
  value: '',
  label: 'Description',
  placeholder: 'Enter text...',
  error: '',
  helper: '',
  disabled: false,
  required: false,
  maxLength: 500,
  rows: 4,
  size: 'medium',
  variant: 'outlined',
  style: null,
  inputStyle: null,
  showCounter: true,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    minHeight: 100,
  },
  input: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  counterText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  counterWarning: {
    color: COLORS.warning,
  },
  counterLimit: {
    color: COLORS.danger,
  },
});

export default TextArea;