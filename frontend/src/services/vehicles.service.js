// ============================================================================
// Vehicles Service
// ============================================================================

import api from './api';

export const vehiclesService = {
  getVehicles: async (params) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getVehicle: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  updateVehicle: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  exportVehicles: async (format) => {
    const response = await api.get('/vehicles/export', {
      params: { format },
      responseType: 'blob',
    });
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vehicles.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response;
  },
};

export default vehiclesService;