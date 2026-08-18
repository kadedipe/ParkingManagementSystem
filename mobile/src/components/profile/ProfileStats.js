// ============================================================================
// ProfileStats Component - Profile Statistics Cards
// ============================================================================

// parking-management-system/mobile/src/components/profile/ProfileStats.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card } from '../common';

const ProfileStats = ({
  stats,
  onStatPress,
  style,
}) => {
  const defaultStats = {
    bookings: 12,
    vehicles: 3,
    charging: 8,
    loyaltyPoints: 450,
    reviews: 5,
    referrals: 2,
  };

  const displayStats = stats || defaultStats;

  const statItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      value: displayStats.bookings,
      icon: 'calendar',
      color: COLORS.primary,
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      value: displayStats.vehicles,
      icon: 'truck',
      color: COLORS.success,
    },
    {
      id: 'charging',
      label: 'Charging',
      value: displayStats.charging,
      icon: 'zap',
      color: COLORS.warning,
    },
    {
      id: 'loyalty',
      label: 'Loyalty Points',
      value: displayStats.loyaltyPoints,
      icon: 'star',
      color: COLORS.secondary,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {statItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.statItem}
            onPress={() => onStatPress?.(item.id)}
            activeOpacity={0.7}
          >
            <Card variant="flat" style={[styles.statCard, { borderLeftColor: item.color }]}>
              <View style={styles.statContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                  <Feather name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statCard: {
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  statContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
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
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: 2,
  },
});

export default ProfileStats;