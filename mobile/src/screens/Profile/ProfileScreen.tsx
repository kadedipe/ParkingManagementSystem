// ============================================================================
// ProfileScreen - Main Profile Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Profile/ProfileScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainTabScreenProps } from '../../navigation/types/mainTabs';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import {
  Card,
  Button,
  Avatar,
  Badge,
  Divider,
} from '../../components';
import { useAuth, useBooking, useParking, useNotification } from '../../hooks';

const ProfileScreen = ({ navigation }: MainTabScreenProps<typeof ROUTES.APP.PROFILE>) => {
  const { user, logout, getUserName, getUserInitials } = useAuth();
  const { bookings, getBookingsByStatus } = useBooking();
  const { parkingLots } = useParking();
  const { unreadCount } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    bookings: 0,
    vehicles: 0,
    charging: 0,
    points: 0,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadStats();
    animateIn();
  }, [bookings]);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadStats = () => {
    const activeBookings = getBookingsByStatus('active').length;
    const upcomingBookings = getBookingsByStatus('confirmed').length;
    
    setStats({
      bookings: activeBookings + upcomingBookings,
      vehicles: user?.vehicles?.length || 0,
      charging: 0, // Would come from charging service
      points: user?.loyaltyPoints || 0,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PROFILE.EDIT);
  };

  const handleVehicles = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PROFILE.VEHICLES);
  };

  const handlePaymentMethods = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PAYMENT.METHODS);
  };

  const handleLoyalty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PROFILE.LOYALTY);
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PROFILE.SETTINGS);
  };

  const handleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.NOTIFICATION.LIST);
  };

  const handleHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PROFILE.HELP);
  };

  const renderStatItem = (icon: string, label: string, value: number, color: string) => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderMenuItem = (
    icon: string,
    label: string,
    onPress: () => void,
    badge?: string | number,
    iconColor?: string
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, iconColor && { backgroundColor: iconColor + '15' }]}>
          <Feather name={icon} size={20} color={iconColor || COLORS.text} />
        </View>
        <Text style={[styles.menuLabel, iconColor && { color: iconColor }]}>
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <Badge
            text={typeof badge === 'number' && badge > 99 ? '99+' : String(badge)}
            variant="danger"
            size="small"
            style={styles.menuBadge}
          />
        )}
        <Feather name="chevron-right" size={20} color={COLORS.gray400} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={handleNotifications}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={24} color={COLORS.text} />
              {unreadCount > 0 && (
                <Badge
                  text={unreadCount > 99 ? '99+' : String(unreadCount)}
                  variant="danger"
                  size="small"
                  style={styles.notificationBadge}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={handleEditProfile} activeOpacity={0.8}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{getUserName()}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              {user?.memberSince && (
                <Text style={styles.memberSince}>
                  Member since {new Date(user.memberSince).getFullYear()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Feather name="edit-2" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {renderStatItem('calendar', 'Bookings', stats.bookings, COLORS.primary)}
          {renderStatItem('truck', 'Vehicles', stats.vehicles, COLORS.success)}
          {renderStatItem('zap', 'Charging', stats.charging, COLORS.warning)}
          {renderStatItem('star', 'Points', stats.points, COLORS.secondary)}
        </View>

        <Divider style={styles.divider} />

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          {renderMenuItem('user', 'Edit Profile', handleEditProfile)}
          {renderMenuItem('truck', 'My Vehicles', handleVehicles, stats.vehicles)}
          {renderMenuItem('credit-card', 'Payment Methods', handlePaymentMethods)}
          {renderMenuItem('star', 'Loyalty Points', handleLoyalty, stats.points, COLORS.warning)}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Preferences</Text>
          {renderMenuItem('bell', 'Notifications', handleNotifications, unreadCount)}
          {renderMenuItem('globe', 'Language', () => navigation.navigate(ROUTES.PROFILE.LANGUAGE), 'English')}
          {renderMenuItem('moon', 'Dark Mode', () => navigation.navigate(ROUTES.PROFILE.THEME))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          {renderMenuItem('help-circle', 'Help Center', handleHelp)}
          {renderMenuItem('message-square', 'Send Feedback', () => navigation.navigate(ROUTES.PROFILE.FEEDBACK))}
          {renderMenuItem('info', 'About', () => navigation.navigate(ROUTES.PROFILE.ABOUT), 'v2.0.0')}
        </View>

        <View style={styles.menuSection}>
          {renderMenuItem(
            'log-out',
            'Log Out',
            handleLogout,
            undefined,
            COLORS.danger
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  memberSince: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  editButton: {
    padding: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: 2,
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  menuSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    marginRight: SPACING.sm,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ProfileScreen;