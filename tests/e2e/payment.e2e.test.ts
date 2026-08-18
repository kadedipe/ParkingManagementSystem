// ============================================================================
// Payment E2E Tests - Full Payment Flow
// ============================================================================

// parking-management-system/tests/e2e/payment.e2e.test.ts

import { testServerUrl, createTestUser, loginTestUser, waitFor, generateTestPlate } from './setup';
import axios from 'axios';

describe('Payment E2E Tests', () => {
  let userToken: string;
  let adminToken: string;
  let parkingLotId: string;
  let vehicleId: string;
  let bookingId: string;
  let paymentMethodId: string;

  beforeAll(async () => {
    // Create and login user
    const userEmail = `payment_user_${Date.now()}@example.com`;
    await axios.post(`${testServerUrl}/api/v1/auth/register`, {
      name: 'Payment Test User',
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
      name: 'E2E Payment Parking',
      address: {
        street: '555 Payment Ave',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '11111'
      },
      location: {
        latitude: 40.7200,
        longitude: -74.0140
      },
      totalSpots: 30,
      basePricePerHour: 10.00
    };
    
    const lotResponse = await axios.post(
      `${testServerUrl}/api/v1/parking/lots`,
      lotData,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    parkingLotId = lotResponse.data.data.id;
    
    // Create vehicle
    const vehicleData = {
      name: 'E2E Payment Vehicle',
      plateNumber: generateTestPlate(),
      make: 'BMW',
      model: 'i4',
      type: 'car',
      year: 2023,
      color: 'Black',
      isEV: true
    };
    
    const vehicleResponse = await axios.post(
      `${testServerUrl}/api/v1/vehicles`,
      vehicleData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    vehicleId = vehicleResponse.data.data.id;
    
    // Create booking
    const bookingData = {
      parkingLotId,
      spotId: 'B1',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      vehicleId
    };
    
    const bookingResponse = await axios.post(
      `${testServerUrl}/api/v1/bookings`,
      bookingData,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    bookingId = bookingResponse.data.data.id;
  });

  describe('Payment Method Flow', () => {
    it('should add a payment method', async () => {
      const paymentData = {
        type: 'card',
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        holderName: 'Test User',
        isDefault: true
      };
      
      const response = await axios.post(
        `${testServerUrl}/api/v1/payments/methods`,
        paymentData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.type).toBe('card');
      expect(response.data.data.isDefault).toBe(true);
      
      paymentMethodId = response.data.data.id;
    });

    it('should get payment methods', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/payments/methods`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Processing Flow', () => {
    it('should process payment', async () => {
      const paymentData = {
        amount: 25.00,
        currency: 'USD',
        paymentMethodId,
        bookingId,
        description: 'E2E test payment'
      };
      
      const response = await axios.post(
        `${testServerUrl}/api/v1/payments/process`,
        paymentData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.status).toBe('completed');
    });

    it('should handle payment with insufficient funds', async () => {
      const paymentData = {
        amount: 9999.99,
        currency: 'USD',
        paymentMethodId,
        bookingId,
        description: 'Large payment'
      };
      
      try {
        await axios.post(
          `${testServerUrl}/api/v1/payments/process`,
          paymentData,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        fail('Should have thrown 400 error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
      }
    });
  });

  describe('Payment History Flow', () => {
    it('should get payment history', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/payments/history`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('items');
      expect(response.data.data.items.length).toBeGreaterThan(0);
    });

    it('should get payment receipt', async () => {
      // Get payment ID first
      const historyResponse = await axios.get(
        `${testServerUrl}/api/v1/payments/history`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      const paymentId = historyResponse.data.data.items[0].id;
      
      const response = await axios.get(
        `${testServerUrl}/api/v1/payments/${paymentId}/receipt`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('receiptUrl');
    });
  });
});