// ============================================================================
// Global Teardown - Integration Test Cleanup
// ============================================================================

// parking-management-system/tests/integration/globalTeardown.ts

import { getConnection } from 'typeorm';

module.exports = async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  try {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }
};