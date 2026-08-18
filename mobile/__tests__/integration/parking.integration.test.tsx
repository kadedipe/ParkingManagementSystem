// ============================================================================
// Parking Integration Tests - Parking Flow Integration Tests
// ============================================================================

// parking-management-system/mobile/__tests__/integration/parking.integration.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '../../../src/store';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { BookingProvider } from '../../../src/contexts/BookingContext';
import { ParkingScreen, ParkingDetailsScreen } from '../../../src/screens/Parking';
import parkingService from '../../../src/api/services/parking.service';
import { createMockNavigation, createMockRoute, createMockParkingLot } from '../helpers';

// Mock parking service
jest.mock('../../../src/api/services/parking.service');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider>
            <BookingProvider>
              {component}
            </BookingProvider>
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

describe('Parking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Parking List Flow', () => {
    test('should load parking lots on mount', async () => {
      const mockParkingLots = [
        createMockParkingLot({ id: '1', name: 'Downtown Parking' }),
        createMockParkingLot({ id: '2', name: 'City Center Garage' }),
      ];
      
      const mockGetParkingLots = jest.fn().mockResolvedValue({
        lots: mockParkingLots,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
      
      (parkingService.getParkingLots as jest.Mock).mockImplementation(mockGetParkingLots);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { findByText } = renderWithProviders(
        <ParkingScreen navigation={navigation} route={route} />
      );

      await waitFor(() => {
        expect(mockGetParkingLots).toHaveBeenCalled();
      });

      expect(await findByText('Downtown Parking')).toBeTruthy();
      expect(await findByText('City Center Garage')).toBeTruthy();
    });

    test('should handle empty parking lots', async () => {
      const mockGetParkingLots = jest.fn().mockResolvedValue({
        lots: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      
      (parkingService.getParkingLots as jest.Mock).mockImplementation(mockGetParkingLots);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { findByText } = renderWithProviders(
        <ParkingScreen navigation={navigation} route={route} />
      );

      await waitFor(() => {
        expect(mockGetParkingLots).toHaveBeenCalled();
      });

      expect(await findByText('No Parking Spots Found')).toBeTruthy();
    });

    test('should filter parking lots by search', async () => {
      const mockSearch = jest.fn().mockResolvedValue({
        lots: [createMockParkingLot({ id: '1', name: 'Searched Parking' })],
      });
      
      (parkingService.searchParkingLots as jest.Mock).mockImplementation(mockSearch);

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByPlaceholderText, findByText } = renderWithProviders(
        <ParkingScreen navigation={navigation} route={route} />
      );

      const searchInput = getByPlaceholderText('Search parking lots...');
      fireEvent.changeText(searchInput, 'test search');
      fireEvent(searchInput, 'submitEditing');

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('test search');
      });

      expect(await findByText('Searched Parking')).toBeTruthy();
    });

    test('should navigate to parking details when card is pressed', async () => {
      const mockParkingLots = [
        createMockParkingLot({ id: '1', name: 'Test Parking' }),
      ];
      
      (parkingService.getParkingLots as jest.Mock).mockResolvedValue({
        lots: mockParkingLots,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { findByText } = renderWithProviders(
        <ParkingScreen navigation={navigation} route={route} />
      );

      const parkingCard = await findByText('Test Parking');
      fireEvent.press(parkingCard);

      expect(navigation.navigate).toHaveBeenCalledWith('ParkingDetails', {
        parkingId: '1',
      });
    });
  });

  describe('Parking Details Flow', () => {
    test('should load parking details on mount', async () => {
      const mockParkingLot = createMockParkingLot({
        id: '1',
        name: 'Detailed Parking',
        address: '123 Main St',
        availableSpots: 25,
        totalSpots: 50,
      });
      
      (parkingService.getParkingLotById as jest.Mock).mockResolvedValue(mockParkingLot);

      const navigation = createMockNavigation();
      const route = createMockRoute({ parkingId: '1' });

      const { findByText } = renderWithProviders(
        <ParkingDetailsScreen navigation={navigation} route={route} />
      );

      await waitFor(() => {
        expect(parkingService.getParkingLotById).toHaveBeenCalledWith('1');
      });

      expect(await findByText('Detailed Parking')).toBeTruthy();
      expect(await findByText('123 Main St')).toBeTruthy();
    });

    test('should show booking button when spots available', async () => {
      const mockParkingLot = createMockParkingLot({
        id: '1',
        name: 'Available Parking',
        availableSpots: 10,
        totalSpots: 20,
      });
      
      (parkingService.getParkingLotById as jest.Mock).mockResolvedValue(mockParkingLot);

      const navigation = createMockNavigation();
      const route = createMockRoute({ parkingId: '1' });

      const { findByText } = renderWithProviders(
        <ParkingDetailsScreen navigation={navigation} route={route} />
      );

      const bookButton = await findByText('Book Now');
      expect(bookButton).toBeTruthy();
      expect(bookButton.props.disabled).toBeFalsy();
    });

    test('should disable booking button when no spots available', async () => {
      const mockParkingLot = createMockParkingLot({
        id: '1',
        name: 'Full Parking',
        availableSpots: 0,
        totalSpots: 20,
      });
      
      (parkingService.getParkingLotById as jest.Mock).mockResolvedValue(mockParkingLot);

      const navigation = createMockNavigation();
      const route = createMockRoute({ parkingId: '1' });

      const { findByText } = renderWithProviders(
        <ParkingDetailsScreen navigation={navigation} route={route} />
      );

      const bookButton = await findByText('Book Now');
      expect(bookButton).toBeTruthy();
      expect(bookButton.props.disabled).toBeTruthy();
    });

    test('should handle parking lot not found', async () => {
      (parkingService.getParkingLotById as jest.Mock).mockRejectedValue({
        message: 'Parking lot not found',
      });

      const navigation = createMockNavigation();
      const route = createMockRoute({ parkingId: 'invalid' });

      const { findByText } = renderWithProviders(
        <ParkingDetailsScreen navigation={navigation} route={route} />
      );

      expect(await findByText('Parking lot not found')).toBeTruthy();
    });

    test('should navigate to booking creation when book button pressed', async () => {
      const mockParkingLot = createMockParkingLot({
        id: '1',
        name: 'Test Parking',
        availableSpots: 10,
      });
      
      (parkingService.getParkingLotById as jest.Mock).mockResolvedValue(mockParkingLot);

      const navigation = createMockNavigation();
      const route = createMockRoute({ parkingId: '1' });

      const { findByText } = renderWithProviders(
        <ParkingDetailsScreen navigation={navigation} route={route} />
      );

      const bookButton = await findByText('Book Now');
      fireEvent.press(bookButton);

      expect(navigation.navigate).toHaveBeenCalledWith('CreateBooking', {
        parkingId: '1',
        spotId: undefined,
      });
    });
  });
});