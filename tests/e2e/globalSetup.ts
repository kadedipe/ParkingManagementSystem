// ============================================================================
// Global Setup - E2E Test Environment Setup
// ============================================================================

// parking-management-system/tests/e2e/globalSetup.ts

import { config } from 'dotenv';
import { createConnection } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

module.exports = async () => {
  // Load test environment variables
  config({ path: '.env.test' });
  
  console.log('🚀 Setting up E2E test environment...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Setup test database
  try {
    await setupTestDatabase();
    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
  
  // Start test server
  try {
    await startTestServer();
    console.log('✅ Test server started');
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    throw error;
  }
};

async function setupTestDatabase() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
    database: process.env.DB_NAME || 'parking_e2e_db',
    synchronize: true,
    dropSchema: true,
    entities: ['src/models/**/*.ts'],
  });
  
  await connection.close();
}

async function startTestServer() {
  // Start the application in test mode
  const { stdout, stderr } = await execAsync('npm run start:test', {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3001'
    }
  });
  
  console.log('Test server output:', stdout);
  if (stderr) console.error('Test server error:', stderr);
}