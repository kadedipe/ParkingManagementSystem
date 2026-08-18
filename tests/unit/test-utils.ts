// ============================================================================
// Test Utilities - Helper Functions for Unit Tests
// ============================================================================

// parking-management-system/tests/unit/utils/test-utils.ts

import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

/**
 * Generate mock user data
 */
export const generateMockUser = (overrides = {}) => ({
  id: uuidv4(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  role: 'user',
  isVerified: true,
  isTwoFactorEnabled: false,
  loyaltyPoints: Math.floor(Math.random() * 1000),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

/**
 * Generate mock vehicle data
 */
export const generateMockVehicle = (overrides = {}) => ({
  id: uuidv4(),
  userId: uuidv4(),
  name: faker.vehicle.vehicle(),
  plateNumber: faker.vehicle.vrm(),
  vin: faker.vehicle.vin(),
  color: faker.vehicle.color(),
  year: faker.date.past({ years: 10 }).getFullYear(),
  make: { id: uuidv4(), name: faker.vehicle.manufacturer() },
  model: { id: uuidv4(), name: faker.vehicle.model() },
  type: { id: uuidv4(), name: 'car' },
  isEV: faker.datatype.boolean(),
  batteryCapacity: faker.number.float({ min: 40, max: 100 }),
  connectorType: 'type2',
  maxChargingPower: faker.number.int({ min: 50, max: 350 }),
  mileage: faker.number.int({ min: 0, max: 100000 }),
  isDefault: false,
  status: 'active',
  features: [],
  images: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

/**
 * Generate mock parking lot data
 */
export const generateMockParkingLot = (overrides = {}) => ({
  id: uuidv4(),
  name: faker.company.name() + ' Parking',
  description: faker.lorem.sentence(),
  type: 'standard',
  status: 'active',
  address: {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: 'USA',
    postalCode: faker.location.zipCode(),
    formatted: faker.location.streetAddress() + ', ' + faker.location.city()
  },
  location: {
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude()
  },
  totalSpots: faker.number.int({ min: 50, max: 500 }),
  availableSpots: faker.number.int({ min: 10, max: 50 }),
  reservedSpots: 0,
  basePricePerHour: { amount: faker.number.float({ min: 2, max: 10, precision: 0.01 }), currency: 'USD' },
  amenities: ['security', 'lighting', 'ev_charging'],
  features: ['reservation', 'premium'],
  operatingHours: {
    monday: { open: '06:00', close: '22:00', isOpen: true },
    tuesday: { open: '06:00', close: '22:00', isOpen: true },
    wednesday: { open: '06:00', close: '22:00', isOpen: true },
    thursday: { open: '06:00', close: '22:00', isOpen: true },
    friday: { open: '06:00', close: '22:00', isOpen: true },
    saturday: { open: '08:00', close: '20:00', isOpen: true },
    sunday: { open: '10:00', close: '18:00', isOpen: true }
  },
  rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
  reviewCount: faker.number.int({ min: 10, max: 500 }),
  images: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

/**
 * Generate mock booking data
 */
export const generateMockBooking = (overrides = {}) => {
  const startTime = faker.date.future();
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + faker.number.int({ min: 1, max: 4 }));
  
  return {
    id: uuidv4(),
    parkingLotId: uuidv4(),
    parkingLotName: faker.company.name() + ' Parking',
    spotId: uuidv4(),
    spotNumber: 'A' + faker.number.int({ min: 1, max: 20 }),
    userId: uuidv4(),
    vehicleId: uuidv4(),
    vehiclePlate: faker.vehicle.vrm(),
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: 'confirmed',
    amount: { amount: faker.number.float({ min: 10, max: 50, precision: 0.01 }), currency: 'USD' },
    paymentStatus: 'paid',
    paymentId: uuidv4(),
    qrCode: faker.string.alphanumeric(20),
    checkInTime: null,
    checkOutTime: null,
    isExtended: false,
    extensionCount: 0,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
};

/**
 * Generate mock payment data
 */
export const generateMockPayment = (overrides = {}) => ({
  id: uuidv4(),
  userId: uuidv4(),
  bookingId: uuidv4(),
  amount: { amount: faker.number.float({ min: 10, max: 100, precision: 0.01 }), currency: 'USD' },
  method: {
    id: uuidv4(),
    type: 'card',
    cardType: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    holderName: faker.person.fullName(),
    isDefault: true
  },
  status: 'completed',
  description: 'Parking booking payment',
  receiptUrl: 'https://example.com/receipt/' + uuidv4(),
  providerTransactionId: faker.string.alphanumeric(20),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

/**
 * Create mock HTTP request
 */
export const createMockRequest = (overrides = {}) => ({
  headers: {
    authorization: 'Bearer mock-token',
    'content-type': 'application/json'
  },
  body: {},
  params: {},
  query: {},
  user: { id: uuidv4(), role: 'user' },
  ip: '127.0.0.1',
  method: 'GET',
  url: '/api/test',
  ...overrides
});

/**
 * Create mock HTTP response
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    statusCode: 200,
    headers: {}
  };
  return res;
};

/**
 * Mock database repository
 */
export const createMockRepository = (overrides = {}) => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  })),
  ...overrides
});

/**
 * Sleep function for async testing
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API response
 */
export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  timestamp: new Date().toISOString()
});

/**
 * Mock API error
 */
export const mockApiError = (code: string, message: string, status = 400) => ({
  code,
  message,
  status,
  timestamp: new Date().toISOString()
});