// ============================================================================
// ChargingStatus Component - Quick Charging Status Display
// ============================================================================

// parking-management-system/mobile/src/components/charging/ChargingStatus.js

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

const ChargingStatus = ({
  status,
  batteryPercentage = 0,
  stationName,
  estimatedTime,
  onPress,
  style,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'charging':
        return 'zap';
      case 'paused':
        return 'pause';
      case 'completed':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'circle';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'charging':
        return COLORS.success;
      case 'paused':
        return COLORS.warning;
      case 'completed':
        return COLORS.success;
      case 'error':
        return COLORS.danger;
      default:
        return COLORS.gray600;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'charging':
        return 'Charging';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getBatteryColor = () => {
    if (batteryPercentage >= 80) return COLORS.success;
    if (batteryPercentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const statusColor = getStatusColor();
  const batteryColor = getBatteryColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={style}
    >
      <Card variant="elevated" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: statusColor },
              ]}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: statusColor }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          <View style={styles.batteryContainer}>
            <View style={styles.batteryIcon}>
              <Feather name="battery" size={24} color={batteryColor} />
              <Text style={[styles.batteryPercentage, { color: batteryColor }]}>
                {Math.round(batteryPercentage)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          {stationName && (
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={16} color={COLORS.gray500} />
              <Text style={styles.detailText}>{stationName}</Text>
            </View>
          )}
          {estimatedTime && (
            <View style={styles.detailRow}>
              <Feather name="clock" size={16} color={COLORS.gray500} />
              <Text style={styles.detailText}>
                Estimated: {estimatedTime}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(batteryPercentage, 100)}%`,
                  backgroundColor: getBatteryColor(),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Feather
            name={getStatusIcon()}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.footerText, { color: statusColor }]}>
            {getStatusText()} in progress
          </Text>
          <Feather
            name="chevron-right"
            size={16}
            color={COLORS.gray400}
            style={styles.chevron}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    marginVertical: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusTextContainer: {
    flexDirection: 'column',
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  statusValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  batteryContainer: {
    alignItems: 'flex-end',
  },
  batteryIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryPercentage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginLeft: SPACING.xs,
  },
  details: {
    marginVertical: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs / 2,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    marginVertical: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  chevron: {
    marginLeft: SPACING.xs,
  },
});

export default ChargingStatus;