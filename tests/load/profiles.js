// ============================================================================
// Profile Configurations - Different Test Profiles
// ============================================================================

// parking-management-system/tests/load/profiles.js

export const profiles = {
  // ============================================================================
  // Smoke Test - Minimal load to validate system
  // ============================================================================
  smoke: {
    stages: [
      { duration: '1m', target: 1 },
      { duration: '2m', target: 1 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.05'],
    },
    vus: 1,
    duration: '4m',
  },

  // ============================================================================
  // Load Test - Normal expected load
  // ============================================================================
  load: {
    stages: [
      { duration: '2m', target: 10 },
      { duration: '5m', target: 10 },
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.01'],
    },
    vus: 10,
    duration: '16m',
  },

  // ============================================================================
  // Stress Test - High load to find breaking point
  // ============================================================================
  stress: {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.05'],
    },
    vus: 20,
    duration: '16m',
  },

  // ============================================================================
  // Spike Test - Sudden spikes in traffic
  // ============================================================================
  spike: {
    stages: [
      { duration: '2m', target: 10 },
      { duration: '30s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 10 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.05'],
    },
    vus: 10,
    duration: '5m',
  },

  // ============================================================================
  // Soak Test - Extended duration to identify memory leaks
  // ============================================================================
  soak: {
    stages: [
      { duration: '5m', target: 20 },
      { duration: '30m', target: 20 },
      { duration: '5m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.02'],
    },
    vus: 20,
    duration: '40m',
  },

  // ============================================================================
  // Breakpoint Test - Find breaking point
  // ============================================================================
  breakpoint: {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '2m', target: 40 },
      { duration: '2m', target: 60 },
      { duration: '2m', target: 80 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<5000'],
      http_req_failed: ['rate<0.1'],
    },
    vus: 20,
    duration: '12m',
  },
};

export const getProfile = (name = 'load') => {
  return profiles[name] || profiles.load;
};