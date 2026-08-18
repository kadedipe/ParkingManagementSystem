// ============================================================================
// BookingContext - Booking Context Provider
// ============================================================================

// parking-management-system/mobile/src/contexts/BookingContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import bookingService from '../api/services/booking.service';
import websocketService from '../api/services/websocket.service';

export interface Booking {
  id: string;
  parkingLotId: string;
  parkingLotName: string;
  spotId: string;
  spotNumber: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  vehicleId: string;
  vehiclePlate: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

interface BookingContextType {
  bookings: Booking[];
  activeBooking: Booking | null;
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (data: Partial<Booking>) => Promise<Booking>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  extendBooking: (bookingId: string, additionalHours: number) => Promise<void>;
  checkIn: (bookingId: string) => Promise<void>;
  checkOut: (bookingId: string) => Promise<void>;
  getBooking: (bookingId: string) => Promise<Booking>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookings();
      if (isMounted.current) {
        setBookings(response.bookings || []);
        // Find active booking
        const active = response.bookings?.find(
          (b: Booking) => b.status === 'active' || b.status === 'confirmed'
        );
        setActiveBooking(active || null);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to fetch bookings');
        console.error('Error fetching bookings:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Create booking
  const createBooking = useCallback(async (data: Partial<Booking>) => {
    try {
      setLoading(true);
      const response = await bookingService.createBooking(data);
      if (isMounted.current) {
        setBookings((prev) => [response, ...prev]);
        setError(null);
      }
      return response;
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to create booking');
        console.error('Error creating booking:', err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      setLoading(true);
      await bookingService.cancelBooking(bookingId, { reason });
      if (isMounted.current) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
        if (activeBooking?.id === bookingId) {
          setActiveBooking(null);
        }
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to cancel booking');
        console.error('Error cancelling booking:', err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [activeBooking]);

  // Confirm booking
  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      await bookingService.confirmBooking(bookingId);
      if (isMounted.current) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'confirmed' } : b
          )
        );
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to confirm booking');
        console.error('Error confirming booking:', err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Extend booking
  const extendBooking = useCallback(async (bookingId: string, additionalHours: number) => {
    try {
      setLoading(true);
      await bookingService.extendBooking(bookingId, { additionalHours });
      await fetchBookings(); // Refresh bookings
      setError(null);
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to extend booking');
        console.error('Error extending booking:', err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchBookings]);

  // Check in
  const checkIn = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      await bookingService.checkInBooking(bookingId);
      if (isMounted.current) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'active' } : b
          )
        );
        const updated = bookings.find((b) => b.id === bookingId);
        if (updated) {
          setActiveBooking({ ...updated, status: 'active' });
        }
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to check in');
        console.error('Error checking in:', err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [bookings]);

  // Check out
  const checkOut = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      await bookingService.checkOutBooking(bookingId);
      if (isMounted.current) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'completed' } : b
          )
        );
        if (activeBooking?.id === bookingId) {
          setActiveBooking(null);
        }
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to check out');
        console.error('Error checking out:', err);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [activeBooking]);

  // Get booking by ID
  const getBooking = useCallback(async (bookingId: string) => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      return response;
    } catch (err) {
      console.error('Error getting booking:', err);
      throw err;
    }
  }, []);

  // Listen for real-time booking updates
  useEffect(() => {
    const handleBookingUpdate = (payload: any) => {
      if (isMounted.current) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === payload.id ? { ...b, ...payload } : b
          )
        );
        if (activeBooking?.id === payload.id) {
          setActiveBooking({ ...activeBooking, ...payload });
        }
      }
    };

    websocketService.on('booking:update', handleBookingUpdate);

    return () => {
      websocketService.off('booking:update', handleBookingUpdate);
    };
  }, [activeBooking]);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  const contextValue: BookingContextType = {
    bookings,
    activeBooking,
    loading,
    error,
    fetchBookings,
    createBooking,
    cancelBooking,
    confirmBooking,
    extendBooking,
    checkIn,
    checkOut,
    getBooking,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;