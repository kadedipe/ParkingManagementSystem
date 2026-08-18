// ============================================================================
// Screen Usage Example - How to Use Screens in MainStack
// ============================================================================

// parking-management-system/mobile/src/screens/main/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { MainTabScreenProps } from '../../navigation/types/mainTabs';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import {
  Card,
  SearchInput,
  ParkingCard,
  QuickActions,
  DashboardHeader,
  DashboardStats,
} from '../../components';
import { useAuth, useParking, useBooking, useLocation } from '../../hooks';

const HomeScreen: React.FC<MainTabScreenProps<typeof ROUTES.APP.HOME>> = ({ navigation }) => {
  const { user, getUserName } = useAuth();
  const { parkingLots, loadParkingLots, loading } = useParking();
  const { activeBooking } = useBooking();
  const { location, getCurrentLocation } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (location) {
      await loadParkingLots({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10,
        limit: 5,
      });
    } else {
      await loadParkingLots({ limit: 5 });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleParkingSelect = (parking: any) => {
    navigation.navigate(ROUTES.PARKING.DETAILS, { parkingId: parking.id });
  };

  const handleNotificationPress = () => {
    navigation.navigate(ROUTES.NOTIFICATION.LIST);
  };

  const handleProfilePress = () => {
    navigation.navigate(ROUTES.PROFILE.EDIT);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'parking':
        navigation.navigate(ROUTES.APP.PARKING);
        break;
      case 'booking':
        navigation.navigate(ROUTES.APP.BOOKINGS);
        break;
      case 'charging':
        navigation.navigate(ROUTES.APP.CHARGING);
        break;
      case 'payment':
        navigation.navigate(ROUTES.PAYMENT.METHODS);
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <DashboardHeader
        user={user}
        notificationCount={3}
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
      />

      {/* Active Booking Banner */}
      {activeBooking && (
        <TouchableOpacity
          style={styles.activeBookingBanner}
          onPress={() => navigation.navigate(ROUTES.BOOKING.DETAILS, { bookingId: activeBooking.id })}
        >
          <View style={styles.activeBookingContent}>
            <Feather name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.activeBookingText}>
              Active: {activeBooking.parkingLotName}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search parking spots..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={() => {
            navigation.navigate(ROUTES.APP.PARKING);
          }}
        />
      </View>

      {/* Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions onActionPress={handleQuickAction} />

      {/* Nearby Parking */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Parking</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.APP.PARKING)}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {parkingLots.slice(0, 3).map((parking) => (
        <ParkingCard
          key={parking.id}
          {...parking}
          onPress={() => handleParkingSelect(parking)}
          onBookPress={() => handleParkingSelect(parking)}
          style={styles.parkingCard}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  activeBookingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  activeBookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBookingText: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.sm,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
  },
  parkingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
});

export default HomeScreen;