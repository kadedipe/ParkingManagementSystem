// ============================================================================
// Component Tests - Button Component Tests
// ============================================================================

// parking-management-system/mobile/__tests__/unit/components/Button.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../src/components/common/Button';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';

describe('Button Component', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  test('should render correctly with default props', () => {
    const { getByText } = renderWithTheme(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('should handle press events', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Press Me" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('should show loading state', () => {
    const { getByTestId } = renderWithTheme(
      <Button title="Loading Button" onPress={() => {}} loading={true} />
    );
    expect(getByTestId('button')).toBeTruthy();
  });

  test('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Disabled Button" onPress={onPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('should render with variant styles', () => {
    const variants = ['primary', 'secondary', 'outline', 'danger', 'success'];
    variants.forEach(variant => {
      const { getByText } = renderWithTheme(
        <Button title={`${variant} Button`} onPress={() => {}} variant={variant as any} />
      );
      expect(getByText(`${variant} Button`)).toBeTruthy();
    });
  });

  test('should render with different sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    sizes.forEach(size => {
      const { getByText } = renderWithTheme(
        <Button title={`${size} Button`} onPress={() => {}} size={size as any} />
      );
      expect(getByText(`${size} Button`)).toBeTruthy();
    });
  });
});