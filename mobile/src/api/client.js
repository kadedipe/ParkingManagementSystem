// ============================================================================
// API Client
// ============================================================================

/**
 * API client configuration for the mobile app.
 * 
 * This module provides a configured Axios instance with:
 * - Base URL configuration
 * - Default headers
 * - Request/response interceptors
 * - Error handling
 * - Retry logic
 * - Authentication token management
 * - Offline queue support
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

import { API_ENDPOINTS } from './endpoints';
import { setupInterceptors } from './interceptors';
import { logger } from '../utils/logger';
import { config } from '../config';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// ============================================================================
// Axios Instance
// ============================================================================

/**
 * Create Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: config.api.url,
  timeout: config.api.timeout || DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Platform': Platform.OS,
    'X-App-Version': config.app.version,
  },
  withCredentials: true,
});

// ============================================================================
// Token Management
// ============================================================================

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Set access and refresh tokens
 */
export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  
  if (access) {
    AsyncStorage.setItem('access_token', access);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  } else {
    AsyncStorage.removeItem('access_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
  
  if (refresh) {
    AsyncStorage.setItem('refresh_token', refresh);
  } else {
    AsyncStorage.removeItem('refresh_token');
  }
};

/**
 * Get access token
 */
export const getAccessToken = async () => {
  if (!accessToken) {
    accessToken = await AsyncStorage.getItem('access_token');
  }
  return accessToken;
};

/**
 * Get refresh token
 */
export const getRefreshToken = async () => {
  if (!refreshToken) {
    refreshToken = await AsyncStorage.getItem('refresh_token');
  }
  return refreshToken;
};

/**
 * Clear tokens
 */
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  AsyncStorage.removeItem('access_token');
  AsyncStorage.removeItem('refresh_token');
  delete apiClient.defaults.headers.common['Authorization'];
};

// ============================================================================
// Token Refresh
// ============================================================================

/**
 * Refresh access token
 */
export const refreshAccessToken = async () => {
  try {
    const refresh = await getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${config.api.url}/auth/refresh`,
      { refresh_token: refresh },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    
    return access_token;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

/**
 * Subscribe to token refresh
 */
export const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * On token refreshed
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// ============================================================================
// Request Queue (Offline Support)
// ============================================================================

let requestQueue = [];
let isProcessingQueue = false;

/**
 * Process request queue
 */
export const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { request, resolve, reject } = requestQueue.shift();
    try {
      const response = await apiClient(request);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  }
  
  isProcessingQueue = false;
};

/**
 * Add request to queue
 */
export const queueRequest = (request) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ request, resolve, reject });
  });
};

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Retry request with exponential backoff
 */
export const retryRequest = async (requestFn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's a client error (4xx) except 429
      if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        throw error;
      }
      
      // Don't retry if it's a cancellation
      if (axios.isCancel(error)) {
        throw error;
      }
      
      if (attempt < retries) {
        // Exponential backoff
        const backoff = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }
  
  throw lastError;
};

// ============================================================================
// API Methods
// ============================================================================

/**
 * GET request
 */
export const get = (url, config = {}) => {
  return retryRequest(() => apiClient.get(url, config));
};

/**
 * POST request
 */
export const post = (url, data, config = {}) => {
  return retryRequest(() => apiClient.post(url, data, config));
};

/**
 * PUT request
 */
export const put = (url, data, config = {}) => {
  return retryRequest(() => apiClient.put(url, data, config));
};

/**
 * PATCH request
 */
export const patch = (url, data, config = {}) => {
  return retryRequest(() => apiClient.patch(url, data, config));
};

/**
 * DELETE request
 */
export const del = (url, config = {}) => {
  return retryRequest(() => apiClient.delete(url, config));
};

/**
 * Upload file
 */
export const upload = (url, file, onProgress, config = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return retryRequest(() => apiClient.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(progress);
      }
    },
  }));
};

/**
 * Download file
 */
export const download = (url, config = {}) => {
  return retryRequest(() => apiClient.get(url, {
    ...config,
    responseType: 'blob',
  }));
};

// ============================================================================
// Setup Interceptors
// ============================================================================

setupInterceptors(apiClient, {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  setTokens,
  clearTokens,
  subscribeTokenRefresh,
  onTokenRefreshed,
  queueRequest,
  processQueue,
});

// ============================================================================
// Export
// ============================================================================

export default apiClient;