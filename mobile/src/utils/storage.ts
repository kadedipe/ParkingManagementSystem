// ============================================================================
// Storage Utility - Secure Storage Management
// ============================================================================

// parking-management-system/mobile/src/utils/storage.ts

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { APP_CONSTANTS } from './constants';

/**
 * Storage Types
 */
export type StorageType = 'secure' | 'async' | 'memory';

/**
 * Storage Options
 */
export interface StorageOptions {
  type?: StorageType;
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
}

/**
 * Storage Item
 */
export interface StorageItem<T = any> {
  key: string;
  value: T;
  expiresAt?: number;
  createdAt: number;
}

/**
 * Storage Service
 */
class StorageService {
  private memoryStorage: Map<string, StorageItem> = new Map();
  private prefix: string = APP_CONSTANTS.STORAGE_KEYS.PREFIX || 'app_';

  /**
   * Set an item in storage
   */
  async set<T = any>(
    key: string,
    value: T,
    options: StorageOptions = {}
  ): Promise<void> {
    const { type = 'async', encrypt = false, expiresIn } = options;
    const fullKey = this.getFullKey(key);

    const item: StorageItem<T> = {
      key: fullKey,
      value,
      createdAt: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };

    const stringified = JSON.stringify(item);

    try {
      switch (type) {
        case 'secure':
          await SecureStore.setItemAsync(
            fullKey,
            encrypt ? this.encrypt(stringified) : stringified
          );
          break;
        case 'memory':
          this.memoryStorage.set(fullKey, item);
          break;
        case 'async':
        default:
          await AsyncStorage.setItem(fullKey, stringified);
          break;
      }
    } catch (error) {
      console.error(`Error setting item "${fullKey}" in storage:`, error);
      throw error;
    }
  }

  /**
   * Get an item from storage
   */
  async get<T = any>(
    key: string,
    options: StorageOptions = {}
  ): Promise<T | null> {
    const { type = 'async', encrypt = false } = options;
    const fullKey = this.getFullKey(key);

    try {
      let raw: string | null = null;

      switch (type) {
        case 'secure':
          raw = await SecureStore.getItemAsync(fullKey);
          if (raw && encrypt) {
            raw = this.decrypt(raw);
          }
          break;
        case 'memory':
          const item = this.memoryStorage.get(fullKey);
          return item ? this.getValidItem(item) : null;
        case 'async':
        default:
          raw = await AsyncStorage.getItem(fullKey);
          break;
      }

      if (!raw) return null;

      const parsed: StorageItem<T> = JSON.parse(raw);
      return this.getValidItem(parsed);
    } catch (error) {
      console.error(`Error getting item "${fullKey}" from storage:`, error);
      return null;
    }
  }

  /**
   * Remove an item from storage
   */
  async remove(
    key: string,
    options: StorageOptions = {}
  ): Promise<void> {
    const { type = 'async' } = options;
    const fullKey = this.getFullKey(key);

    try {
      switch (type) {
        case 'secure':
          await SecureStore.deleteItemAsync(fullKey);
          break;
        case 'memory':
          this.memoryStorage.delete(fullKey);
          break;
        case 'async':
        default:
          await AsyncStorage.removeItem(fullKey);
          break;
      }
    } catch (error) {
      console.error(`Error removing item "${fullKey}" from storage:`, error);
      throw error;
    }
  }

  /**
   * Check if an item exists in storage
   */
  async exists(
    key: string,
    options: StorageOptions = {}
  ): Promise<boolean> {
    const { type = 'async' } = options;
    const fullKey = this.getFullKey(key);

    try {
      switch (type) {
        case 'secure':
          const secureItem = await SecureStore.getItemAsync(fullKey);
          return secureItem !== null;
        case 'memory':
          return this.memoryStorage.has(fullKey);
        case 'async':
        default:
          const asyncItem = await AsyncStorage.getItem(fullKey);
          return asyncItem !== null;
      }
    } catch (error) {
      console.error(`Error checking existence of "${fullKey}" in storage:`, error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(options: StorageOptions = {}): Promise<string[]> {
    const { type = 'async' } = options;
    const fullKey = this.getFullKey('');

    try {
      switch (type) {
        case 'secure':
          // SecureStore doesn't have a getAllKeys method
          return [];
        case 'memory':
          return Array.from(this.memoryStorage.keys())
            .filter(key => key.startsWith(fullKey))
            .map(key => key.replace(fullKey, ''));
        case 'async':
        default:
          const keys = await AsyncStorage.getAllKeys();
          return keys
            .filter(key => key.startsWith(fullKey))
            .map(key => key.replace(fullKey, ''));
      }
    } catch (error) {
      console.error('Error getting all keys from storage:', error);
      return [];
    }
  }

  /**
   * Clear all items
   */
  async clear(options: StorageOptions = {}): Promise<void> {
    const { type = 'async' } = options;

    try {
      switch (type) {
        case 'secure':
          // SecureStore doesn't have a clear method
          break;
        case 'memory':
          this.memoryStorage.clear();
          break;
        case 'async':
        default:
          const keys = await AsyncStorage.getAllKeys();
          const appKeys = keys.filter(key => key.startsWith(this.prefix));
          if (appKeys.length > 0) {
            await AsyncStorage.multiRemove(appKeys);
          }
          break;
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get item with validation
   */
  private getValidItem<T = any>(item: StorageItem<T>): T | null {
    if (!item) return null;

    // Check if expired
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.remove(item.key).catch(console.error);
      return null;
    }

    return item.value;
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Simple encryption (placeholder - use a real encryption library in production)
   */
  private encrypt(data: string): string {
    // For production, use a proper encryption library
    // This is a simple Base64 encoding for demonstration
    return Buffer.from(data).toString('base64');
  }

  /**
   * Simple decryption (placeholder - use a real encryption library in production)
   */
  private decrypt(data: string): string {
    // For production, use a proper encryption library
    return Buffer.from(data, 'base64').toString();
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  /**
   * Store authentication tokens
   */
  async setAuthTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    await Promise.all([
      this.set('accessToken', accessToken, { type: 'secure' }),
      this.set('refreshToken', refreshToken, { type: 'secure' }),
    ]);
  }

  /**
   * Get authentication tokens
   */
  async getAuthTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.get<string>('accessToken', { type: 'secure' }),
        this.get<string>('refreshToken', { type: 'secure' }),
      ]);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error getting auth tokens:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens
   */
  async clearAuthTokens(): Promise<void> {
    await Promise.all([
      this.remove('accessToken', { type: 'secure' }),
      this.remove('refreshToken', { type: 'secure' }),
      this.remove('userData'),
    ]);
  }

  /**
   * Store user data
   */
  async setUserData<T = any>(userData: T): Promise<void> {
    await this.set('userData', userData);
  }

  /**
   * Get user data
   */
  async getUserData<T = any>(): Promise<T | null> {
    return this.get<T>('userData');
  }

  /**
   * Store theme preference
   */
  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await this.set('theme', theme);
  }

  /**
   * Get theme preference
   */
  async getTheme(): Promise<'light' | 'dark' | null> {
    return this.get<'light' | 'dark'>('theme');
  }

  /**
   * Store language preference
   */
  async setLanguage(language: string): Promise<void> {
    await this.set('language', language);
  }

  /**
   * Get language preference
   */
  async getLanguage(): Promise<string | null> {
    return this.get<string>('language');
  }

  /**
   * Store onboarding status
   */
  async setOnboardingComplete(completed: boolean): Promise<void> {
    await this.set('onboardingComplete', completed);
  }

  /**
   * Get onboarding status
   */
  async getOnboardingComplete(): Promise<boolean> {
    return this.get<boolean>('onboardingComplete') ?? false;
  }

  /**
   * Store notification token
   */
  async setNotificationToken(token: string): Promise<void> {
    await this.set('notificationToken', token, { type: 'secure' });
  }

  /**
   * Get notification token
   */
  async getNotificationToken(): Promise<string | null> {
    return this.get<string>('notificationToken', { type: 'secure' });
  }

  /**
   * Store last sync time
   */
  async setLastSync(timestamp: number): Promise<void> {
    await this.set('lastSync', timestamp);
  }

  /**
   * Get last sync time
   */
  async getLastSync(): Promise<number | null> {
    return this.get<number>('lastSync');
  }

  /**
   * Store a cached API response
   */
  async setCache<T = any>(
    key: string,
    data: T,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<void> {
    await this.set(`cache_${key}`, data, { expiresIn: ttl });
  }

  /**
   * Get cached API response
   */
  async getCache<T = any>(key: string): Promise<T | null> {
    return this.get<T>(`cache_${key}`);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    const keys = await this.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    await Promise.all(cacheKeys.map(key => this.remove(key)));
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalItems: number;
    memoryItems: number;
    asyncItems: number;
    secureItems: number;
  }> {
    try {
      const memoryKeys = Array.from(this.memoryStorage.keys());
      const asyncKeys = await this.getAllKeys({ type: 'async' });
      const secureKeys = await this.getAllKeys({ type: 'secure' });

      return {
        totalItems: memoryKeys.length + asyncKeys.length + secureKeys.length,
        memoryItems: memoryKeys.length,
        asyncItems: asyncKeys.length,
        secureItems: secureKeys.length,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalItems: 0,
        memoryItems: 0,
        asyncItems: 0,
        secureItems: 0,
      };
    }
  }
}

// Export singleton instance
export const Storage = new StorageService();

// Export individual functions for convenience
export const {
  set,
  get,
  remove,
  exists,
  getAllKeys,
  clear,
  setAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  setUserData,
  getUserData,
  setTheme,
  getTheme,
  setLanguage,
  getLanguage,
  setOnboardingComplete,
  getOnboardingComplete,
  setNotificationToken,
  getNotificationToken,
  setLastSync,
  getLastSync,
  setCache,
  getCache,
  clearCache,
  getStats,
} = Storage;

// ============================================================================
// Storage Hooks
// ============================================================================

/**
 * React hook for storage
 */
export const useStorage = () => {
  return Storage;
};

/**
 * React hook for getting a storage value
 */
export const useStorageValue = <T = any>(
  key: string,
  defaultValue?: T
) => {
  const [value, setValue] = React.useState<T | null>(defaultValue || null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        const stored = await Storage.get<T>(key);
        setValue(stored !== null ? stored : (defaultValue || null));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const updateValue = React.useCallback(
    async (newValue: T) => {
      try {
        await Storage.set(key, newValue);
        setValue(newValue);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [key]
  );

  return { value, loading, error, updateValue };
};

export default Storage;