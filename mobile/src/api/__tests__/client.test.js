// ============================================================================
// API Client Tests
// ============================================================================

import apiClient, { setTokens, clearTokens } from '../client';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

describe('API Client', () => {
  beforeEach(() => {
    clearTokens();
    jest.clearAllMocks();
  });

  test('should set tokens correctly', () => {
    setTokens('test_access', 'test_refresh');
    expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer test_access');
  });

  test('should clear tokens correctly', () => {
    setTokens('test_access', 'test_refresh');
    clearTokens();
    expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
  });

  test('should handle network errors', async () => {
    // Mock network error
    jest.spyOn(apiClient, 'get').mockRejectedValue({ response: null });
    
    try {
      await apiClient.get('/test');
    } catch (error) {
      expect(error.code).toBe('NETWORK_ERROR');
    }
  });
});