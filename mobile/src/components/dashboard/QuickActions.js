// ============================================================================
// QuickActions Component - Dashboard Quick Action Cards
// ============================================================================

// parking-management-system/mobile/src/components/dashboard/QuickActions.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const QuickActions = ({ actions, onActionPress }) => {
  const defaultActions = [
    {
      id: 'parking',
      icon: 'parking',
      label: 'Find Parking',
      color: COLORS.primary,
    },
    {
      id: 'booking',
      icon: 'calendar',
      label: 'My Bookings',
      color: COLORS.success,
    },
    {
      id: 'charging',
      icon: 'zap',
      label: 'EV Charging',
      color: COLORS.warning,
    },
    {
      id: 'payment',
      icon: 'credit-card',
      label: 'Payments',
      color: COLORS.secondary,
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {displayActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: action.color + '15' }]}
            onPress={() => onActionPress?.(action.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Feather name={action.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  actionCard: {
    width: '25%',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs / 2,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default QuickActions;