// ============================================================================
// MainTabs - Bottom Tab Navigator
// ============================================================================

// parking-management-system/mobile/src/navigation/MainTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { ROUTES } from '../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

// Tab Screens
import HomeScreen from '../screens/main/HomeScreen';
import ParkingScreen from '../screens/main/ParkingScreen';
import ChargingScreen from '../screens/main/ChargingScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Types
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Tabs Navigator - Bottom tab navigation for main app
 */
export const MainTabs = () => {
  const { colors, isDark } = useTheme();
  const { unreadCount } = useNotification();

  // Tab screen options
  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarShowLabel: true,
    tabBarStyle: {
      backgroundColor: isDark ? colors.background : '#FFFFFF',
      borderTopColor: colors.border,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      paddingTop: 10,
      height: Platform.OS === 'ios' ? 85 : 65,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 5,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      marginTop: 4,
    },
    tabBarHideOnKeyboard: true,
  };

  // Custom tab bar icon with badge
  const renderTabIcon = (routeName: string, color: string, size: number, focused: boolean) => {
    const icons: Record<string, string> = {
      [ROUTES.APP.HOME]: 'home',
      [ROUTES.APP.PARKING]: 'grid',
      [ROUTES.APP.CHARGING]: 'zap',
      [ROUTES.APP.BOOKINGS]: 'calendar',
      [ROUTES.APP.PROFILE]: 'user',
    };

    const iconName = icons[routeName] || 'circle';

    return (
      <View style={styles.iconContainer}>
        <Feather
          name={iconName}
          size={size}
          color={color}
          style={focused && styles.activeIcon}
        />
        {routeName === ROUTES.APP.BOOKINGS && unreadCount > 0 && (
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
          </View>
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={tabScreenOptions}
      sceneContainerStyle={{
        backgroundColor: colors.background,
      }}
    >
      <Tab.Screen
        name={ROUTES.APP.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) =>
            renderTabIcon(ROUTES.APP.HOME, color, size, focused),
        }}
      />

      <Tab.Screen
        name={ROUTES.APP.PARKING}
        component={ParkingScreen}
        options={{
          tabBarLabel: 'Parking',
          tabBarIcon: ({ color, size, focused }) =>
            renderTabIcon(ROUTES.APP.PARKING, color, size, focused),
        }}
      />

      <Tab.Screen
        name={ROUTES.APP.CHARGING}
        component={ChargingScreen}
        options={{
          tabBarLabel: 'Charging',
          tabBarIcon: ({ color, size, focused }) =>
            renderTabIcon(ROUTES.APP.CHARGING, color, size, focused),
        }}
      />

      <Tab.Screen
        name={ROUTES.APP.BOOKINGS}
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size, focused }) =>
            renderTabIcon(ROUTES.APP.BOOKINGS, color, size, focused),
        }}
      />

      <Tab.Screen
        name={ROUTES.APP.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) =>
            renderTabIcon(ROUTES.APP.PROFILE, color, size, focused),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default MainTabs;