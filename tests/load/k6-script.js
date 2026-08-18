// ============================================================================
// K6 Load Test Script - Performance Testing
// ============================================================================

// parking-management-system/tests/load/k6-script.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// Custom Metrics
// ============================================================================

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestsCounter = new Counter('requests');

// ============================================================================
// Test Configuration
// ============================================================================

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
    errors: ['rate<0.1'],             // Custom error rate must be below 10%
  },
  summaryTime: 'json',
};

// ============================================================================
// Test Data
// ============================================================================

const testUsers = [
  { email: 'test1@example.com', password: 'Test@123456' },
  { email: 'test2@example.com', password: 'Test@123456' },
  { email: 'test3@example.com', password: 'Test@123456' },
  { email: 'test4@example.com', password: 'Test@123456' },
  { email: 'test5@example.com', password: 'Test@123456' },
];

const testParkingLot = {
  name: 'Load Test Parking',
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
  amenities: ['security', 'lighting']
};

const testVehicle = {
  name: 'Load Test Vehicle',
  plateNumber: 'LOAD123',
  make: 'Tesla',
  model: 'Model 3',
  type: 'car',
  year: 2023,
  color: 'White'
};

// ============================================================================
// Helper Functions
// ============================================================================

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTestEmail() {
  return `load_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
}

function generateTestPlate() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let plate = '';
  for (let i = 0; i < 7; i++) {
    plate += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return plate;
}

// ============================================================================
// API Client
// ============================================================================

class APIClient {
  constructor() {
    this.baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
    this.token = null;
    this.userId = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // ============================================================================
  // Auth Endpoints
  // ============================================================================

  register(userData) {
    const url = `${this.baseUrl}/api/v1/auth/register`;
    const payload = JSON.stringify(userData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'register' },
    };
    return http.post(url, payload, params);
  }

  login(email, password) {
    const url = `${this.baseUrl}/api/v1/auth/login`;
    const payload = JSON.stringify({ email, password });
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'login' },
    };
    const response = http.post(url, payload, params);
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      if (data.data && data.data.tokens) {
        this.token = data.data.tokens.accessToken;
        this.userId = data.data.user.id;
      }
    }
    return response;
  }

  refreshToken(refreshToken) {
    const url = `${this.baseUrl}/api/v1/auth/refresh`;
    const payload = JSON.stringify({ refreshToken });
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'refresh' },
    };
    return http.post(url, payload, params);
  }

  logout() {
    const url = `${this.baseUrl}/api/v1/auth/logout`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'logout' },
    };
    const response = http.post(url, {}, params);
    this.token = null;
    this.userId = null;
    return response;
  }

  // ============================================================================
  // User Endpoints
  // ============================================================================

  getProfile() {
    const url = `${this.baseUrl}/api/v1/users/profile`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_profile' },
    };
    return http.get(url, params);
  }

  updateProfile(profileData) {
    const url = `${this.baseUrl}/api/v1/users/profile`;
    const payload = JSON.stringify(profileData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'update_profile' },
    };
    return http.put(url, payload, params);
  }

  // ============================================================================
  // Vehicle Endpoints
  // ============================================================================

  createVehicle(vehicleData) {
    const url = `${this.baseUrl}/api/v1/vehicles`;
    const payload = JSON.stringify(vehicleData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'create_vehicle' },
    };
    return http.post(url, payload, params);
  }

  getVehicles() {
    const url = `${this.baseUrl}/api/v1/vehicles`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_vehicles' },
    };
    return http.get(url, params);
  }

  getVehicle(id) {
    const url = `${this.baseUrl}/api/v1/vehicles/${id}`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_vehicle' },
    };
    return http.get(url, params);
  }

  updateVehicle(id, vehicleData) {
    const url = `${this.baseUrl}/api/v1/vehicles/${id}`;
    const payload = JSON.stringify(vehicleData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'update_vehicle' },
    };
    return http.put(url, payload, params);
  }

  deleteVehicle(id) {
    const url = `${this.baseUrl}/api/v1/vehicles/${id}`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'delete_vehicle' },
    };
    return http.del(url, params);
  }

  // ============================================================================
  // Parking Endpoints
  // ============================================================================

  createParkingLot(lotData) {
    const url = `${this.baseUrl}/api/v1/parking/lots`;
    const payload = JSON.stringify(lotData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'create_parking_lot' },
    };
    return http.post(url, payload, params);
  }

  getParkingLots(params = {}) {
    const url = `${this.baseUrl}/api/v1/parking/lots`;
    const qs = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = qs ? `${url}?${qs}` : url;
    const requestParams = {
      headers: this.getHeaders(),
      tags: { name: 'get_parking_lots' },
    };
    return http.get(fullUrl, requestParams);
  }

  getParkingLot(id) {
    const url = `${this.baseUrl}/api/v1/parking/lots/${id}`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_parking_lot' },
    };
    return http.get(url, params);
  }

  updateParkingLot(id, lotData) {
    const url = `${this.baseUrl}/api/v1/parking/lots/${id}`;
    const payload = JSON.stringify(lotData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'update_parking_lot' },
    };
    return http.put(url, payload, params);
  }

  deleteParkingLot(id) {
    const url = `${this.baseUrl}/api/v1/parking/lots/${id}`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'delete_parking_lot' },
    };
    return http.del(url, params);
  }

  getNearbyParkingLots(lat, lng, radius = 5) {
    const url = `${this.baseUrl}/api/v1/parking/lots/nearby`;
    const qs = `latitude=${lat}&longitude=${lng}&radius=${radius}`;
    const fullUrl = `${url}?${qs}`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_nearby_parking' },
    };
    return http.get(fullUrl, params);
  }

  getParkingAvailability(id) {
    const url = `${this.baseUrl}/api/v1/parking/lots/${id}/availability`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_parking_availability' },
    };
    return http.get(url, params);
  }

  // ============================================================================
  // Booking Endpoints
  // ============================================================================

  createBooking(bookingData) {
    const url = `${this.baseUrl}/api/v1/bookings`;
    const payload = JSON.stringify(bookingData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'create_booking' },
    };
    return http.post(url, payload, params);
  }

  getBookings(params = {}) {
    const url = `${this.baseUrl}/api/v1/bookings`;
    const qs = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = qs ? `${url}?${qs}` : url;
    const requestParams = {
      headers: this.getHeaders(),
      tags: { name: 'get_bookings' },
    };
    return http.get(fullUrl, requestParams);
  }

  getBooking(id) {
    const url = `${this.baseUrl}/api/v1/bookings/${id}`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_booking' },
    };
    return http.get(url, params);
  }

  cancelBooking(id, reason = '') {
    const url = `${this.baseUrl}/api/v1/bookings/${id}/cancel`;
    const payload = JSON.stringify({ reason });
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'cancel_booking' },
    };
    return http.post(url, payload, params);
  }

  extendBooking(id, additionalHours) {
    const url = `${this.baseUrl}/api/v1/bookings/${id}/extend`;
    const payload = JSON.stringify({ additionalHours });
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'extend_booking' },
    };
    return http.post(url, payload, params);
  }

  checkIn(id) {
    const url = `${this.baseUrl}/api/v1/bookings/${id}/check-in`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'check_in' },
    };
    return http.post(url, {}, params);
  }

  checkOut(id) {
    const url = `${this.baseUrl}/api/v1/bookings/${id}/check-out`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'check_out' },
    };
    return http.post(url, {}, params);
  }

  // ============================================================================
  // Payment Endpoints
  // ============================================================================

  createPaymentMethod(paymentData) {
    const url = `${this.baseUrl}/api/v1/payments/methods`;
    const payload = JSON.stringify(paymentData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'create_payment_method' },
    };
    return http.post(url, payload, params);
  }

  getPaymentMethods() {
    const url = `${this.baseUrl}/api/v1/payments/methods`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_payment_methods' },
    };
    return http.get(url, params);
  }

  processPayment(paymentData) {
    const url = `${this.baseUrl}/api/v1/payments/process`;
    const payload = JSON.stringify(paymentData);
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'process_payment' },
    };
    return http.post(url, payload, params);
  }

  getPaymentHistory(params = {}) {
    const url = `${this.baseUrl}/api/v1/payments/history`;
    const qs = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = qs ? `${url}?${qs}` : url;
    const requestParams = {
      headers: this.getHeaders(),
      tags: { name: 'get_payment_history' },
    };
    return http.get(fullUrl, requestParams);
  }

  getPaymentReceipt(id) {
    const url = `${this.baseUrl}/api/v1/payments/${id}/receipt`;
    const params = {
      headers: this.getHeaders(),
      tags: { name: 'get_payment_receipt' },
    };
    return http.get(url, params);
  }
}

// ============================================================================
// Test Scenarios
// ============================================================================

export function setup() {
  console.log('🔧 Setting up load test...');
  
  const api = new APIClient();
  const adminUser = {
    name: 'Load Test Admin',
    email: `load_admin_${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'Test@123456',
    role: 'admin'
  };
  
  // Register admin user
  const registerResponse = api.register(adminUser);
  check(registerResponse, {
    'admin registration successful': (r) => r.status === 201,
  });
  
  // Login admin
  const loginResponse = api.login(adminUser.email, adminUser.password);
  check(loginResponse, {
    'admin login successful': (r) => r.status === 200,
  });
  
  // Create test parking lot
  const lotResponse = api.createParkingLot(testParkingLot);
  check(lotResponse, {
    'parking lot created': (r) => r.status === 201,
  });
  
  const lotData = JSON.parse(lotResponse.body);
  const parkingLotId = lotData.data.id;
  
  // Create test vehicle
  const vehicleData = { ...testVehicle, plateNumber: generateTestPlate() };
  const vehicleResponse = api.createVehicle(vehicleData);
  check(vehicleResponse, {
    'vehicle created': (r) => r.status === 201,
  });
  
  const vehicleDataResponse = JSON.parse(vehicleResponse.body);
  const vehicleId = vehicleDataResponse.data.id;
  
  // Prepare test data for scenarios
  const testData = {
    adminUser,
    parkingLotId,
    vehicleId,
    api,
  };
  
  console.log('✅ Load test setup complete');
  return testData;
}

export default function (data) {
  const api = new APIClient();
  const user = getRandomUser();
  
  // ============================================================================
  // Scenario: User Flow
  // ============================================================================
  
  // 1. Login
  const loginResponse = api.login(user.email, user.password);
  const loginCheck = check(loginResponse, {
    'login successful': (r) => r.status === 200,
  });
  
  if (!loginCheck) {
    errorRate.add(1);
    return;
  }
  
  // 2. Get profile
  const profileResponse = api.getProfile();
  check(profileResponse, {
    'get profile successful': (r) => r.status === 200,
  });
  
  // 3. Get vehicles
  const vehiclesResponse = api.getVehicles();
  check(vehiclesResponse, {
    'get vehicles successful': (r) => r.status === 200,
  });
  
  // 4. Create vehicle
  const newVehicle = {
    name: 'Load Test Vehicle',
    plateNumber: generateTestPlate(),
    make: 'Toyota',
    model: 'Camry',
    type: 'car',
    year: 2023,
    color: 'Blue'
  };
  const createVehicleResponse = api.createVehicle(newVehicle);
  check(createVehicleResponse, {
    'create vehicle successful': (r) => r.status === 201,
  });
  
  let vehicleId = null;
  if (createVehicleResponse.status === 201) {
    const vehicleData = JSON.parse(createVehicleResponse.body);
    vehicleId = vehicleData.data.id;
  }
  
  // 5. Get parking lots
  const lotsResponse = api.getParkingLots({ limit: 10 });
  check(lotsResponse, {
    'get parking lots successful': (r) => r.status === 200,
  });
  
  let parkingLotId = data.parkingLotId;
  
  // 6. Get parking lot details
  const lotResponse = api.getParkingLot(parkingLotId);
  check(lotResponse, {
    'get parking lot details successful': (r) => r.status === 200,
  });
  
  // 7. Check availability
  const availabilityResponse = api.getParkingAvailability(parkingLotId);
  check(availabilityResponse, {
    'get availability successful': (r) => r.status === 200,
  });
  
  // 8. Create booking
  const startTime = new Date(Date.now() + 3600000).toISOString();
  const endTime = new Date(Date.now() + 7200000).toISOString();
  
  const bookingData = {
    parkingLotId,
    spotId: `A${getRandomInt(1, 10)}`,
    startTime,
    endTime,
    vehicleId: vehicleId || data.vehicleId,
  };
  
  const bookingResponse = api.createBooking(bookingData);
  const bookingCheck = check(bookingResponse, {
    'create booking successful': (r) => r.status === 201,
  });
  
  let bookingId = null;
  if (bookingCheck) {
    const bookingDataResponse = JSON.parse(bookingResponse.body);
    bookingId = bookingDataResponse.data.id;
    
    // 9. Get booking
    const getBookingResponse = api.getBooking(bookingId);
    check(getBookingResponse, {
      'get booking successful': (r) => r.status === 200,
    });
    
    // 10. Check in
    const checkInResponse = api.checkIn(bookingId);
    check(checkInResponse, {
      'check in successful': (r) => r.status === 200,
    });
    
    // 11. Extend booking
    const extendResponse = api.extendBooking(bookingId, 1);
    check(extendResponse, {
      'extend booking successful': (r) => r.status === 200,
    });
    
    // 12. Check out
    const checkOutResponse = api.checkOut(bookingId);
    check(checkOutResponse, {
      'check out successful': (r) => r.status === 200,
    });
    
    // 13. Cancel booking
    const cancelResponse = api.cancelBooking(bookingId);
    check(cancelResponse, {
      'cancel booking successful': (r) => r.status === 200,
    });
  }
  
  // 14. Delete vehicle
  if (vehicleId) {
    const deleteVehicleResponse = api.deleteVehicle(vehicleId);
    check(deleteVehicleResponse, {
      'delete vehicle successful': (r) => r.status === 204,
    });
  }
  
  // 15. Logout
  const logoutResponse = api.logout();
  check(logoutResponse, {
    'logout successful': (r) => r.status === 200,
  });
  
  // Record metrics
  errorRate.add(0);
  
  // Random sleep between requests
  sleep(Math.random() * 2 + 1);
}

// ============================================================================
// Teardown
// ============================================================================

export function teardown(data) {
  console.log('🧹 Cleaning up load test data...');
  
  const api = data.api || new APIClient();
  
  // Login as admin
  const loginResponse = api.login(data.adminUser.email, data.adminUser.password);
  if (loginResponse.status !== 200) {
    console.log('❌ Failed to login as admin for cleanup');
    return;
  }
  
  // Delete test parking lot
  if (data.parkingLotId) {
    const deleteResponse = api.deleteParkingLot(data.parkingLotId);
    check(deleteResponse, {
      'delete parking lot successful': (r) => r.status === 204,
    });
  }
  
  console.log('✅ Load test cleanup complete');
}

// ============================================================================
// Custom Summary Report
// ============================================================================

export function handleSummary(data) {
  console.log('📊 Generating load test summary...');
  
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.txt': `
========================================
  LOAD TEST SUMMARY
========================================

Test Duration: ${data.state.testRunDuration}
VUs: ${data.state.vus} (max: ${data.state.vusMax})

HTTP Requests:
  Total: ${data.metrics.http_reqs.values.count}
  Rate: ${data.metrics.http_reqs.values.rate}/s

Response Times:
  Avg: ${data.metrics.http_req_duration.values.avg}ms
  Min: ${data.metrics.http_req_duration.values.min}ms
  Max: ${data.metrics.http_req_duration.values.max}ms
  P95: ${data.metrics.http_req_duration.values['p(95)']}ms
  P99: ${data.metrics.http_req_duration.values['p(99)']}ms

Error Rate:
  HTTP Errors: ${data.metrics.http_req_failed.values.rate * 100}%
  Custom Errors: ${data.metrics.errors.values.rate * 100}%

Status Codes:
  ${Object.entries(data.metrics.http_req_status).filter(([key]) => key !== 'value').map(([key, val]) => `  ${key}: ${val.values.count}`).join('\n')}

Performance Thresholds:
  HTTP Duration < 500ms (95%): ${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✅ PASS' : '❌ FAIL'}
  HTTP Error Rate < 1%: ${data.metrics.http_req_failed.values.rate < 0.01 ? '✅ PASS' : '❌ FAIL'}
  Custom Error Rate < 10%: ${data.metrics.errors.values.rate < 0.1 ? '✅ PASS' : '❌ FAIL'}

========================================
    `,
  };
}