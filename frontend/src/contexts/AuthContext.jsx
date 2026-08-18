// ============================================================================
// Auth Context
// ============================================================================

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { config } from '../config';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(config.auth.tokenStorageKey);
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem(config.auth.tokenStorageKey);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem(config.auth.tokenStorageKey, response.token);
        setUser(response.user);
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
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