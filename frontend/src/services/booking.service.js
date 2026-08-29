// ============================================================================
// Bookings / Reservations Service
// ============================================================================

import api from './api';

const normalizeReservation = (reservation) => ({
  ...reservation,
  spot_id: reservation.parking_spot_id,
  date: reservation.start_time,
  total_amount: reservation.total_price,
});

const buildStats = (items) => ({
  total: items.length,
  active: items.filter((item) => ['confirmed', 'active'].includes(String(item.status).toLowerCase())).length,
  pending: items.filter((item) => String(item.status).toLowerCase() === 'pending').length,
  completed: items.filter((item) => String(item.status).toLowerCase() === 'completed').length,
  cancelled: items.filter((item) => String(item.status).toLowerCase() === 'cancelled').length,
  totalSpent: items
    .filter((item) => String(item.status).toLowerCase() === 'completed')
    .reduce((total, item) => total + Number(item.total_price || 0), 0),
});

export const bookingsService = {
  createBooking: async (booking) => {
    const start = new Date(`${booking.date}T${booking.time}:00`);
    if (Number.isNaN(start.getTime())) {
      throw new Error('Invalid booking date or time');
    }

    const durationHours = Number(booking.duration || 1);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    const createResponse = await api.post('/reservations/', {
      parking_spot_id: booking.spot_id,
      vehicle_id: booking.vehicle_id || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    const created = createResponse.data;
    const confirmResponse = await api.post(`/reservations/${created.id}/confirm`);

    return {
      success: true,
      data: normalizeReservation(confirmResponse.data),
      message: 'Booking confirmed successfully',
    };
  },

  getBookings: async (params) => {
    const response = await api.get('/reservations/', { params });
    const items = Array.isArray(response.data)
      ? response.data.map(normalizeReservation)
      : [];
    return {
      items,
      total: items.length,
      stats: buildStats(items),
    };
  },

  getBooking: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return normalizeReservation(response.data);
  },

  cancelBooking: async (id) => {
    const response = await api.post(`/reservations/${id}/cancel`);
    return normalizeReservation(response.data);
  },

  startParking: async (reservationId) => {
    const response = await api.post('/parking-sessions/start', {
      reservation_id: reservationId,
    });
    return response.data;
  },

  endParking: async (reservationId) => {
    const sessionsResponse = await api.get('/parking-sessions/', {
      params: { active_only: true, limit: 100 },
    });
    const activeSession = (Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [])
      .find((session) => session.reservation_id === reservationId);

    if (!activeSession) {
      throw new Error('No active parking session was found for this reservation');
    }

    const response = await api.post(`/parking-sessions/${activeSession.id}/end`, {});
    return response.data;
  },

  rebookBooking: async (id) => {
    const existing = await bookingsService.getBooking(id);
    throw new Error(`Rebooking reservation ${existing.id} requires a new date and time`);
  },

  exportBookings: async () => {
    throw new Error('Booking export is not available yet');
  },
};

export default bookingsService;
