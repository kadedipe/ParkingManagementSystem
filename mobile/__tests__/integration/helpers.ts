// ============================================================================
// Integration Test Helpers - Helper Functions for Integration Tests
// ============================================================================

// parking-management-system/mobile/__tests__/integration/helpers.ts

import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../../src/store';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { BookingProvider } from '../../../src/contexts/BookingContext';
import { NavigationContainer } from '@react-navigation/native';

/**
 * Render component with all providers for integration tests
 */
export const renderWithAllProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider>
            <BookingProvider>
              {component}
            </BookingProvider>
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

/**
 * Mock API response with delay for testing loading states
 */
export const mockApiWithDelay = <T,>(data: T, delay: number = 500) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Create mock for successful API response
 */
export const mockSuccessResponse = <T,>(data: T) => {
  return jest.fn().mockResolvedValue(data);
};

/**
 * Create mock for error API response
 */
export const mockErrorResponse = (error: any) => {
  return jest.fn().mockRejectedValue(error);
};

/**
 * Wait for loading state to complete
 */
export const waitForLoadingComplete = async () => {
  await waitForAsync();
};

/**
 * Simulate user typing in a text input
 */
export const typeInInput = (element: any, text: string) => {
  fireEvent.changeText(element, text);
  fireEvent(element, 'onChangeText', text);
};

/**
 * Simulate form submission
 */
export const submitForm = (submitButton: any) => {
  fireEvent.press(submitButton);
};

/**
 * Get all form errors
 */
export const getFormErrors = (container: any) => {
  return container.queryAllByTestId('form-error');
};

/**
 * Check if form has errors
 */
export const hasFormErrors = (container: any): boolean => {
  return getFormErrors(container).length > 0;
};