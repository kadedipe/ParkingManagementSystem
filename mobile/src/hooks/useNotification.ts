// ============================================================================
// useNotification Hook - Notification Management Hook
// ============================================================================

// parking-management-system/mobile/src/hooks/useNotification.ts

import { useState, useCallback } from 'react';
import { useNotification as useNotificationContext } from '../contexts/NotificationContext';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export const useNotification = () => {
  const notificationContext = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mark notification as read with haptic feedback
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationContext.markAsRead(notificationId);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (err: any) {
        console.error('Error marking notification as read:', err);
      }
    },
    [notificationContext]
  );

  // Mark all as read with confirmation
  const markAllAsRead = useCallback(
    async () => {
      const unreadCount = notificationContext.unreadCount;
      if (unreadCount === 0) {
        Alert.alert('Info', 'No unread notifications');
        return false;
      }

      return new Promise((resolve) => {
        Alert.alert(
          'Mark All as Read',
          `Mark ${unreadCount} notifications as read?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Mark All',
              onPress: async () => {
                setIsLoading(true);
                try {
                  await notificationContext.markAllAsRead();
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                  resolve(true);
                } catch (err: any) {
                  Alert.alert('Error', 'Failed to mark all as read');
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
    },
    [notificationContext]
  );

  // Delete notification with confirmation
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      return new Promise((resolve) => {
        Alert.alert(
          'Delete Notification',
          'Are you sure you want to delete this notification?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                setIsLoading(true);
                try {
                  await notificationContext.deleteNotification(notificationId);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  resolve(true);
                } catch (err: any) {
                  Alert.alert('Error', 'Failed to delete notification');
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
    },
    [notificationContext]
  );

  // Delete all notifications
  const deleteAllNotifications = useCallback(
    async () => {
      if (notificationContext.notifications.length === 0) {
        Alert.alert('Info', 'No notifications to delete');
        return false;
      }

      return new Promise((resolve) => {
        Alert.alert(
          'Delete All Notifications',
          `Delete all ${notificationContext.notifications.length} notifications?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Delete All',
              style: 'destructive',
              onPress: async () => {
                setIsLoading(true);
                try {
                  await notificationContext.deleteAllNotifications();
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }
                  resolve(true);
                } catch (err: any) {
                  Alert.alert('Error', 'Failed to delete notifications');
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
    },
    [notificationContext]
  );

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: string) => {
      return notificationContext.notifications.filter((n) => n.type === type);
    },
    [notificationContext.notifications]
  );

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notificationContext.notifications.filter((n) => !n.isRead);
  }, [notificationContext.notifications]);

  // Get read notifications
  const getReadNotifications = useCallback(() => {
    return notificationContext.notifications.filter((n) => n.isRead);
  }, [notificationContext.notifications]);

  // Check if there are unread notifications
  const hasUnreadNotifications = useCallback(() => {
    return notificationContext.unreadCount > 0;
  }, [notificationContext.unreadCount]);

  // Send push notification
  const sendPushNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        await notificationContext.sendPushNotification(title, body, data);
        return true;
      } catch (err: any) {
        console.error('Error sending push notification:', err);
        return false;
      }
    },
    [notificationContext]
  );

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    try {
      await notificationContext.registerForPushNotifications();
      return true;
    } catch (err: any) {
      console.error('Error registering for push notifications:', err);
      return false;
    }
  }, [notificationContext]);

  return {
    ...notificationContext,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    getReadNotifications,
    hasUnreadNotifications,
    sendPushNotification,
    registerForPushNotifications,
    isLoading,
    error,
  };
};

export default useNotification;