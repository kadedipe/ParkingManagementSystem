// ============================================================================
// Test Setup - Integration Test Helpers
// ============================================================================

// parking-management-system/tests/integration/setup.ts

import { config } from 'dotenv';
import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';

// Load test environment
config({ path: '.env.test' });

// Global test variables
let app: INestApplication;
let request: supertest.SuperTest<supertest.Test>;

// Setup before all tests
beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  
  request = supertest(app.getHttpServer());
});

// Cleanup after all tests
afterAll(async () => {
  await app.close();
});

// Export for use in tests
export { app, request };

// Test utilities
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'Test@123456'
  };
  
  const user = { ...defaultUser, ...userData };
  const response = await request.post('/api/v1/auth/register').send(user);
  return response.body;
};

export const getAuthToken = async (email: string, password: string) => {
  const response = await request
    .post('/api/v1/auth/login')
    .send({ email, password });
  
  return response.body.data?.tokens?.accessToken;
};

export const createTestParkingLot = async (token: string, lotData = {}) => {
  const defaultLot = {
    name: 'Test Parking Lot',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'USA',
      postalCode: '12345'
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    totalSpots: 50,
    basePricePerHour: 5.00,
    amenities: ['security', 'lighting']
  };
  
  const lot = { ...defaultLot, ...lotData };
  const response = await request
    .post('/api/v1/parking/lots')
    .set('Authorization', `Bearer ${token}`)
    .send(lot);
  
  return response.body;
};

export const createTestBooking = async (token: string, bookingData = {}) => {
  const defaultBooking = {
    parkingLotId: 'test-parking-lot-id',
    spotId: 'test-spot-id',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    vehicleId: 'test-vehicle-id'
  };
  
  const booking = { ...defaultBooking, ...bookingData };
  const response = await request
    .post('/api/v1/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send(booking);
  
  return response.body;
};