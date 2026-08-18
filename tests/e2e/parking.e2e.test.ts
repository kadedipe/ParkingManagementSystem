// ============================================================================
// Parking E2E Tests - Full Parking Flow
// ============================================================================

// parking-management-system/tests/e2e/parking.e2e.test.ts

import { testServerUrl, createTestUser, loginTestUser, waitFor } from './setup';
import axios from 'axios';

describe('Parking E2E Tests', () => {
  let adminToken: string;
  let userToken: string;
  let parkingLotId: string;
  let userId: string;

  beforeAll(async () => {
    // Create admin user
    const adminEmail = `admin_${Date.now()}@example.com`;
    const adminUser = {
      name: 'E2E Admin',
      email: adminEmail,
      phone: '+1234567890',
      password: 'Test@123456',
      role: 'admin'
    };
    
    await axios.post(`${testServerUrl}/api/v1/auth/register`, adminUser);
    const loginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
      email: adminEmail,
      password: 'Test@123456'
    });
    adminToken = loginResponse.data.data.tokens.accessToken;
    
    // Create regular user
    const userEmail = `user_${Date.now()}@example.com`;
    const userResponse = await axios.post(`${testServerUrl}/api/v1/auth/register`, {
      name: 'E2E User',
      email: userEmail,
      phone: '+1234567891',
      password: 'Test@123456'
    });
    userId = userResponse.data.data.user.id;
    
    const userLoginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
      email: userEmail,
      password: 'Test@123456'
    });
    userToken = userLoginResponse.data.data.tokens.accessToken;
  });

  describe('Parking Lot Management Flow', () => {
    it('should create a parking lot', async () => {
      const lotData = {
        name: 'E2E Test Parking',
        address: {
          street: '789 E2E Blvd',
          city: 'Test City',
          state: 'TS',
          country: 'USA',
          postalCode: '54321'
        },
        location: {
          latitude: 40.7150,
          longitude: -74.0100
        },
        totalSpots: 100,
        basePricePerHour: 6.00,
        amenities: ['security', 'lighting', 'ev_charging']
      };
      
      const response = await axios.post(
        `${testServerUrl}/api/v1/parking/lots`,
        lotData,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.name).toBe(lotData.name);
      
      parkingLotId = response.data.data.id;
    });

    it('should get all parking lots', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/parking/lots`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('items');
      expect(response.data.data.items.length).toBeGreaterThan(0);
    });

    it('should get parking lot details', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/parking/lots/${parkingLotId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.id).toBe(parkingLotId);
      expect(response.data.data.name).toBe('E2E Test Parking');
    });

    it('should update parking lot', async () => {
      const updateData = {
        name: 'E2E Updated Parking',
        basePricePerHour: 7.50
      };
      
      const response = await axios.put(
        `${testServerUrl}/api/v1/parking/lots/${parkingLotId}`,
        updateData,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe(updateData.name);
      expect(response.data.data.basePricePerHour.amount).toBe(updateData.basePricePerHour);
    });
  });

  describe('Parking Search Flow', () => {
    it('should search parking by location', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/parking/lots/nearby`,
        {
          params: {
            latitude: 40.7128,
            longitude: -74.0060,
            radius: 10
          },
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
    });

    it('should search parking with filters', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/parking/lots/search`,
        {
          params: {
            query: 'E2E',
            amenities: ['security', 'ev_charging'],
            minRating: 4.0,
            maxPrice: 10.00
          },
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
    });
  });

  describe('Parking Availability Flow', () => {
    it('should check parking availability', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/parking/lots/${parkingLotId}/availability`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('totalSpots');
      expect(response.data.data).toHaveProperty('availableSpots');
      expect(response.data.data).toHaveProperty('isFull');
    });

    it('should get parking occupancy', async () => {
      const response = await axios.get(
        `${testServerUrl}/api/v1/parking/lots/${parkingLotId}/occupancy`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('occupancyRate');
    });
  });
});