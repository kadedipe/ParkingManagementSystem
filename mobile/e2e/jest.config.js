// ============================================================================
// Jest Configuration - E2E Test Configuration
// ============================================================================

// parking-management-system/mobile/e2e/jest.config.js

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./setup.js'],
  testMatch: ['**/?(*.)+(e2e).js'],
  testEnvironment: 'node',
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: './globalSetup.js',
  globalTeardown: './globalTeardown.js',
  reporters: ['detox/runners/jest/streamlineReporter'],
  verbose: true,
};