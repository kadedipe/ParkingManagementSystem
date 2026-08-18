// ============================================================================
// Test Helpers - Helper Functions for Tests
// ============================================================================

// parking-management-system/mobile/__tests__/helpers.ts

import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../src/store';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

/**
 * Render component with all required providers
 */
export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  isVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create mock tokens
 */
export const createMockTokens = (overrides = {}) => ({
  accessToken: 'mock_access_token',
  refreshToken: 'mock_refresh_token',
  expiresIn: 3600,
  ...overrides,
});

/**
 * Create mock parking lot
 */
export const createMockParkingLot = (overrides = {}) => ({
  id: 'lot123',
  name: 'Test Parking Lot',
  address: '123 Test St, City',
  latitude: 37.7749,
  longitude: -122.4194,
  totalSpots: 100,
  availableSpots: 45,
  pricePerHour: 5.00,
  rating: 4.5,
  amenities: ['security', 'lighting'],
  status: 'active',
  ...overrides,
});

/**
 * Create mock booking
 */
export const createMockBooking = (overrides = {}) => ({
  id: 'booking123',
  parkingLotId: 'lot123',
  parkingLotName: 'Test Parking Lot',
  spotId: 'spot123',
  spotNumber: 'A1',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  status: 'confirmed',
  vehicleId: 'vehicle123',
  vehiclePlate: 'ABC-1234',
  amount: 25.00,
  paymentStatus: 'paid',
  ...overrides,
});

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock navigation
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

/**
 * Mock route
 */
export const createMockRoute = (params = {}) => ({
  params,
  key: 'mock-key',
  name: 'MockScreen',
});

/**
 * Mock API response
 */
export const createMockApiResponse = (data: any, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
  timestamp: new Date().toISOString(),
});

/**
 * Mock API error
 */
export const createMockApiError = (message = 'An error occurred', status = 500) => ({
  response: {
    data: { message },
    status,
  },
});

/**
 * Test async hook
 */
export const testAsyncHook = async (hook: () => any) => {
  let result: any;
  const TestComponent = () => {
    result = hook();
    return null;
  };
  render(<TestComponent />);
  await waitForAsync();
  return result;
};