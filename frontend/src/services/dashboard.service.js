// ============================================================================
// Dashboard Service
// ============================================================================

import api from './api';

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const fulfilledData = (result) =>
  result.status === 'fulfilled' ? asArray(result.value?.data) : [];

const sum = (items, selector) =>
  items.reduce((total, item) => total + Number(selector(item) || 0), 0);

export const dashboardService = {
  getDashboard: async () => {
    const [lotsResult, reservationsResult, vehiclesResult, stationsResult, sessionsResult] =
      await Promise.allSettled([
        api.get('/parking-lots/', { params: { limit: 100 } }),
        api.get('/reservations/', { params: { limit: 100 } }),
        api.get('/vehicles', { params: { limit: 100 } }),
        api.get('/charging-stations/'),
        api.get('/charging-sessions/'),
      ]);

    const lots = fulfilledData(lotsResult);
    const reservations = fulfilledData(reservationsResult);
    const vehicles = fulfilledData(vehiclesResult);
    const stations = fulfilledData(stationsResult);
    const sessions = fulfilledData(sessionsResult);

    const totalSpots = sum(lots, (lot) => lot.total_spots);
    const availableSpots = sum(lots, (lot) => lot.available_spots);
    const activeReservations = reservations.filter((reservation) =>
      ['active', 'confirmed', 'pending'].includes(String(reservation.status).toLowerCase())
    ).length;
    const activeCharging = sessions.filter((session) =>
      ['active', 'charging', 'in_progress'].includes(String(session.status).toLowerCase())
    ).length;

    return {
      stats: {
        total_spots: totalSpots,
        available_spots: availableSpots,
        occupied_spots: Math.max(0, totalSpots - availableSpots),
        total_vehicles: vehicles.length,
        active_reservations: activeReservations,
        active_sessions: activeReservations,
        today_sessions: 0,
        avg_duration: 0,
        total_revenue: sum(reservations, (reservation) => reservation.total_price),
        weekly_revenue: 0,
        revenue_growth: 0,
        charging_stations: stations.length,
        active_charging: activeCharging,
        energy_consumed: sum(sessions, (session) => session.energy_consumed_kwh),
      },
      occupancy_data: [],
      revenue_data: [],
      activity_data: [],
      spot_status_data: [],
      charging_data: stations,
      reservations_data: reservations.slice(0, 10),
    };
  },
};

export default dashboardService;
