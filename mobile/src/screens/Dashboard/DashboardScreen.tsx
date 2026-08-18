// ============================================================================
// DashboardScreen - Main Dashboard Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Dashboard/DashboardScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
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
  SearchInput,
  ParkingCard,
  QuickActions,
  DashboardHeader,
  DashboardStats,
} from '../../components';
import { useAuth, useParking, useBooking, useLocation, useNotification } from '../../hooks';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: MainTabScreenProps<typeof ROUTES.APP.HOME>) => {
  const { user, getUserName } = useAuth();
  const { 
    parkingLots, 
    loadParkingLots, 
    loading: parkingLoading,
    getNearbyParking,
  } = useParking();
  const { 
    bookings, 
    activeBooking, 
    getUpcomingBookings,
    loading: bookingLoading,
  } = useBooking();
  const { location, getCurrentLocation } = useLocation();
  const { unreadCount } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    setGreeting(getGreeting());
    loadInitialData();
    animateIn();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
      refreshData();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadInitialData = async () => {
    try {
      // Get location
      const loc = await getCurrentLocation();
      if (loc) {
        await getNearbyParking(loc.latitude, loc.longitude, 10);
      } else {
        await loadParkingLots({ limit: 5 });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate(ROUTES.APP.PARKING);
    }
  };

  const handleParkingSelect = (parking: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PARKING.DETAILS, { parkingId: parking.id });
  };

  const handleBookingPress = () => {
    if (activeBooking) {
      navigation.navigate(ROUTES.BOOKING.DETAILS, { bookingId: activeBooking.id });
    } else {
      navigation.navigate(ROUTES.APP.BOOKINGS);
    }
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.NOTIFICATION.LIST);
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PROFILE.EDIT);
  };

  const handleQuickAction = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const renderActiveBooking = () => {
    if (!activeBooking) return null;

    const startTime = new Date(activeBooking.startTime);
    const endTime = new Date(activeBooking.endTime);
    const timeLeft = formatDistanceToNow(endTime, { addSuffix: true });

    return (
      <TouchableOpacity
        style={styles.activeBookingCard}
        onPress={handleBookingPress}
        activeOpacity={0.7}
      >
        <View style={styles.activeBookingHeader}>
          <View style={styles.activeBookingIcon}>
            <Feather name="calendar" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.activeBookingInfo}>
            <Text style={styles.activeBookingTitle}>Active Booking</Text>
            <Text style={styles.activeBookingLot}>{activeBooking.parkingLotName}</Text>
          </View>
          <View style={styles.activeBookingTime}>
            <Text style={styles.activeBookingTimeText}>{timeLeft}</Text>
          </View>
        </View>
        <View style={styles.activeBookingDetails}>
          <View style={styles.activeBookingDetail}>
            <Feather name="clock" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.activeBookingDetailText}>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </Text>
          </View>
          <View style={styles.activeBookingDetail}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.activeBookingDetailText}>
              Spot {activeBooking.spotNumber}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUpcomingBookings = () => {
    const upcoming = getUpcomingBookings().slice(0, 2);
    if (upcoming.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.APP.BOOKINGS)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcoming.map((booking) => {
          const date = new Date(booking.startTime);
          const dateLabel = isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'MMM d');
          
          return (
            <Card key={booking.id} variant="elevated" style={styles.upcomingCard}>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.BOOKING.DETAILS, { bookingId: booking.id })}
                activeOpacity={0.7}
              >
                <View style={styles.upcomingCardHeader}>
                  <Text style={styles.upcomingCardTitle}>{booking.parkingLotName}</Text>
                  <Text style={styles.upcomingCardDate}>{dateLabel}</Text>
                </View>
                <Text style={styles.upcomingCardTime}>
                  {format(date, 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                </Text>
                <View style={styles.upcomingCardFooter}>
                  <Text style={styles.upcomingCardSpot}>Spot {booking.spotNumber}</Text>
                  <Text style={styles.upcomingCardStatus}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    );
  };

  const renderParkingNearby = () => {
    const nearby = parkingLots.slice(0, 3);
    if (nearby.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Feather name="map-pin" size={48} color={COLORS.gray300} />
          <Text style={styles.emptyStateTitle}>No Parking Nearby</Text>
          <Text style={styles.emptyStateText}>
            Try searching for parking spots in your area
          </Text>
          <Button
            title="Search Parking"
            onPress={() => navigation.navigate(ROUTES.APP.PARKING)}
            variant="primary"
            style={styles.emptyStateButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Parking</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.APP.PARKING)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {nearby.map((parking) => (
          <ParkingCard
            key={parking.id}
            {...parking}
            onPress={() => handleParkingSelect(parking)}
            onBookPress={() => handleParkingSelect(parking)}
            style={styles.parkingCard}
          />
        ))}
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading dashboard...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader
        user={user}
        notificationCount={unreadCount}
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
      />

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            {greeting}, {getUserName().split(' ')[0]}! 👋
          </Text>
          <Text style={styles.greetingSubtext}>
            Ready to park today?
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search parking spots..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={handleSearch}
            onSubmitEditing={handleSearch}
            size="medium"
          />
        </View>

        {/* Active Booking */}
        {renderActiveBooking()}

        {/* Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <QuickActions onActionPress={handleQuickAction} />

        {/* Upcoming Bookings */}
        {renderUpcomingBookings()}

        {/* Nearby Parking */}
        {parkingLoading ? renderLoading() : renderParkingNearby()}

        {/* Bottom Spacer */}
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
  greetingContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  greetingSubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.gray600,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  activeBookingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBookingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  activeBookingInfo: {
    flex: 1,
  },
  activeBookingTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  activeBookingLot: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
  },
  activeBookingTime: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  activeBookingTimeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#FFFFFF',
  },
  activeBookingDetails: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  activeBookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBookingDetailText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: SPACING.xs,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  upcomingCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  upcomingCardDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
  },
  upcomingCardTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  upcomingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  upcomingCardSpot: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  upcomingCardStatus: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.success,
  },
  parkingCard: {
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    minWidth: 160,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default DashboardScreen;