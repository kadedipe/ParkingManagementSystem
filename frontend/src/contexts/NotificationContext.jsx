// ============================================================================
// Notification Context
// ============================================================================

/**
 * Notification Context for managing application notifications.
 * 
 * This context provides:
 * - Notification management (add, remove, mark read)
 * - Real-time notification updates via WebSocket
 * - Toast notifications
 * - In-app notification center
 * - Notification preferences
 * - Unread count tracking
 * - Notification categories and filtering
 * - Persistent notification storage
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { notificationsService } from '../services/notifications.service';
import { useWebSocket } from '../hooks/useWebSocket';
import { config } from '../config';

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  // Notifications
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  
  // UI State
  loading: false,
  error: null,
  isRefreshing: false,
  lastUpdated: null,
  
  // Filters
  filters: {
    type: 'all',
    read: 'all',
    dateRange: 'all',
  },
  
  // Preferences
  preferences: {
    email: true,
    sms: false,
    push: true,
    parkingAlerts: true,
    chargingAlerts: true,
    paymentAlerts: true,
    systemUpdates: true,
    marketing: false,
  },
  
  // Toast queue
  toasts: [],
};

// ============================================================================
// Action Types
// ============================================================================

const ActionTypes = {
  // Notifications
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_READ: 'MARK_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Counts
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  SET_TOTAL_COUNT: 'SET_TOTAL_COUNT',
  
  // UI
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_REFRESHING: 'SET_REFRESHING',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_FILTER: 'UPDATE_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // Preferences
  SET_PREFERENCES: 'SET_PREFERENCES',
  UPDATE_PREFERENCE: 'UPDATE_PREFERENCE',
  
  // Toasts
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS',
};

// ============================================================================
// Reducer
// ============================================================================

const notificationReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        totalCount: action.payload.length,
        lastUpdated: new Date(),
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        totalCount: state.totalCount + 1,
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1,
      };
      
    case ActionTypes.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id ? action.payload : notif
        ),
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload),
        totalCount: state.totalCount - 1,
        unreadCount: state.notifications.find(n => n.id === action.payload && !n.isRead)
          ? state.unreadCount - 1
          : state.unreadCount,
      };
      
    case ActionTypes.MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
      
    case ActionTypes.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map(notif => ({
          ...notif,
          isRead: true,
          readAt: new Date(),
        })),
        unreadCount: 0,
      };
      
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        totalCount: 0,
        unreadCount: 0,
      };
      
    case ActionTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };
      
    case ActionTypes.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: state.unreadCount + action.payload,
      };
      
    case ActionTypes.SET_TOTAL_COUNT:
      return {
        ...state,
        totalCount: action.payload,
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case ActionTypes.SET_REFRESHING:
      return {
        ...state,
        isRefreshing: action.payload,
      };
      
    case ActionTypes.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload,
      };
      
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: action.payload,
      };
      
    case ActionTypes.UPDATE_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case ActionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };
      
    case ActionTypes.SET_PREFERENCES:
      return {
        ...state,
        preferences: action.payload,
      };
      
    case ActionTypes.UPDATE_PREFERENCE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.payload.key]: action.payload.value,
        },
      };
      
    case ActionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
      
    case ActionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
      
    case ActionTypes.CLEAR_TOASTS:
      return {
        ...state,
        toasts: [],
      };
      
    default:
      return state;
  }
};

// ============================================================================
// Context Provider
// ============================================================================

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children, autoConnect = true }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // ==========================================================================
  // WebSocket Integration
  // ==========================================================================

  const ws = useWebSocket({
    url: config.websocket.url,
    autoConnect,
    onMessage: (data) => {
      // Handle real-time notification updates
      if (data.type === 'notification') {
        dispatch({
          type: ActionTypes.ADD_NOTIFICATION,
          payload: data.payload,
        });
        
        // Show toast for new notification
        if (!data.payload.isRead) {
          addToast({
            type: data.payload.type || 'info',
            message: data.payload.message,
            title: data.payload.title,
            duration: 5000,
          });
        }
      }
      
      if (data.type === 'notification_read') {
        dispatch({
          type: ActionTypes.MARK_READ,
          payload: data.payload.id,
        });
      }
      
      if (data.type === 'notification_count') {
        dispatch({
          type: ActionTypes.SET_UNREAD_COUNT,
          payload: data.payload.count,
        });
      }
    },
    onOpen: () => {
      // Subscribe to notifications channel
      ws.send('subscribe', { channel: 'notifications' });
    },
  });

  // ==========================================================================
  // Toast Management
  // ==========================================================================

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      createdAt: new Date(),
    };
    
    dispatch({ type: ActionTypes.ADD_TOAST, payload: newToast });
    
    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id });
      }, toast.duration || 5000);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_TOASTS });
  }, []);

  // ==========================================================================
  // Notification API Methods
  // ==========================================================================

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_ERROR });

      const response = await notificationsService.getNotifications({
        ...state.filters,
        ...params,
      });

      dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: response.items });
      dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: response.unreadCount });
      dispatch({ type: ActionTypes.SET_TOTAL_COUNT, payload: response.total });
      dispatch({ type: ActionTypes.SET_LAST_UPDATED, payload: new Date() });

      return response;
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || 'Failed to fetch notifications',
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.filters]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationsService.markAsRead(id);
      dispatch({ type: ActionTypes.MARK_READ, payload: id });
      
      // Send WebSocket message
      if (ws.isConnected) {
        ws.send('notification_read', { id });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, [ws]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      dispatch({ type: ActionTypes.MARK_ALL_READ });
      
      // Send WebSocket message
      if (ws.isConnected) {
        ws.send('notifications_read_all', {});
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }, [ws]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationsService.deleteNotification(id);
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationsService.clearAll();
      dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      throw error;
    }
  }, []);

  // ==========================================================================
  // Filter Methods
  // ==========================================================================

  const setFilters = useCallback((filters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
  }, []);

  const updateFilter = useCallback((key, value) => {
    dispatch({
      type: ActionTypes.UPDATE_FILTER,
      payload: { key, value },
    });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_FILTERS });
  }, []);

  // ==========================================================================
  // Preferences Methods
  // ==========================================================================

  const fetchPreferences = useCallback(async () => {
    try {
      const preferences = await notificationsService.getPreferences();
      dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences });
      return preferences;
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      throw error;
    }
  }, []);

  const updatePreference = useCallback(async (key, value) => {
    try {
      await notificationsService.updatePreference(key, value);
      dispatch({
        type: ActionTypes.UPDATE_PREFERENCE,
        payload: { key, value },
      });
    } catch (error) {
      console.error('Failed to update preference:', error);
      throw error;
    }
  }, []);

  const updatePreferences = useCallback(async (preferences) => {
    try {
      await notificationsService.updatePreferences(preferences);
      dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, []);

  // ==========================================================================
  // Refresh
  // ==========================================================================

  const refreshNotifications = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_REFRESHING, payload: true });
    try {
      await fetchNotifications();
    } finally {
      dispatch({ type: ActionTypes.SET_REFRESHING, payload: false });
    }
  }, [fetchNotifications]);

  // ==========================================================================
  // Initial Load
  // ==========================================================================

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    
    // Set up polling for unread count
    const interval = setInterval(async () => {
      try {
        const count = await notificationsService.getUnreadCount();
        dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: count });
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value = useMemo(() => ({
    // State
    ...state,
    wsStatus: ws.status,
    isConnected: ws.isConnected,
    
    // Toast methods
    addToast,
    removeToast,
    clearToasts,
    
    // Notification methods
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    
    // Filter methods
    setFilters,
    updateFilter,
    clearFilters,
    
    // Preference methods
    fetchPreferences,
    updatePreference,
    updatePreferences,
    
    // WebSocket
    ws,
    
    // Utilities
    hasUnread: state.unreadCount > 0,
    hasNotifications: state.notifications.length > 0,
    filteredNotifications: state.notifications.filter(notif => {
      if (state.filters.type !== 'all' && notif.type !== state.filters.type) return false;
      if (state.filters.read === 'read' && !notif.isRead) return false;
      if (state.filters.read === 'unread' && notif.isRead) return false;
      return true;
    }),
  }), [state, ws, addToast, removeToast, clearToasts, fetchNotifications, markAsRead,
    markAllAsRead, deleteNotification, clearAllNotifications, refreshNotifications,
    setFilters, updateFilter, clearFilters, fetchPreferences, updatePreference, updatePreferences]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// ============================================================================
// Toast Types
// ============================================================================

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ============================================================================
// Export
// ============================================================================

export default NotificationContext;