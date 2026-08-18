// ============================================================================
// useBooking Hook - Booking Management Hook
// ============================================================================

// parking-management-system/mobile/src/hooks/useBooking.ts

import { useState, useCallback, useEffect } from 'react';
import { useBooking as useBookingContext } from '../contexts/BookingContext';
import { Alert } from 'react-native';
import { format, differenceInHours, addHours } from 'date-fns';

export const useBooking = () => {
  const bookingContext = useBookingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create booking with validation
  const createBooking = useCallback(
    async (data: {
      parkingLotId: string;
      spotId: string;
      startTime: Date;
      endTime: Date;
      vehicleId: string;
    }) => {
      // Validation
      if (!data.parkingLotId || !data.spotId || !data.vehicleId) {
        Alert.alert('Error', 'Please fill in all required fields');
        return null;
      }

      if (data.startTime >= data.endTime) {
        Alert.alert('Error', 'End time must be after start time');
        return null;
      }

      const hours = differenceInHours(data.endTime, data.startTime);
      if (hours < 1) {
        Alert.alert('Error', 'Minimum booking duration is 1 hour');
        return null;
      }

      setIsLoading(true);
      try {
        const booking = await bookingContext.createBooking({
          ...data,
          startTime: data.startTime.toISOString(),
          endTime: data.endTime.toISOString(),
        });
        Alert.alert('Success', 'Booking created successfully');
        return booking;
      } catch (err: any) {
        const message = err.message || 'Failed to create booking';
        setError(message);
        Alert.alert('Error', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [bookingContext]
  );

  // Cancel booking with confirmation
  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string) => {
      return new Promise((resolve) => {
        Alert.alert(
          'Cancel Booking',
          'Are you sure you want to cancel this booking?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: async () => {
                setIsLoading(true);
                try {
                  await bookingContext.cancelBooking(bookingId, reason);
                  Alert.alert('Success', 'Booking cancelled successfully');
                  resolve(true);
                } catch (err: any) {
                  const message = err.message || 'Failed to cancel booking';
                  Alert.alert('Error', message);
                  resolve(false);
                } finally {
                  setIsLoading(false);
                }
              },
            },
          ],
          { cancelable: true }
        );
      });
    },
    [bookingContext]
  );

  // Extend booking
  const extendBooking = useCallback(
    async (bookingId: string, additionalHours: number) => {
      if (additionalHours < 1) {
        Alert.alert('Error', 'Must extend by at least 1 hour');
        return false;
      }

      setIsLoading(true);
      try {
        await bookingContext.extendBooking(bookingId, additionalHours);
        Alert.alert('Success', `Booking extended by ${additionalHours} hours`);
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to extend booking';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [bookingContext]
  );

  // Check in
  const checkIn = useCallback(
    async (bookingId: string) => {
      setIsLoading(true);
      try {
        await bookingContext.checkIn(bookingId);
        Alert.alert('Success', 'Checked in successfully');
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to check in';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [bookingContext]
  );

  // Check out
  const checkOut = useCallback(
    async (bookingId: string) => {
      setIsLoading(true);
      try {
        await bookingContext.checkOut(bookingId);
        Alert.alert('Success', 'Checked out successfully');
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to check out';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [bookingContext]
  );

  // Get bookings by status
  const getBookingsByStatus = useCallback(
    (status: string) => {
      return bookingContext.bookings.filter((b) => b.status === status);
    },
    [bookingContext.bookings]
  );

  // Get upcoming bookings
  const getUpcomingBookings = useCallback(() => {
    const now = new Date();
    return bookingContext.bookings.filter(
      (b) =>
        new Date(b.startTime) > now &&
        (b.status === 'confirmed' || b.status === 'pending')
    );
  }, [bookingContext.bookings]);

  // Get active bookings
  const getActiveBookings = useCallback(() => {
    return bookingContext.bookings.filter((b) => b.status === 'active');
  }, [bookingContext.bookings]);

  // Get completed bookings
  const getCompletedBookings = useCallback(() => {
    return bookingContext.bookings.filter((b) => b.status === 'completed');
  }, [bookingContext.bookings]);

  // Get cancelled bookings
  const getCancelledBookings = useCallback(() => {
    return bookingContext.bookings.filter((b) => b.status === 'cancelled');
  }, [bookingContext.bookings]);

  // Check if booking is active
  const isBookingActive = useCallback(
    (bookingId: string) => {
      const booking = bookingContext.bookings.find((b) => b.id === bookingId);
      return booking?.status === 'active';
    },
    [bookingContext.bookings]
  );

  // Check if booking is cancellable
  const isBookingCancellable = useCallback(
    (bookingId: string) => {
      const booking = bookingContext.bookings.find((b) => b.id === bookingId);
      if (!booking) return false;
      return ['pending', 'confirmed'].includes(booking.status);
    },
    [bookingContext.bookings]
  );

  // Get booking duration in hours
  const getBookingDuration = useCallback(
    (bookingId: string) => {
      const booking = bookingContext.bookings.find((b) => b.id === bookingId);
      if (!booking) return 0;
      return differenceInHours(
        new Date(booking.endTime),
        new Date(booking.startTime)
      );
    },
    [bookingContext.bookings]
  );

  // Format booking time
  const formatBookingTime = useCallback(
    (bookingId: string) => {
      const booking = bookingContext.bookings.find((b) => b.id === bookingId);
      if (!booking) return '';
      return `${format(
        new Date(booking.startTime),
        'MMM d, h:mm a'
      )} - ${format(new Date(booking.endTime), 'h:mm a')}`;
    },
    [bookingContext.bookings]
  );

  return {
    ...bookingContext,
    createBooking,
    cancelBooking,
    extendBooking,
    checkIn,
    checkOut,
    getBookingsByStatus,
    getUpcomingBookings,
    getActiveBookings,
    getCompletedBookings,
    getCancelledBookings,
    isBookingActive,
    isBookingCancellable,
    getBookingDuration,
    formatBookingTime,
    isLoading,
    error,
  };
};

export default useBooking;