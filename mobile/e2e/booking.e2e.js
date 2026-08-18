// ============================================================================
// Booking E2E Tests - Booking Flow End-to-End Tests
// ============================================================================

// parking-management-system/mobile/e2e/booking.e2e.js

import { device, element, by } from 'detox';
import { 
  waitForElement, 
  tapElement, 
  loginUser,
  createBooking,
} from './utils';

describe('Booking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser('test@example.com', 'Test@123456');
  });

  describe('Booking Creation', () => {
    test('should navigate to parking and select spot', async () => {
      await tapElement('parkingTab');
      await waitForElement('parkingCard_1');
      await tapElement('parkingCard_1');
      await waitForElement('parkingDetailsScreen');
      await tapElement('spot_A1');
      await tapElement('bookNowButton');
      await waitForElement('bookingScreen');
    });

    test('should show booking form', async () => {
      await waitForElement('bookingForm');
      await waitForElement('startTimePicker');
      await waitForElement('endTimePicker');
      await waitForElement('vehicleSelector');
    });

    test('should validate booking form', async () => {
      await tapElement('confirmBookingButton');
      await waitForElement('bookingError');
    });

    test('should create booking successfully', async () => {
      await tapElement('startTimePicker');
      await tapElement('confirmTimeButton');
      await tapElement('endTimePicker');
      await tapElement('confirmTimeButton');
      await tapElement('confirmBookingButton');
      await waitForElement('bookingConfirmation', 15000);
    });

    test('should show booking QR code', async () => {
      await waitForElement('qrCode');
      await waitForElement('bookingDetails');
    });
  });

  describe('Booking List', () => {
    test('should navigate to bookings', async () => {
      await tapElement('bookingsTab');
      await waitForElement('bookingsList');
    });

    test('should display booking cards', async () => {
      await waitForElement('bookingCard_1');
      await waitForElement('bookingStatus');
    });

    test('should filter bookings by status', async () => {
      await tapElement('filterButton');
      await tapElement('activeFilter');
      await tapElement('applyFilterButton');
      await waitForElement('filteredBookings');
    });
  });

  describe('Booking Details', () => {
    test('should navigate to booking details', async () => {
      await tapElement('bookingCard_1');
      await waitForElement('bookingDetailsScreen');
    });

    test('should display booking information', async () => {
      await waitForElement('bookingParkingLot');
      await waitForElement('bookingSpot');
      await waitForElement('bookingDateTime');
      await waitForElement('bookingStatus');
    });

    test('should show QR code', async () => {
      await waitForElement('bookingQRCode');
    });

    test('should cancel booking', async () => {
      await tapElement('cancelBookingButton');
      await tapElement('confirmCancelButton');
      await waitForElement('bookingCancelled');
    });
  });
});