// ============================================================================
// Integration Test Runner - Run Integration Tests
// ============================================================================

// parking-management-system/tests/integration/run-tests.js

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Integration Tests...');
console.log('==================================================\n');

try {
  // Set environment for tests
  process.env.NODE_ENV = 'test';
  
  // Run tests with coverage
  execSync('jest --config=jest.config.js --coverage', {
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  
  console.log('\n✅ All integration tests passed successfully!');
  console.log('📊 Coverage report generated in coverage/ directory');
} catch (error) {
  console.error('\n❌ Integration tests failed!');
  process.exit(1);
}