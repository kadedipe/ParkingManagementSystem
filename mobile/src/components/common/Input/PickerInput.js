// ============================================================================
// PickerInput Component - Input with Picker
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/PickerInput.js

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Input from './Input';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * PickerInput Component - Input with dropdown picker
 */
const PickerInput = ({
  value,
  label,
  placeholder = 'Select an option...',
  options = [],
  onSelect,
  error,
  helper,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'outlined',
  style,
  inputStyle,
  pickerStyle,
  optionStyle,
  ...props
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const handleSelect = (option) => {
    setSelectedLabel(option.label);
    if (onSelect) onSelect(option.value);
    setModalVisible(false);
  };

  const openPicker = () => {
    if (disabled) return;
    setModalVisible(true);
  };

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.option,
        optionStyle,
        value === item.value && styles.selectedOption,
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.optionText,
          value === item.value && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {value === item.value && (
        <Feather name="check" size={20} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  // Find selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={openPicker}
        disabled={disabled}
        style={[styles.pickerContainer, pickerStyle]}
      >
        <Input
          label={label}
          placeholder={placeholder}
          value={displayValue}
          error={error}
          helper={helper}
          disabled={disabled}
          required={required}
          size={size}
          variant={variant}
          style={[styles.inputContainer, style]}
          inputStyle={[styles.input, inputStyle]}
          rightIcon={
            <Feather
              name="chevron-down"
              size={20}
              color={disabled ? COLORS.gray400 : COLORS.gray600}
            />
          }
          editable={false}
          pointerEvents="none"
          {...props}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value.toString()}
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContainer}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

PickerInput.propTypes = {
  value: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  error: PropTypes.string,
  helper: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outlined', 'filled', 'underlined']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  pickerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  optionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

PickerInput.defaultProps = {
  value: null,
  label: '',
  placeholder: 'Select an option...',
  error: '',
  helper: '',
  disabled: false,
  required: false,
  size: 'medium',
  variant: 'outlined',
  style: null,
  inputStyle: null,
  pickerStyle: null,
  optionStyle: null,
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: '100%',
  },
  inputContainer: {
    pointerEvents: 'none',
  },
  input: {
    paddingRight: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  optionsList: {
    flex: 1,
  },
  optionsContainer: {
    paddingVertical: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});

export default PickerInput;