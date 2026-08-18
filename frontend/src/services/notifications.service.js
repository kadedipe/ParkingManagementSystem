// ============================================================================
// Notifications Service
// ============================================================================

import api from './api';

export const notificationsService = {
  // Notification CRUD
  getNotifications: async (params) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getNotification: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications/clear');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Preferences
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  updatePreference: async (key, value) => {
    const response = await api.patch(`/notifications/preferences/${key}`, { value });
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  // Toast notifications
  createToast: async (data) => {
    const response = await api.post('/notifications/toast', data);
    return response.data;
  },
};

export default notificationsService;