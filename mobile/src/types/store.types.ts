// ============================================================================
// Store Types - TypeScript Type Definitions for Redux Store
// ============================================================================

// parking-management-system/mobile/src/types/store.types.ts

import { User, AuthTokens, Booking, ParkingLot } from './api.types';

/**
 * Auth State
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Booking State
 */
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

/**
 * Parking State
 */
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
    sortBy: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * UI State
 */
export interface UIState {
  isLoading: boolean;
  isNetworkConnected: boolean;
  theme: 'light' | 'dark';
  modal: {
    isVisible: boolean;
    type: string;
    data: any;
  };
  toast: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  bottomSheet: {
    isVisible: boolean;
    content: React.ReactNode | null;
    snapPoints: string[];
  };
}

/**
 * Root State
 */
export interface RootState {
  auth: AuthState;
  booking: BookingState;
  parking: ParkingState;
  ui: UIState;
}

/**
 * Store Actions
 */
export type StoreAction<T = any> = {
  type: string;
  payload?: T;
  error?: string;
};

/**
 * Async Thunk Config
 */
export interface AsyncThunkConfig {
  state: RootState;
  rejectValue: string;
}

export default {
  AuthState,
  BookingState,
  ParkingState,
  UIState,
  RootState,
  StoreAction,
  AsyncThunkConfig,
};