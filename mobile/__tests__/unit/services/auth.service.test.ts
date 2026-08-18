// ============================================================================
// Auth Service Tests - Authentication Service Unit Tests
// ============================================================================

// parking-management-system/mobile/__tests__/unit/services/auth.service.test.ts

import authService from '../../../src/api/services/auth.service';
import apiClient from '../../../src/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../src/api/client');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const loginResponse = {
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
      },
    };

    test('should successfully login with valid credentials', async () => {
      apiClient.post.mockResolvedValueOnce(loginResponse);

      const result = await authService.login(loginCredentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginCredentials);
      expect(result).toEqual(loginResponse.data);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access_token_123'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token_123'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userData',
        JSON.stringify(loginResponse.data.user)
      );
    });

    test('should handle login failure with invalid credentials', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Invalid email or password',
          },
        },
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.login(loginCredentials)).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
        status: 401,
        data: null,
      });

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test('should handle network error during login', async () => {
      const networkError = {};

      apiClient.post.mockRejectedValueOnce(networkError);

      await expect(authService.login(loginCredentials)).rejects.toEqual({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null,
      });
    });

    test('should handle validation errors during login', async () => {
      const errorResponse = {
        response: {
          status: 422,
          data: {
            message: 'Validation error',
            errors: {
              email: ['Email is required'],
              password: ['Password is required'],
            },
          },
        },
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.login(loginCredentials)).rejects.toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        status: 422,
        data: {
          email: ['Email is required'],
          password: ['Password is required'],
        },
      });
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      phone: '+1234567890',
    };

    const registerResponse = {
      data: {
        user: {
          id: 'user456',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'user',
        },
        tokens: {
          accessToken: 'access_token_456',
          refreshToken: 'refresh_token_456',
        },
        message: 'User registered successfully',
      },
    };

    test('should successfully register a new user', async () => {
      apiClient.post.mockResolvedValueOnce(registerResponse);

      const result = await authService.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(registerResponse.data);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access_token_456'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token_456'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userData',
        JSON.stringify(registerResponse.data.user)
      );
    });

    test('should handle registration failure (email already exists)', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'Email already registered',
          },
        },
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.register(registerData)).rejects.toEqual({
        code: 'CONFLICT',
        message: 'Email already registered',
        status: 409,
        data: null,
      });
    });
  });

  describe('logout', () => {
    test('should successfully logout user', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { message: 'Logged out successfully' } });

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userData');
    });
  });

  describe('refreshToken', () => {
    const refreshResponse = {
      data: {
        accessToken: 'new_access_token_789',
        refreshToken: 'new_refresh_token_789',
      },
    };

    test('should successfully refresh tokens', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('old_refresh_token');
      apiClient.post.mockResolvedValueOnce(refreshResponse);

      const result = await authService.refreshToken();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old_refresh_token',
      });
      expect(result).toEqual(refreshResponse.data);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'new_access_token_789'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'new_refresh_token_789'
      );
    });

    test('should handle missing refresh token', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      await expect(authService.refreshToken()).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'No refresh token available',
        status: 401,
        data: null,
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    const userData = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    test('should get current user from AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(userData));

      const result = await authService.getCurrentUser();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userData');
      expect(result).toEqual(userData);
    });

    test('should return null when no user data exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when access token exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('access_token_123');

      const result = await authService.isAuthenticated();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
      expect(result).toBe(true);
    });

    test('should return false when no access token exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordData = {
      email: 'test@example.com',
    };

    const forgotPasswordResponse = {
      data: {
        message: 'Password reset link sent to your email',
      },
    };

    test('should successfully send password reset link', async () => {
      apiClient.post.mockResolvedValueOnce(forgotPasswordResponse);

      const result = await authService.forgotPassword(forgotPasswordData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', forgotPasswordData);
      expect(result).toEqual(forgotPasswordResponse.data);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordData = {
      token: 'reset_token_123',
      newPassword: 'newPassword456',
    };

    const resetPasswordResponse = {
      data: {
        message: 'Password reset successfully',
      },
    };

    test('should successfully reset password', async () => {
      apiClient.post.mockResolvedValueOnce(resetPasswordResponse);

      const result = await authService.resetPassword(resetPasswordData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetPasswordData);
      expect(result).toEqual(resetPasswordResponse.data);
    });
  });
});