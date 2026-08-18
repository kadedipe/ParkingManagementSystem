// ============================================================================
// User Service - API Service for User Management
// ============================================================================

import apiClient from '../client';

/**
 * User Service - Handles all user-related API operations
 */
class UserService {
  /**
   * Get current user profile
   * @returns {Promise} - API response with user profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update current user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - API response with updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Partially update user profile
   * @param {Object} profileData - Partial profile data
   * @returns {Promise} - API response with updated profile
   */
  async patchProfile(profileData) {
    try {
      const response = await apiClient.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * @param {string} userId - User ID
   * @returns {Promise} - API response with user details
   */
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all users (admin only)
   * @param {Object} params - Query parameters (page, limit, role, status, search, etc.)
   * @returns {Promise} - API response with users list
   */
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new user (admin only)
   * @param {Object} userData - User data (email, password, name, role, etc.)
   * @returns {Promise} - API response with created user
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user (admin only)
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response with updated user
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user (admin only)
   * @param {string} userId - User ID
   * @returns {Promise} - API response
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password data (currentPassword, newPassword)
   * @returns {Promise} - API response
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset user password (forgot password)
   * @param {Object} data - Reset data (email)
   * @returns {Promise} - API response
   */
  async resetPassword(data) {
    try {
      const response = await apiClient.post('/users/reset-password', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm password reset with token
   * @param {Object} data - Confirmation data (token, newPassword)
   * @returns {Promise} - API response
   */
  async confirmPasswordReset(data) {
    try {
      const response = await apiClient.post('/users/reset-password/confirm', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify user email
   * @param {Object} data - Verification data (token)
   * @returns {Promise} - API response
   */
  async verifyEmail(data) {
    try {
      const response = await apiClient.post('/users/verify-email', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend email verification
   * @param {Object} data - Resend data (email)
   * @returns {Promise} - API response
   */
  async resendVerificationEmail(data) {
    try {
      const response = await apiClient.post('/users/resend-verification', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload user avatar
   * @param {FormData} formData - Form data with avatar image
   * @returns {Promise} - API response with updated user profile
   */
  async uploadAvatar(formData) {
    try {
      const response = await apiClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user avatar
   * @returns {Promise} - API response with updated user profile
   */
  async deleteAvatar() {
    try {
      const response = await apiClient.delete('/users/avatar');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user vehicles
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with user's vehicles
   */
  async getUserVehicles(params = {}) {
    try {
      const response = await apiClient.get('/users/vehicles', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add vehicle to user
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise} - API response with added vehicle
   */
  async addVehicle(vehicleData) {
    try {
      const response = await apiClient.post('/users/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise} - API response with updated vehicle
   */
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await apiClient.put(`/users/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response
   */
  async deleteVehicle(vehicleId) {
    try {
      const response = await apiClient.delete(`/users/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set default vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response
   */
  async setDefaultVehicle(vehicleId) {
    try {
      const response = await apiClient.post(`/users/vehicles/${vehicleId}/default`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user payment methods
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with user's payment methods
   */
  async getUserPaymentMethods(params = {}) {
    try {
      const response = await apiClient.get('/users/payment-methods', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add payment method to user
   * @param {Object} paymentData - Payment method data
   * @returns {Promise} - API response with added payment method
   */
  async addPaymentMethod(paymentData) {
    try {
      const response = await apiClient.post('/users/payment-methods', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} - API response
   */
  async deletePaymentMethod(methodId) {
    try {
      const response = await apiClient.delete(`/users/payment-methods/${methodId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set default payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} - API response
   */
  async setDefaultPaymentMethod(methodId) {
    try {
      const response = await apiClient.post(`/users/payment-methods/${methodId}/default`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user settings
   * @returns {Promise} - API response with user settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/users/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user settings
   * @param {Object} settingsData - Updated settings data
   * @returns {Promise} - API response with updated settings
   */
  async updateSettings(settingsData) {
    try {
      const response = await apiClient.put('/users/settings', settingsData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user activity log
   * @param {Object} params - Query parameters (page, limit, dateRange, type, etc.)
   * @returns {Promise} - API response with user activity
   */
  async getActivityLog(params = {}) {
    try {
      const response = await apiClient.get('/users/activity', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user statistics
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise} - API response with user statistics
   */
  async getUserStats(params = {}) {
    try {
      const response = await apiClient.get('/users/stats', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user booking history
   * @param {Object} params - Query parameters (page, limit, status, dateRange, etc.)
   * @returns {Promise} - API response with booking history
   */
  async getBookingHistory(params = {}) {
    try {
      const response = await apiClient.get('/users/bookings', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user loyalty/reward points
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with loyalty points
   */
  async getLoyaltyPoints(params = {}) {
    try {
      const response = await apiClient.get('/users/loyalty', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user referral information
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with referral information
   */
  async getReferralInfo(params = {}) {
    try {
      const response = await apiClient.get('/users/referral', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create referral code
   * @param {Object} data - Referral data
   * @returns {Promise} - API response with referral code
   */
  async createReferralCode(data = {}) {
    try {
      const response = await apiClient.post('/users/referral', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user notifications
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with user notifications
   */
  async getUserNotifications(params = {}) {
    try {
      const response = await apiClient.get('/users/notifications', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark notification as read for user
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - API response
   */
  async markNotificationRead(notificationId) {
    try {
      const response = await apiClient.patch(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark all user notifications as read
   * @returns {Promise} - API response
   */
  async markAllNotificationsRead() {
    try {
      const response = await apiClient.patch('/users/notifications/read-all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deactivate user account
   * @param {Object} data - Deactivation data (reason, password, etc.)
   * @returns {Promise} - API response
   */
  async deactivateAccount(data = {}) {
    try {
      const response = await apiClient.post('/users/deactivate', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reactivate user account
   * @param {Object} data - Reactivation data (token, etc.)
   * @returns {Promise} - API response
   */
  async reactivateAccount(data = {}) {
    try {
      const response = await apiClient.post('/users/reactivate', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user role and permissions
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with user roles and permissions
   */
  async getUserRoles(params = {}) {
    try {
      const response = await apiClient.get('/users/roles', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Assign role to user (admin only)
   * @param {string} userId - User ID
   * @param {Object} roleData - Role assignment data
   * @returns {Promise} - API response
   */
  async assignRole(userId, roleData) {
    try {
      const response = await apiClient.post(`/users/${userId}/roles`, roleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove role from user (admin only)
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @returns {Promise} - API response
   */
  async removeRole(userId, roleId) {
    try {
      const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search users (admin only)
   * @param {Object} params - Search parameters (query, role, status, etc.)
   * @returns {Promise} - API response with search results
   */
  async searchUsers(params = {}) {
    try {
      const response = await apiClient.get('/users/search', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export users data (admin only)
   * @param {Object} params - Export parameters (format, fields, filter, etc.)
   * @returns {Promise} - API response with exported data
   */
  async exportUsers(params = {}) {
    try {
      const response = await apiClient.get('/users/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user analytics (admin only)
   * @param {Object} params - Query parameters (metric, dateRange, etc.)
   * @returns {Promise} - API response with user analytics
   */
  async getUserAnalytics(params = {}) {
    try {
      const response = await apiClient.get('/users/analytics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user dashboard data
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with dashboard data
   */
  async getDashboardData(params = {}) {
    try {
      const response = await apiClient.get('/users/dashboard', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Object} error - Error object from axios
   * @returns {Object} - Standardized error object
   */
  handleError(error) {
    if (!error.response) {
      // Network error
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null,
      };
    }

    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: data?.message || 'Invalid request. Please check your input.',
          status,
          data: data?.errors || null,
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in again.',
          status,
          data: null,
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          status,
          data: null,
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: data?.message || 'User not found.',
          status,
          data: null,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'User conflict. Email may already be registered.',
          status,
          data: data?.details || null,
        };
      case 422:
        return {
          code: 'VALIDATION_ERROR',
          message: data?.message || 'Validation error.',
          status,
          data: data?.errors || null,
        };
      case 429:
        return {
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.',
          status,
          data: null,
        };
      case 503:
        return {
          code: 'SERVICE_UNAVAILABLE',
          message: 'User service temporarily unavailable. Please try again later.',
          status,
          data: null,
        };
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: data?.message || 'An unexpected error occurred.',
          status,
          data: null,
        };
    }
  }
}

// Export a singleton instance
export default new UserService();