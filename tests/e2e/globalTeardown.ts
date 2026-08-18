// ============================================================================
// Global Teardown - E2E Test Cleanup
// ============================================================================

// parking-management-system/tests/e2e/globalTeardown.ts

import { getConnection } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

module.exports = async () => {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Cleanup test database
  try {
    await cleanupTestDatabase();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }
  
  // Stop test server
  try {
    await stopTestServer();
    console.log('✅ Test server stopped');
  } catch (error) {
    console.error('❌ Failed to stop test server:', error);
  }
};

async function cleanupTestDatabase() {
  try {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  } catch (error) {
    // Connection might not exist
  }
}

async function stopTestServer() {
  try {
    await execAsync('pkill -f "node.*dist/main" || true');
  } catch (error) {
    // Ignore errors
  }
}