// ============================================================================
// Bookings / Reservations Service
// ============================================================================

import api from './api';

const normalizeReservation = (reservation) => ({
  ...reservation,
  spot_id: reservation.parking_spot_id,
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
      stats: null,
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

  rebookBooking: async (id) => {
    const existing = await bookingsService.getBooking(id);
    throw new Error(`Rebooking reservation ${existing.id} requires a new date and time`);
  },

  exportBookings: async () => {
    throw new Error('Booking export is not available yet');
  },
};

export default bookingsService;
