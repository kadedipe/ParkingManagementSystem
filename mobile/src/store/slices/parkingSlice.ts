// ============================================================================
// Parking Slice - Parking State Management
// ============================================================================

// parking-management-system/mobile/src/store/slices/parkingSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import parkingService from '../../api/services/parking.service';

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
  phone?: string;
  openingHours?: any;
}

export interface ParkingState {
  parkingLots: ParkingLot[];
  selectedParking: ParkingLot | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    amenities: string[];
    minRating: number;
    maxPrice: number;
    sortBy: 'distance' | 'price' | 'rating' | 'availability';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ParkingState = {
  parkingLots: [],
  selectedParking: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    amenities: [],
    minRating: 0,
    maxPrice: 50,
    sortBy: 'distance',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchParkingLots = createAsyncThunk(
  'parking/fetchParkingLots',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      amenities?: string[];
      minRating?: number;
      maxPrice?: number;
      sortBy?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await parkingService.getParkingLots(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch parking lots');
    }
  }
);

export const fetchParkingById = createAsyncThunk(
  'parking/fetchParkingById',
  async (parkingId: string, { rejectWithValue }) => {
    try {
      const response = await parkingService.getParkingLotById(parkingId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch parking details');
    }
  }
);

export const searchParking = createAsyncThunk(
  'parking/searchParking',
  async (
    query: string,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { parking: ParkingState };
      const { filters } = state.parking;
      const response = await parkingService.searchParkingLots({
        query,
        ...filters,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const fetchNearbyParking = createAsyncThunk(
  'parking/fetchNearbyParking',
  async (
    params: { latitude: number; longitude: number; radius?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await parkingService.getNearbyParkingLots(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch nearby parking');
    }
  }
);

// Parking slice
const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    clearParkingError: (state) => {
      state.error = null;
    },
    clearSelectedParking: (state) => {
      state.selectedParking = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ParkingState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateParkingLot: (state, action: PayloadAction<Partial<ParkingLot>>) => {
      const { id, ...updates } = action.payload;
      const index = state.parkingLots.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.parkingLots[index] = { ...state.parkingLots[index], ...updates };
      }
      if (state.selectedParking?.id === id) {
        state.selectedParking = { ...state.selectedParking, ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch parking lots
      .addCase(fetchParkingLots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchParkingLots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingLots = action.payload.lots || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchParkingLots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch parking by id
      .addCase(fetchParkingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchParkingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedParking = action.payload;
        state.error = null;
      })
      .addCase(fetchParkingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search parking
      .addCase(searchParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchParking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingLots = action.payload.lots || [];
        state.error = null;
      })
      .addCase(searchParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch nearby parking
      .addCase(fetchNearbyParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyParking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingLots = action.payload.lots || [];
        state.error = null;
      })
      .addCase(fetchNearbyParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearParkingError,
  clearSelectedParking,
  setFilters,
  resetFilters,
  updateParkingLot,
} = parkingSlice.actions;

// Selectors
export const selectParkingLots = (state: { parking: ParkingState }) =>
  state.parking.parkingLots;
export const selectSelectedParking = (state: { parking: ParkingState }) =>
  state.parking.selectedParking;
export const selectParkingLoading = (state: { parking: ParkingState }) =>
  state.parking.isLoading;
export const selectParkingError = (state: { parking: ParkingState }) =>
  state.parking.error;
export const selectParkingFilters = (state: { parking: ParkingState }) =>
  state.parking.filters;

export default parkingSlice.reducer;