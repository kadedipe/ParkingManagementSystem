// ============================================================================
// Redux Store Configuration
// ============================================================================

/**
 * Redux store configuration for the parking management system.
 * 
 * This store provides:
 * - Centralized state management
 * - Redux Toolkit with slices
 * - API integration with RTK Query
 * - Persistence with redux-persist
 * - DevTools integration
 * - Middleware configuration
 * - Type-safe actions and selectors
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import parkingReducer from './slices/parkingSlice';
import bookingReducer from './slices/bookingSlice';
import vehicleReducer from './slices/vehicleSlice';
import chargingReducer from './slices/chargingSlice';
import paymentReducer from './slices/paymentSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

// Import RTK Query APIs
import { authApi } from './api/authApi';
import { parkingApi } from './api/parkingApi';
import { bookingApi } from './api/bookingApi';
import { vehicleApi } from './api/vehicleApi';
import { chargingApi } from './api/chargingApi';
import { paymentApi } from './api/paymentApi';
import { userApi } from './api/userApi';
import { notificationApi } from './api/notificationApi';

// ============================================================================
// Persistence Configuration
// ============================================================================

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'user', 'ui'], // Only persist these slices
  blacklist: ['parking', 'booking', 'notification'], // Don't persist these slices
  migrate: (state) => {
    // Handle migrations if needed
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  // Slices
  auth: authReducer,
  user: userReducer,
  parking: parkingReducer,
  booking: bookingReducer,
  vehicle: vehicleReducer,
  charging: chargingReducer,
  payment: paymentReducer,
  notification: notificationReducer,
  ui: uiReducer,

  // RTK Query APIs
  [authApi.reducerPath]: authApi.reducer,
  [parkingApi.reducerPath]: parkingApi.reducer,
  [bookingApi.reducerPath]: bookingApi.reducer,
  [vehicleApi.reducerPath]: vehicleApi.reducer,
  [chargingApi.reducerPath]: chargingApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ============================================================================
// Store Configuration
// ============================================================================

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['persist', 'auth.persist'],
      },
      immutableCheck: {
        ignoredPaths: ['persist'],
      },
    }).concat(
      authApi.middleware,
      parkingApi.middleware,
      bookingApi.middleware,
      vehicleApi.middleware,
      chargingApi.middleware,
      paymentApi.middleware,
      userApi.middleware,
      notificationApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
  enhancers: (defaultEnhancers) => [...defaultEnhancers],
});

// ============================================================================
// Persistor
// ============================================================================

export const persistor = persistStore(store, null, () => {
  // Optional callback after rehydration
  console.log('Store rehydrated');
});

// ============================================================================
// Setup Listeners
// ============================================================================

setupListeners(store.dispatch);

// ============================================================================
// Type Definitions (for TypeScript)
// ============================================================================

/**
 * Root state type
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App dispatch type
 */
export type AppDispatch = typeof store.dispatch;

// ============================================================================
// Custom Hooks
// ============================================================================

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

/**
 * Typed useDispatch hook
 */
export const useAppDispatch = () => useDispatch();

/**
 * Typed useSelector hook
 */
export const useAppSelector = useSelector;

// ============================================================================
// Store Utilities
// ============================================================================

/**
 * Reset store to initial state
 */
export const resetStore = () => {
  store.dispatch({ type: 'RESET_STATE' });
};

/**
 * Clear persisted store
 */
export const clearPersistedStore = async () => {
  await persistor.purge();
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Get current store state
 */
export const getState = () => store.getState();

/**
 * Dispatch action
 */
export const dispatch = (action) => store.dispatch(action);

// ============================================================================
// Selectors
// ============================================================================

// Auth Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Parking Selectors
export const selectParking = (state) => state.parking;
export const selectSpots = (state) => state.parking.spots;
export const selectSelectedSpot = (state) => state.parking.selectedSpot;
export const selectParkingLoading = (state) => state.parking.loading;
export const selectParkingFilters = (state) => state.parking.filters;

// Booking Selectors
export const selectBooking = (state) => state.booking;
export const selectBookings = (state) => state.booking.bookings;
export const selectActiveBookings = (state) => state.booking.bookings.filter(b => b.status === 'active');
export const selectBookingLoading = (state) => state.booking.loading;

// Vehicle Selectors
export const selectVehicles = (state) => state.vehicle.vehicles;
export const selectSelectedVehicle = (state) => state.vehicle.selectedVehicle;
export const selectVehicleLoading = (state) => state.vehicle.loading;

// Charging Selectors
export const selectCharging = (state) => state.charging;
export const selectChargingStations = (state) => state.charging.stations;
export const selectChargingSessions = (state) => state.charging.sessions;
export const selectChargingLoading = (state) => state.charging.loading;

// Payment Selectors
export const selectPayments = (state) => state.payment.payments;
export const selectPaymentLoading = (state) => state.payment.loading;

// Notification Selectors
export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.unreadCount;

// UI Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectLoading = (state) => state.ui.loading;

// ============================================================================
// Export
// ============================================================================

export default store;