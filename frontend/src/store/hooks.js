// ============================================================================
// Redux Hooks
// ============================================================================

/**
 * Custom Redux hooks for the parking management system.
 * 
 * This module provides:
 * - Typed versions of useDispatch and useSelector
 * - Custom hooks for common store operations
 * - Memoized selectors
 * - Async action helpers
 * - Store utilities
 */

import { useDispatch, useSelector, useStore } from 'react-redux';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { showSnackbar, setLoading } from './slices/uiSlice';
import { clearAuth } from './slices/authSlice';
import { resetStore } from './index';

// ============================================================================
// Typed Hooks
// ============================================================================

/**
 * Typed useDispatch hook
 */
export const useAppDispatch = () => {
  const dispatch = useDispatch();
  return dispatch;
};

/**
 * Typed useSelector hook with selectors
 */
export const useAppSelector = useSelector;

/**
 * Typed useStore hook
 */
export const useAppStore = useStore;

// ============================================================================
// Action Hooks
// ============================================================================

/**
 * Hook for dispatching actions with loading state
 */
export const useActionWithLoading = (action, options = {}) => {
  const dispatch = useAppDispatch();
  const { showSnackbar: showToast = true, successMessage, errorMessage } = options;

  return useCallback(
    async (payload) => {
      try {
        dispatch(setLoading(true));
        const result = await dispatch(action(payload)).unwrap();
        if (showToast && successMessage) {
          dispatch(showSnackbar({
            message: successMessage,
            severity: 'success',
          }));
        }
        return result;
      } catch (error) {
        if (showToast) {
          dispatch(showSnackbar({
            message: errorMessage || error.message || 'Operation failed',
            severity: 'error',
          }));
        }
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, action, showToast, successMessage, errorMessage]
  );
};

/**
 * Hook for handling async actions with error handling
 */
export const useAsyncAction = (action) => {
  const dispatch = useAppDispatch();
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (payload) => {
      try {
        setLoadingState(true);
        setError(null);
        const result = await dispatch(action(payload)).unwrap();
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoadingState(false);
      }
    },
    [dispatch, action]
  );

  return { execute, loading, error };
};

/**
 * Hook for debounced actions
 */
export const useDebouncedAction = (action, delay = 500) => {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef(null);

  return useCallback(
    (payload) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        dispatch(action(payload));
      }, delay);
    },
    [dispatch, action, delay]
  );
};

/**
 * Hook for throttled actions
 */
export const useThrottledAction = (action, limit = 1000) => {
  const dispatch = useAppDispatch();
  const lastRunRef = useRef(0);

  return useCallback(
    (payload) => {
      const now = Date.now();
      if (now - lastRunRef.current >= limit) {
        lastRunRef.current = now;
        dispatch(action(payload));
      }
    },
    [dispatch, action, limit]
  );
};

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Hook for creating memoized selectors
 */
export const useMemoSelector = (selector, dependencies = []) => {
  return useMemo(() => selector, dependencies);
};

/**
 * Hook for selecting multiple state values
 */
export const useSelectMany = (selectors) => {
  const store = useAppStore();
  return useMemo(() => {
    const state = store.getState();
    return Object.entries(selectors).reduce((acc, [key, selector]) => {
      acc[key] = selector(state);
      return acc;
    }, {});
  }, [selectors, store]);
};

/**
 * Hook for watching state changes
 */
export const useWatchState = (selector, callback) => {
  const prevValue = useRef();
  const currentValue = useAppSelector(selector);

  useEffect(() => {
    if (prevValue.current !== undefined && prevValue.current !== currentValue) {
      callback(currentValue, prevValue.current);
    }
    prevValue.current = currentValue;
  }, [currentValue, callback]);
};

// ============================================================================
// Store Hooks
// ============================================================================

/**
 * Hook for accessing store state with refresh
 */
export const useStoreState = (selector) => {
  const state = useAppSelector(selector);
  const store = useAppStore();

  const refresh = useCallback(() => {
    return store.getState();
  }, [store]);

  return [state, refresh];
};

/**
 * Hook for accessing store dispatch with context
 */
export const useStoreDispatch = () => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const dispatchWithContext = useCallback(
    (action, context = {}) => {
      const enrichedAction = {
        ...action,
        meta: {
          ...action.meta,
          ...context,
          timestamp: Date.now(),
        },
      };
      return dispatch(enrichedAction);
    },
    [dispatch]
  );

  return { dispatch: dispatchWithContext, store };
};

// ============================================================================
// UI Hooks
// ============================================================================

/**
 * Hook for displaying snackbar notifications
 */
export const useSnackbar = () => {
  const dispatch = useAppDispatch();

  const show = useCallback(
    (message, severity = 'info', options = {}) => {
      dispatch(showSnackbar({
        message,
        severity,
        ...options,
      }));
    },
    [dispatch]
  );

  const showSuccess = useCallback(
    (message, options = {}) => show(message, 'success', options),
    [show]
  );

  const showError = useCallback(
    (message, options = {}) => show(message, 'error', options),
    [show]
  );

  const showWarning = useCallback(
    (message, options = {}) => show(message, 'warning', options),
    [show]
  );

  const showInfo = useCallback(
    (message, options = {}) => show(message, 'info', options),
    [show]
  );

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

/**
 * Hook for managing loading state
 */
export const useLoading = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.ui.loading);

  const setLoadingState = useCallback(
    (value) => {
      dispatch(setLoading(value));
    },
    [dispatch]
  );

  const withLoading = useCallback(
    async (fn) => {
      try {
        setLoadingState(true);
        return await fn();
      } finally {
        setLoadingState(false);
      }
    },
    [setLoadingState]
  );

  return {
    loading,
    setLoadingState,
    withLoading,
  };
};

// ============================================================================
// Auth Hooks
// ============================================================================

/**
 * Hook for checking authentication status
 */
export const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const loading = useAppSelector((state) => state.auth.loading);

  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission) => {
      return user?.permissions?.includes(permission) || false;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      return roles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  return {
    user,
    isAuthenticated,
    loading,
    hasRole,
    hasPermission,
    hasAnyRole,
  };
};

/**
 * Hook for auth protected actions
 */
export const useProtectedAction = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  return useCallback(
    (action, ...args) => {
      if (!isAuthenticated) {
        dispatch(showSnackbar({
          message: 'Please login to perform this action',
          severity: 'warning',
        }));
        return Promise.reject(new Error('Not authenticated'));
      }
      return action(...args);
    },
    [isAuthenticated, dispatch]
  );
};

// ============================================================================
// Pagination Hooks
// ============================================================================

/**
 * Hook for managing pagination
 */
export const usePagination = (initialPage = 1, initialPageSize = 20) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, newPage));
  }, []);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    resetPagination,
  };
};

// ============================================================================
// Form Hooks
// ============================================================================

/**
 * Hook for managing form state with Redux
 */
export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (submitAction) => {
    setIsSubmitting(true);
    try {
      const result = await submitAction(formData);
      return result;
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldError,
    setFormData,
  };
};

// ============================================================================
// Export
// ============================================================================

export default {
  useAppDispatch,
  useAppSelector,
  useAppStore,
  useActionWithLoading,
  useAsyncAction,
  useDebouncedAction,
  useThrottledAction,
  useMemoSelector,
  useSelectMany,
  useWatchState,
  useStoreState,
  useStoreDispatch,
  useSnackbar,
  useLoading,
  useAuth,
  useProtectedAction,
  usePagination,
  useFormState,
};