// ============================================================================
// useDashboard Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [occupancyData, setOccupancyData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [spotStatusData, setSpotStatusData] = useState([]);
  const [chargingData, setChargingData] = useState([]);
  const [reservationsData, setReservationsData] = useState([]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getDashboard();
      
      setStats(response.stats);
      setOccupancyData(response.occupancy_data || []);
      setRevenueData(response.revenue_data || []);
      setActivityData(response.activity_data || []);
      setSpotStatusData(response.spot_status_data || []);
      setChargingData(response.charging_data || []);
      setReservationsData(response.reservations_data || []);
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchDashboard,
    occupancyData,
    revenueData,
    activityData,
    spotStatusData,
    chargingData,
    reservationsData,
  };
};

export default useDashboard;