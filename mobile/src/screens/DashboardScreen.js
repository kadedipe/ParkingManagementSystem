// ============================================================================
// Dashboard Screen - Main Dashboard View
// ============================================================================

// parking-management-system/mobile/src/screens/DashboardScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Container } from '../components/common';
import {
  DashboardHeader,
  DashboardStats,
  QuickActions,
  RecentBookings,
} from '../components/dashboard';
import { COLORS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import bookingService from '../api/services/booking.service';
import parkingService from '../api/services/parking.service';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpots: 0,
    availableSpots: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const bookingsResponse = await bookingService.getBookings({ limit: 5 });
      setBookings(bookingsResponse.bookings || []);

      // Load parking stats
      const parkingResponse = await parkingService.getParkingCapacity();
      if (parkingResponse) {
        setStats({
          totalBookings: bookingsResponse?.total || 0,
          activeBookings: bookingsResponse?.active || 0,
          totalSpots: parkingResponse.total || 0,
          availableSpots: parkingResponse.available || 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'parking':
        navigation.navigate('ParkingList');
        break;
      case 'booking':
        navigation.navigate('Bookings');
        break;
      case 'charging':
        navigation.navigate('Charging');
        break;
      case 'payment':
        navigation.navigate('Payments');
        break;
      default:
        break;
    }
  };

  return (
    <Container>
      <DashboardHeader
        user={user}
        notificationCount={3}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('Profile')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardStats stats={stats} />
        <QuickActions onActionPress={handleQuickAction} />
        <RecentBookings
          bookings={bookings}
          onBookingPress={(booking) => navigation.navigate('BookingDetails', { bookingId: booking.id })}
          onViewAll={() => navigation.navigate('Bookings')}
        />
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
});

export default DashboardScreen;