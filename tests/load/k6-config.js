// ============================================================================
// K6 Configuration - Load Test Configuration
// ============================================================================

// parking-management-system/tests/load/k6-config.js

import { Options } from 'k6/options';

// ============================================================================
// Environment Configuration
// ============================================================================

const ENV = {
  BASE_URL: __ENV.BASE_URL || 'http://localhost:3000',
  TEST_DURATION: __ENV.TEST_DURATION || '5m',
  VUS: parseInt(__ENV.VUS || '10'),
  MAX_VUS: parseInt(__ENV.MAX_VUS || '50'),
  ENVIRONMENT: __ENV.ENVIRONMENT || 'local',
};

// ============================================================================
// Test Stages Configuration
// ============================================================================

const getStages = () => {
  // Different test profiles
  const profiles = {
    // Smoke test - minimal load
    smoke: [
      { duration: '1m', target: 1 },
      { duration: '2m', target: 1 },
      { duration: '1m', target: 0 },
    ],
    
    // Load test - normal load
    load: [
      { duration: '2m', target: 10 },
      { duration: '5m', target: 10 },
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 0 },
    ],
    
    // Stress test - high load
    stress: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
    
    // Spike test - sudden spikes
    spike: [
      { duration: '2m', target: 10 },
      { duration: '30s', target: 100 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 10 },
      { duration: '1m', target: 0 },
    ],
    
    // Soak test - extended duration
    soak: [
      { duration: '5m', target: 20 },
      { duration: '30m', target: 20 },
      { duration: '5m', target: 0 },
    ],
    
    // Breakpoint test - find breaking point
    breakpoint: [
      { duration: '2m', target: 20 },
      { duration: '2m', target: 40 },
      { duration: '2m', target: 60 },
      { duration: '2m', target: 80 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 0 },
    ],
  };

  // Use the specified profile or default to load
  const profile = __ENV.TEST_PROFILE || 'load';
  return profiles[profile] || profiles.load;
};

// ============================================================================
// Thresholds Configuration
// ============================================================================

const getThresholds = () => {
  const baseThresholds = {
    // HTTP request duration thresholds
    http_req_duration: [
      'p(95)<500',   // 95% of requests must be below 500ms
      'p(99)<1000',  // 99% of requests must be below 1000ms
      'avg<300',     // Average must be below 300ms
    ],
    
    // HTTP request failed threshold
    http_req_failed: [
      'rate<0.01',   // Error rate must be below 1%
    ],
    
    // Custom error rate threshold
    errors: [
      'rate<0.1',    // Custom error rate must be below 10%
    ],
    
    // Response time trend
    response_time: [
      'p(95)<500',
      'p(99)<1000',
    ],
  };

  // Stricter thresholds for production
  if (ENV.ENVIRONMENT === 'production') {
    return {
      ...baseThresholds,
      http_req_duration: [
        'p(95)<300',   // 95% of requests must be below 300ms
        'p(99)<500',   // 99% of requests must be below 500ms
        'avg<200',     // Average must be below 200ms
      ],
      http_req_failed: [
        'rate<0.005',  // Error rate must be below 0.5%
      ],
    };
  }

  return baseThresholds;
};

// ============================================================================
// Scenarios Configuration
// ============================================================================

const getScenarios = () => {
  return {
    // Main scenario - realistic user behavior
    realistic_user_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: getStages(),
      gracefulRampDown: '30s',
      exec: 'default',
      tags: { scenario: 'realistic_user_flow' },
    },
    
    // Constant load scenario
    constant_load: {
      executor: 'constant-vus',
      vus: ENV.VUS,
      duration: ENV.TEST_DURATION,
      exec: 'default',
      tags: { scenario: 'constant_load' },
    },
    
    // Peak load scenario
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: ENV.VUS * 2 },
        { duration: '3m', target: ENV.VUS * 2 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'default',
      tags: { scenario: 'peak_load' },
    },
  };
};

// ============================================================================
// Summary Report Configuration
// ============================================================================

const summaryTrendStats = ['avg', 'min', 'max', 'p(95)', 'p(99)', 'p(99.9)'];

const summaryTime = 'json';

// ============================================================================
// Main Configuration Export
// ============================================================================

export const options = {
  // Test stages
  stages: getStages(),
  
  // Thresholds
  thresholds: getThresholds(),
  
  // Scenarios
  scenarios: getScenarios(),
  
  // Summary report
  summaryTrendStats,
  summaryTime,
  
  // Additional options
  discardResponseBodies: false,
  noColor: false,
  quiet: false,
  includeSystemEnvVars: true,
  
  // Tags
  tags: {
    environment: ENV.ENVIRONMENT,
    test_type: 'load',
    project: 'parking-management-system',
    version: '2.0.0',
  },
};

// ============================================================================
// Custom Configuration Sections
// ============================================================================

export const config = {
  // API endpoints configuration
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      refresh: '/api/v1/auth/refresh',
      logout: '/api/v1/auth/logout',
    },
    users: {
      profile: '/api/v1/users/profile',
      stats: '/api/v1/users/stats',
      vehicles: '/api/v1/vehicles',
    },
    parking: {
      lots: '/api/v1/parking/lots',
      nearby: '/api/v1/parking/lots/nearby',
      availability: '/api/v1/parking/lots/availability',
      spots: '/api/v1/parking/lots/spots',
    },
    bookings: {
      base: '/api/v1/bookings',
      checkin: '/api/v1/bookings/check-in',
      checkout: '/api/v1/bookings/check-out',
      extend: '/api/v1/bookings/extend',
      cancel: '/api/v1/bookings/cancel',
    },
    payments: {
      methods: '/api/v1/payments/methods',
      process: '/api/v1/payments/process',
      history: '/api/v1/payments/history',
      receipt: '/api/v1/payments/receipt',
    },
    charging: {
      stations: '/api/v1/charging/stations',
      sessions: '/api/v1/charging/sessions',
    },
    notifications: {
      base: '/api/v1/notifications',
      settings: '/api/v1/notifications/settings',
    },
  },
  
  // Test data configuration
  testData: {
    users: [
      { email: 'test1@example.com', password: 'Test@123456' },
      { email: 'test2@example.com', password: 'Test@123456' },
      { email: 'test3@example.com', password: 'Test@123456' },
      { email: 'test4@example.com', password: 'Test@123456' },
      { email: 'test5@example.com', password: 'Test@123456' },
    ],
    parkingLots: [
      {
        name: 'Load Test Parking 1',
        address: {
          street: '123 Load Test St',
          city: 'Test City',
          state: 'TS',
          country: 'USA',
          postalCode: '12345'
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        totalSpots: 100,
        basePricePerHour: 5.00,
      },
      {
        name: 'Load Test Parking 2',
        address: {
          street: '456 Load Test Ave',
          city: 'Test City',
          state: 'TS',
          country: 'USA',
          postalCode: '54321'
        },
        location: {
          latitude: 40.7142,
          longitude: -74.0080
        },
        totalSpots: 150,
        basePricePerHour: 7.50,
      },
    ],
    vehicles: [
      {
        name: 'Load Test Vehicle',
        make: 'Tesla',
        model: 'Model 3',
        type: 'car',
        year: 2023,
        color: 'White',
        isEV: true,
      },
    ],
  },
  
  // Performance targets
  performanceTargets: {
    responseTime: {
      p95: 500,  // 95th percentile response time in ms
      p99: 1000, // 99th percentile response time in ms
      avg: 300,  // Average response time in ms
    },
    throughput: {
      requestsPerSecond: 100, // Target requests per second
    },
    errorRate: {
      max: 0.01, // Maximum allowed error rate (1%)
    },
  },
  
  // Resource limits
  resourceLimits: {
    maxVUs: 100,
    maxDuration: '30m',
    maxMemory: '512MB',
  },
};

// ============================================================================
// Custom HTML Report Configuration
// ============================================================================

export const reportConfig = {
  title: 'Parking Management System - Load Test Report',
  logo: 'https://parkingapp.com/logo.png',
  colors: {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    background: '#F2F2F7',
  },
  charts: {
    responseTime: true,
    requests: true,
    errors: true,
    throughput: true,
  },
  tables: {
    summary: true,
    endpoints: true,
    errors: true,
  },
};

export default options;