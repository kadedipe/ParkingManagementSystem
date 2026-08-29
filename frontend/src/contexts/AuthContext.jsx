// ============================================================================
// Auth Context
// ============================================================================

import React, { createContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';
import { config } from '../config';

export const AuthContext = createContext(null);

const evidenceUser = import.meta.env.VITE_EVIDENCE_MODE === 'true'
  ? { id: 'faculty-review-user', email: 'review@example.edu', firstName: 'Kolapo', role: 'admin' }
  : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(evidenceUser);
  const [loading, setLoading] = useState(!evidenceUser);
  const [error, setError] = useState(null);

  // Load user on mount
  useEffect(() => {
    if (evidenceUser) return undefined;

    const controller = new AbortController();
    let isMounted = true;

    const loadUser = async () => {
      try {
        const token = localStorage.getItem(config.auth.tokenStorageKey);
        if (token) {
          const userData = await authService.getCurrentUser({
            timeout: 8000,
            signal: controller.signal,
          });
          if (isMounted) {
            setUser(userData);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load user:', err);
          authService.clearTokens();
          authService.clearUser();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setError(null);
      const response = await authService.login(email, password, rememberMe);
      
      if (response.success) {
        localStorage.setItem(config.auth.tokenStorageKey, response.token);
        setUser(response.user);
        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      localStorage.removeItem(config.auth.tokenStorageKey);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      setError(null);
      const response = await authService.resetPassword(email);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authService.updateProfile(data);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
