// ============================================================================
// ParkingCard Component - Card for Parking Spots
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/ParkingCard.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Card from './Card';
import CardHeader from './CardHeader';
import CardContent from './CardContent';
import CardFooter from './CardFooter';
import CardAction from './CardAction';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * ParkingCard Component - Specialized card for parking spot display
 */
const ParkingCard = ({
  name,
  address,
  distance,
  price,
  availableSpots,
  totalSpots,
  rating,
  status = 'available',
  image,
  onPress,
  onBookPress,
  variant = 'elevated',
  style,
  ...props
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'partial':
        return COLORS.warning;
      case 'full':
        return COLORS.danger;
      case 'closed':
        return COLORS.gray600;
      default:
        return COLORS.gray600;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'partial':
        return 'Limited Spots';
      case 'full':
        return 'Full';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  const occupancyPercentage = totalSpots > 0 
    ? Math.round(((totalSpots - availableSpots) / totalSpots) * 100)
    : 0;

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
        subtitle={address}
        rightIcon={
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        }
      />
      <CardContent>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{distance}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>{price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rating</Text>
            <Text style={styles.detailValue}>⭐ {rating}</Text>
          </View>
        </View>
        <View style={styles.occupancyContainer}>
          <View style={styles.occupancyBar}>
            <View
              style={[
                styles.occupancyFill,
                {
                  width: `${occupancyPercentage}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.occupancyText}>
            {availableSpots} / {totalSpots} spots available
          </Text>
        </View>
      </CardContent>
      <CardFooter>
        <Text style={styles.footerText}>{availableSpots} spots left</Text>
        <CardAction
          label="Book Now"
          onPress={onBookPress}
          variant="contained"
          color={COLORS.primary}
        />
      </CardFooter>
    </Card>
  );
};

ParkingCard.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string,
  distance: PropTypes.string,
  price: PropTypes.string,
  availableSpots: PropTypes.number,
  totalSpots: PropTypes.number,
  rating: PropTypes.number,
  status: PropTypes.oneOf(['available', 'partial', 'full', 'closed']),
  image: PropTypes.oneOfType([
    PropTypes.shape({ uri: PropTypes.string }),
    PropTypes.number,
  ]),
  onPress: PropTypes.func,
  onBookPress: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

ParkingCard.defaultProps = {
  address: '',
  distance: '0.5 km',
  price: '$5.00/hr',
  availableSpots: 10,
  totalSpots: 20,
  rating: 4.5,
  status: 'available',
  image: null,
  onPress: null,
  onBookPress: null,
  variant: 'elevated',
  style: null,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.sm,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  occupancyContainer: {
    marginTop: SPACING.sm,
  },
  occupancyBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  occupancyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});

export default ParkingCard;