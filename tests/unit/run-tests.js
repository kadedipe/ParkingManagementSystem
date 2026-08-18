// ============================================================================
// Test Runner - Run Unit Tests
// ============================================================================

// parking-management-system/tests/unit/run-tests.js

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Unit Tests...');
console.log('==================================================\n');

try {
  // Run tests with coverage
  execSync('jest --coverage --verbose', {
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  
  console.log('\n✅ All tests passed successfully!');
  console.log('📊 Coverage report generated in coverage/ directory');
} catch (error) {
  console.error('\n❌ Tests failed!');
  process.exit(1);
}