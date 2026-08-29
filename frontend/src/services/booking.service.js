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
    if (Number.isNaN(start.getTime())) throw new Error('Invalid booking date or time');

    const durationHours = Number(booking.duration || 1);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    const createResponse = await api.instance.post('/reservations/', {
      parking_spot_id: booking.spot_id,
      vehicle_id: booking.vehicle_id || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    const created = createResponse.data;
    const confirmResponse = await api.instance.post(`/reservations/${created.id}/confirm`);
    const reservation = normalizeReservation(confirmResponse.data);

    let payment = null;
    let paymentWarning = null;
    try {
      const paymentResponse = await api.instance.post('/payments/', {
        reservation_id: reservation.id,
        payment_method: booking.payment_method || 'credit_card',
        currency: 'USD',
      });
      payment = paymentResponse.data;

      // The built-in local provider is transactional and needs no external
      // credentials, so complete it immediately. External providers keep the
      // payment pending until their tokenized checkout is completed.
      if (payment?.provider === 'local' && payment?.status !== 'completed') {
        payment = (await api.instance.post(`/payments/${payment.id}/process`, {})).data;
      } else if (payment?.status !== 'completed') {
        paymentWarning = 'Reservation confirmed. Complete payment from the Payments page.';
      }
    } catch (paymentError) {
      paymentWarning = paymentError?.message || 'Reservation confirmed, but payment setup is temporarily unavailable.';
    }

    return {
      success: true,
      data: { ...reservation, payment },
      payment,
      payment_warning: paymentWarning,
      message: paymentWarning
        ? 'Reservation confirmed. Payment needs attention.'
        : 'Reservation and payment completed successfully',
    };
  },

  getBookings: async (params) => {
    const response = await api.get('/reservations/', { params });
    const items = Array.isArray(response.data) ? response.data.map(normalizeReservation) : [];
    return { items, total: items.length, stats: buildStats(items) };
  },

  getBooking: async (id) => normalizeReservation((await api.get(`/reservations/${id}`)).data),
  cancelBooking: async (id) => normalizeReservation((await api.instance.post(`/reservations/${id}/cancel`)).data),
  startParking: async (reservationId) => (await api.instance.post('/parking-sessions/start', { reservation_id: reservationId })).data,

  endParking: async (reservationId) => {
    const sessionsResponse = await api.get('/parking-sessions/', { params: { active_only: true, limit: 100 } });
    const activeSession = (Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [])
      .find((session) => session.reservation_id === reservationId);
    if (!activeSession) throw new Error('No active parking session was found for this reservation');
    return (await api.instance.post(`/parking-sessions/${activeSession.id}/end`, {})).data;
  },

  rebookBooking: async (id) => {
    const existing = await bookingsService.getBooking(id);
    throw new Error(`Rebooking reservation ${existing.id} requires a new date and time`);
  },

  exportBookings: async () => { throw new Error('Booking export is not available yet'); },
};

export default bookingsService;
