// ============================================================================
// Settings Service
// ============================================================================

import api from './api';

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },

  exportSettings: async () => {
    const response = await api.get('/settings/export');
    return response.data;
  },

  importSettings: async (data) => {
    const response = await api.post('/settings/import', data);
    return response.data;
  },

  resetSettings: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  },
};

export default settingsService;