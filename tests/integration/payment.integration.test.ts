// ============================================================================
// Payment Integration Tests - Payment Flow Tests
// ============================================================================

// parking-management-system/tests/integration/payment.integration.test.ts

import { app, request, getAuthToken } from './setup';

describe('Payment Integration Tests', () => {
  let userToken: string;
  let bookingId: string;
  let paymentMethodId: string;

  beforeAll(async () => {
    userToken = await getAuthToken('test1@example.com', 'Test@123456');
    
    // Create a booking for payment test
    const parkingResponse = await request
      .get('/api/v1/parking/lots')
      .set('Authorization', `Bearer ${userToken}`);
    
    const parkingLotId = parkingResponse.body.data.items[0].id;
    
    const vehiclesResponse = await request
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`);
    
    const vehicleId = vehiclesResponse.body.data[0].id;
    
    const bookingData = {
      parkingLotId,
      spotId: 'spot-1',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      vehicleId
    };
    
    const bookingResponse = await request
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(bookingData);
    
    bookingId = bookingResponse.body.data.id;
  });

  describe('Payment Methods', () => {
    it('should add a payment method', async () => {
      const paymentMethodData = {
        type: 'card',
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        holderName: 'Test User',
        isDefault: true
      };
      
      const response = await request
        .post('/api/v1/payments/methods')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentMethodData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe('card');
      expect(response.body.data.isDefault).toBe(true);
      
      paymentMethodId = response.body.data.id;
    });

    it('should get payment methods', async () => {
      const response = await request
        .get('/api/v1/payments/methods')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should set default payment method', async () => {
      // Add another payment method
      const secondMethodData = {
        type: 'card',
        cardNumber: '5555555555554444',
        expiryMonth: 6,
        expiryYear: 2026,
        cvv: '456',
        holderName: 'Test User',
        isDefault: false
      };
      
      const secondMethodResponse = await request
        .post('/api/v1/payments/methods')
        .set('Authorization', `Bearer ${userToken}`)
        .send(secondMethodData);
      
      const secondMethodId = secondMethodResponse.body.data.id;
      
      const response = await request
        .put(`/api/v1/payments/methods/${secondMethodId}/default`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Payment Processing', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        amount: 25.00,
        currency: 'USD',
        paymentMethodId,
        bookingId,
        description: 'Parking booking payment'
      };
      
      const response = await request
        .post('/api/v1/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 400 for insufficient funds', async () => {
      const paymentData = {
        amount: 1000.00,
        currency: 'USD',
        paymentMethodId,
        bookingId,
        description: 'Large payment'
      };
      
      const response = await request
        .post('/api/v1/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should get payment history', async () => {
      const response = await request
        .get('/api/v1/payments/history')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toBeInstanceOf(Array);
    });

    it('should get payment receipt', async () => {
      // Get payment ID first
      const historyResponse = await request
        .get('/api/v1/payments/history')
        .set('Authorization', `Bearer ${userToken}`);
      
      const paymentId = historyResponse.body.data.items[0].id;
      
      const response = await request
        .get(`/api/v1/payments/${paymentId}/receipt`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('receiptUrl');
    });
  });
});