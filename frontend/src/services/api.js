// ============================================================================
// API Service
// ============================================================================

/**
 * API service for making HTTP requests to the backend.
 * 
 * This service provides:
 * - Axios instance with base configuration
 * - Request/response interceptors
 * - Authentication token management
 * - Error handling and retry logic
 * - Request cancellation
 * - Logging and debugging
 * - Offline queue support
 * - Rate limiting handling
 */

import axios from 'axios';
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

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout || DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// ============================================================================
// Request Queue (for offline support)
// ============================================================================

let requestQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { request, resolve, reject } = requestQueue.shift();
    try {
      const response = await api(request);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  }
  
  isProcessingQueue = false;
};

// ============================================================================
// Token Management
// ============================================================================

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  
  if (access) {
    localStorage.setItem(config.auth.tokenStorageKey, access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  } else {
    localStorage.removeItem(config.auth.tokenStorageKey);
    delete api.defaults.headers.common['Authorization'];
  }
  
  if (refresh) {
    localStorage.setItem(config.auth.refreshTokenStorageKey, refresh);
  } else {
    localStorage.removeItem(config.auth.refreshTokenStorageKey);
  }
};

const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem(config.auth.tokenStorageKey);
  }
  return accessToken;
};

const getRefreshToken = () => {
  if (!refreshToken) {
    refreshToken = localStorage.getItem(config.auth.refreshTokenStorageKey);
  }
  return refreshToken;
};

const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(config.auth.tokenStorageKey);
  localStorage.removeItem(config.auth.refreshTokenStorageKey);
  delete api.defaults.headers.common['Authorization'];
};

// ============================================================================
// Token Refresh
// ============================================================================

const refreshAccessToken = async () => {
  try {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${config.api.baseUrl}/auth/refresh`, {
      refresh_token: refresh,
    });

    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    
    return access_token;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// ============================================================================
// Request Interceptor
// ============================================================================

api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
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

// ============================================================================
// Response Interceptor
// ============================================================================

api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - response.config.metadata?.startTime;
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
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
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    // Handle network errors
    if (!error.response) {
      // Network error - add to queue if we're offline
      if (!navigator.onLine) {
        return new Promise((resolve, reject) => {
          requestQueue.push({
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
      
      if (isRefreshing) {
        // If already refreshing, wait for new token
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearTokens();
        // Redirect to login
        window.location.href = '/login';
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
          resolve(api(originalRequest));
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

// ============================================================================
// Retry Logic
// ============================================================================

const retryRequest = async (requestFn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
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

const apiService = {
  // Core methods
  get: (url, config = {}) => {
    return retryRequest(() => api.get(url, config));
  },
  
  post: (url, data, config = {}) => {
    return retryRequest(() => api.post(url, data, config));
  },
  
  put: (url, data, config = {}) => {
    return retryRequest(() => api.put(url, data, config));
  },
  
  patch: (url, data, config = {}) => {
    return retryRequest(() => api.patch(url, data, config));
  },
  
  delete: (url, config = {}) => {
    return retryRequest(() => api.delete(url, config));
  },
  
  // Upload file
  upload: (url, file, onProgress, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return retryRequest(() => api.post(url, formData, {
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
  },
  
  // Download file
  download: (url, config = {}) => {
    return retryRequest(() => api.get(url, {
      ...config,
      responseType: 'blob',
    }));
  },
  
  // Cancel request
  cancel: (cancelToken) => {
    if (cancelToken) {
      cancelToken.cancel('Request cancelled by user');
    }
  },
  
  // Create cancel token
  getCancelToken: () => {
    return axios.CancelToken.source();
  },
  
  // Authentication
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  refreshAccessToken,
  
  // Queue management
  processQueue,
  getQueueLength: () => requestQueue.length,
  clearQueue: () => {
    requestQueue = [];
  },
  
  // Instance
  instance: api,
};

// ============================================================================
// Export
// ============================================================================

export default apiService;

// ============================================================================
// Interceptor Helpers
// ============================================================================

/**
 * Add custom interceptor
 */
export const addInterceptor = (onRequest, onResponse, onError) => {
  const requestInterceptor = api.interceptors.request.use(onRequest, onError);
  const responseInterceptor = api.interceptors.response.use(onResponse, onError);
  
  return () => {
    api.interceptors.request.eject(requestInterceptor);
    api.interceptors.response.eject(responseInterceptor);
  };
};

/**
 * Remove all interceptors
 */
export const removeAllInterceptors = () => {
  api.interceptors.request.clear();
  api.interceptors.response.clear();
};

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Basic GET request
const data = await apiService.get('/users');

// POST with data
const result = await apiService.post('/users', { name: 'John' });

// With authentication
apiService.setTokens('access_token', 'refresh_token');
const protectedData = await apiService.get('/protected');

// File upload with progress
const file = event.target.files[0];
await apiService.upload('/upload', file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// File download
const blob = await apiService.download('/report.pdf');
const url = window.URL.createObjectURL(blob);
window.open(url);

// Cancel request
const cancelToken = apiService.getCancelToken();
apiService.get('/long-request', { cancelToken: cancelToken.token });
// Later...
apiService.cancel(cancelToken);

// Retry on failure
const response = await apiService.get('/unreliable-endpoint');

// Offline queue
// Requests will be queued when offline and processed when back online
window.addEventListener('online', () => {
  apiService.processQueue();
});
*/

// ============================================================================
// Export
// ============================================================================

export { api };