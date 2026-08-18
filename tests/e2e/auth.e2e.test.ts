// ============================================================================
// Authentication E2E Tests - Full Authentication Flow
// ============================================================================

// parking-management-system/tests/e2e/auth.e2e.test.ts

import { testServerUrl, createTestUser, loginTestUser, waitFor } from './setup';
import axios from 'axios';

describe('Authentication E2E Tests', () => {
  const testUser = {
    name: 'E2E Auth Test',
    email: `e2e_auth_${Date.now()}@example.com`,
    phone: '+1234567890',
    password: 'Test@123456'
  };

  describe('User Registration Flow', () => {
    it('should complete full registration flow', async () => {
      // Step 1: Register user
      const registerResponse = await axios.post(`${testServerUrl}/api/v1/auth/register`, testUser);
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.data.success).toBe(true);
      expect(registerResponse.data.data).toHaveProperty('user');
      expect(registerResponse.data.data.user.email).toBe(testUser.email);
      
      // Step 2: Verify email (simulated)
      const verifyResponse = await axios.post(`${testServerUrl}/api/v1/auth/verify-email`, {
        token: registerResponse.data.data.user.id
      });
      
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.data.success).toBe(true);
    });

    it('should handle duplicate email registration', async () => {
      // First registration
      await axios.post(`${testServerUrl}/api/v1/auth/register`, testUser);
      
      // Second registration with same email
      try {
        await axios.post(`${testServerUrl}/api/v1/auth/register`, testUser);
        fail('Should have thrown 409 error');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.error.message).toContain('already exists');
      }
    });
  });

  describe('User Login Flow', () => {
    it('should complete full login flow', async () => {
      // Step 1: Register user
      const userEmail = generateTestEmail();
      await axios.post(`${testServerUrl}/api/v1/auth/register`, {
        ...testUser,
        email: userEmail
      });
      
      // Step 2: Login
      const loginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
        email: userEmail,
        password: testUser.password
      });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.success).toBe(true);
      expect(loginResponse.data.data).toHaveProperty('tokens');
      expect(loginResponse.data.data.tokens).toHaveProperty('accessToken');
      expect(loginResponse.data.data.tokens).toHaveProperty('refreshToken');
      
      // Step 3: Access protected endpoint
      const protectedResponse = await axios.get(`${testServerUrl}/api/v1/users/profile`, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.data.tokens.accessToken}`
        }
      });
      
      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.data.success).toBe(true);
      expect(protectedResponse.data.data.email).toBe(userEmail);
    });

    it('should handle invalid credentials', async () => {
      try {
        await axios.post(`${testServerUrl}/api/v1/auth/login`, {
          email: testUser.email,
          password: 'wrongpassword'
        });
        fail('Should have thrown 401 error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.success).toBe(false);
      }
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh tokens successfully', async () => {
      // Register and login
      const userEmail = generateTestEmail();
      await axios.post(`${testServerUrl}/api/v1/auth/register`, {
        ...testUser,
        email: userEmail
      });
      
      const loginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
        email: userEmail,
        password: testUser.password
      });
      
      const refreshToken = loginResponse.data.data.tokens.refreshToken;
      
      // Refresh token
      const refreshResponse = await axios.post(`${testServerUrl}/api/v1/auth/refresh`, {
        refreshToken
      });
      
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data.success).toBe(true);
      expect(refreshResponse.data.data).toHaveProperty('accessToken');
      expect(refreshResponse.data.data).toHaveProperty('refreshToken');
    });
  });

  describe('Logout Flow', () => {
    it('should logout successfully', async () => {
      // Register and login
      const userEmail = generateTestEmail();
      await axios.post(`${testServerUrl}/api/v1/auth/register`, {
        ...testUser,
        email: userEmail
      });
      
      const loginResponse = await axios.post(`${testServerUrl}/api/v1/auth/login`, {
        email: userEmail,
        password: testUser.password
      });
      
      const accessToken = loginResponse.data.data.tokens.accessToken;
      
      // Logout
      const logoutResponse = await axios.post(
        `${testServerUrl}/api/v1/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.data.success).toBe(true);
      
      // Try to access protected endpoint with invalidated token
      try {
        await axios.get(`${testServerUrl}/api/v1/users/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fail('Should have thrown 401 error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});