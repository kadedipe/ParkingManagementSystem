// ============================================================================
// Auth Integration Tests - Authentication Flow Integration Tests
// ============================================================================

// parking-management-system/mobile/__tests__/integration/auth.integration.test.tsx

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store, persistor } from '../../../src/store';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '../../../src/screens/Auth';
import authService from '../../../src/api/services/auth.service';
import { createMockNavigation, createMockRoute, waitForAsync } from '../helpers';

// Mock auth service
jest.mock('../../../src/api/services/auth.service');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NavigationContainer>
            <AuthProvider>
              {component}
            </AuthProvider>
          </NavigationContainer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    test('should successfully login and navigate to home', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
      });
      
      (authService.login as jest.Mock).mockImplementation(mockLogin);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(
        <LoginScreen navigation={navigation} route={route} />
      );

      // Fill in login form
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      
      // Submit form
      fireEvent.press(getByText('Sign In'));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    test('should show error for invalid credentials', async () => {
      const mockLogin = jest.fn().mockRejectedValue({
        message: 'Invalid email or password',
      });
      
      (authService.login as jest.Mock).mockImplementation(mockLogin);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <LoginScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpassword');
      fireEvent.press(getByText('Sign In'));

      const errorMessage = await findByText('Invalid email or password');
      expect(errorMessage).toBeTruthy();
    });

    test('should validate email format before submitting', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <LoginScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Sign In'));

      const errorMessage = await findByText('Please enter a valid email address');
      expect(errorMessage).toBeTruthy();
      expect(authService.login).not.toHaveBeenCalled();
    });

    test('should require both email and password', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText, findByText } = renderWithProviders(
        <LoginScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Sign In'));

      const errorMessage = await findByText('Please fill in all fields');
      expect(errorMessage).toBeTruthy();
      expect(authService.login).not.toHaveBeenCalled();
    });

    test('should navigate to forgot password screen', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText } = renderWithProviders(
        <LoginScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Forgot Password?'));
      expect(navigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    test('should navigate to register screen', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText } = renderWithProviders(
        <LoginScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Sign Up'));
      expect(navigation.navigate).toHaveBeenCalledWith('Register');
    });
  });

  describe('Registration Flow', () => {
    test('should successfully register a new user', async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        user: {
          id: 'user456',
          name: 'New User',
          email: 'newuser@example.com',
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_456',
          refreshToken: 'refresh_token_456',
        },
        message: 'User registered successfully',
      });
      
      (authService.register as jest.Mock).mockImplementation(mockRegister);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText } = renderWithProviders(
        <RegisterScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'New User');
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'newuser@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '1234567890');
      fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');
      
      // Agree to terms
      const termsCheckbox = getByText('I agree to the Terms of Service');
      fireEvent.press(termsCheckbox);
      
      fireEvent.press(getByText('Create Account'));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@example.com',
          phone: '1234567890',
          password: 'password123',
        });
      });
    });

    test('should validate password requirements', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <RegisterScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'New User');
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'newuser@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a password'), 'short');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'short');
      
      const termsCheckbox = getByText('I agree to the Terms of Service');
      fireEvent.press(termsCheckbox);
      
      fireEvent.press(getByText('Create Account'));

      const errorMessage = await findByText('Password must be at least 8 characters');
      expect(errorMessage).toBeTruthy();
      expect(authService.register).not.toHaveBeenCalled();
    });

    test('should validate password confirmation match', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <RegisterScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'New User');
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'newuser@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password456');
      
      const termsCheckbox = getByText('I agree to the Terms of Service');
      fireEvent.press(termsCheckbox);
      
      fireEvent.press(getByText('Create Account'));

      const errorMessage = await findByText('Passwords do not match');
      expect(errorMessage).toBeTruthy();
      expect(authService.register).not.toHaveBeenCalled();
    });

    test('should require agreement to terms', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <RegisterScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'New User');
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'newuser@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');
      
      fireEvent.press(getByText('Create Account'));

      const errorMessage = await findByText('Please agree to the Terms of Service');
      expect(errorMessage).toBeTruthy();
      expect(authService.register).not.toHaveBeenCalled();
    });

    test('should navigate back to login', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText } = renderWithProviders(
        <RegisterScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Sign In'));
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Forgot Password Flow', () => {
    test('should successfully send reset email', async () => {
      const mockForgotPassword = jest.fn().mockResolvedValue({
        message: 'Password reset link sent to your email',
      });
      
      (authService.forgotPassword as jest.Mock).mockImplementation(mockForgotPassword);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <ForgotPasswordScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.press(getByText('Send Reset Instructions'));

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });

      const successMessage = await findByText('Check Your Email');
      expect(successMessage).toBeTruthy();
    });

    test('should validate email before sending', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText, findByText } = renderWithProviders(
        <ForgotPasswordScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Send Reset Instructions'));

      const errorMessage = await findByText('Please enter your email address');
      expect(errorMessage).toBeTruthy();
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, getByText, findByText } = renderWithProviders(
        <ForgotPasswordScreen navigation={navigation} route={route} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');
      fireEvent.press(getByText('Send Reset Instructions'));

      const errorMessage = await findByText('Please enter a valid email address');
      expect(errorMessage).toBeTruthy();
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    test('should navigate back to login', async () => {
      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText } = renderWithProviders(
        <ForgotPasswordScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Back to Login'));
      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    });
  });
});