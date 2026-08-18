// ============================================================================
// useBookings Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { bookingsService } from '../services/bookings.service';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);

  const fetchBookings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.getBookings(params);
      setBookings(response.items || []);
      setTotal(response.total || 0);
      setStats(response.stats || null);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBooking = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.getBooking(id);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to get booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id, reason) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.cancelBooking(id, reason);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rebookBooking = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.rebookBooking(id);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to rebook');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportBookings = useCallback(async (format) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.exportBookings(format);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to export bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    total,
    stats,
    fetchBookings,
    getBooking,
    cancelBooking,
    rebookBooking,
    exportBookings,
  };
};

export default useBookings;