// ============================================================================
// E2E Setup - Test Setup and Utilities
// ============================================================================

// parking-management-system/mobile/e2e/setup.js

import { device, element, by, waitFor } from 'detox';

// Increase timeout for all tests
jest.setTimeout(120000);

// Global setup before all tests
beforeAll(async () => {
  await device.launchApp({
    permissions: {
      notifications: 'YES',
      location: 'inuse',
      camera: 'YES',
      photos: 'YES',
    },
  });
});

// Reset app state before each test
beforeEach(async () => {
  await device.reloadReactNative();
});

// Global teardown after all tests
afterAll(async () => {
  await device.terminateApp();
});

// Custom matchers and utilities
expect.extend({
  async toBeVisible(element) {
    const isVisible = await element.isVisible();
    return {
      pass: isVisible,
      message: () => `Expected element to ${isVisible ? 'not ' : ''}be visible`,
    };
  },
  async toExist(element) {
    const exists = await element.exists();
    return {
      pass: exists,
      message: () => `Expected element to ${exists ? 'not ' : ''}exist`,
    };
  },
});