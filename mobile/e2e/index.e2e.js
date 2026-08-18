// ============================================================================
// E2E Test Runner - Run All E2E Tests
// ============================================================================

// parking-management-system/mobile/e2e/index.e2e.js

import { device } from 'detox';

describe('E2E Test Suite', () => {
  // Import all test suites
  require('./auth.e2e');
  require('./parking.e2e');
  require('./booking.e2e');
  require('./payment.e2e');
  require('./profile.e2e');
  require('./charging.e2e');

  // Global test configuration
  beforeAll(async () => {
    // Set up test environment
    console.log('🚀 Starting E2E tests...');
  });

  afterAll(async () => {
    // Clean up test environment
    console.log('✅ E2E tests completed.');
  });
});

// Run specific test suites
describe('Smoke Tests', () => {
  test('should launch app successfully', async () => {
    await device.launchApp();
    await expect(element(by.id('loginScreen'))).toBeVisible();
  });

  test('should login successfully', async () => {
    await element(by.id('emailInput')).typeText('test@example.com');
    await element(by.id('passwordInput')).typeText('Test@123456');
    await element(by.id('loginButton')).tap();
    await expect(element(by.id('homeScreen'))).toBeVisible();
  });
});

// Package.json scripts
// {
//   "scripts": {
//     "test:e2e:ios": "detox test -c ios.sim.debug",
//     "test:e2e:android": "detox test -c android.emu.debug",
//     "test:e2e:ios:release": "detox test -c ios.sim.release",
//     "test:e2e:android:release": "detox test -c android.emu.release"
//   }
// }