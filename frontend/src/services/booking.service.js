// ============================================================================
// Bookings Service
// ============================================================================

import api from './api';

export const bookingsService = {
  getBookings: async (params) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  rebookBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/rebook`);
    return response.data;
  },

  exportBookings: async (format) => {
    const response = await api.get('/bookings/export', { 
      params: { format },
      responseType: 'blob',
    });
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response;
  },
};

export default bookingsService;