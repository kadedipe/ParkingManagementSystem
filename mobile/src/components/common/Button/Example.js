// ============================================================================
// Button Usage Examples - How to use Button Components
// ============================================================================

// parking-management-system/mobile/src/components/common/Button/Example.js

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Button, IconButton, SocialButton, ToggleButton, ButtonGroup } from './index';

const ButtonExample = () => {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  const handleToggle = (active) => {
    console.log('Toggle state:', active);
  };

  const handleGroupSelect = (index) => {
    console.log('Selected option:', index);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Primary Button</Text>
      <View style={styles.row}>
        <Button
          title="Primary Button"
          onPress={handlePress}
          variant="primary"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Secondary Button</Text>
      <View style={styles.row}>
        <Button
          title="Secondary Button"
          onPress={handlePress}
          variant="secondary"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Outline Button</Text>
      <View style={styles.row}>
        <Button
          title="Outline Button"
          onPress={handlePress}
          variant="outline"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Danger Button</Text>
      <View style={styles.row}>
        <Button
          title="Danger Button"
          onPress={handlePress}
          variant="danger"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Success Button</Text>
      <View style={styles.row}>
        <Button
          title="Success Button"
          onPress={handlePress}
          variant="success"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Loading Button</Text>
      <View style={styles.row}>
        <Button
          title="Loading"
          onPress={handlePress}
          loading={true}
          variant="primary"
        />
      </View>

      <Text style={styles.sectionTitle}>Disabled Button</Text>
      <View style={styles.row}>
        <Button
          title="Disabled Button"
          onPress={handlePress}
          disabled={true}
          variant="primary"
        />
      </View>

      <Text style={styles.sectionTitle}>Button with Icon</Text>
      <View style={styles.row}>
        <Button
          title="With Icon"
          onPress={handlePress}
          iconLeft={<Feather name="check" size={20} color="#FFFFFF" />}
          variant="success"
        />
      </View>

      <Text style={styles.sectionTitle}>Icon Button</Text>
      <View style={styles.row}>
        <IconButton
          icon={<Feather name="search" size={24} color="#FFFFFF" />}
          onPress={handlePress}
          variant="primary"
          size="medium"
        />
        <IconButton
          icon={<Feather name="heart" size={24} color="#FFFFFF" />}
          onPress={handlePress}
          variant="danger"
          size="medium"
        />
        <IconButton
          icon={<Feather name="check" size={24} color="#FFFFFF" />}
          onPress={handlePress}
          variant="success"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Social Buttons</Text>
      <View style={styles.row}>
        <SocialButton
          provider="google"
          onPress={handlePress}
          icon={<Feather name="mail" size={20} color="#DB4437" />}
        />
        <SocialButton
          provider="apple"
          onPress={handlePress}
          icon={<Feather name="apple" size={20} color="#FFFFFF" />}
        />
      </View>

      <Text style={styles.sectionTitle}>Toggle Button</Text>
      <View style={styles.row}>
        <ToggleButton
          title="Toggle Me"
          onToggle={handleToggle}
          variant="primary"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Button Group</Text>
      <View style={styles.row}>
        <ButtonGroup
          options={[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' },
          ]}
          onSelect={handleGroupSelect}
          variant="primary"
          size="medium"
        />
      </View>

      <Text style={styles.sectionTitle}>Size Variants</Text>
      <View style={styles.row}>
        <Button
          title="Small"
          onPress={handlePress}
          size="small"
          variant="primary"
        />
        <Button
          title="Medium"
          onPress={handlePress}
          size="medium"
          variant="primary"
        />
        <Button
          title="Large"
          onPress={handlePress}
          size="large"
          variant="primary"
        />
      </View>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
});

export default ButtonExample;