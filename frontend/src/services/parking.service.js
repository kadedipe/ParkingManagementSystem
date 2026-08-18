// ============================================================================
// Parking Service
// ============================================================================

import apiService from './api';

export const parkingService = {
  // Spots
  getSpots: async (params) => {
    const response = await apiService.get('/parking/spots', { params });
    return response.data;
  },

  getSpot: async (id) => {
    const response = await apiService.get(`/parking/spots/${id}`);
    return response.data;
  },

  createSpot: async (data) => {
    const response = await apiService.post('/parking/spots', data);
    return response.data;
  },

  updateSpot: async (id, data) => {
    const response = await apiService.put(`/parking/spots/${id}`, data);
    return response.data;
  },

  deleteSpot: async (id) => {
    const response = await apiService.delete(`/parking/spots/${id}`);
    return response.data;
  },

  // Sessions
  startSession: async (data) => {
    const response = await apiService.post('/parking/sessions/start', data);
    return response.data;
  },

  endSession: async (id) => {
    const response = await apiService.post(`/parking/sessions/${id}/end`);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await apiService.get('/parking/sessions/active');
    return response.data;
  },

  getSessionHistory: async (params) => {
    const response = await apiService.get('/parking/sessions/history', { params });
    return response.data;
  },

  // Reservations
  createReservation: async (data) => {
    const response = await apiService.post('/parking/reservations', data);
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await apiService.post(`/parking/reservations/${id}/cancel`);
    return response.data;
  },

  getReservations: async () => {
    const response = await apiService.get('/parking/reservations');
    return response.data;
  },

  getUpcomingReservations: async () => {
    const response = await apiService.get('/parking/reservations/upcoming');
    return response.data;
  },
};

export default parkingService;