// ============================================================================
// Global Setup - Integration Test Setup
// ============================================================================

// parking-management-system/tests/integration/globalSetup.ts

import { config } from 'dotenv';
import { createConnection, getConnection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

module.exports = async () => {
  // Load test environment variables
  config({ path: '.env.test' });
  
  console.log('🚀 Setting up integration test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'parking_test_db';
  process.env.JWT_SECRET = 'test_jwt_secret_key';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  
  // Create test database connection
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'test_user',
      password: process.env.DB_PASSWORD || 'test_password',
      database: process.env.DB_NAME || 'parking_test_db',
      synchronize: true,
      dropSchema: true,
      entities: ['src/models/**/*.ts'],
    });
    
    console.log('✅ Test database connected');
    
    // Seed test data
    await seedTestData(connection);
    
    console.log('✅ Test data seeded');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
};

async function seedTestData(connection: any) {
  // Create test users
  const passwordHash = await bcrypt.hash('Test@123456', 10);
  
  const users = [
    {
      id: uuidv4(),
      name: 'Test User 1',
      email: 'test1@example.com',
      phone: '+1234567890',
      passwordHash,
      role: 'user',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Test User 2',
      email: 'test2@example.com',
      phone: '+1234567891',
      passwordHash,
      role: 'user',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Test Admin',
      email: 'admin@example.com',
      phone: '+1234567892',
      passwordHash,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await connection.getRepository('User').save(users);
  
  // Create test parking lots
  const parkingLots = [
    {
      id: uuidv4(),
      name: 'Downtown Parking',
      description: 'Convenient downtown parking',
      type: 'standard',
      status: 'active',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      },
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      totalSpots: 100,
      availableSpots: 45,
      basePricePerHour: 5.00,
      amenities: ['security', 'lighting', 'ev_charging'],
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'City Center Garage',
      description: 'Secure garage in city center',
      type: 'premium',
      status: 'active',
      address: {
        street: '456 Broadway',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10002'
      },
      location: {
        latitude: 40.7142,
        longitude: -74.0080
      },
      totalSpots: 200,
      availableSpots: 120,
      basePricePerHour: 7.50,
      amenities: ['security', 'covered', 'valet'],
      rating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      name: 'Airport Parking',
      description: 'Long-term parking near airport',
      type: 'standard',
      status: 'active',
      address: {
        street: '789 Airport Blvd',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10003'
      },
      location: {
        latitude: 40.7100,
        longitude: -74.0100
      },
      totalSpots: 300,
      availableSpots: 0,
      basePricePerHour: 3.00,
      amenities: ['security', 'lighting'],
      rating: 4.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await connection.getRepository('ParkingLot').save(parkingLots);
  
  // Create test vehicles
  const vehicles = [
    {
      id: uuidv4(),
      userId: users[0].id,
      name: 'Tesla Model 3',
      plateNumber: 'ABC-1234',
      vin: '5YJ3E1EA7JF123456',
      color: 'White',
      year: 2023,
      make: { id: uuidv4(), name: 'Tesla' },
      model: { id: uuidv4(), name: 'Model 3' },
      type: { id: uuidv4(), name: 'car' },
      isEV: true,
      batteryCapacity: 75.0,
      connectorType: 'type2',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: uuidv4(),
      userId: users[1].id,
      name: 'Toyota Camry',
      plateNumber: 'XYZ-5678',
      vin: '4T1B11HK5KU123456',
      color: 'Black',
      year: 2022,
      make: { id: uuidv4(), name: 'Toyota' },
      model: { id: uuidv4(), name: 'Camry' },
      type: { id: uuidv4(), name: 'car' },
      isEV: false,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await connection.getRepository('Vehicle').save(vehicles);
}