// ============================================================================
// Parking Context
// ============================================================================

/**
 * Parking Context for managing parking-related state and operations.
 * 
 * This context provides:
 * - Parking spot management
 * - Real-time availability updates
 * - Parking session management
 * - Reservation management
 * - Filter and search state
 * - Loading and error states
 * - WebSocket integration for real-time updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { parkingService } from '../services/parking.service';
import { useWebSocket } from '../hooks/useWebSocket';
import { config } from '../config';

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  // Parking spots
  spots: [],
  selectedSpot: null,
  totalSpots: 0,
  
  // Parking sessions
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
};

// ============================================================================
// Action Types
// ============================================================================

const ActionTypes = {
  // Spots
  SET_SPOTS: 'SET_SPOTS',
  SET_SELECTED_SPOT: 'SET_SELECTED_SPOT',
  UPDATE_SPOT: 'UPDATE_SPOT',
  ADD_SPOT: 'ADD_SPOT',
  REMOVE_SPOT: 'REMOVE_SPOT',
  CLEAR_SPOTS: 'CLEAR_SPOTS',
  
  // Sessions
  SET_ACTIVE_SESSIONS: 'SET_ACTIVE_SESSIONS',
  SET_SESSION_HISTORY: 'SET_SESSION_HISTORY',
  SET_CURRENT_SESSION: 'SET_CURRENT_SESSION',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  
  // Reservations
  SET_RESERVATIONS: 'SET_RESERVATIONS',
  SET_UPCOMING_RESERVATIONS: 'SET_UPCOMING_RESERVATIONS',
  ADD_RESERVATION: 'ADD_RESERVATION',
  UPDATE_RESERVATION: 'UPDATE_RESERVATION',
  REMOVE_RESERVATION: 'REMOVE_RESERVATION',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_FILTER: 'UPDATE_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // UI
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_PAGE: 'SET_PAGE',
  SET_PAGE_SIZE: 'SET_PAGE_SIZE',
  SET_TOTAL: 'SET_TOTAL',
  
  // Status
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_REFRESHING: 'SET_REFRESHING',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Real-time updates
  HANDLE_REAL_TIME_UPDATE: 'HANDLE_REAL_TIME_UPDATE',
};

// ============================================================================
// Reducer
// ============================================================================

const parkingReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_SPOTS:
      return {
        ...state,
        spots: action.payload,
        totalSpots: action.payload.length,
        lastUpdated: new Date(),
      };
      
    case ActionTypes.SET_SELECTED_SPOT:
      return {
        ...state,
        selectedSpot: action.payload,
      };
      
    case ActionTypes.UPDATE_SPOT:
      return {
        ...state,
        spots: state.spots.map(spot =>
          spot.id === action.payload.id ? action.payload : spot
        ),
        selectedSpot: state.selectedSpot?.id === action.payload.id
          ? action.payload
          : state.selectedSpot,
      };
      
    case ActionTypes.ADD_SPOT:
      return {
        ...state,
        spots: [action.payload, ...state.spots],
        totalSpots: state.totalSpots + 1,
      };
      
    case ActionTypes.REMOVE_SPOT:
      return {
        ...state,
        spots: state.spots.filter(spot => spot.id !== action.payload),
        totalSpots: state.totalSpots - 1,
        selectedSpot: state.selectedSpot?.id === action.payload
          ? null
          : state.selectedSpot,
      };
      
    case ActionTypes.SET_ACTIVE_SESSIONS:
      return {
        ...state,
        activeSessions: action.payload,
      };
      
    case ActionTypes.SET_SESSION_HISTORY:
      return {
        ...state,
        sessionHistory: action.payload,
      };
      
    case ActionTypes.SET_CURRENT_SESSION:
      return {
        ...state,
        currentSession: action.payload,
      };
      
    case ActionTypes.ADD_SESSION:
      return {
        ...state,
        activeSessions: [action.payload, ...state.activeSessions],
        sessionHistory: [action.payload, ...state.sessionHistory],
      };
      
    case ActionTypes.UPDATE_SESSION:
      return {
        ...state,
        activeSessions: state.activeSessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        sessionHistory: state.sessionHistory.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        currentSession: state.currentSession?.id === action.payload.id
          ? action.payload
          : state.currentSession,
      };
      
    case ActionTypes.SET_RESERVATIONS:
      return {
        ...state,
        reservations: action.payload,
      };
      
    case ActionTypes.SET_UPCOMING_RESERVATIONS:
      return {
        ...state,
        upcomingReservations: action.payload,
      };
      
    case ActionTypes.ADD_RESERVATION:
      return {
        ...state,
        reservations: [action.payload, ...state.reservations],
        upcomingReservations: [action.payload, ...state.upcomingReservations],
      };
      
    case ActionTypes.UPDATE_RESERVATION:
      return {
        ...state,
        reservations: state.reservations.map(res =>
          res.id === action.payload.id ? action.payload : res
        ),
        upcomingReservations: state.upcomingReservations.map(res =>
          res.id === action.payload.id ? action.payload : res
        ),
      };
      
    case ActionTypes.REMOVE_RESERVATION:
      return {
        ...state,
        reservations: state.reservations.filter(res => res.id !== action.payload),
        upcomingReservations: state.upcomingReservations.filter(res => res.id !== action.payload),
      };
      
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: action.payload,
      };
      
    case ActionTypes.UPDATE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case ActionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };
      
    case ActionTypes.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };
      
    case ActionTypes.SET_PAGE:
      return {
        ...state,
        page: action.payload,
      };
      
    case ActionTypes.SET_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.payload,
        page: 1,
      };
      
    case ActionTypes.SET_TOTAL:
      return {
        ...state,
        total: action.payload,
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case ActionTypes.SET_REFRESHING:
      return {
        ...state,
        isRefreshing: action.payload,
      };
      
    case ActionTypes.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload,
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case ActionTypes.CLEAR_SPOTS:
      return {
        ...state,
        spots: [],
        totalSpots: 0,
        selectedSpot: null,
      };
      
    case ActionTypes.HANDLE_REAL_TIME_UPDATE:
      return handleRealTimeUpdate(state, action.payload);
      
    default:
      return state;
  }
};

// ============================================================================
// Real-time Update Handler
// ============================================================================

const handleRealTimeUpdate = (state, update) => {
  switch (update.type) {
    case 'spot_updated':
      return {
        ...state,
        spots: state.spots.map(spot =>
          spot.id === update.data.id ? { ...spot, ...update.data } : spot
        ),
        selectedSpot: state.selectedSpot?.id === update.data.id
          ? { ...state.selectedSpot, ...update.data }
          : state.selectedSpot,
      };
      
    case 'spot_added':
      return {
        ...state,
        spots: [update.data, ...state.spots],
        totalSpots: state.totalSpots + 1,
      };
      
    case 'spot_removed':
      return {
        ...state,
        spots: state.spots.filter(spot => spot.id !== update.data),
        totalSpots: state.totalSpots - 1,
      };
      
    case 'session_started':
      return {
        ...state,
        activeSessions: [update.data, ...state.activeSessions],
        currentSession: update.data,
      };
      
    case 'session_ended':
      return {
        ...state,
        activeSessions: state.activeSessions.filter(s => s.id !== update.data.id),
        sessionHistory: [update.data, ...state.sessionHistory],
        currentSession: state.currentSession?.id === update.data.id
          ? null
          : state.currentSession,
      };
      
    case 'reservation_created':
      return {
        ...state,
        reservations: [update.data, ...state.reservations],
        upcomingReservations: [update.data, ...state.upcomingReservations],
      };
      
    case 'reservation_updated':
      return {
        ...state,
        reservations: state.reservations.map(res =>
          res.id === update.data.id ? { ...res, ...update.data } : res
        ),
        upcomingReservations: state.upcomingReservations.map(res =>
          res.id === update.data.id ? { ...res, ...update.data } : res
        ),
      };
      
    default:
      return state;
  }
};

// ============================================================================
// Context Provider
// ============================================================================

const ParkingContext = createContext(null);

export const ParkingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(parkingReducer, initialState);
  const [wsStatus, setWsStatus] = useState('disconnected');

  // ==========================================================================
  // WebSocket Integration
  // ==========================================================================

  const ws = useWebSocket({
    url: config.websocket.url,
    onMessage: (data) => {
      // Handle real-time parking updates
      if (data.type?.startsWith('parking_')) {
        dispatch({
          type: ActionTypes.HANDLE_REAL_TIME_UPDATE,
          payload: data,
        });
        setWsStatus('connected');
      }
    },
    onOpen: () => setWsStatus('connected'),
    onClose: () => setWsStatus('disconnected'),
    onError: () => setWsStatus('error'),
    onReconnect: () => setWsStatus('reconnecting'),
  });

  // ==========================================================================
  // API Methods
  // ==========================================================================

  const fetchSpots = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const response = await parkingService.getSpots({
        ...state.filters,
        ...params,
        page: state.page,
        limit: state.pageSize,
      });

      dispatch({ type: ActionTypes.SET_SPOTS, payload: response.items });
      dispatch({ type: ActionTypes.SET_TOTAL, payload: response.total });
      dispatch({ type: ActionTypes.SET_LAST_UPDATED, payload: new Date() });

      return response;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to fetch parking spots',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.filters, state.page, state.pageSize]);

  const getSpot = useCallback(async (id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const spot = await parkingService.getSpot(id);
      dispatch({ type: ActionTypes.SET_SELECTED_SPOT, payload: spot });
      return spot;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to fetch parking spot',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const createReservation = useCallback(async (data) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const reservation = await parkingService.createReservation(data);
      dispatch({ type: ActionTypes.ADD_RESERVATION, payload: reservation });
      return reservation;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to create reservation',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      await parkingService.cancelReservation(id);
      dispatch({ type: ActionTypes.REMOVE_RESERVATION, payload: id });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to cancel reservation',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const startParkingSession = useCallback(async (data) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const session = await parkingService.startSession(data);
      dispatch({ type: ActionTypes.ADD_SESSION, payload: session });
      return session;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to start parking session',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const endParkingSession = useCallback(async (id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const session = await parkingService.endSession(id);
      dispatch({ type: ActionTypes.UPDATE_SESSION, payload: session });
      return session;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to end parking session',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const getActiveSessions = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const sessions = await parkingService.getActiveSessions();
      dispatch({ type: ActionTypes.SET_ACTIVE_SESSIONS, payload: sessions });
      return sessions;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to fetch active sessions',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const getReservations = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const reservations = await parkingService.getReservations();
      dispatch({ type: ActionTypes.SET_RESERVATIONS, payload: reservations });
      return reservations;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to fetch reservations',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // ==========================================================================
  // Filter Methods
  // ==========================================================================

  const setFilters = useCallback((filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  }, []);

  const updateFilter = useCallback((key, value) => {
    dispatch({
      type: ActionTypes.UPDATE_FILTER,
      payload: { key, value },
    });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_FILTERS });
  }, []);

  // ==========================================================================
  // UI Methods
  // ==========================================================================

  const setViewMode = useCallback((mode) => {
    dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: mode });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: ActionTypes.SET_PAGE, payload: page });
  }, []);

  const setPageSize = useCallback((size) => {
    dispatch({ type: ActionTypes.SET_PAGE_SIZE, payload: size });
  }, []);

  const refreshSpots = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_REFRESHING, payload: true });
    try {
      await fetchSpots();
    } finally {
      dispatch({ type: ActionTypes.SET_REFRESHING, payload: false });
    }
  }, [fetchSpots]);

  // ==========================================================================
  // Subscribe to Real-time Updates
  // ==========================================================================

  useEffect(() => {
    if (ws.isConnected) {
      // Subscribe to parking updates
      ws.send('subscribe', { channel: 'parking_updates' });
    }
  }, [ws.isConnected]);

  // ==========================================================================
  // Initial Load
  // ==========================================================================

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value = useMemo(() => ({
    // State
    ...state,
    wsStatus,
    
    // API Methods
    fetchSpots,
    getSpot,
    createReservation,
    cancelReservation,
    startParkingSession,
    endParkingSession,
    getActiveSessions,
    getReservations,
    
    // Filter Methods
    setFilters,
    updateFilter,
    clearFilters,
    
    // UI Methods
    setViewMode,
    setPage,
    setPageSize,
    refreshSpots,
    
    // WebSocket
    ws,
    
    // Utilities
    isConnected: ws.isConnected,
    hasActiveFilters: Object.values(state.filters).some(v => 
      Array.isArray(v) ? v.length > 0 : v !== '' && v !== 0 && v !== null
    ),
    activeFilterCount: Object.values(state.filters).reduce((count, v) => {
      if (Array.isArray(v)) return count + v.length;
      if (v !== '' && v !== 0 && v !== null) return count + 1;
      return count;
    }, 0),
  }), [state, ws, wsStatus, fetchSpots, getSpot, createReservation, cancelReservation,
    startParkingSession, endParkingSession, getActiveSessions, getReservations,
    setFilters, updateFilter, clearFilters, setViewMode, setPage, setPageSize, refreshSpots]);

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};

// ============================================================================
// Export
// ============================================================================

export default ParkingContext;