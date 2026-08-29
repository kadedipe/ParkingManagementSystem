// ============================================================================
// Parking Service
// ============================================================================

import apiService from './api';

export const parkingService = {
  search: async (params) => {
    const lotsResponse = await apiService.get('/parking-lots/', {
      params: { skip: 0, limit: 100 },
    });
    const lots = Array.isArray(lotsResponse.data) ? lotsResponse.data : [];
    const spotResults = await Promise.allSettled(
      lots.map((lot) =>
        apiService.get('/parking-spots/', {
          params: {
            parking_lot_id: lot.id,
            skip: Math.max(0, ((params?.page || 1) - 1) * (params?.limit || 20)),
            limit: params?.limit || 20,
          },
        })
      )
    );

    const query = String(params?.query || '').trim().toLowerCase();
    const requestedStatuses = Array.isArray(params?.statuses) ? params.statuses : [];
    const spots = spotResults.flatMap((result, index) => {
      if (result.status !== 'fulfilled' || !Array.isArray(result.value.data)) return [];
      const lot = lots[index];
      return result.value.data.map((spot) => ({
        ...spot,
        parking_lot: lot,
        parking_lot_name: lot.name,
        name: spot.number ? `${lot.name} · ${spot.number}` : lot.name,
        address: lot.address,
        location: lot.location,
        latitude: lot.location?.latitude ?? lot.location?.lat,
        longitude: lot.location?.longitude ?? lot.location?.lng,
        price_per_hour: spot.charging_price ?? lot.price_per_hour,
      }));
    }).filter((spot) => {
      const matchesQuery = !query || [spot.name, spot.number, spot.parking_lot_name]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const matchesStatus = requestedStatuses.length === 0 || requestedStatuses.includes(spot.status);
      return matchesQuery && matchesStatus;
    });

    return {
      items: spots,
      spots,
      total: spots.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };
  },

  // Spots
  getSpots: async (params) => {
    const response = await apiService.get('/parking-spots/', { params });
    return response.data;
  },

  getSpot: async (id) => {
    const response = await apiService.get(`/parking-spots/${id}`);
    return response.data;
  },

  createSpot: async (data) => {
    const response = await apiService.post('/parking-spots/', data);
    return response.data;
  },

  updateSpot: async (id, data) => {
    const response = await apiService.put(`/parking-spots/${id}`, data);
    return response.data;
  },

  deleteSpot: async (id) => {
    const response = await apiService.delete(`/parking-spots/${id}`);
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
