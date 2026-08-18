// ============================================================================
// Hooks Index - Export All Hooks
// ============================================================================

// parking-management-system/mobile/src/hooks/index.ts

export { default as useAuth } from './useAuth';
export { default as useBooking } from './useBooking';
export { default as useNotification } from './useNotification';
export { default as useParking } from './useParking';
export { default as useDebounce, useDebouncedCallback } from './useDebounce';
export { default as useLocation } from './useLocation';
export { default as useKeyboard } from './useKeyboard';
export { default as useNetwork } from './useNetwork';
export { default as useAppState } from './useAppState';

// Export types
export type { UserLocation } from './useLocation';
export type { ParkingLot } from './useParking';