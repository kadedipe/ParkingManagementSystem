// ============================================================================
// Integration Tests - Auth Flow Integration Tests
// ============================================================================

// parking-management-system/mobile/__tests__/integration/auth.flow.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '../../../src/store';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import LoginScreen from '../../../src/screens/Auth/LoginScreen';
import authService from '../../../src/api/services/auth.service';

jest.mock('../../../src/api/services/auth.service');

describe('Authentication Flow', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <NavigationContainer>
          <AuthProvider>
            {component}
          </AuthProvider>
        </NavigationContainer>
      </Provider>
    );
  };

  test('should handle successful login', async () => {
    const mockNavigate = jest.fn();
    const mockLogin = jest.fn().mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
    });
    
    (authService.login as jest.Mock).mockImplementation(mockLogin);

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(
      <LoginScreen navigation={{ navigate: mockNavigate }} route={{ params: {} }} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('should show error message on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue({
      message: 'Invalid credentials',
    });
    
    (authService.login as jest.Mock).mockImplementation(mockLogin);

    const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
      <LoginScreen navigation={{ navigate: jest.fn() }} route={{ params: {} }} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    const errorMessage = await findByText('Invalid credentials');
    expect(errorMessage).toBeTruthy();
  });

  test('should validate email format', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
      <LoginScreen navigation={{ navigate: jest.fn() }} route={{ params: {} }} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(loginButton);

    const errorMessage = await findByText('Please enter a valid email address');
    expect(errorMessage).toBeTruthy();
  });

  test('should require password', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
      <LoginScreen navigation={{ navigate: jest.fn() }} route={{ params: {} }} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(loginButton);

    const errorMessage = await findByText('Please fill in all fields');
    expect(errorMessage).toBeTruthy();
  });
});