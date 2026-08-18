// ============================================================================
// Test Setup - E2E Test Utilities
// ============================================================================

// parking-management-system/tests/e2e/setup.ts

import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as axios from 'axios';
import * as crypto from 'crypto';

// Load test environment
config({ path: '.env.test' });

// Global test variables
let testServerUrl: string;
let testData: any = {};

// Setup before all tests
beforeAll(() => {
  testServerUrl = `http://localhost:3001`;
  console.log(`🌐 Test server URL: ${testServerUrl}`);
});

// Export test utilities
export { testServerUrl, testData };

// Test helpers
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'E2E Test User',
    email: `e2e_${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'Test@123456'
  };
  
  const user = { ...defaultUser, ...userData };
  const response = await axios.post(`${testServerUrl}/api/v1/auth/register`, user);
  return response.data;
};

export const loginTestUser = async (email: string, password: string) => {
  const response = await axios.post(`${testServerUrl}/api/v1/auth/login`, { email, password });
  return response.data;
};

export const createTestParkingLot = async (token: string, lotData = {}) => {
  const defaultLot = {
    name: 'E2E Test Parking',
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
    basePricePerHour: 5.00
  };
  
  const lot = { ...defaultLot, ...lotData };
  const response = await axios.post(
    `${testServerUrl}/api/v1/parking/lots`,
    lot,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const createTestVehicle = async (token: string, vehicleData = {}) => {
  const defaultVehicle = {
    name: 'E2E Test Vehicle',
    plateNumber: `E2E${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    make: 'Tesla',
    model: 'Model 3',
    type: 'car',
    year: 2023,
    color: 'White'
  };
  
  const vehicle = { ...defaultVehicle, ...vehicleData };
  const response = await axios.post(
    `${testServerUrl}/api/v1/vehicles`,
    vehicle,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
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
  const response = await axios.post(
    `${testServerUrl}/api/v1/bookings`,
    booking,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateTestEmail = () => `e2e_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

export const generateTestPlate = () => `E2E${crypto.randomBytes(4).toString('hex').toUpperCase()}`;