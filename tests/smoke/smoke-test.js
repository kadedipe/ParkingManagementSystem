// ============================================================================
// Smoke Test Script - Post-Deployment Verification
// ============================================================================

// parking-management-system/tests/smoke/smoke-test.js

const axios = require('axios');
const { performance } = require('perf_hooks');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TIMEOUT = 10000;

async function runSmokeTests() {
  console.log('🚀 Running smoke tests...');
  console.log(`📍 API URL: ${API_URL}`);
  console.log('========================================\n');

  const tests = [
    { name: 'Health Check', endpoint: '/health', method: 'GET' },
    { name: 'API Version', endpoint: '/api/v1/version', method: 'GET' },
    { name: 'Public Parking Lots', endpoint: '/api/v1/parking/lots?limit=1', method: 'GET' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const start = performance.now();
      const response = await axios({
        method: test.method,
        url: `${API_URL}${test.endpoint}`,
        timeout: TIMEOUT,
      });
      const duration = performance.now() - start;

      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${test.name}: ${response.status} (${duration.toFixed(0)}ms)`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: ${response.status} (${duration.toFixed(0)}ms)`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests();