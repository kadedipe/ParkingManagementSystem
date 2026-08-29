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
    const [parkingMetricsResult, vehiclesResult, stationsResult, chargingSessionsResult] =
      await Promise.allSettled([
        api.get('/parking-sessions/dashboard'),
        api.get('/vehicles', { params: { limit: 100 } }),
        api.get('/charging-stations/'),
        api.get('/charging-sessions/'),
      ]);

    if (parkingMetricsResult.status !== 'fulfilled') {
      throw parkingMetricsResult.reason || new Error('Parking dashboard metrics are unavailable');
    }

    const parking = parkingMetricsResult.value?.data || {};
    const vehicles = fulfilledData(vehiclesResult);
    const stations = fulfilledData(stationsResult);
    const chargingSessions = fulfilledData(chargingSessionsResult);
    const activeCharging = chargingSessions.filter((session) =>
      ['active', 'charging', 'in_progress'].includes(String(session.status).toLowerCase())
    ).length;

    return {
      stats: {
        ...(parking.stats || {}),
        total_vehicles: vehicles.length,
        charging_stations: stations.length,
        active_charging: activeCharging,
        energy_consumed: sum(chargingSessions, (session) => session.energy_consumed_kwh),
      },
      occupancy_data: parking.occupancy_data || [],
      revenue_data: parking.revenue_data || [],
      activity_data: parking.activity_data || [],
      spot_status_data: parking.spot_status_data || [],
      charging_data: stations,
      reservations_data: parking.reservations_data || [],
    };
  },

  getOccupancy: async () => {
    const dashboard = await dashboardService.getDashboard();
    const stats = dashboard.stats || {};
    const total = Number(stats.total_spots || 0);
    const occupied = Number(stats.occupied_spots || 0);
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  },

  getRevenue: async () => {
    const dashboard = await dashboardService.getDashboard();
    return Number(dashboard.stats?.total_revenue || 0);
  },

  getActivity: async ({ limit = 20 } = {}) => {
    const dashboard = await dashboardService.getDashboard();
    const activity = Array.isArray(dashboard.activity_data) ? dashboard.activity_data : [];
    return activity.slice(0, limit);
  },
};

export default dashboardService;
