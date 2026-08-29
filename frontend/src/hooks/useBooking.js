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

  const createBooking = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsService.createBooking(data);
      if (response?.data) {
        setBookings((current) => [response.data, ...current]);
        setTotal((current) => current + 1);
      }
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
      return await bookingsService.getBooking(id);
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
      setBookings((current) => current.map((booking) => (
        booking.id === id ? response : booking
      )));
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
      return await bookingsService.rebookBooking(id);
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
      return await bookingsService.exportBookings(format);
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
    createBooking,
    fetchBookings,
    getBooking,
    cancelBooking,
    rebookBooking,
    exportBookings,
  };
};

export const useBooking = useBookings;

export default useBookings;
