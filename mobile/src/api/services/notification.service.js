// ============================================================================
// Notification Service - API Service for Notification Management
// ============================================================================

import apiClient from '../client';

/**
 * Notification Service - Handles all notification-related API operations
 */
class NotificationService {
  /**
   * Get all notifications for the current user
   * @param {Object} params - Query parameters (page, limit, type, status, etc.)
   * @returns {Promise} - API response with notifications list
   */
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - API response with notification details
   */
  async getNotificationById(notificationId) {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - API response with updated notification
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark multiple notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   * @returns {Promise} - API response with updated notifications
   */
  async markMultipleAsRead(notificationIds) {
    try {
      const response = await apiClient.patch('/notifications/read-multiple', {
        notificationIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise} - API response
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - API response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete multiple notifications
   * @param {Array} notificationIds - Array of notification IDs
   * @returns {Promise} - API response
   */
  async deleteMultipleNotifications(notificationIds) {
    try {
      const response = await apiClient.delete('/notifications/delete-multiple', {
        data: { notificationIds }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete all notifications
   * @returns {Promise} - API response
   */
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete('/notifications/delete-all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get unread notification count
   * @param {Object} params - Query parameters (type, etc.)
   * @returns {Promise} - API response with unread count
   */
  async getUnreadCount(params = {}) {
    try {
      const response = await apiClient.get('/notifications/unread-count', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notifications by type
   * @param {string} type - Notification type (booking, payment, reminder, etc.)
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with filtered notifications
   */
  async getNotificationsByType(type, params = {}) {
    try {
      const response = await apiClient.get(`/notifications/type/${type}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent notifications (last 24 hours)
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with recent notifications
   */
  async getRecentNotifications(params = {}) {
    try {
      const response = await apiClient.get('/notifications/recent', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register device for push notifications
   * @param {Object} deviceData - Device registration data (deviceToken, platform, etc.)
   * @returns {Promise} - API response with registration details
   */
  async registerDevice(deviceData) {
    try {
      const response = await apiClient.post('/notifications/device/register', deviceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unregister device from push notifications
   * @param {string} deviceToken - Device token
   * @returns {Promise} - API response
   */
  async unregisterDevice(deviceToken) {
    try {
      const response = await apiClient.delete('/notifications/device/unregister', {
        data: { deviceToken }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update device notification settings
   * @param {Object} settings - Notification settings (types, channels, etc.)
   * @returns {Promise} - API response with updated settings
   */
  async updateNotificationSettings(settings) {
    try {
      const response = await apiClient.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification settings
   * @returns {Promise} - API response with notification settings
   */
  async getNotificationSettings() {
    try {
      const response = await apiClient.get('/notifications/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a notification (for admin/managers)
   * @param {Object} notificationData - Notification data (title, message, recipients, etc.)
   * @returns {Promise} - API response with sent notification
   */
  async sendNotification(notificationData) {
    try {
      const response = await apiClient.post('/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send bulk notifications (for admin/managers)
   * @param {Object} bulkData - Bulk notification data (title, message, users, etc.)
   * @returns {Promise} - API response with bulk notification result
   */
  async sendBulkNotifications(bulkData) {
    try {
      const response = await apiClient.post('/notifications/send-bulk', bulkData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification templates
   * @param {Object} params - Query parameters (type, category, etc.)
   * @returns {Promise} - API response with notification templates
   */
  async getNotificationTemplates(params = {}) {
    try {
      const response = await apiClient.get('/notifications/templates', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create notification template (for admin/managers)
   * @param {Object} templateData - Template data (name, type, content, etc.)
   * @returns {Promise} - API response with created template
   */
  async createNotificationTemplate(templateData) {
    try {
      const response = await apiClient.post('/notifications/templates', templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update notification template (for admin/managers)
   * @param {string} templateId - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise} - API response with updated template
   */
  async updateNotificationTemplate(templateId, templateData) {
    try {
      const response = await apiClient.put(`/notifications/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete notification template (for admin/managers)
   * @param {string} templateId - Template ID
   * @returns {Promise} - API response
   */
  async deleteNotificationTemplate(templateId) {
    try {
      const response = await apiClient.delete(`/notifications/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification delivery status
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - API response with delivery status
   */
  async getDeliveryStatus(notificationId) {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification analytics
   * @param {Object} params - Query parameters (dateRange, type, etc.)
   * @returns {Promise} - API response with notification analytics
   */
  async getNotificationAnalytics(params = {}) {
    try {
      const response = await apiClient.get('/notifications/analytics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Subscribe to notification channel
   * @param {string} channel - Channel name
   * @param {Object} data - Subscription data
   * @returns {Promise} - API response
   */
  async subscribeToChannel(channel, data = {}) {
    try {
      const response = await apiClient.post(`/notifications/channels/${channel}/subscribe`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unsubscribe from notification channel
   * @param {string} channel - Channel name
   * @returns {Promise} - API response
   */
  async unsubscribeFromChannel(channel) {
    try {
      const response = await apiClient.delete(`/notifications/channels/${channel}/unsubscribe`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get subscribed channels
   * @returns {Promise} - API response with subscribed channels
   */
  async getSubscribedChannels() {
    try {
      const response = await apiClient.get('/notifications/channels');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Schedule a notification
   * @param {Object} scheduleData - Schedule data (title, message, scheduleTime, etc.)
   * @returns {Promise} - API response with scheduled notification
   */
  async scheduleNotification(scheduleData) {
    try {
      const response = await apiClient.post('/notifications/schedule', scheduleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel scheduled notification
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise} - API response
   */
  async cancelScheduledNotification(scheduleId) {
    try {
      const response = await apiClient.delete(`/notifications/schedule/${scheduleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get scheduled notifications
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with scheduled notifications
   */
  async getScheduledNotifications(params = {}) {
    try {
      const response = await apiClient.get('/notifications/schedule', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mute notifications for a specific booking
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Mute data (duration, etc.)
   * @returns {Promise} - API response
   */
  async muteBookingNotifications(bookingId, data = {}) {
    try {
      const response = await apiClient.post(`/notifications/booking/${bookingId}/mute`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unmute notifications for a specific booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response
   */
  async unmuteBookingNotifications(bookingId) {
    try {
      const response = await apiClient.delete(`/notifications/booking/${bookingId}/mute`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification preferences
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with notification preferences
   */
  async getNotificationPreferences(params = {}) {
    try {
      const response = await apiClient.get('/notifications/preferences', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences (email, push, sms, etc.)
   * @returns {Promise} - API response with updated preferences
   */
  async updateNotificationPreferences(preferences) {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Test notification delivery
   * @param {Object} testData - Test data (type, recipient, etc.)
   * @returns {Promise} - API response with test result
   */
  async testNotificationDelivery(testData) {
    try {
      const response = await apiClient.post('/notifications/test', testData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get notification delivery history
   * @param {Object} params - Query parameters (page, limit, dateRange, etc.)
   * @returns {Promise} - API response with delivery history
   */
  async getDeliveryHistory(params = {}) {
    try {
      const response = await apiClient.get('/notifications/delivery-history', { params });
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
          message: data?.message || 'Notification not found.',
          status,
          data: null,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'Notification conflict. Please try again.',
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
          message: 'Notification service temporarily unavailable. Please try again later.',
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
export default new NotificationService();