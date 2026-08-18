// ============================================================================
// useVehicles Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { vehiclesService } from '../services/vehicles.service';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);

  const fetchVehicles = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesService.getVehicles(params);
      setVehicles(response.items || []);
      setTotal(response.total || 0);
      setStats(response.stats || null);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicle = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesService.getVehicle(id);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to get vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesService.createVehicle(data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesService.updateVehicle(id, data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesService.deleteVehicle(id);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportVehicles = useCallback(async (format) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehiclesService.exportVehicles(format);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to export vehicles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehicles,
    loading,
    error,
    total,
    stats,
    fetchVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    exportVehicles,
  };
};

export default useVehicles;