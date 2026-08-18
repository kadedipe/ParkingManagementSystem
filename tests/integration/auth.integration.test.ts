// ============================================================================
// Auth Integration Tests - Authentication Flow Tests
// ============================================================================

// parking-management-system/tests/integration/auth.integration.test.ts

import { app, request, getAuthToken } from './setup';

describe('Authentication Integration Tests', () => {
  const testUser = {
    name: 'Integration Test User',
    email: `int_test_${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'Test@123456'
  };

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request
        .post('/api/v1/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should return 400 for duplicate email', async () => {
      await request.post('/api/v1/auth/register').send(testUser);
      
      const response = await request
        .post('/api/v1/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should return 400 for invalid input', async () => {
      const invalidUser = {
        name: '',
        email: 'invalid-email',
        password: 'short'
      };
      
      const response = await request
        .post('/api/v1/auth/register')
        .send(invalidUser);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('errors');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      // Register user first
      await request.post('/api/v1/auth/register').send(testUser);
      
      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request.post('/api/v1/auth/register').send(testUser);
      const loginResponse = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request.post('/api/v1/auth/register').send(testUser);
      const loginResponse = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request
        .post('/api/v1/auth/logout');
      
      expect(response.status).toBe(401);
    });
  });
});