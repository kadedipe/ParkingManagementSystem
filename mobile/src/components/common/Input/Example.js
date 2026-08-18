// ============================================================================
// Input Usage Examples - How to use Input Components
// ============================================================================

// parking-management-system/mobile/src/components/common/Input/Example.js

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  Input,
  InputGroup,
  SearchInput,
  PasswordInput,
  PhoneInput,
  TextArea,
  PickerInput,
} from './index';

const InputExample = () => {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
    { label: 'Option 4', value: '4' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Basic Input</Text>
      <Input
        label="Username"
        placeholder="Enter username"
        value={text}
        onChangeText={setText}
        helper="Choose a unique username"
      />

      <Text style={styles.sectionTitle}>Outlined Input</Text>
      <Input
        label="Email"
        placeholder="Enter email"
        value={text}
        onChangeText={setText}
        variant="outlined"
        leftIcon={<Feather name="mail" size={20} color="#999" />}
      />

      <Text style={styles.sectionTitle}>Filled Input</Text>
      <Input
        label="Full Name"
        placeholder="Enter full name"
        value={text}
        onChangeText={setText}
        variant="filled"
      />

      <Text style={styles.sectionTitle}>Underlined Input</Text>
      <Input
        label="Address"
        placeholder="Enter address"
        value={text}
        onChangeText={setText}
        variant="underlined"
      />

      <Text style={styles.sectionTitle}>With Error</Text>
      <Input
        label="Email"
        placeholder="Enter email"
        value={text}
        onChangeText={setText}
        error="Invalid email address"
      />

      <Text style={styles.sectionTitle}>Disabled Input</Text>
      <Input
        label="Disabled"
        placeholder="This is disabled"
        value="Read only value"
        onChangeText={setText}
        disabled={true}
      />

      <Text style={styles.sectionTitle}>Required Input</Text>
      <Input
        label="Required Field"
        placeholder="This field is required"
        value={text}
        onChangeText={setText}
        required={true}
      />

      <Text style={styles.sectionTitle}>Password Input</Text>
      <PasswordInput
        value={password}
        onChangeText={setPassword}
        label="Password"
        placeholder="Enter your password"
      />

      <Text style={styles.sectionTitle}>Phone Input</Text>
      <PhoneInput
        value={phone}
        onChangeText={setPhone}
        countryCode="+1"
        label="Phone Number"
        placeholder="Enter phone number"
      />

      <Text style={styles.sectionTitle}>Search Input</Text>
      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search for parking..."
        onSearch={(text) => console.log('Searching:', text)}
      />

      <Text style={styles.sectionTitle}>Text Area</Text>
      <TextArea
        value={description}
        onChangeText={setDescription}
        label="Description"
        placeholder="Enter a description"
        maxLength={200}
        rows={4}
      />

      <Text style={styles.sectionTitle}>Picker Input</Text>
      <PickerInput
        value={selectedOption}
        options={options}
        onSelect={setSelectedOption}
        label="Select Option"
        placeholder="Choose an option"
      />

      <Text style={styles.sectionTitle}>Input Group</Text>
      <InputGroup label="Personal Information" required>
        <Input
          label="First Name"
          placeholder="Enter first name"
          value={text}
          onChangeText={setText}
        />
        <Input
          label="Last Name"
          placeholder="Enter last name"
          value={text}
          onChangeText={setText}
        />
      </InputGroup>

      <Text style={styles.sectionTitle}>Size Variants</Text>
      <Input
        label="Small"
        placeholder="Small input"
        value={text}
        onChangeText={setText}
        size="small"
      />
      <Input
        label="Medium"
        placeholder="Medium input"
        value={text}
        onChangeText={setText}
        size="medium"
      />
      <Input
        label="Large"
        placeholder="Large input"
        value={text}
        onChangeText={setText}
        size="large"
      />

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  spacer: {
    height: 40,
  },
});

export default InputExample;