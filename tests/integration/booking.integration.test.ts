// ============================================================================
// Booking Integration Tests - Booking Flow Tests
// ============================================================================

// parking-management-system/tests/integration/booking.integration.test.ts

import { app, request, getAuthToken } from './setup';

describe('Booking Integration Tests', () => {
  let userToken: string;
  let parkingLotId: string;
  let vehicleId: string;
  let bookingId: string;

  beforeAll(async () => {
    userToken = await getAuthToken('test1@example.com', 'Test@123456');
    
    // Get a parking lot
    const lotsResponse = await request
      .get('/api/v1/parking/lots')
      .set('Authorization', `Bearer ${userToken}`);
    
    parkingLotId = lotsResponse.body.data.items[0].id;
    
    // Get a vehicle
    const vehiclesResponse = await request
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`);
    
    vehicleId = vehiclesResponse.body.data[0].id;
  });

  describe('Booking Creation', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        parkingLotId,
        spotId: 'spot-1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        vehicleId
      };
      
      const response = await request
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('confirmed');
      
      bookingId = response.body.data.id;
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidBooking = {
        parkingLotId,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() - 3600000).toISOString()
      };
      
      const response = await request
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidBooking);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for conflicting booking', async () => {
      const bookingData = {
        parkingLotId,
        spotId: 'spot-1',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        vehicleId
      };
      
      const response = await request
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData);
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('conflict');
    });
  });

  describe('Booking Management', () => {
    it('should get all bookings for user', async () => {
      const response = await request
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toBeInstanceOf(Array);
    });

    it('should get booking by ID', async () => {
      const response = await request
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(bookingId);
    });

    it('should extend booking', async () => {
      const response = await request
        .post(`/api/v1/bookings/${bookingId}/extend`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ additionalHours: 2 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isExtended).toBe(true);
      expect(response.body.data.extensionCount).toBe(1);
    });

    it('should cancel booking', async () => {
      const response = await request
        .post(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Change of plans' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should not allow cancellation of already cancelled booking', async () => {
      const response = await request
        .post(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Check-in and Check-out', () => {
    let activeBookingId: string;

    beforeAll(async () => {
      // Create a booking for check-in test
      const bookingData = {
        parkingLotId,
        spotId: 'spot-2',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        vehicleId
      };
      
      const response = await request
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData);
      
      activeBookingId = response.body.data.id;
    });

    it('should check in to booking', async () => {
      const response = await request
        .post(`/api/v1/bookings/${activeBookingId}/check-in`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('checkInTime');
      expect(response.body.data.status).toBe('active');
    });

    it('should check out from booking', async () => {
      const response = await request
        .post(`/api/v1/bookings/${activeBookingId}/check-out`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('checkOutTime');
      expect(response.body.data.status).toBe('completed');
    });
  });
});