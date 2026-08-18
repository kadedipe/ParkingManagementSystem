// ============================================================================
// SearchInput Component - Search Input with Clear Button
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/SearchInput.js

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

/**
 * SearchInput Component - Input with search functionality and clear button
 */
const SearchInput = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSearch,
  onClear,
  variant = 'default',
  size = 'medium',
  disabled = false,
  style,
  inputStyle,
  autoFocus = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState(value || '');
  const inputRef = useRef(null);

  const handleChangeText = (text) => {
    setSearchValue(text);
    if (onChangeText) onChangeText(text);
  };

  const handleClear = () => {
    setSearchValue('');
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    if (onSearch) onSearch(searchValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      case 'underlined':
        return styles.underlined;
      case 'default':
      default:
        return styles.default;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      case 'medium':
      default:
        return styles.medium;
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, variantStyles, sizeStyles, style]}>
      <View style={styles.iconContainer}>
        <Feather name="search" size={20} color={COLORS.gray500} />
      </View>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          inputStyle,
          isFocused && styles.focused,
          disabled && styles.disabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray500}
        value={searchValue}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
        returnKeyType="search"
        autoFocus={autoFocus}
        {...props}
      />
      {searchValue.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={COLORS.gray500} />
        </TouchableOpacity>
      )}
    </View>
  );
};

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled', 'underlined']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  autoFocus: PropTypes.bool,
};

SearchInput.defaultProps = {
  placeholder: 'Search...',
  value: '',
  onChangeText: null,
  onSearch: null,
  onClear: null,
  variant: 'default',
  size: 'medium',
  disabled: false,
  style: null,
  inputStyle: null,
  autoFocus: false,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
  },
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.gray300,
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.gray300,
    borderWidth: 1,
  },
  filled: {
    backgroundColor: COLORS.gray100,
    borderColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray300,
  },
  underlined: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray300,
    borderRadius: 0,
  },
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minHeight: 36,
  },
  medium: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
    padding: 0,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default SearchInput;