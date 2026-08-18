// ============================================================================
// Booking Integration Tests - Booking Flow Integration Tests
// ============================================================================

// parking-management-system/mobile/__tests__/integration/booking.integration.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '../../../src/store';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { BookingProvider } from '../../../src/contexts/BookingContext';
import { BookingsScreen, BookingDetailsScreen } from '../../../src/screens/Booking';
import bookingService from '../../../src/api/services/booking.service';
import { createMockNavigation, createMockRoute, createMockBooking } from '../helpers';

// Mock booking service
jest.mock('../../../src/api/services/booking.service');

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

describe('Booking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking List Flow', () => {
    test('should load bookings on mount', async () => {
      const mockBookings = [
        createMockBooking({ id: '1', parkingLotName: 'Downtown Parking' }),
        createMockBooking({ id: '2', parkingLotName: 'City Center Garage' }),
      ];
      
      (bookingService.getBookings as jest.Mock).mockResolvedValue({
        bookings: mockBookings,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { findByText } = renderWithProviders(
        <BookingsScreen navigation={navigation} route={route} />
      );

      await waitFor(() => {
        expect(bookingService.getBookings).toHaveBeenCalled();
      });

      expect(await findByText('Downtown Parking')).toBeTruthy();
      expect(await findByText('City Center Garage')).toBeTruthy();
    });

    test('should handle empty bookings', async () => {
      (bookingService.getBookings as jest.Mock).mockResolvedValue({
        bookings: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { findByText } = renderWithProviders(
        <BookingsScreen navigation={navigation} route={route} />
      );

      expect(await findByText('No Bookings Found')).toBeTruthy();
    });

    test('should filter bookings by status', async () => {
      const mockBookings = [
        createMockBooking({ id: '1', status: 'active', parkingLotName: 'Active Booking' }),
      ];
      
      (bookingService.getBookings as jest.Mock).mockResolvedValue({
        bookings: mockBookings,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { getByText, findByText } = renderWithProviders(
        <BookingsScreen navigation={navigation} route={route} />
      );

      // Tap on active filter
      fireEvent.press(getByText('Active'));

      await waitFor(() => {
        expect(bookingService.getBookings).toHaveBeenCalledWith({
          status: 'active',
        });
      });

      expect(await findByText('Active Booking')).toBeTruthy();
    });

    test('should navigate to booking details when booking is pressed', async () => {
      const mockBookings = [
        createMockBooking({ id: '1', parkingLotName: 'Test Booking' }),
      ];
      
      (bookingService.getBookings as jest.Mock).mockResolvedValue({
        bookings: mockBookings,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const navigation = createMockNavigation();
      const route = createMockRoute();

      const { findByText } = renderWithProviders(
        <BookingsScreen navigation={navigation} route={route} />
      );

      const bookingCard = await findByText('Test Booking');
      fireEvent.press(bookingCard);

      expect(navigation.navigate).toHaveBeenCalledWith('BookingDetails', {
        bookingId: '1',
      });
    });
  });

  describe('Booking Details Flow', () => {
    test('should load booking details on mount', async () => {
      const mockBooking = createMockBooking({
        id: '1',
        parkingLotName: 'Detailed Booking',
        parkingLotAddress: '123 Main St',
        spotNumber: 'A1',
        amount: 25.00,
      });
      
      (bookingService.getBookingById as jest.Mock).mockResolvedValue(mockBooking);

      const navigation = createMockNavigation();
      const route = createMockRoute({ bookingId: '1' });

      const { findByText } = renderWithProviders(
        <BookingDetailsScreen navigation={navigation} route={route} />
      );

      await waitFor(() => {
        expect(bookingService.getBookingById).toHaveBeenCalledWith('1');
      });

      expect(await findByText('Detailed Booking')).toBeTruthy();
      expect(await findByText('123 Main St')).toBeTruthy();
      expect(await findByText('A1')).toBeTruthy();
      expect(await findByText('$25.00')).toBeTruthy();
    });

    test('should show cancel button for pending/confirmed bookings', async () => {
      const mockBooking = createMockBooking({
        id: '1',
        status: 'confirmed',
        parkingLotName: 'Cancelable Booking',
      });
      
      (bookingService.getBookingById as jest.Mock).mockResolvedValue(mockBooking);

      const navigation = createMockNavigation();
      const route = createMockRoute({ bookingId: '1' });

      const { findByText } = renderWithProviders(
        <BookingDetailsScreen navigation={navigation} route={route} />
      );

      expect(await findByText('Cancel Booking')).toBeTruthy();
    });

    test('should handle booking cancellation', async () => {
      const mockBooking = createMockBooking({
        id: '1',
        status: 'confirmed',
        parkingLotName: 'Test Booking',
      });
      
      (bookingService.getBookingById as jest.Mock).mockResolvedValue(mockBooking);
      (bookingService.cancelBooking as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Booking cancelled successfully',
      });

      const navigation = createMockNavigation();
      const route = createMockRoute({ bookingId: '1' });

      const { findByText } = renderWithProviders(
        <BookingDetailsScreen navigation={navigation} route={route} />
      );

      const cancelButton = await findByText('Cancel Booking');
      fireEvent.press(cancelButton);

      // Confirm cancellation
      const confirmButton = await findByText('Yes');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(bookingService.cancelBooking).toHaveBeenCalledWith('1', {
          reason: undefined,
        });
      });
    });

    test('should handle booking not found', async () => {
      (bookingService.getBookingById as jest.Mock).mockRejectedValue({
        message: 'Booking not found',
      });

      const navigation = createMockNavigation();
      const route = createMockRoute({ bookingId: 'invalid' });

      const { findByText } = renderWithProviders(
        <BookingDetailsScreen navigation={navigation} route={route} />
      );

      expect(await findByText('Booking not found')).toBeTruthy();
    });
  });

  describe('Booking Creation Flow', () => {
    test('should create booking with valid data', async () => {
      const mockBooking = createMockBooking({
        id: 'new',
        parkingLotName: 'New Booking',
        status: 'confirmed',
      });
      
      (bookingService.createBooking as jest.Mock).mockResolvedValue(mockBooking);

      const navigation = createMockNavigation();
      const route = createMockRoute({
        parkingId: '1',
        spotId: 'A1',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
      });

      const { getByText } = renderWithProviders(
        <CreateBookingScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Confirm Booking'));

      await waitFor(() => {
        expect(bookingService.createBooking).toHaveBeenCalled();
      });
    });
  });
});