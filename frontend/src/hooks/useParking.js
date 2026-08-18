// ============================================================================
// useParking Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { parkingService } from '../services/parking.service';

export const useParking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const searchParking = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await parkingService.search(params);
      setData(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to search parking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getParkingSpot = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await parkingService.getById(id);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to get parking spot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reserveSpot = useCallback(async (spotId, reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await parkingService.reserve(spotId, reservationData);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to reserve spot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    searchParking,
    getParkingSpot,
    reserveSpot,
  };
};

export default useParking;