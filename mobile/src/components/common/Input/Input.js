// ============================================================================
// Input Component - Reusable Input with Multiple Variants
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/Input.js

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

/**
 * Input Component - Primary reusable input with multiple variants
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {function} props.onChangeText - Text change handler
 * @param {string} props.variant - Input variant (default, outlined, filled, underlined)
 * @param {string} props.size - Input size (small, medium, large)
 * @param {string} props.error - Error message
 * @param {string} props.helper - Helper text
 * @param {boolean} props.secureTextEntry - Password input
 * @param {boolean} props.disabled - Disable input
 * @param {boolean} props.required - Required field
 * @param {string} props.leftIcon - Left icon component
 * @param {string} props.rightIcon - Right icon component
 * @param {string} props.keyboardType - Keyboard type
 * @param {string} props.autoCapitalize - Auto capitalize
 * @param {string} props.returnKeyType - Return key type
 * @param {function} props.onFocus - Focus handler
 * @param {function} props.onBlur - Blur handler
 * @param {Object} props.style - Additional styles
 * @param {Object} props.inputStyle - Additional input styles
 * @param {string} props.testID - Test ID for testing
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'outlined',
  size = 'medium',
  error,
  helper,
  secureTextEntry = false,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  returnKeyType = 'done',
  onFocus,
  onBlur,
  style,
  inputStyle,
  testID,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const [height, setHeight] = useState(null);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = (e) => {
    setIsFocused(true);
    animateLabel(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!value) {
      animateLabel(false);
    }
    if (onBlur) onBlur(e);
  };

  const animateLabel = (focused) => {
    Animated.timing(animatedLabel, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return styles.filledInput;
      case 'underlined':
        return styles.underlinedInput;
      case 'default':
        return styles.defaultInput;
      case 'outlined':
      default:
        return styles.outlinedInput;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.smallInput;
      case 'large':
        return styles.largeInput;
      case 'medium':
      default:
        return styles.mediumInput;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      case 'medium':
      default:
        return styles.mediumText;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textSize = getTextSize();

  const isError = !!error;
  const isFilled = variant === 'filled';

  const inputContainerStyles = [
    styles.inputContainer,
    variantStyles,
    sizeStyles,
    isFocused && styles.focused,
    isError && styles.error,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = {
    position: 'absolute',
    left: SPACING.md,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [size === 'small' ? 10 : size === 'large' ? 18 : 14, -8],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [
        size === 'small' ? 14 : size === 'large' ? 18 : 16,
        size === 'small' ? 10 : size === 'large' ? 12 : 11,
      ],
    }),
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.gray600, isError ? COLORS.danger : COLORS.primary],
    }),
    backgroundColor: isFilled ? COLORS.gray100 : '#FFFFFF',
    paddingHorizontal: isFilled ? 0 : 4,
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Animated.Text>
      )}
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          testID={testID || 'input'}
          style={[
            styles.input,
            textSize,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholder={isFocused || value ? '' : placeholder}
          placeholderTextColor={COLORS.gray500}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          multiline={props.multiline || false}
          numberOfLines={props.numberOfLines || 1}
          onContentSizeChange={(e) => {
            if (props.multiline) {
              setHeight(e.nativeEvent.contentSize.height);
            }
          }}
          style={[
            styles.input,
            textSize,
            props.multiline && styles.multilineInput,
            props.multiline && height && { height: Math.max(height, 40) },
            inputStyle,
          ]}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIconText}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {(helper || error) && (
        <Text style={[styles.helperText, isError && styles.errorText]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled', 'underlined']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  error: PropTypes.string,
  helper: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.string,
  returnKeyType: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
};

Input.defaultProps = {
  label: '',
  placeholder: '',
  value: '',
  variant: 'outlined',
  size: 'medium',
  error: '',
  helper: '',
  secureTextEntry: false,
  disabled: false,
  required: false,
  leftIcon: null,
  rightIcon: null,
  keyboardType: 'default',
  autoCapitalize: 'sentences',
  returnKeyType: 'done',
  onFocus: null,
  onBlur: null,
  style: null,
  inputStyle: null,
  testID: null,
  multiline: false,
  numberOfLines: 1,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    position: 'absolute',
    zIndex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray600,
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
      },
      android: {
        backgroundColor: 'transparent',
      },
    }),
  },
  required: {
    color: COLORS.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  // Variant styles
  defaultInput: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.gray300,
  },
  outlinedInput: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.gray300,
    borderWidth: 1,
  },
  filledInput: {
    backgroundColor: COLORS.gray100,
    borderColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray300,
  },
  underlinedInput: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray300,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  // Size styles
  smallInput: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minHeight: 36,
  },
  mediumInput: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  largeInput: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 56,
  },
  // Text size styles
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  largeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    paddingVertical: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingVertical: SPACING.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
  eyeIcon: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  eyeIconText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  focused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.6,
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

export default Input;