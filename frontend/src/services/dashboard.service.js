// ============================================================================
// Dashboard Service
// ============================================================================

import api from './api';

export const dashboardService = {
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getOccupancy: async (params) => {
    const response = await api.get('/dashboard/occupancy', { params });
    return response.data;
  },

  getRevenue: async (params) => {
    const response = await api.get('/dashboard/revenue', { params });
    return response.data;
  },

  getActivity: async (params) => {
    const response = await api.get('/dashboard/activity', { params });
    return response.data;
  },

  getReservations: async () => {
    const response = await api.get('/dashboard/reservations');
    return response.data;
  },
};

export default dashboardService;