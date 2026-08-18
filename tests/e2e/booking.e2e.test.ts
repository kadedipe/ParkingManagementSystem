// ============================================================================
// Booking E2E Tests - Full Booking Flow
// ============================================================================

// parking-management-system/tests/e2e/booking.e2e.test.ts

import { testServerUrl, createTestUser, loginTestUser, waitFor, generateTestPlate } from './setup';
import axios from 'axios';

describe('Booking E2E Tests', () => {
  let userToken: string;
  let adminToken: string;
  let parkingLotId: string;
  let vehicleId: string;
  let bookingId: string;

  beforeAll(async () => {
    // Create and login user
    const userEmail = `booking_user_${Date.now()}@example.com`;
    await axios.post(`${testServerUrl}/api/v1/auth/register`, {
      name: 'Booking Test User',
      email: userEmail,
      phone: '+1234567890',
      password: 'Test@123456'
    });
    
    const loginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
      email: userEmail,
      password: 'Test@123456'
    });
    userToken = loginResponse.data.data.tokens.accessToken;
    
    // Create admin and login
    const adminEmail = `admin_${Date.now()}@example.com`;
    await axios.post(`${testServerUrl}/api/v1/auth/register`, {
      name: 'Admin User',
      email: adminEmail,
      phone: '+1234567891',
      password: 'Test@123456',
      role: 'admin'
    });
    
    const adminLoginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
      email: adminEmail,
      password: 'Test@123456'
    });
    adminToken = adminLoginResponse.data.data.tokens.accessToken;
    
    // Create parking lot
    const lotData = {
      name: 'E2E Booking Parking',
      address: {
        street: '321 Booking Blvd',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '98765'
      },
      location: {
        latitude: 40.7180,
        longitude: -74.0120
      },
      totalSpots: 50,
      basePricePerHour: 8.00
    };
    
    const lotResponse = await axios.post(
      `${testServerUrl}/api/v1/parking/lots`,
      lotData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    parkingLotId = lotResponse.data.data.id;
    
    // Create vehicle
    const vehicleData = {
      name: 'E2E Booking Vehicle',
      plateNumber: generateTestPlate(),
      make: 'Tesla',
      model: 'Model Y',
      type: 'car',
      year: 2023,
      color: 'White',
      isEV: true
    };
    
    const vehicleResponse = await axios.post(
      `${testServerUrl}/api/v1/vehicles`,
      vehicleData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    vehicleId = vehicleResponse.data.data.id;
  });

  describe('Booking Creation Flow', () => {
    it('should create a booking', async () => {
      const bookingData = {
        parkingLotId,
        spotId: 'A1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        vehicleId
      };
      
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings`,
        bookingData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.status).toBe('confirmed');
      expect(response.data.data.parkingLotId).toBe(parkingLotId);
      
      bookingId = response.data.data.id;
    });

    it('should handle conflicting booking', async () => {
      const bookingData = {
        parkingLotId,
        spotId: 'A1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        vehicleId
      };
      
      try {
        await axios.post(
          `${testServerUrl}/api/v1/bookings`,
          bookingData,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        fail('Should have thrown 409 error');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.success).toBe(false);
      }
    });
  });

  describe('Booking Management Flow', () => {
    it('should get all bookings', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/bookings`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('items');
      expect(response.data.data.items.length).toBeGreaterThan(0);
    });

    it('should get booking details', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/bookings/${bookingId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(bookingId);
    });

    it('should extend booking', async () => {
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings/${bookingId}/extend`,
        { additionalHours: 2 },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.isExtended).toBe(true);
      expect(response.data.data.extensionCount).toBe(1);
    });
  });

  describe('Check-in & Check-out Flow', () => {
    let activeBookingId: string;

    beforeAll(async () => {
      // Create a booking for check-in test
      const bookingData = {
        parkingLotId,
        spotId: 'A2',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        vehicleId
      };
      
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings`,
        bookingData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      activeBookingId = response.data.data.id;
    });

    it('should check in to booking', async () => {
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings/${activeBookingId}/check-in`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('checkInTime');
      expect(response.data.data.status).toBe('active');
    });

    it('should check out from booking', async () => {
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings/${activeBookingId}/check-out`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('checkOutTime');
      expect(response.data.data.status).toBe('completed');
    });
  });

  describe('Booking Cancellation Flow', () => {
    let cancelBookingId: string;

    beforeAll(async () => {
      // Create a booking for cancellation test
      const bookingData = {
        parkingLotId,
        spotId: 'A3',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        vehicleId
      };
      
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings`,
        bookingData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      cancelBookingId = response.data.data.id;
    });

    it('should cancel booking', async () => {
      const response = await axios.post(
        `${testServerUrl}/api/v1/bookings/${cancelBookingId}/cancel`,
        { reason: 'Testing cancellation' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.status).toBe('cancelled');
    });

    it('should not allow cancellation of already cancelled booking', async () => {
      try {
        await axios.post(
          `${testServerUrl}/api/v1/bookings/${cancelBookingId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        fail('Should have thrown 400 error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
      }
    });
  });
});