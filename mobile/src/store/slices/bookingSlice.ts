// ============================================================================
// Booking Slice - Booking State Management
// ============================================================================

// parking-management-system/mobile/src/store/slices/bookingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import bookingService from '../../api/services/booking.service';

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

export interface BookingState {
  bookings: Booking[];
  activeBooking: Booking | null;
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BookingState = {
  bookings: [],
  activeBooking: null,
  selectedBooking: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await bookingService.getBookings(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchActiveBooking = createAsyncThunk(
  'booking/fetchActiveBooking',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getActiveBookings();
      const active = response.bookings?.[0] || null;
      return active;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch active booking');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch booking');
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData: Partial<Booking>, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (
    { bookingId, reason }: { bookingId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      await bookingService.cancelBooking(bookingId, { reason });
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel booking');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'booking/confirmBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      await bookingService.confirmBooking(bookingId);
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to confirm booking');
    }
  }
);

export const extendBooking = createAsyncThunk(
  'booking/extendBooking',
  async (
    { bookingId, additionalHours }: { bookingId: string; additionalHours: number },
    { rejectWithValue }
  ) => {
    try {
      await bookingService.extendBooking(bookingId, { additionalHours });
      return { bookingId, additionalHours };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to extend booking');
    }
  }
);

export const checkIn = createAsyncThunk(
  'booking/checkIn',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      await bookingService.checkInBooking(bookingId);
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'booking/checkOut',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      await bookingService.checkOutBooking(bookingId);
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check out');
    }
  }
);

// Booking slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    updateBookingStatus: (
      state,
      action: PayloadAction<{ bookingId: string; status: Booking['status'] }>
    ) => {
      const { bookingId, status } = action.payload;
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (booking) {
        booking.status = status;
      }
      if (state.activeBooking?.id === bookingId) {
        state.activeBooking.status = status;
      }
      if (state.selectedBooking?.id === bookingId) {
        state.selectedBooking.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch bookings
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch active booking
      .addCase(fetchActiveBooking.fulfilled, (state, action) => {
        state.activeBooking = action.payload;
      })
      // Fetch booking by id
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const bookingId = action.payload;
        state.bookings = state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        );
        if (state.activeBooking?.id === bookingId) {
          state.activeBooking = null;
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking.status = 'cancelled';
        }
        state.error = null;
      })
      // Confirm booking
      .addCase(confirmBooking.fulfilled, (state, action) => {
        const bookingId = action.payload;
        state.bookings = state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'confirmed' } : b
        );
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking.status = 'confirmed';
        }
        state.error = null;
      })
      // Check in
      .addCase(checkIn.fulfilled, (state, action) => {
        const bookingId = action.payload;
        state.bookings = state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'active' } : b
        );
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (booking) {
          state.activeBooking = booking;
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking.status = 'active';
        }
        state.error = null;
      })
      // Check out
      .addCase(checkOut.fulfilled, (state, action) => {
        const bookingId = action.payload;
        state.bookings = state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'completed' } : b
        );
        if (state.activeBooking?.id === bookingId) {
          state.activeBooking = null;
        }
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking.status = 'completed';
        }
        state.error = null;
      });
  },
});

export const { clearBookingError, clearSelectedBooking, updateBookingStatus } =
  bookingSlice.actions;

// Selectors
export const selectBookings = (state: { booking: BookingState }) =>
  state.booking.bookings;
export const selectActiveBooking = (state: { booking: BookingState }) =>
  state.booking.activeBooking;
export const selectSelectedBooking = (state: { booking: BookingState }) =>
  state.booking.selectedBooking;
export const selectBookingLoading = (state: { booking: BookingState }) =>
  state.booking.isLoading;
export const selectBookingError = (state: { booking: BookingState }) =>
  state.booking.error;
export const selectBookingPagination = (state: { booking: BookingState }) =>
  state.booking.pagination;

export default bookingSlice.reducer;