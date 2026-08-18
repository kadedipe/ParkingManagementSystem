// ============================================================================
// ParkingSpotSelector Component - Interactive Spot Selection
// ============================================================================

// parking-management-system/mobile/src/components/parking/ParkingSpotSelector.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Badge } from '../common';

const ParkingSpotSelector = ({
  spots,
  onSpotSelect,
  selectedSpotId,
  maxSelectable = 1,
}) => {
  const [selectedSpots, setSelectedSpots] = useState(
    selectedSpotId ? [selectedSpotId] : []
  );

  const handleSpotPress = (spot) => {
    if (spot.status !== 'available') return;

    let newSelection;
    if (maxSelectable === 1) {
      newSelection = selectedSpots.includes(spot.id) ? [] : [spot.id];
    } else {
      if (selectedSpots.includes(spot.id)) {
        newSelection = selectedSpots.filter(id => id !== spot.id);
      } else if (selectedSpots.length < maxSelectable) {
        newSelection = [...selectedSpots, spot.id];
      } else {
        return;
      }
    }
    setSelectedSpots(newSelection);
    onSpotSelect?.(newSelection);
  };

  const getSpotStatus = (spot) => {
    const isSelected = selectedSpots.includes(spot.id);
    if (isSelected) return 'selected';
    if (spot.status === 'occupied') return 'occupied';
    if (spot.status === 'reserved') return 'reserved';
    return 'available';
  };

  const getSpotColor = (status) => {
    switch (status) {
      case 'selected':
        return COLORS.primary;
      case 'occupied':
        return COLORS.danger;
      case 'reserved':
        return COLORS.warning;
      case 'available':
      default:
        return COLORS.success;
    }
  };

  const getSpotLabel = (status) => {
    switch (status) {
      case 'selected':
        return '✓ Selected';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      case 'available':
      default:
        return 'Available';
    }
  };

  const renderSpotMap = () => {
    // Group spots by level
    const levels = spots?.reduce((acc, spot) => {
      const level = spot.level || 1;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spot);
      return acc;
    }, {}) || {};

    return Object.entries(levels).map(([level, levelSpots]) => (
      <View key={level} style={styles.levelContainer}>
        <Text style={styles.levelTitle}>Level {level}</Text>
        <View style={styles.spotsGrid}>
          {levelSpots.map((spot, index) => {
            const status = getSpotStatus(spot);
            const color = getSpotColor(status);
            return (
              <TouchableOpacity
                key={spot.id || index}
                style={[
                  styles.spotBox,
                  {
                    borderColor: color,
                    backgroundColor: status === 'available' ? color + '15' : color + '10',
                  },
                  status === 'occupied' && styles.spotDisabled,
                  status === 'reserved' && styles.spotDisabled,
                ]}
                onPress={() => handleSpotPress(spot)}
                disabled={status === 'occupied' || status === 'reserved'}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.spotNumber,
                    { color: status === 'selected' ? COLORS.primary : COLORS.text },
                  ]}
                >
                  {spot.number || `A${index + 1}`}
                </Text>
                {status === 'occupied' && (
                  <View style={styles.spotStatusIcon}>
                    <Feather name="x" size={12} color={COLORS.danger} />
                  </View>
                )}
                {status === 'reserved' && (
                  <View style={styles.spotStatusIcon}>
                    <Feather name="clock" size={12} color={COLORS.warning} />
                  </View>
                )}
                {status === 'selected' && (
                  <View style={styles.spotStatusIcon}>
                    <Feather name="check" size={12} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ));
  };

  const selectedCount = selectedSpots.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>Reserved</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
        </View>
        {maxSelectable > 1 && (
          <Badge
            text={`${selectedCount}/${maxSelectable}`}
            variant={selectedCount === maxSelectable ? 'success' : 'primary'}
          />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSpotMap()}
      </ScrollView>

      {selectedCount > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedCount} spot{selectedCount > 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => onSpotSelect?.(selectedSpots)}
          >
            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            <Feather name="check" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
  },
  levelContainer: {
    padding: SPACING.md,
  },
  levelTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  spotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  spotBox: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
    position: 'relative',
  },
  spotDisabled: {
    opacity: 0.5,
  },
  spotNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  spotStatusIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginRight: SPACING.xs,
  },
});

export default ParkingSpotSelector;