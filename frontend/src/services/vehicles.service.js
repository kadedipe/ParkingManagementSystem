// ============================================================================
// Vehicles Service
// ============================================================================

import api from './api';

export const vehiclesService = {
  getVehicles: async (params) => {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.pageSize || params?.limit || 10)));
    const response = await api.get('/vehicles', {
      params: {
        skip: (page - 1) * limit,
        limit,
      },
    });
    const vehicles = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.items)
        ? response.data.items
        : [];
    const search = String(params?.search || '').trim().toLowerCase();
    const status = params?.status;
    const type = params?.type;
    const filtered = vehicles.filter((vehicle) => {
      const matchesSearch = !search || [
        vehicle.name,
        vehicle.plate_number,
        vehicle.make,
        vehicle.model,
      ].some((value) => String(value || '').toLowerCase().includes(search));
      const matchesStatus = !status || vehicle.status === status;
      const matchesType = !type || (type === 'ev' ? vehicle.is_ev : !vehicle.is_ev);
      return matchesSearch && matchesStatus && matchesType;
    });
    return {
      items: filtered,
      total: filtered.length,
      stats: {
        total: filtered.length,
        active: filtered.filter((vehicle) => vehicle.status === 'active').length,
        electric: filtered.filter((vehicle) => vehicle.is_ev).length,
      },
    };
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
