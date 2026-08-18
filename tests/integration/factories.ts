// ============================================================================
// Test Data Factories - Generate Test Data
// ============================================================================

// parking-management-system/tests/integration/factories.ts

import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

export class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      id: uuidv4(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: 'Test@123456',
      role: 'user',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createParkingLot(overrides = {}) {
    return {
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
        postalCode: faker.location.zipCode()
      },
      location: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude()
      },
      totalSpots: faker.number.int({ min: 50, max: 500 }),
      availableSpots: faker.number.int({ min: 10, max: 50 }),
      basePricePerHour: faker.number.float({ min: 2, max: 10, precision: 0.01 }),
      amenities: ['security', 'lighting', 'ev_charging'],
      rating: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createBooking(overrides = {}) {
    const startTime = faker.date.future();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + faker.number.int({ min: 1, max: 4 }));
    
    return {
      id: uuidv4(),
      parkingLotId: uuidv4(),
      spotId: uuidv4(),
      userId: uuidv4(),
      vehicleId: uuidv4(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'confirmed',
      amount: faker.number.float({ min: 10, max: 50, precision: 0.01 }),
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }
}