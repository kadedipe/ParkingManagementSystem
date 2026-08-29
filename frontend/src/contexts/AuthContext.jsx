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

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Unable to read profile image'));
  reader.readAsDataURL(file);
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(evidenceUser);
  const [loading, setLoading] = useState(!evidenceUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (evidenceUser) return undefined;

    const controller = new AbortController();
    let isMounted = true;

    const loadUser = async () => {
      try {
        const token = localStorage.getItem(config.auth.tokenStorageKey);
        if (token) {
          const userData = await authService.getCurrentUser({ timeout: 8000, signal: controller.signal });
          if (isMounted) setUser(userData);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load user:', err);
          authService.clearTokens();
          authService.clearUser();
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
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
      if (!response.success) throw new Error(response.error || 'Login failed');
      localStorage.setItem(config.auth.tokenStorageKey, response.token);
      setUser(response.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(config.auth.tokenStorageKey);
      setUser(null);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      if (!response.success) throw new Error(response.error || response.message || 'Registration failed');
      return { success: true, data: response.data, token: response.token };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const resetPassword = useCallback(async (...args) => {
    try {
      setError(null);
      return await authService.resetPassword(...args);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);
      const payload = { ...data };
      if (payload.avatar instanceof File) {
        if (!payload.avatar.type?.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        if (payload.avatar.size > 1_500_000) {
          throw new Error('Profile image must be 1.5 MB or smaller');
        }
        payload.avatar = await fileToDataUrl(payload.avatar);
      }

      const response = await authService.updateProfile(payload);
      if (!response?.success || !response?.user) {
        throw new Error(response?.error || 'Failed to update profile');
      }

      setUser(response.user);
      return response;
    } catch (err) {
      // A failed profile request must never destroy an otherwise valid login.
      setError(err.message);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (data) => {
    const response = await authService.changePassword(data.currentPassword, data.newPassword);
    if (!response?.success) throw new Error(response?.error || 'Failed to change password');
    return response;
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
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
