// ============================================================================
// Profile Service
// ============================================================================

import api from './api';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/profile/preferences', preferences);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/profile/change-password', data);
    return response.data;
  },

  getActivity: async (params) => {
    const response = await api.get('/profile/activity', { params });
    return response.data;
  },
};

export default profileService;