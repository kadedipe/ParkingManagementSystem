// ============================================================================
// PasswordInput Component - Password Input with Toggle Visibility
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/PasswordInput.js

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Input from './Input';
import { COLORS } from '../../../constants/theme';

/**
 * PasswordInput Component - Input with password visibility toggle
 */
const PasswordInput = ({
  value,
  onChangeText,
  label = 'Password',
  placeholder = 'Enter password',
  error,
  helper,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'outlined',
  style,
  inputStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const renderRightIcon = () => (
    <TouchableOpacity
      style={styles.eyeButton}
      onPress={togglePasswordVisibility}
      activeOpacity={0.7}
    >
      <Feather
        name={showPassword ? 'eye-off' : 'eye'}
        size={20}
        color={isFocused ? COLORS.primary : COLORS.gray500}
      />
    </TouchableOpacity>
  );

  // Password strength indicator (optional)
  const getPasswordStrength = (password) => {
    if (!password) return null;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(value);

  return (
    <View style={[styles.container, style]}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        error={error}
        helper={helper}
        disabled={disabled}
        required={required}
        size={size}
        variant={variant}
        rightIcon={renderRightIcon()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputStyle={[styles.input, inputStyle]}
        {...props}
      />
      {value && value.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            {[1, 2, 3, 4].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthSegment,
                  {
                    backgroundColor:
                      strength && strength >= level
                        ? strength <= 1
                          ? COLORS.danger
                          : strength === 2
                          ? COLORS.warning
                          : COLORS.success
                        : COLORS.gray300,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.strengthLabel}>
            {strength && (
              <Text style={styles.strengthText}>
                {strength <= 1
                  ? 'Weak'
                  : strength === 2
                  ? 'Fair'
                  : strength === 3
                  ? 'Good'
                  : 'Strong'}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

PasswordInput.propTypes = {
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
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
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

PasswordInput.defaultProps = {
  value: '',
  label: 'Password',
  placeholder: 'Enter password',
  error: '',
  helper: '',
  disabled: false,
  required: false,
  size: 'medium',
  variant: 'outlined',
  style: null,
  inputStyle: null,
  onFocus: null,
  onBlur: null,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    paddingRight: 40,
  },
  eyeButton: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  strengthLabel: {
    marginTop: 4,
  },
  strengthText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
});

export default PasswordInput;