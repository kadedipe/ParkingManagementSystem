// ============================================================================
// DashboardHeader - Header Component for Dashboard
// ============================================================================

// parking-management-system/mobile/src/components/dashboard/DashboardHeader.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Badge } from '../common';

interface User {
  name: string;
  avatar?: string;
  email?: string;
}

interface DashboardHeaderProps {
  user: User | null;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const DashboardHeader = ({
  user,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}: DashboardHeaderProps) => {
  const getInitials = () => {
    if (!user?.name) return '?';
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={24} color={COLORS.text} />
          {notificationCount > 0 && (
            <Badge
              text={notificationCount > 99 ? '99+' : notificationCount.toString()}
              variant="danger"
              size="small"
              style={styles.notificationBadge}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  userInfo: {
    marginLeft: SPACING.sm,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});

export default DashboardHeader;