// ============================================================================
// Auth Service Tests - Authentication Service Unit Tests
// ============================================================================

import authService from '../../services/auth.service';
import apiClient from '../../client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../../client');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = {
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        },
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123'
        }
      }
    };

    test('should successfully login with valid credentials', async () => {
      // Mock successful login
      apiClient.post.mockResolvedValueOnce(loginResponse);

      const result = await authService.login(loginCredentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginCredentials);
      expect(result).toEqual(loginResponse.data);
      
      // Verify tokens are stored
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
            message: 'Invalid email or password'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.login(loginCredentials)).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
        status: 401,
        data: null
      });

      // Verify tokens are not stored
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test('should handle network error during login', async () => {
      const networkError = {};

      apiClient.post.mockRejectedValueOnce(networkError);

      await expect(authService.login(loginCredentials)).rejects.toEqual({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null
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
              password: ['Password is required']
            }
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.login(loginCredentials)).rejects.toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        status: 422,
        data: {
          email: ['Email is required'],
          password: ['Password is required']
        }
      });
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      phone: '+1234567890'
    };

    const registerResponse = {
      data: {
        user: {
          id: 'user456',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'user'
        },
        tokens: {
          accessToken: 'access_token_456',
          refreshToken: 'refresh_token_456'
        },
        message: 'User registered successfully'
      }
    };

    test('should successfully register a new user', async () => {
      apiClient.post.mockResolvedValueOnce(registerResponse);

      const result = await authService.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(registerResponse.data);
      
      // Verify tokens are stored
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
            message: 'Email already registered'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.register(registerData)).rejects.toEqual({
        code: 'CONFLICT',
        message: 'Email already registered',
        status: 409,
        data: null
      });
    });

    test('should handle registration with invalid data', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Invalid registration data',
            errors: {
              email: ['Invalid email format'],
              password: ['Password must be at least 8 characters']
            }
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.register(registerData)).rejects.toEqual({
        code: 'BAD_REQUEST',
        message: 'Invalid registration data',
        status: 400,
        data: {
          email: ['Invalid email format'],
          password: ['Password must be at least 8 characters']
        }
      });
    });
  });

  describe('logout', () => {
    test('should successfully logout user', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { message: 'Logged out successfully' } });

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      
      // Verify tokens are cleared
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userData');
    });

    test('should handle logout failure gracefully', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            message: 'Server error during logout'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.logout()).rejects.toEqual({
        code: 'SERVER_ERROR',
        message: 'Server error during logout',
        status: 500,
        data: null
      });
    });
  });

  describe('refreshToken', () => {
    const refreshResponse = {
      data: {
        accessToken: 'new_access_token_789',
        refreshToken: 'new_refresh_token_789'
      }
    };

    test('should successfully refresh tokens', async () => {
      // Mock refresh token in storage
      AsyncStorage.getItem.mockResolvedValueOnce('old_refresh_token');

      apiClient.post.mockResolvedValueOnce(refreshResponse);

      const result = await authService.refreshToken();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old_refresh_token'
      });
      expect(result).toEqual(refreshResponse.data);
      
      // Verify new tokens are stored
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
        data: null
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('should handle invalid refresh token', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('invalid_token');

      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Invalid refresh token'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.refreshToken()).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
        status: 401,
        data: null
      });

      // Verify tokens are cleared on invalid refresh token
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userData');
    });
  });

  describe('getCurrentUser', () => {
    const userData = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
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
      email: 'test@example.com'
    };

    const forgotPasswordResponse = {
      data: {
        message: 'Password reset link sent to your email'
      }
    };

    test('should successfully send password reset link', async () => {
      apiClient.post.mockResolvedValueOnce(forgotPasswordResponse);

      const result = await authService.forgotPassword(forgotPasswordData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', forgotPasswordData);
      expect(result).toEqual(forgotPasswordResponse.data);
    });

    test('should handle email not found error', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Email not found'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.forgotPassword(forgotPasswordData)).rejects.toEqual({
        code: 'NOT_FOUND',
        message: 'Email not found',
        status: 404,
        data: null
      });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordData = {
      token: 'reset_token_123',
      newPassword: 'newPassword456'
    };

    const resetPasswordResponse = {
      data: {
        message: 'Password reset successfully'
      }
    };

    test('should successfully reset password', async () => {
      apiClient.post.mockResolvedValueOnce(resetPasswordResponse);

      const result = await authService.resetPassword(resetPasswordData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetPasswordData);
      expect(result).toEqual(resetPasswordResponse.data);
    });

    test('should handle invalid token error', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Invalid or expired reset token'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.resetPassword(resetPasswordData)).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired reset token',
        status: 401,
        data: null
      });
    });
  });

  describe('verifyEmail', () => {
    const verifyData = {
      token: 'verification_token_123'
    };

    const verifyResponse = {
      data: {
        message: 'Email verified successfully'
      }
    };

    test('should successfully verify email', async () => {
      apiClient.post.mockResolvedValueOnce(verifyResponse);

      const result = await authService.verifyEmail(verifyData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-email', verifyData);
      expect(result).toEqual(verifyResponse.data);
    });

    test('should handle invalid verification token', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Invalid verification token'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.verifyEmail(verifyData)).rejects.toEqual({
        code: 'BAD_REQUEST',
        message: 'Invalid verification token',
        status: 400,
        data: null
      });
    });
  });

  describe('changePassword (authenticated)', () => {
    const changePasswordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456'
    };

    const changePasswordResponse = {
      data: {
        message: 'Password changed successfully'
      }
    };

    test('should successfully change password', async () => {
      apiClient.post.mockResolvedValueOnce(changePasswordResponse);

      const result = await authService.changePassword(changePasswordData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', changePasswordData);
      expect(result).toEqual(changePasswordResponse.data);
    });

    test('should handle incorrect current password', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Current password is incorrect'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.changePassword(changePasswordData)).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'Current password is incorrect',
        status: 401,
        data: null
      });
    });

    test('should handle weak new password', async () => {
      const errorResponse = {
        response: {
          status: 422,
          data: {
            message: 'Validation error',
            errors: {
              newPassword: ['Password must be at least 8 characters']
            }
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.changePassword(changePasswordData)).rejects.toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        status: 422,
        data: {
          newPassword: ['Password must be at least 8 characters']
        }
      });
    });
  });

  describe('socialLogin', () => {
    const socialLoginData = {
      provider: 'google',
      token: 'google_token_123',
      email: 'socialuser@example.com',
      name: 'Social User'
    };

    const socialLoginResponse = {
      data: {
        user: {
          id: 'user789',
          email: 'socialuser@example.com',
          name: 'Social User',
          role: 'user'
        },
        tokens: {
          accessToken: 'access_token_789',
          refreshToken: 'refresh_token_789'
        },
        isNewUser: false
      }
    };

    test('should successfully login with social provider', async () => {
      apiClient.post.mockResolvedValueOnce(socialLoginResponse);

      const result = await authService.socialLogin(socialLoginData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/social-login', socialLoginData);
      expect(result).toEqual(socialLoginResponse.data);
      
      // Verify tokens are stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'access_token_789'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token_789'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userData',
        JSON.stringify(socialLoginResponse.data.user)
      );
    });

    test('should handle failed social login', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Invalid social token'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.socialLogin(socialLoginData)).rejects.toEqual({
        code: 'BAD_REQUEST',
        message: 'Invalid social token',
        status: 400,
        data: null
      });
    });
  });

  describe('twoFactorAuth', () => {
    const twoFactorData = {
      code: '123456'
    };

    test('should enable 2FA successfully', async () => {
      const enableResponse = {
        data: {
          message: '2FA enabled successfully',
          secret: 'QR_SECRET_123'
        }
      };

      apiClient.post.mockResolvedValueOnce(enableResponse);

      const result = await authService.enableTwoFactor();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/enable');
      expect(result).toEqual(enableResponse.data);
    });

    test('should verify 2FA code successfully', async () => {
      const verifyResponse = {
        data: {
          message: '2FA verified successfully',
          verified: true
        }
      };

      apiClient.post.mockResolvedValueOnce(verifyResponse);

      const result = await authService.verifyTwoFactor(twoFactorData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/verify', twoFactorData);
      expect(result).toEqual(verifyResponse.data);
    });

    test('should disable 2FA successfully', async () => {
      const disableResponse = {
        data: {
          message: '2FA disabled successfully'
        }
      };

      apiClient.post.mockResolvedValueOnce(disableResponse);

      const result = await authService.disableTwoFactor();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/2fa/disable');
      expect(result).toEqual(disableResponse.data);
    });

    test('should handle invalid 2FA code', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Invalid 2FA code'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.verifyTwoFactor(twoFactorData)).rejects.toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid 2FA code',
        status: 401,
        data: null
      });
    });
  });

  describe('deviceManagement', () => {
    const deviceData = {
      deviceId: 'device_123',
      platform: 'ios',
      token: 'push_token_123'
    };

    test('should register device successfully', async () => {
      const registerResponse = {
        data: {
          message: 'Device registered successfully'
        }
      };

      apiClient.post.mockResolvedValueOnce(registerResponse);

      const result = await authService.registerDevice(deviceData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/device/register', deviceData);
      expect(result).toEqual(registerResponse.data);
    });

    test('should unregister device successfully', async () => {
      const unregisterResponse = {
        data: {
          message: 'Device unregistered successfully'
        }
      };

      apiClient.post.mockResolvedValueOnce(unregisterResponse);

      const result = await authService.unregisterDevice(deviceData.deviceId);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/device/unregister', {
        deviceId: deviceData.deviceId
      });
      expect(result).toEqual(unregisterResponse.data);
    });
  });

  describe('sessionManagement', () => {
    test('should get active sessions', async () => {
      const sessionsResponse = {
        data: {
          sessions: [
            {
              id: 'session1',
              device: 'iPhone 12',
              platform: 'ios',
              lastActive: '2024-01-01T00:00:00Z'
            },
            {
              id: 'session2',
              device: 'MacBook Pro',
              platform: 'web',
              lastActive: '2024-01-01T10:00:00Z'
            }
          ]
        }
      };

      apiClient.get.mockResolvedValueOnce(sessionsResponse);

      const result = await authService.getActiveSessions();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/sessions');
      expect(result).toEqual(sessionsResponse.data);
    });

    test('should terminate session successfully', async () => {
      const terminateResponse = {
        data: {
          message: 'Session terminated successfully'
        }
      };

      apiClient.post.mockResolvedValueOnce(terminateResponse);

      const result = await authService.terminateSession('session1');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/sessions/terminate', {
        sessionId: 'session1'
      });
      expect(result).toEqual(terminateResponse.data);
    });

    test('should terminate all sessions successfully', async () => {
      const terminateAllResponse = {
        data: {
          message: 'All sessions terminated successfully'
        }
      };

      apiClient.post.mockResolvedValueOnce(terminateAllResponse);

      const result = await authService.terminateAllSessions();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/sessions/terminate-all');
      expect(result).toEqual(terminateAllResponse.data);
    });
  });
});