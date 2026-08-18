// ============================================================================
// Auth Service
// ============================================================================

/**
 * Authentication service for the mobile app.
 * 
 * This service handles all authentication-related API calls including:
 * - Login, logout, registration
 * - Token management
 * - Password reset
 * - Profile management
 * - Social authentication
 * - Two-factor authentication
 */

import apiClient, { setTokens, clearTokens } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { storage } from '../../utils/storage';

// ============================================================================
// Auth Service
// ============================================================================

const authService = {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  /**
   * Login user
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        email,
        password,
        rememberMe,
      });

      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens
      setTokens(access_token, refresh_token);
      
      // Store user data
      await storage.setItem('user', user);
      
      // Store remember me preference
      if (rememberMe) {
        await storage.setItem('remember_me', 'true');
        await storage.setItem('remembered_email', email);
      } else {
        await storage.removeItem('remember_me');
        await storage.removeItem('remembered_email');
      }
      
      return {
        success: true,
        user,
        token: access_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  /**
   * Register user
   */
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.register, userData);
      
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens if auto-login is enabled
      if (access_token) {
        setTokens(access_token, refresh_token);
        await storage.setItem('user', user);
      }
      
      return {
        success: true,
        user,
        token: access_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearTokens();
      await storage.removeItem('user');
      await storage.removeItem('remember_me');
    }
  },

  // ==========================================================================
  // Token Management
  // ==========================================================================

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.refresh);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);
      return { success: true, token: access_token };
    } catch (error) {
      clearTokens();
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  },

  // ==========================================================================
  // Password Management
  // ==========================================================================

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email',
      };
    }
  },

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
        token,
        new_password: newPassword,
      });
      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      await apiClient.post(API_ENDPOINTS.auth.changePassword, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password change failed',
      };
    }
  },

  // ==========================================================================
  // Email Verification
  // ==========================================================================

  /**
   * Send verification email
   */
  async sendVerificationEmail() {
    try {
      await apiClient.post(API_ENDPOINTS.auth.sendVerification);
      return {
        success: true,
        message: 'Verification email sent',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send verification email',
      };
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      await apiClient.post(API_ENDPOINTS.auth.verifyEmail, { token });
      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  },

  // ==========================================================================
  // User Profile
  // ==========================================================================

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.auth.profile);
      await storage.setItem('user', response.data);
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get profile',
      };
    }
  },

  /**
   * Update profile
   */
  async updateProfile(data) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.auth.profile, data);
      await storage.setItem('user', response.data);
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'avatar.jpg',
      });
      
      const response = await apiClient.post(API_ENDPOINTS.auth.avatar, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await storage.setItem('user', response.data);
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
      };
    }
  },

  // ==========================================================================
  // Two-Factor Authentication
  // ==========================================================================

  /**
   * Enable 2FA
   */
  async enableTwoFactor() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.twoFactor + '/enable');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to enable 2FA',
      };
    }
  },

  /**
   * Disable 2FA
   */
  async disableTwoFactor(code) {
    try {
      await apiClient.post(API_ENDPOINTS.auth.twoFactor + '/disable', { code });
      return {
        success: true,
        message: '2FA disabled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to disable 2FA',
      };
    }
  },

  /**
   * Verify 2FA code
   */
  async verifyTwoFactor(code) {
    try {
      await apiClient.post(API_ENDPOINTS.auth.twoFactor + '/verify', { code });
      return {
        success: true,
        message: '2FA verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Invalid 2FA code',
      };
    }
  },

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Get sessions
   */
  async getSessions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.auth.sessions);
      return {
        success: true,
        sessions: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get sessions',
      };
    }
  },

  /**
   * Revoke session
   */
  async revokeSession(sessionId) {
    try {
      await apiClient.delete(`${API_ENDPOINTS.auth.sessions}/${sessionId}`);
      return {
        success: true,
        message: 'Session revoked successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to revoke session',
      };
    }
  },

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions() {
    try {
      await apiClient.post(API_ENDPOINTS.auth.sessions + '/revoke-all');
      return {
        success: true,
        message: 'All other sessions revoked',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to revoke sessions',
      };
    }
  },

  // ==========================================================================
  // Social Authentication
  // ==========================================================================

  /**
   * Login with social provider
   */
  async socialLogin(provider, token) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.auth.socialLogin}/${provider}`, {
        token,
      });

      const { access_token, refresh_token, user } = response.data;
      
      setTokens(access_token, refresh_token);
      await storage.setItem('user', user);
      
      return {
        success: true,
        user,
        token: access_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || `${provider} login failed`,
      };
    }
  },

  // ==========================================================================
  // Utility
  // ==========================================================================

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const token = await storage.getItem('access_token');
    return !!token;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    return await storage.getItem('user');
  },
};

// ============================================================================
// Export
// ============================================================================

export default authService;