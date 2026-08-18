// ============================================================================
// DashboardStats - Statistics Cards Component
// ============================================================================

// parking-management-system/mobile/src/components/dashboard/DashboardStats.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card } from '../common';

interface StatItem {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

interface DashboardStatsProps {
  stats?: StatItem[];
  onStatPress?: (statId: string) => void;
}

const defaultStats: StatItem[] = [
  {
    id: 'bookings',
    label: 'Bookings',
    value: 12,
    icon: 'calendar',
    color: COLORS.primary,
    trend: { value: 15, direction: 'up' },
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    value: 3,
    icon: 'truck',
    color: COLORS.success,
    trend: { value: 0, direction: 'neutral' },
  },
  {
    id: 'charging',
    label: 'Charging Sessions',
    value: 8,
    icon: 'zap',
    color: COLORS.warning,
    trend: { value: 25, direction: 'up' },
  },
  {
    id: 'points',
    label: 'Loyalty Points',
    value: 450,
    icon: 'star',
    color: COLORS.secondary,
    trend: { value: 10, direction: 'up' },
  },
];

export const DashboardStats = ({ stats = defaultStats, onStatPress }: DashboardStatsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <TouchableOpacity
            key={stat.id}
            style={styles.statItem}
            onPress={() => onStatPress?.(stat.id)}
            activeOpacity={0.7}
          >
            <Card variant="flat" style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <View style={styles.statContent}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
                  <Feather name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.trend && stat.trend.value !== 0 && (
                  <View style={styles.trendContainer}>
                    <Feather
                      name={stat.trend.direction === 'up' ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={
                        stat.trend.direction === 'up' ? COLORS.success : COLORS.danger
                      }
                    />
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color:
                            stat.trend.direction === 'up'
                              ? COLORS.success
                              : COLORS.danger,
                        },
                      ]}
                    >
                      {stat.trend.value}%
                    </Text>
                  </View>
                )}
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: 2,
  },
});

export default DashboardStats;