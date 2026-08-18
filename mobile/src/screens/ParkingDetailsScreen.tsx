// ============================================================================
// Navigation Usage Example - Screen Component
// ============================================================================

// parking-management-system/mobile/src/screens/ParkingDetailsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

import { ScreenProps } from '../navigation/types';
import { ROUTES } from '../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { Card, Button, Rating, PriceTag, Badge } from '../components/common';
import { useParking } from '../hooks/useParking';
import { useBooking } from '../hooks/useBooking';
import NavigationService from '../navigation/NavigationService';

const ParkingDetailsScreen: React.FC = () => {
  const route = useRoute<ScreenProps<typeof ROUTES.PARKING.DETAILS>['route']>();
  const navigation = useNavigation();
  const { parkingId } = route.params || {};

  const { selectedParking, getParkingDetails, loading } = useParking();
  const { createBooking } = useBooking();
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  useEffect(() => {
    if (parkingId) {
      getParkingDetails(parkingId);
    }
  }, [parkingId]);

  const handleBookNow = () => {
    if (!selectedParking) return;

    NavigationService.navigate('CreateBooking', {
      parkingId: selectedParking.id,
      spotId: selectedSpot || undefined,
    });
  };

  const handleViewMap = () => {
    if (!selectedParking) return;
    NavigationService.navigate('ParkingMap', {
      parkingId: selectedParking.id,
    });
  };

  const handleViewReviews = () => {
    if (!selectedParking) return;
    NavigationService.navigate('ParkingReviews', {
      parkingId: selectedParking.id,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!selectedParking) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={COLORS.danger} />
        <Text style={styles.errorText}>Parking lot not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="primary"
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        {selectedParking.images?.[0] ? (
          <Image
            source={{ uri: selectedParking.images[0] }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={48} color={COLORS.gray300} />
          </View>
        )}
        <View style={styles.imageOverlay}>
          <Badge
            text={selectedParking.availableSpots > 0 ? 'Available' : 'Full'}
            variant={selectedParking.availableSpots > 0 ? 'success' : 'danger'}
          />
        </View>
      </View>

      {/* Parking Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{selectedParking.name}</Text>
            <View style={styles.ratingContainer}>
              <Rating rating={selectedParking.rating || 0} size="small" />
              <Text style={styles.ratingText}>
                {selectedParking.rating?.toFixed(1) || '0.0'}
              </Text>
              <TouchableOpacity onPress={handleViewReviews}>
                <Text style={styles.reviewsLink}>
                  ({selectedParking.reviewCount || 0} reviews)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <PriceTag
            amount={selectedParking.pricePerHour || 0}
            period="/hr"
            variant="filled"
            color={COLORS.primary}
          />
        </View>

        <View style={styles.addressContainer}>
          <Feather name="map-pin" size={16} color={COLORS.gray500} />
          <Text style={styles.address}>{selectedParking.address}</Text>
        </View>

        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Feather name="home" size={20} color={COLORS.primary} />
            <Text style={styles.quickInfoLabel}>Total Spots</Text>
            <Text style={styles.quickInfoValue}>{selectedParking.totalSpots}</Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Feather name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.quickInfoLabel}>Available</Text>
            <Text style={styles.quickInfoValue}>{selectedParking.availableSpots}</Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Feather name="clock" size={20} color={COLORS.warning} />
            <Text style={styles.quickInfoLabel}>Hours</Text>
            <Text style={styles.quickInfoValue}>24/7</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewMap}>
            <Feather name="map" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewReviews}>
            <Feather name="star" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Reviews</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Book Now"
          onPress={handleBookNow}
          variant="primary"
          size="large"
          style={styles.bookButton}
          disabled={selectedParking.availableSpots === 0}
        />

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.danger,
    marginTop: SPACING.md,
  },
  errorButton: {
    marginTop: SPACING.lg,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  reviewsLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  quickInfoItem: {
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: 2,
  },
  quickInfoValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  quickInfoDivider: {
    width: 1,
    backgroundColor: COLORS.gray300,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  bookButton: {
    marginTop: SPACING.sm,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ParkingDetailsScreen;