// ============================================================================
// Hooks Usage Example - Component Integration
// ============================================================================

// parking-management-system/mobile/src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useParking } from '../hooks/useParking';
import { useBooking } from '../hooks/useBooking';
import { useLocation } from '../hooks/useLocation';
import { useDebounce } from '../hooks/useDebounce';
import { useNetwork } from '../hooks/useNetwork';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { ParkingCard, SearchInput } from '../components/common';

const HomeScreen = ({ navigation }) => {
  const { user, getUserName } = useAuth();
  const { parkingLots, loadParkingLots, loading } = useParking();
  const { activeBooking } = useBooking();
  const { location, getCurrentLocation } = useLocation();
  const { isConnected } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      searchParking(debouncedSearch);
    }
  }, [debouncedSearch]);

  const loadInitialData = async () => {
    if (location) {
      await loadParkingLots({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10,
      });
    } else {
      await loadParkingLots();
    }
  };

  const searchParking = async (query: string) => {
    await loadParkingLots({ search: query });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleParkingSelect = (parking: any) => {
    navigation.navigate('ParkingDetails', { parkingId: parking.id });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {getUserName()}!</Text>
        {!isConnected && (
          <Text style={styles.offlineText}>🔴 Offline</Text>
        )}
        {activeBooking && (
          <View style={styles.activeBookingBadge}>
            <Text style={styles.activeBookingText}>
              Active Booking: {activeBooking.parkingLotName}
            </Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchInput
          placeholder="Search parking lots..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={searchParking}
        />
      </View>

      {/* Parking List */}
      {parkingLots.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No parking lots found</Text>
        </View>
      ) : (
        parkingLots.map((lot) => (
          <ParkingCard
            key={lot.id}
            {...lot}
            onPress={() => handleParkingSelect(lot)}
            onBookPress={() => handleParkingSelect(lot)}
            style={styles.parkingCard}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.md,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  offlineText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
  activeBookingBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginTop: SPACING.xs,
  },
  activeBookingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  searchContainer: {
    marginVertical: SPACING.md,
  },
  parkingCard: {
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
  },
});

export default HomeScreen;