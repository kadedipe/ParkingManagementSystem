// ============================================================================
// Parking Slice
// ============================================================================

/**
 * Parking slice for managing parking-related state.
 * 
 * This slice provides:
 * - Parking spot management
 * - Parking session management
 * - Reservation management
 * - Filter and search state
 * - Real-time updates
 * - Loading and error states
 * - Pagination
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { parkingService } from '../../services/parking.service';

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  // Spots
  spots: [],
  selectedSpot: null,
  totalSpots: 0,
  
  // Sessions
  activeSessions: [],
  sessionHistory: [],
  currentSession: null,
  
  // Reservations
  reservations: [],
  upcomingReservations: [],
  
  // Filters
  filters: {
    search: '',
    spotTypes: [],
    statuses: ['available'],
    accessLevels: [],
    minPrice: 0,
    maxPrice: 100,
    radius: 5,
    latitude: null,
    longitude: null,
    sortBy: 'distance',
    sortOrder: 'asc',
  },
  
  // UI State
  viewMode: 'list',
  page: 1,
  pageSize: 20,
  total: 0,
  
  // Status
  loading: false,
  error: null,
  isRefreshing: false,
  lastUpdated: null,
  wsConnected: false,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Fetch parking spots
 */
export const fetchSpots = createAsyncThunk(
  'parking/fetchSpots',
  async (params, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const filters = state.parking.filters;
      const page = state.parking.page;
      const pageSize = state.parking.pageSize;
      
      const response = await parkingService.getSpots({
        ...filters,
        ...params,
        page,
        limit: pageSize,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch parking spots');
    }
  }
);

/**
 * Fetch single parking spot
 */
export const fetchSpot = createAsyncThunk(
  'parking/fetchSpot',
  async (id, { rejectWithValue }) => {
    try {
      const response = await parkingService.getSpot(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch parking spot');
    }
  }
);

/**
 * Create parking spot
 */
export const createSpot = createAsyncThunk(
  'parking/createSpot',
  async (data, { rejectWithValue }) => {
    try {
      const response = await parkingService.createSpot(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create parking spot');
    }
  }
);

/**
 * Update parking spot
 */
export const updateSpot = createAsyncThunk(
  'parking/updateSpot',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await parkingService.updateSpot(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update parking spot');
    }
  }
);

/**
 * Delete parking spot
 */
export const deleteSpot = createAsyncThunk(
  'parking/deleteSpot',
  async (id, { rejectWithValue }) => {
    try {
      await parkingService.deleteSpot(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete parking spot');
    }
  }
);

/**
 * Start parking session
 */
export const startParkingSession = createAsyncThunk(
  'parking/startSession',
  async (data, { rejectWithValue }) => {
    try {
      const response = await parkingService.startSession(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start parking session');
    }
  }
);

/**
 * End parking session
 */
export const endParkingSession = createAsyncThunk(
  'parking/endSession',
  async (id, { rejectWithValue }) => {
    try {
      const response = await parkingService.endSession(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to end parking session');
    }
  }
);

/**
 * Fetch active sessions
 */
export const fetchActiveSessions = createAsyncThunk(
  'parking/fetchActiveSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await parkingService.getActiveSessions();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch active sessions');
    }
  }
);

/**
 * Fetch session history
 */
export const fetchSessionHistory = createAsyncThunk(
  'parking/fetchSessionHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await parkingService.getSessionHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch session history');
    }
  }
);

/**
 * Create reservation
 */
export const createReservation = createAsyncThunk(
  'parking/createReservation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await parkingService.createReservation(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create reservation');
    }
  }
);

/**
 * Cancel reservation
 */
export const cancelReservation = createAsyncThunk(
  'parking/cancelReservation',
  async (id, { rejectWithValue }) => {
    try {
      await parkingService.cancelReservation(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel reservation');
    }
  }
);

/**
 * Fetch reservations
 */
export const fetchReservations = createAsyncThunk(
  'parking/fetchReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await parkingService.getReservations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reservations');
    }
  }
);

/**
 * Fetch upcoming reservations
 */
export const fetchUpcomingReservations = createAsyncThunk(
  'parking/fetchUpcomingReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await parkingService.getUpcomingReservations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch upcoming reservations');
    }
  }
);

// ============================================================================
// Parking Slice
// ============================================================================

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    // Spot actions
    setSelectedSpot: (state, action) => {
      state.selectedSpot = action.payload;
    },
    clearSelectedSpot: (state) => {
      state.selectedSpot = null;
    },
    clearSpots: (state) => {
      state.spots = [];
      state.totalSpots = 0;
    },
    
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset page when filters change
    },
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    
    // UI actions
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setTotal: (state, action) => {
      state.total = action.payload;
    },
    
    // Real-time update actions
    handleRealTimeUpdate: (state, action) => {
      const { type, data } = action.payload;
      
      switch (type) {
        case 'spot_updated':
          const spotIndex = state.spots.findIndex(s => s.id === data.id);
          if (spotIndex !== -1) {
            state.spots[spotIndex] = { ...state.spots[spotIndex], ...data };
          }
          if (state.selectedSpot?.id === data.id) {
            state.selectedSpot = { ...state.selectedSpot, ...data };
          }
          break;
          
        case 'spot_added':
          state.spots = [data, ...state.spots];
          state.totalSpots += 1;
          break;
          
        case 'spot_removed':
          state.spots = state.spots.filter(s => s.id !== data);
          state.totalSpots -= 1;
          if (state.selectedSpot?.id === data) {
            state.selectedSpot = null;
          }
          break;
          
        case 'session_started':
          state.activeSessions = [data, ...state.activeSessions];
          state.currentSession = data;
          break;
          
        case 'session_ended':
          state.activeSessions = state.activeSessions.filter(s => s.id !== data.id);
          state.sessionHistory = [data, ...state.sessionHistory];
          if (state.currentSession?.id === data.id) {
            state.currentSession = null;
          }
          break;
          
        case 'reservation_created':
          state.reservations = [data, ...state.reservations];
          state.upcomingReservations = [data, ...state.upcomingReservations];
          break;
          
        case 'reservation_updated':
          state.reservations = state.reservations.map(r =>
            r.id === data.id ? { ...r, ...data } : r
          );
          state.upcomingReservations = state.upcomingReservations.map(r =>
            r.id === data.id ? { ...r, ...data } : r
          );
          break;
          
        case 'reservation_cancelled':
          state.reservations = state.reservations.filter(r => r.id !== data);
          state.upcomingReservations = state.upcomingReservations.filter(r => r.id !== data);
          break;
          
        default:
          break;
      }
    },
    
    // WebSocket status
    setWsConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
    
    // Error actions
    clearError: (state) => {
      state.error = null;
    },
    
    // Refresh state
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    
    // Last updated
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // ======================================================================
      // Fetch Spots
      // ======================================================================
      .addCase(fetchSpots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpots.fulfilled, (state, action) => {
        state.loading = false;
        state.spots = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.totalSpots = action.payload.total || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSpots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ======================================================================
      // Fetch Single Spot
      // ======================================================================
      .addCase(fetchSpot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpot.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSpot = action.payload;
      })
      .addCase(fetchSpot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ======================================================================
      // Create Spot
      // ======================================================================
      .addCase(createSpot.fulfilled, (state, action) => {
        state.spots = [action.payload, ...state.spots];
        state.totalSpots += 1;
      })
      
      // ======================================================================
      // Update Spot
      // ======================================================================
      .addCase(updateSpot.fulfilled, (state, action) => {
        const index = state.spots.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.spots[index] = action.payload;
        }
        if (state.selectedSpot?.id === action.payload.id) {
          state.selectedSpot = action.payload;
        }
      })
      
      // ======================================================================
      // Delete Spot
      // ======================================================================
      .addCase(deleteSpot.fulfilled, (state, action) => {
        state.spots = state.spots.filter(s => s.id !== action.payload);
        state.totalSpots -= 1;
        if (state.selectedSpot?.id === action.payload) {
          state.selectedSpot = null;
        }
      })
      
      // ======================================================================
      // Start Session
      // ======================================================================
      .addCase(startParkingSession.fulfilled, (state, action) => {
        state.activeSessions = [action.payload, ...state.activeSessions];
        state.currentSession = action.payload;
      })
      
      // ======================================================================
      // End Session
      // ======================================================================
      .addCase(endParkingSession.fulfilled, (state, action) => {
        state.activeSessions = state.activeSessions.filter(s => s.id !== action.payload.id);
        state.sessionHistory = [action.payload, ...state.sessionHistory];
        if (state.currentSession?.id === action.payload.id) {
          state.currentSession = null;
        }
      })
      
      // ======================================================================
      // Fetch Active Sessions
      // ======================================================================
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.activeSessions = action.payload || [];
      })
      
      // ======================================================================
      // Fetch Session History
      // ======================================================================
      .addCase(fetchSessionHistory.fulfilled, (state, action) => {
        state.sessionHistory = action.payload || [];
      })
      
      // ======================================================================
      // Create Reservation
      // ======================================================================
      .addCase(createReservation.fulfilled, (state, action) => {
        state.reservations = [action.payload, ...state.reservations];
        state.upcomingReservations = [action.payload, ...state.upcomingReservations];
      })
      
      // ======================================================================
      // Cancel Reservation
      // ======================================================================
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.reservations = state.reservations.filter(r => r.id !== action.payload);
        state.upcomingReservations = state.upcomingReservations.filter(r => r.id !== action.payload);
      })
      
      // ======================================================================
      // Fetch Reservations
      // ======================================================================
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.reservations = action.payload || [];
      })
      
      // ======================================================================
      // Fetch Upcoming Reservations
      // ======================================================================
      .addCase(fetchUpcomingReservations.fulfilled, (state, action) => {
        state.upcomingReservations = action.payload || [];
      });
  },
});

// ============================================================================
// Actions
// ============================================================================

export const {
  setSelectedSpot,
  clearSelectedSpot,
  clearSpots,
  setFilters,
  updateFilter,
  clearFilters,
  resetFilters,
  setViewMode,
  setPage,
  setPageSize,
  setTotal,
  handleRealTimeUpdate,
  setWsConnected,
  clearError,
  setRefreshing,
  setLastUpdated,
} = parkingSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectParking = (state) => state.parking;
export const selectSpots = (state) => state.parking.spots;
export const selectSelectedSpot = (state) => state.parking.selectedSpot;
export const selectTotalSpots = (state) => state.parking.totalSpots;
export const selectActiveSessions = (state) => state.parking.activeSessions;
export const selectSessionHistory = (state) => state.parking.sessionHistory;
export const selectCurrentSession = (state) => state.parking.currentSession;
export const selectReservations = (state) => state.parking.reservations;
export const selectUpcomingReservations = (state) => state.parking.upcomingReservations;
export const selectParkingFilters = (state) => state.parking.filters;
export const selectParkingViewMode = (state) => state.parking.viewMode;
export const selectParkingPage = (state) => state.parking.page;
export const selectParkingPageSize = (state) => state.parking.pageSize;
export const selectParkingTotal = (state) => state.parking.total;
export const selectParkingLoading = (state) => state.parking.loading;
export const selectParkingError = (state) => state.parking.error;
export const selectParkingRefreshing = (state) => state.parking.isRefreshing;
export const selectParkingLastUpdated = (state) => state.parking.lastUpdated;
export const selectParkingWsConnected = (state) => state.parking.wsConnected;

/**
 * Select filtered spots based on current filters
 */
export const selectFilteredSpots = (state) => {
  const { spots, filters } = state.parking;
  let filtered = [...spots];
  
  // Filter by search
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(spot =>
      spot.spot_number?.toLowerCase().includes(search) ||
      spot.location?.address?.toLowerCase().includes(search)
    );
  }
  
  // Filter by spot types
  if (filters.spotTypes.length > 0) {
    filtered = filtered.filter(spot =>
      filters.spotTypes.includes(spot.spot_type)
    );
  }
  
  // Filter by statuses
  if (filters.statuses.length > 0) {
    filtered = filtered.filter(spot =>
      filters.statuses.includes(spot.status)
    );
  }
  
  // Filter by price range
  filtered = filtered.filter(spot =>
    (spot.price || 0) >= filters.minPrice &&
    (spot.price || 0) <= filters.maxPrice
  );
  
  return filtered;
};

/**
 * Select available spots
 */
export const selectAvailableSpots = (state) => {
  return state.parking.spots.filter(spot => spot.status === 'available');
};

/**
 * Select occupied spots
 */
export const selectOccupiedSpots = (state) => {
  return state.parking.spots.filter(spot => spot.status === 'occupied');
};

/**
 * Select spots by type
 */
export const selectSpotsByType = (state, type) => {
  return state.parking.spots.filter(spot => spot.spot_type === type);
};

// ============================================================================
// Export
// ============================================================================

export default parkingSlice.reducer;