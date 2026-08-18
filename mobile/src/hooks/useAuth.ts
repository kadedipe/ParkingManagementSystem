// ============================================================================
// useAuth Hook - Authentication Hook
// ============================================================================

// parking-management-system/mobile/src/hooks/useAuth.ts

import { useState, useCallback, useEffect } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { Alert } from 'react-native';
import { ROUTES } from '../constants/routes';

/**
 * useAuth Hook - Extended authentication functionality
 */
export const useAuth = () => {
  const authContext = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login with error handling
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await authContext.login(email, password);
        return true;
      } catch (err: any) {
        const message = err.message || 'Login failed. Please try again.';
        setError(message);
        Alert.alert('Login Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authContext]
  );

  // Register with error handling
  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        await authContext.register(data);
        return true;
      } catch (err: any) {
        const message = err.message || 'Registration failed. Please try again.';
        setError(message);
        Alert.alert('Registration Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authContext]
  );

  // Logout with confirmation
  const logout = useCallback(async () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await authContext.logout();
                resolve(true);
              } catch (err) {
                console.error('Logout error:', err);
                resolve(false);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    });
  }, [authContext]);

  // Change password with validation
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmPassword: string) => {
      // Validation
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      if (newPassword.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters');
        return false;
      }
      if (newPassword === currentPassword) {
        Alert.alert('Error', 'New password must be different from current password');
        return false;
      }

      setIsLoading(true);
      try {
        await authContext.changePassword(currentPassword, newPassword);
        Alert.alert('Success', 'Password changed successfully');
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to change password';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authContext]
  );

  // Reset password
  const resetPassword = useCallback(
    async (email: string) => {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return false;
      }
      
      setIsLoading(true);
      try {
        await authContext.resetPassword(email);
        Alert.alert(
          'Success',
          'Password reset instructions sent to your email'
        );
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to reset password';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authContext]
  );

  // Verify email
  const verifyEmail = useCallback(
    async (token: string) => {
      setIsLoading(true);
      try {
        await authContext.verifyEmail(token);
        Alert.alert('Success', 'Email verified successfully');
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to verify email';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authContext]
  );

  // Enable 2FA
  const enableTwoFactor = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authContext.enableTwoFactor();
      return result;
    } catch (err: any) {
      const message = err.message || 'Failed to enable two-factor authentication';
      Alert.alert('Error', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authContext]);

  // Verify 2FA code
  const verifyTwoFactor = useCallback(
    async (code: string) => {
      if (code.length !== 6) {
        Alert.alert('Error', 'Please enter a valid 6-digit code');
        return false;
      }

      setIsLoading(true);
      try {
        await authContext.verifyTwoFactor(code);
        Alert.alert('Success', 'Two-factor authentication enabled');
        return true;
      } catch (err: any) {
        const message = err.message || 'Invalid verification code';
        Alert.alert('Error', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [authContext]
  );

  // Disable 2FA
  const disableTwoFactor = useCallback(async () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await authContext.disableTwoFactor();
                Alert.alert('Success', 'Two-factor authentication disabled');
                resolve(true);
              } catch (err: any) {
                const message = err.message || 'Failed to disable 2FA';
                Alert.alert('Error', message);
                resolve(false);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    });
  }, [authContext]);

  // Check if user has required role
  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!authContext.user) return false;
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      return requiredRoles.includes(authContext.user.role);
    },
    [authContext.user]
  );

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return authContext.isAuthenticated;
  }, [authContext.isAuthenticated]);

  // Get user display name
  const getUserName = useCallback(() => {
    return authContext.user?.name || 'Guest User';
  }, [authContext.user]);

  // Get user initials
  const getUserInitials = useCallback(() => {
    const name = authContext.user?.name || '';
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [authContext.user]);

  return {
    ...authContext,
    login,
    register,
    logout,
    changePassword,
    resetPassword,
    verifyEmail,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    hasRole,
    isAuthenticated,
    getUserName,
    getUserInitials,
    isLoading,
    error,
  };
};

export default useAuth;