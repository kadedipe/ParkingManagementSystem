// ============================================================================
// DashboardStats Component - Dashboard Statistics Cards
// ============================================================================

// parking-management-system/mobile/src/components/dashboard/DashboardStats.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card, StatCard } from '../common';

const DashboardStats = ({ stats }) => {
  const defaultStats = {
    totalBookings: 24,
    activeBookings: 3,
    totalSpots: 45,
    availableSpots: 12,
  };

  const displayStats = stats || defaultStats;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard
          title="Total Bookings"
          value={displayStats.totalBookings}
          subtitle="All time"
          icon={<Feather name="calendar" size={24} color={COLORS.primary} />}
          color={COLORS.primary}
          style={styles.statCard}
        />
        <StatCard
          title="Active Bookings"
          value={displayStats.activeBookings}
          subtitle="In progress"
          icon={<Feather name="clock" size={24} color={COLORS.success} />}
          color={COLORS.success}
          style={styles.statCard}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          title="Total Spots"
          value={displayStats.totalSpots}
          subtitle="Available"
          icon={<Feather name="home" size={24} color={COLORS.info} />}
          color={COLORS.info}
          style={styles.statCard}
        />
        <StatCard
          title="Available"
          value={displayStats.availableSpots}
          subtitle="Right now"
          icon={<Feather name="check-circle" size={24} color={COLORS.success} />}
          color={COLORS.success}
          style={styles.statCard}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default DashboardStats;