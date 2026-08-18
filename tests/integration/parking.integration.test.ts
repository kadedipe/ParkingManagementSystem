// ============================================================================
// Parking Integration Tests - Parking Flow Tests
// ============================================================================

// parking-management-system/tests/integration/parking.integration.test.ts

import { app, request, getAuthToken } from './setup';

describe('Parking Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let parkingLotId: string;

  beforeAll(async () => {
    // Get admin token
    adminToken = await getAuthToken('admin@example.com', 'Test@123456');
    userToken = await getAuthToken('test1@example.com', 'Test@123456');
  });

  describe('Parking Lot Management', () => {
    const newLot = {
      name: 'Integration Test Parking',
      address: {
        street: '456 Test Ave',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '12345'
      },
      location: {
        latitude: 40.7142,
        longitude: -74.0080
      },
      totalSpots: 100,
      basePricePerHour: 6.00,
      amenities: ['security', 'lighting', 'covered']
    };

    it('should create a parking lot (admin only)', async () => {
      const response = await request
        .post('/api/v1/parking/lots')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newLot);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newLot.name);
      
      parkingLotId = response.body.data.id;
    });

    it('should not allow regular user to create parking lot', async () => {
      const response = await request
        .post('/api/v1/parking/lots')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newLot);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should get all parking lots', async () => {
      const response = await request
        .get('/api/v1/parking/lots')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toBeInstanceOf(Array);
    });

    it('should get parking lot by ID', async () => {
      const response = await request
        .get(`/api/v1/parking/lots/${parkingLotId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(parkingLotId);
    });

    it('should update parking lot (admin only)', async () => {
      const updateData = {
        name: 'Updated Integration Test Parking',
        basePricePerHour: 7.00
      };
      
      const response = await request
        .put(`/api/v1/parking/lots/${parkingLotId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.basePricePerHour.amount).toBe(updateData.basePricePerHour);
    });
  });

  describe('Parking Search & Availability', () => {
    it('should search parking lots by location', async () => {
      const response = await request
        .get('/api/v1/parking/lots/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 5
        })
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should check parking availability', async () => {
      const response = await request
        .get(`/api/v1/parking/lots/${parkingLotId}/availability`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalSpots');
      expect(response.body.data).toHaveProperty('availableSpots');
      expect(response.body.data).toHaveProperty('isFull');
    });

    it('should search parking lots with filters', async () => {
      const response = await request
        .get('/api/v1/parking/lots/search')
        .query({
          query: 'parking',
          amenities: ['security', 'lighting'],
          minRating: 4.0,
          maxPrice: 10
        })
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Parking Spots', () => {
    let spotId: string;

    it('should get parking spots for a lot', async () => {
      const response = await request
        .get(`/api/v1/parking/lots/${parkingLotId}/spots`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      spotId = response.body.data[0].id;
    });

    it('should update parking spot status (admin only)', async () => {
      const response = await request
        .patch(`/api/v1/parking/spots/${spotId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'maintenance' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('maintenance');
    });
  });
});