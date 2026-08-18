// ============================================================================
// API Interceptors
// ============================================================================

/**
 * Request and response interceptors for the API client.
 * 
 * This module handles:
 * - Authentication token injection
 * - Request/response logging
 * - Error handling
 * - Token refresh on 401
 * - Offline queue management
 */

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';
import { API_ENDPOINTS } from './endpoints';

// ============================================================================
// Setup Interceptors
// ============================================================================

export const setupInterceptors = (apiClient, options) => {
  const {
    getAccessToken,
    getRefreshToken,
    refreshAccessToken,
    setTokens,
    clearTokens,
    subscribeTokenRefresh,
    onTokenRefreshed,
    queueRequest,
    processQueue,
  } = options;

  // ==========================================================================
  // Request Interceptor
  // ==========================================================================

  apiClient.interceptors.request.use(
    async (config) => {
      // Add timestamp for debugging
      config.metadata = { startTime: Date.now() };
      
      // Add authentication token
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add platform header
      config.headers['X-Platform'] = Platform.OS;
      
      // Log request in development
      if (__DEV__) {
        logger.debug(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          headers: config.headers,
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ==========================================================================
  // Response Interceptor
  // ==========================================================================

  apiClient.interceptors.response.use(
    (response) => {
      // Log response in development
      if (__DEV__) {
        const duration = Date.now() - response.config.metadata?.startTime;
        logger.debug(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
        });
      }
      
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Log error in development
      if (__DEV__) {
        logger.error('❌ API Error:', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      
      // Handle network errors
      if (!error.response) {
        // Check network status
        const netInfo = await NetInfo.fetch();
        
        if (!netInfo.isConnected) {
          // Queue request for later
          return new Promise((resolve, reject) => {
            queueRequest({
              request: originalRequest,
              resolve,
              reject,
            });
          });
        }
        
        return Promise.reject({
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        });
      }
      
      // Handle 401 Unauthorized - Token expired
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Don't try to refresh on login/register endpoints
        const isAuthEndpoint = Object.values(API_ENDPOINTS.auth).some(
          endpoint => originalRequest.url.includes(endpoint)
        );
        
        if (isAuthEndpoint) {
          return Promise.reject(error);
        }
        
        if (isRefreshing) {
          // If already refreshing, wait for new token
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            });
          });
        }
        
        isRefreshing = true;
        
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onTokenRefreshed(newToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          clearTokens();
          // Redirect to login
          return Promise.reject({
            message: 'Session expired. Please login again.',
            code: 'SESSION_EXPIRED',
          });
        }
      }
      
      // Handle 429 Rate Limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(apiClient(originalRequest));
          }, retryAfter * 1000);
        });
      }
      
      // Handle other errors
      return Promise.reject({
        message: error.response?.data?.message || error.response?.data?.detail || 'An error occurred',
        status: error.response?.status,
        data: error.response?.data,
        code: error.response?.data?.code,
      });
    }
  );
};

// ============================================================================
// Export
// ============================================================================

export default { setupInterceptors };