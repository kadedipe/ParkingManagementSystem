// ============================================================================
// Auth Service
// ============================================================================

/**
 * Auth service for handling authentication operations.
 * 
 * This service provides:
 * - Login, logout, registration
 * - Token management
 * - Password reset and verification
 * - User profile management
 * - Session management
 * - Social authentication
 * - Two-factor authentication
 * - Email verification
 */

import apiService from './api';
import { config } from '../config';

// ============================================================================
// Constants
// ============================================================================

const TOKEN_KEY = config.auth.tokenStorageKey || 'auth_token';
const REFRESH_TOKEN_KEY = config.auth.refreshTokenStorageKey || 'refresh_token';
const USER_KEY = 'user_data';
const REMEMBER_ME_KEY = 'remember_me';

// ============================================================================
// Auth Service Class
// ============================================================================

class AuthService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.isInitialized = false;
    this.authListeners = [];
    this.tokenRefreshTimeout = null;
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize the auth service
   */
  init() {
    if (this.isInitialized) return;
    
    // Load tokens from storage
    this.token = localStorage.getItem(TOKEN_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    // Load user data
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (e) {
        this.user = null;
      }
    }
    
    // Set up API token
    if (this.token) {
      apiService.setTokens(this.token, this.refreshToken);
    }
    
    // Set up auto-refresh
    this.setupAutoRefresh();
    
    this.isInitialized = true;
    this.notifyListeners();
  }

  // ==========================================================================
  // Authentication Methods
  // ==========================================================================

  /**
   * Login user
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
        rememberMe,
      });

      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens
      this.setTokens(access_token, refresh_token);
      
      // Store user
      this.setUser(user);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        localStorage.removeItem('remembered_email');
      }
      
      // Set up auto-refresh
      this.setupAutoRefresh();
      
      this.notifyListeners();
      
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
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens if auto-login is enabled
      if (access_token) {
        this.setTokens(access_token, refresh_token);
        this.setUser(user);
        this.setupAutoRefresh();
        this.notifyListeners();
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
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint
      if (this.token) {
        await apiService.post('/auth/logout');
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearTokens();
      this.clearUser();
      this.clearAutoRefresh();
      this.notifyListeners();
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post('/auth/refresh', {
        refresh_token: this.refreshToken,
      });

      const { access_token, refresh_token } = response.data;
      
      this.setTokens(access_token, refresh_token);
      this.setupAutoRefresh();
      
      return {
        success: true,
        token: access_token,
      };
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearTokens();
      this.clearUser();
      this.notifyListeners();
      
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  }

  // ==========================================================================
  // Password Management
  // ==========================================================================

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      await apiService.post('/auth/forgot-password', { email });
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
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      await apiService.post('/auth/reset-password', {
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
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      await apiService.post('/auth/change-password', {
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
  }

  // ==========================================================================
  // Email Verification
  // ==========================================================================

  /**
   * Send verification email
   */
  async sendVerificationEmail() {
    try {
      await apiService.post('/auth/send-verification');
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
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    try {
      await apiService.post('/auth/verify-email', { token });
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
  }

  // ==========================================================================
  // Social Authentication
  // ==========================================================================

  /**
   * Login with social provider
   */
  async socialLogin(provider, token) {
    try {
      const response = await apiService.post(`/auth/social/${provider}`, {
        token,
      });

      const { access_token, refresh_token, user } = response.data;
      
      this.setTokens(access_token, refresh_token);
      this.setUser(user);
      this.setupAutoRefresh();
      this.notifyListeners();
      
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
  }

  // ==========================================================================
  // Two-Factor Authentication
  // ==========================================================================

  /**
   * Enable 2FA
   */
  async enableTwoFactor() {
    try {
      const response = await apiService.post('/auth/2fa/enable');
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
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(code) {
    try {
      await apiService.post('/auth/2fa/disable', { code });
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
  }

  /**
   * Verify 2FA code
   */
  async verifyTwoFactor(code) {
    try {
      await apiService.post('/auth/2fa/verify', { code });
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
  }

  // ==========================================================================
  // User Profile
  // ==========================================================================

  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await apiService.get('/auth/profile');
      this.setUser(response.data);
      this.notifyListeners();
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
  }

  /**
   * Update user profile
   */
  async updateProfile(data) {
    try {
      const response = await apiService.put('/auth/profile', data);
      this.setUser(response.data);
      this.notifyListeners();
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
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiService.upload('/auth/avatar', file, null, {
        formData,
      });
      
      this.setUser(response.data);
      this.notifyListeners();
      
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
  }

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Get active sessions
   */
  async getSessions() {
    try {
      const response = await apiService.get('/auth/sessions');
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
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId) {
    try {
      await apiService.delete(`/auth/sessions/${sessionId}`);
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
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions() {
    try {
      await apiService.post('/auth/sessions/revoke-all');
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
  }

  // ==========================================================================
  // Token Management
  // ==========================================================================

  /**
   * Set tokens
   */
  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    
    apiService.setTokens(accessToken, refreshToken);
  }

  /**
   * Clear tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiService.clearTokens();
  }

  /**
   * Get access token
   */
  getToken() {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return this.refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  // ==========================================================================
  // User Management
  // ==========================================================================

  /**
   * Set user data
   */
  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Get user data
   */
  getUser() {
    if (!this.user) {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (e) {
          this.user = null;
        }
      }
    }
    return this.user;
  }

  /**
   * Clear user data
   */
  clearUser() {
    this.user = null;
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user has role
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission) {
    const user = this.getUser();
    return user && user.permissions && user.permissions.includes(permission);
  }

  // ==========================================================================
  // Auto-Refresh
  // ==========================================================================

  /**
   * Setup auto-refresh timer
   */
  setupAutoRefresh() {
    this.clearAutoRefresh();
    
    if (!this.token) return;
    
    // Refresh token 5 minutes before expiry
    // Assuming token expiry is 1 hour (3600 seconds)
    const refreshTime = 55 * 60 * 1000; // 55 minutes
    
    this.tokenRefreshTimeout = setTimeout(async () => {
      await this.refreshAccessToken();
    }, refreshTime);
  }

  /**
   * Clear auto-refresh timer
   */
  clearAutoRefresh() {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================

  /**
   * Add auth change listener
   */
  addListener(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify listeners of auth change
   */
  notifyListeners() {
    this.authListeners.forEach(callback => {
      try {
        callback({
          isAuthenticated: this.isAuthenticated(),
          user: this.getUser(),
          token: this.getToken(),
        });
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // ==========================================================================
  // Remember Me
  // ==========================================================================

  /**
   * Get remembered email
   */
  getRememberedEmail() {
    return localStorage.getItem('remembered_email') || '';
  }

  /**
   * Check if remember me is enabled
   */
  isRememberMeEnabled() {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get auth headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get CSRF token
   */
  getCSRFToken() {
    // Get CSRF token from meta tag or cookie
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    return null;
  }

  /**
   * Clear all auth data
   */
  clearAll() {
    this.clearTokens();
    this.clearUser();
    this.clearAutoRefresh();
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem('remembered_email');
    this.notifyListeners();
  }

  /**
   * Get auth status
   */
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getUser(),
      token: this.getToken(),
      hasRefreshToken: !!this.getRefreshToken(),
    };
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

const authService = new AuthService();

// Initialize on import
authService.init();

export default authService;