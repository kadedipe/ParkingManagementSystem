// ============================================================================
// RecentBookings Component - Dashboard Recent Bookings List
// ============================================================================

// parking-management-system/mobile/src/components/dashboard/RecentBookings.js

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Badge } from '../common';

const RecentBookings = ({ bookings, onBookingPress, onViewAll }) => {
  const renderBooking = ({ item }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'active':
          return COLORS.success;
        case 'pending':
          return COLORS.warning;
        case 'completed':
          return COLORS.info;
        case 'cancelled':
          return COLORS.danger;
        default:
          return COLORS.gray600;
      }
    };

    const getStatusText = () => {
      switch (item.status) {
        case 'active':
          return 'Active';
        case 'pending':
          return 'Pending';
        case 'completed':
          return 'Completed';
        case 'cancelled':
          return 'Cancelled';
        default:
          return 'Unknown';
      }
    };

    return (
      <TouchableOpacity
        style={styles.bookingItem}
        onPress={() => onBookingPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingInfo}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingLot}>{item.parkingLot || 'Parking Lot'}</Text>
            <Badge
              text={getStatusText()}
              variant={item.status === 'active' ? 'success' : 'secondary'}
              size="small"
            />
          </View>
          <View style={styles.bookingDetails}>
            <View style={styles.bookingDetail}>
              <Feather name="calendar" size={14} color={COLORS.gray500} />
              <Text style={styles.bookingDetailText}>{item.date || 'Today'}</Text>
            </View>
            <View style={styles.bookingDetail}>
              <Feather name="clock" size={14} color={COLORS.gray500} />
              <Text style={styles.bookingDetailText}>{item.time || '10:00 AM'}</Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.gray400} />
      </TouchableOpacity>
    );
  };

  const hasBookings = bookings && bookings.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Bookings</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {hasBookings ? (
        <FlatList
          data={bookings.slice(0, 3)}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id || item._id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={40} color={COLORS.gray300} />
          <Text style={styles.emptyText}>No recent bookings</Text>
          <TouchableOpacity style={styles.bookNowButton}>
            <Text style={styles.bookNowText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  viewAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bookingLot: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  bookingDetails: {
    flexDirection: 'row',
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  bookingDetailText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginLeft: SPACING.xs,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray500,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.sm,
  },
  bookNowButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
});

export default RecentBookings;