// ============================================================================
// PhoneInput Component - Phone Number Input with Country Code
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/PhoneInput.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Input from './Input';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

/**
 * PhoneInput Component - Input with country code selector
 */
const PhoneInput = ({
  value,
  onChangeText,
  countryCode = '+1',
  onCountryCodeChange,
  label = 'Phone Number',
  placeholder = 'Enter phone number',
  error,
  helper,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'outlined',
  style,
  inputStyle,
  ...props
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleCountryCodePress = () => {
    if (disabled) return;
    setShowCountryPicker(!showCountryPicker);
    if (onCountryCodeChange) {
      // You would typically show a modal or action sheet here
      // For now, we'll just toggle
    }
  };

  const formatPhoneNumber = (text) => {
    // Simple phone number formatting
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]]
        .filter((group) => group.length > 0)
        .join('-');
    }
    return text;
  };

  const handleChangeText = (text) => {
    // Only allow numbers and formatting
    const numericOnly = text.replace(/[^0-9-]/g, '');
    const formatted = formatPhoneNumber(numericOnly);
    if (onChangeText) onChangeText(formatted);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <TouchableOpacity
          style={[
            styles.countryCodeButton,
            disabled && styles.disabled,
          ]}
          onPress={handleCountryCodePress}
          activeOpacity={0.7}
        >
          <Text style={styles.countryCodeText}>{countryCode}</Text>
          <Feather
            name="chevron-down"
            size={16}
            color={disabled ? COLORS.gray400 : COLORS.gray600}
          />
        </TouchableOpacity>
        <View style={styles.divider} />
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
          keyboardType="phone-pad"
          style={[styles.inputContainer, style]}
          inputStyle={[styles.input, inputStyle]}
          {...props}
        />
      </View>
    </View>
  );
};

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  countryCode: PropTypes.string,
  onCountryCodeChange: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helper: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outlined', 'filled', 'underlined']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

PhoneInput.defaultProps = {
  value: '',
  countryCode: '+1',
  onCountryCodeChange: null,
  label: 'Phone Number',
  placeholder: 'Enter phone number',
  error: '',
  helper: '',
  disabled: false,
  required: false,
  size: 'medium',
  variant: 'outlined',
  style: null,
  inputStyle: null,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 44,
  },
  countryCodeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.gray300,
    marginHorizontal: SPACING.xs,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    paddingLeft: 0,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default PhoneInput;