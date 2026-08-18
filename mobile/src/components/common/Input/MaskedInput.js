// ============================================================================
// MaskedInput Component - Input with Mask
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/MaskedInput.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';

/**
 * MaskedInput Component - Input with masking support
 */
const MaskedInput = ({
  value,
  onChangeText,
  mask,
  maskChar = '_',
  formatChars = {
    '9': '[0-9]',
    'A': '[A-Z]',
    'a': '[a-z]',
    '*': '[A-Za-z0-9]',
  },
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value || '');

  const applyMask = (text) => {
    if (!mask) return text;

    let masked = '';
    let textIndex = 0;
    const cleanText = text.replace(/[^a-zA-Z0-9]/g, '');

    for (let i = 0; i < mask.length; i++) {
      if (textIndex >= cleanText.length) break;
      const char = mask[i];
      const pattern = formatChars[char];

      if (pattern) {
        const testChar = cleanText[textIndex];
        const regex = new RegExp(pattern);
        if (regex.test(testChar)) {
          masked += testChar;
          textIndex++;
        }
      } else {
        masked += char;
      }
    }

    return masked;
  };

  const handleChangeText = (text) => {
    const masked = applyMask(text);
    setDisplayValue(masked);
    if (onChangeText) onChangeText(masked);
  };

  return (
    <Input
      value={displayValue}
      onChangeText={handleChangeText}
      {...props}
    />
  );
};

MaskedInput.propTypes = {
  value: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  mask: PropTypes.string,
  maskChar: PropTypes.string,
  formatChars: PropTypes.object,
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

MaskedInput.defaultProps = {
  value: '',
  mask: '',
  maskChar: '_',
  formatChars: {
    '9': '[0-9]',
    'A': '[A-Z]',
    'a': '[a-z]',
    '*': '[A-Za-z0-9]',
  },
  label: '',
  placeholder: '',
  error: '',
  helper: '',
  disabled: false,
  required: false,
  size: 'medium',
  variant: 'outlined',
  style: null,
  inputStyle: null,
};

export default MaskedInput;