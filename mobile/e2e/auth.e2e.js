// ============================================================================
// Authentication E2E Tests - Auth Flow End-to-End Tests
// ============================================================================

// parking-management-system/mobile/e2e/auth.e2e.js

import { device, element, by } from 'detox';
import { 
  waitForElement, 
  tapElement, 
  typeText, 
  loginUser,
  logoutUser,
  getRandomEmail,
  getRandomPassword,
} from './utils';

describe('Authentication Flow', () => {
  const testEmail = getRandomEmail();
  const testPassword = getRandomPassword();

  beforeAll(async () => {
    await device.launchApp();
  });

  describe('Login Flow', () => {
    test('should show login screen on launch', async () => {
      await waitForElement('loginScreen');
    });

    test('should show validation errors for empty fields', async () => {
      await tapElement('loginButton');
      await waitForElement('emailError');
      await waitForElement('passwordError');
    });

    test('should show error for invalid credentials', async () => {
      await typeText('emailInput', 'invalid@example.com');
      await typeText('passwordInput', 'wrongpassword');
      await tapElement('loginButton');
      await waitForElement('loginError');
    });

    test('should login with valid credentials', async () => {
      await typeText('emailInput', 'test@example.com');
      await typeText('passwordInput', 'Test@123456');
      await tapElement('loginButton');
      await waitForElement('homeScreen', 15000);
    });
  });

  describe('Registration Flow', () => {
    test('should navigate to registration screen', async () => {
      await tapElement('signUpLink');
      await waitForElement('registerScreen');
    });

    test('should show validation errors on registration form', async () => {
      await tapElement('registerButton');
      await waitForElement('nameError');
      await waitForElement('emailError');
      await waitForElement('passwordError');
    });

    test('should show error for invalid email', async () => {
      await typeText('nameInput', 'Test User');
      await typeText('emailInput', 'invalid-email');
      await typeText('passwordInput', testPassword);
      await typeText('confirmPasswordInput', testPassword);
      await tapElement('registerButton');
      await waitForElement('emailError');
    });

    test('should show error for password mismatch', async () => {
      await typeText('emailInput', testEmail);
      await typeText('passwordInput', testPassword);
      await typeText('confirmPasswordInput', 'DifferentPassword123');
      await tapElement('registerButton');
      await waitForElement('passwordMismatchError');
    });

    test('should register new user successfully', async () => {
      await typeText('nameInput', 'Test User');
      await typeText('emailInput', testEmail);
      await typeText('passwordInput', testPassword);
      await typeText('confirmPasswordInput', testPassword);
      await tapElement('termsCheckbox');
      await tapElement('registerButton');
      await waitForElement('homeScreen', 15000);
    });
  });

  describe('Logout Flow', () => {
    test('should navigate to profile', async () => {
      await tapElement('profileTab');
      await waitForElement('profileScreen');
    });

    test('should logout successfully', async () => {
      await tapElement('settingsButton');
      await tapElement('logoutButton');
      await tapElement('confirmLogoutButton');
      await waitForElement('loginScreen');
    });
  });
});