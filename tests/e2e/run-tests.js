// ============================================================================
// E2E Test Runner - Run E2E Tests
// ============================================================================

// parking-management-system/tests/e2e/run-tests.js

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running E2E Tests...');
console.log('==================================================\n');

// Check if test environment is ready
try {
  console.log('📋 Checking test environment...');
  execSync('docker ps', { stdio: 'inherit' });
  console.log('✅ Docker is running');
} catch (error) {
  console.error('❌ Docker is not running. Please start Docker first.');
  process.exit(1);
}

// Start test environment
try {
  console.log('\n🔧 Starting test environment...');
  execSync('docker-compose -f tests/e2e/docker-compose.e2e.yml up -d', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../')
  });
  console.log('✅ Test environment started');
} catch (error) {
  console.error('❌ Failed to start test environment:', error);
  process.exit(1);
}

// Wait for services to be ready
console.log('\n⏳ Waiting for services to be ready...');
setTimeout(() => {
  console.log('✅ Services ready');
}, 10000);

// Run tests
try {
  console.log('\n🧪 Running E2E tests...');
  execSync('jest --config=tests/e2e/jest.config.js --runInBand', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../')
  });
  console.log('\n✅ All E2E tests passed successfully!');
} catch (error) {
  console.error('\n❌ E2E tests failed!');
  process.exit(1);
} finally {
  // Cleanup
  console.log('\n🧹 Cleaning up test environment...');
  execSync('docker-compose -f tests/e2e/docker-compose.e2e.yml down', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../')
  });
  console.log('✅ Test environment cleaned up');
}