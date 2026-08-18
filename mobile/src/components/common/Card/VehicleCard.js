// ============================================================================
// VehicleCard Component - Card for Vehicle Display
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/VehicleCard.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Card from './Card';
import CardHeader from './CardHeader';
import CardContent from './CardContent';
import CardFooter from './CardFooter';
import CardAction from './CardAction';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * VehicleCard Component - Specialized card for vehicle display
 */
const VehicleCard = ({
  name,
  plateNumber,
  type,
  color,
  isDefault = false,
  image,
  onPress,
  onEditPress,
  onDeletePress,
  variant = 'elevated',
  style,
  ...props
}) => {
  const getVehicleIcon = () => {
    switch (type) {
      case 'car':
        return '🚗';
      case 'suv':
        return '🚙';
      case 'truck':
        return '🚛';
      case 'motorcycle':
        return '🏍️';
      case 'bicycle':
        return '🚲';
      default:
        return '🚗';
    }
  };

  return (
    <Card
      variant={variant}
      pressable={!!onPress}
      onPress={onPress}
      style={[styles.container, style]}
      {...props}
    >
      <CardHeader
        title={name}
        subtitle={plateNumber}
        rightIcon={
          isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )
        }
      />
      <CardContent>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleTypeContainer}>
            <Text style={styles.vehicleIcon}>{getVehicleIcon()}</Text>
            <Text style={styles.vehicleType}>{type?.toUpperCase()}</Text>
          </View>
          <View style={styles.vehicleDetails}>
            <View style={styles.detailRow}>
              <Feather name="droplet" size={16} color={COLORS.gray600} />
              <Text style={styles.detailText}>{color || 'Black'}</Text>
            </View>
          </View>
        </View>
      </CardContent>
      <CardFooter>
        <View style={styles.actions}>
          <CardAction
            label="Edit"
            onPress={onEditPress}
            variant="text"
            icon={<Feather name="edit-2" size={16} color={COLORS.primary} />}
          />
          <CardAction
            label="Delete"
            onPress={onDeletePress}
            variant="text"
            color={COLORS.danger}
            icon={<Feather name="trash-2" size={16} color={COLORS.danger} />}
          />
        </View>
      </CardFooter>
    </Card>
  );
};

VehicleCard.propTypes = {
  name: PropTypes.string.isRequired,
  plateNumber: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['car', 'suv', 'truck', 'motorcycle', 'bicycle']),
  color: PropTypes.string,
  isDefault: PropTypes.bool,
  image: PropTypes.oneOfType([
    PropTypes.shape({ uri: PropTypes.string }),
    PropTypes.number,
  ]),
  onPress: PropTypes.func,
  onEditPress: PropTypes.func,
  onDeletePress: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

VehicleCard.defaultProps = {
  type: 'car',
  color: 'Black',
  isDefault: false,
  image: null,
  onPress: null,
  onEditPress: null,
  onDeletePress: null,
  variant: 'elevated',
  style: null,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 4,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  vehicleType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray600,
  },
  vehicleDetails: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginLeft: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
});

export default VehicleCard;