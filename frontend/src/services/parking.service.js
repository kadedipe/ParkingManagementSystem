// ============================================================================
// Parking Service
// ============================================================================

import apiService from './api';

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const parkingService = {
  search: async (params) => {
    const lotsResponse = await apiService.get('/parking-lots/', {
      params: { skip: 0, limit: 100 },
    });
    const lots = asArray(lotsResponse.data);
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
    const requestedStatuses = (Array.isArray(params?.statuses) ? params.statuses : [])
      .map((status) => String(status).toLowerCase());
    const spots = spotResults.flatMap((result, index) => {
      if (result.status !== 'fulfilled') return [];
      const lot = lots[index];
      return asArray(result.value.data).map((spot) => {
        const hourlyRate = Number(
          spot.price_per_hour ??
          spot.hourly_rate ??
          spot.charging_price ??
          lot.price_per_hour ??
          lot.base_price_per_hour ??
          0
        );
        const spotNumber = spot.spot_number || spot.number || spot.name || 'Parking spot';
        const spotType = spot.spot_type || spot.type || 'standard';
        return {
          ...spot,
          parking_lot: lot,
          parking_lot_name: lot.name,
          spot_number: spotNumber,
          number: spot.number || spotNumber,
          spot_type: spotType,
          type: spot.type || spotType,
          name: lot.name ? `${lot.name} · ${spotNumber}` : spotNumber,
          address: lot.address,
          location: lot.location,
          latitude: lot.location?.latitude ?? lot.location?.lat,
          longitude: lot.location?.longitude ?? lot.location?.lng,
          floor: spot.floor ?? spot.level ?? 1,
          level: spot.level ?? spot.floor ?? 1,
          section: spot.section || lot.section || lot.name || 'Parking',
          price_per_hour: hourlyRate,
          price: hourlyRate,
          hourly_rate: hourlyRate,
        };
      });
    }).filter((spot) => {
      const matchesQuery = !query || [spot.name, spot.number, spot.spot_number, spot.parking_lot_name]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const status = String(spot.status || '').toLowerCase();
      const matchesStatus = requestedStatuses.length === 0 || requestedStatuses.includes(status);
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

  startSession: async (data) => {
    const response = await apiService.post('/parking-sessions/start', data);
    return response.data;
  },

  endSession: async (id) => {
    const response = await apiService.post(`/parking-sessions/${id}/end`);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await apiService.get('/parking-sessions', { params: { active_only: true } });
    return response.data;
  },

  getSessionHistory: async (params) => {
    const response = await apiService.get('/parking-sessions', { params });
    return response.data;
  },

  createReservation: async (data) => {
    const response = await apiService.post('/reservations', data);
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await apiService.post(`/reservations/${id}/cancel`);
    return response.data;
  },

  getReservations: async () => {
    const response = await apiService.get('/reservations');
    return response.data;
  },

  getUpcomingReservations: async () => {
    const response = await apiService.get('/reservations', { params: { status: 'confirmed' } });
    return response.data;
  },
};

export default parkingService;
