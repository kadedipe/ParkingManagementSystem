// ============================================================================
// AuthContext - Authentication Context Provider
// ============================================================================

// parking-management-system/mobile/src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import authService from '../api/services/auth.service';
import userService from '../api/services/user.service';
import { ROUTES } from '../constants/routes';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'manager';
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  verifyTwoFactor: (code: string) => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  TOKEN_EXPIRY: 'tokenExpiry',
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  // Load stored tokens and user data
  const loadStoredData = useCallback(async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (accessToken && refreshToken && userData) {
        const user = JSON.parse(userData);
        setState((prev) => ({
          ...prev,
          user,
          tokens: { accessToken, refreshToken },
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        }));
        return true;
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));
      return false;
    } catch (error) {
      console.error('Error loading stored data:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));
      return false;
    }
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const isAuthenticated = await loadStoredData();
      
      if (isAuthenticated) {
        // Validate token by fetching user profile
        try {
          const profile = await userService.getProfile();
          setState((prev) => ({
            ...prev,
            user: profile,
            isAuthenticated: true,
          }));
        } catch (error) {
          // Token might be expired
          console.error('Error validating token:', error);
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }, [loadStoredData]);

  // Initialize auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Store tokens securely
  const storeTokens = useCallback(async (tokens: AuthTokens, user: User) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      if (tokens.expiresIn) {
        const expiryDate = Date.now() + tokens.expiresIn * 1000;
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, String(expiryDate));
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }, []);

  // Clear stored tokens
  const clearTokens = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }, []);

  // Login
  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await authService.login({ email, password });
        const { user, tokens } = response;

        if (!user || !tokens) {
          throw new Error('Invalid login response');
        }

        await storeTokens(tokens, user);

        setState((prev) => ({
          ...prev,
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error: any) {
        console.error('Login error:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Login failed. Please try again.',
        }));
        throw error;
      }
    },
    [storeTokens]
  );

  // Register
  const register = useCallback(
    async (data: RegisterData) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await authService.register(data);
        const { user, tokens } = response;

        if (!user || !tokens) {
          throw new Error('Invalid registration response');
        }

        await storeTokens(tokens, user);

        setState((prev) => ({
          ...prev,
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error: any) {
        console.error('Registration error:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Registration failed. Please try again.',
        }));
        throw error;
      }
    },
    [storeTokens]
  );

  // Logout
  const logout = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearTokens();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  }, [clearTokens]);

  // Refresh tokens
  const refreshTokens = useCallback(async () => {
    try {
      const refreshToken = state.tokens?.refreshToken;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response;

      if (!accessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      const updatedTokens: AuthTokens = {
        accessToken,
        refreshToken: newRefreshToken,
      };

      await storeTokens(updatedTokens, state.user!);

      setState((prev) => ({
        ...prev,
        tokens: updatedTokens,
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  }, [state.tokens, state.user, storeTokens, logout]);

  // Update user
  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        const updatedUser = await userService.updateProfile(userData);
        
        setState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        // Update stored user data
        if (state.user) {
          await SecureStore.setItemAsync(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify({ ...state.user, ...updatedUser })
          );
        }

        return updatedUser;
      } catch (error) {
        console.error('Update user error:', error);
        throw error;
      }
    },
    [state.user]
  );

  // Change password
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await authService.changePassword({ currentPassword, newPassword });
      } catch (error) {
        console.error('Change password error:', error);
        throw error;
      }
    },
    []
  );

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.forgotPassword({ email });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token: string) => {
    try {
      await authService.verifyEmail({ token });
      // Update user verification status
      if (state.user) {
        await updateUser({ isVerified: true });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }, [state.user, updateUser]);

  // Enable two-factor authentication
  const enableTwoFactor = useCallback(async () => {
    try {
      const response = await authService.enableTwoFactor();
      return response;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  }, []);

  // Verify two-factor code
  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      await authService.verifyTwoFactor({ code });
      if (state.user) {
        await updateUser({ isTwoFactorEnabled: true });
      }
    } catch (error) {
      console.error('Verify 2FA error:', error);
      throw error;
    }
  }, [state.user, updateUser]);

  // Disable two-factor authentication
  const disableTwoFactor = useCallback(async () => {
    try {
      await authService.disableTwoFactor();
      if (state.user) {
        await updateUser({ isTwoFactorEnabled: false });
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw error;
    }
  }, [state.user, updateUser]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Context value
  const contextValue: AuthContextType = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshTokens,
      updateUser,
      changePassword,
      resetPassword,
      verifyEmail,
      enableTwoFactor,
      verifyTwoFactor,
      disableTwoFactor,
      clearError,
      checkAuth,
    }),
    [
      state,
      login,
      register,
      logout,
      refreshTokens,
      updateUser,
      changePassword,
      resetPassword,
      verifyEmail,
      enableTwoFactor,
      verifyTwoFactor,
      disableTwoFactor,
      clearError,
      checkAuth,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;