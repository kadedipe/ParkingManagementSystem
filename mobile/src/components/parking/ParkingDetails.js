// ============================================================================
// ParkingDetails Component - Detailed Parking Lot View
// ============================================================================

// parking-management-system/mobile/src/components/parking/ParkingDetails.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import {
  Card,
  Button,
  Rating,
  PriceTag,
  Badge,
  Divider,
} from '../common';
import parkingService from '../../api/services/parking.service';

const ParkingDetails = ({ parkingId, onBack, onBook }) => {
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    loadParkingDetails();
  }, [parkingId]);

  const loadParkingDetails = async () => {
    try {
      setLoading(true);
      const response = await parkingService.getParkingLotById(parkingId);
      setParking(response);
    } catch (error) {
      console.error('Error loading parking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMap = () => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${parking.latitude},${parking.longitude}`,
      android: `geo:${parking.latitude},${parking.longitude}?q=${parking.latitude},${parking.longitude}(Parking)`,
    });
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (parking.phone) {
      Linking.openURL(`tel:${parking.phone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!parking) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={COLORS.danger} />
        <Text style={styles.errorText}>Parking lot not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* Header Image */}
      <View style={styles.imageContainer}>
        {parking.images?.[0] ? (
          <Image source={{ uri: parking.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={48} color={COLORS.gray300} />
          </View>
        )}
        <View style={styles.imageOverlay}>
          <View style={styles.statusBadge}>
            <Badge
              text={parking.availableSpots > 0 ? 'Available' : 'Full'}
              variant={parking.availableSpots > 0 ? 'success' : 'danger'}
            />
          </View>
        </View>
      </View>

      {/* Parking Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{parking.name}</Text>
            <View style={styles.ratingContainer}>
              <Rating rating={parking.rating || 0} size="small" />
              <Text style={styles.ratingText}>
                {parking.rating?.toFixed(1) || '0.0'}
              </Text>
            </View>
          </View>
          <PriceTag
            amount={parking.pricePerHour || 0}
            period="/hr"
            variant="filled"
            color={COLORS.primary}
          />
        </View>

        <View style={styles.addressContainer}>
          <Feather name="map-pin" size={16} color={COLORS.gray500} />
          <Text style={styles.address}>{parking.address}</Text>
        </View>

        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Feather name="home" size={20} color={COLORS.primary} />
            <Text style={styles.quickInfoLabel}>Total Spots</Text>
            <Text style={styles.quickInfoValue}>{parking.totalSpots}</Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Feather name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.quickInfoLabel}>Available</Text>
            <Text style={styles.quickInfoValue}>{parking.availableSpots}</Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Feather name="clock" size={20} color={COLORS.warning} />
            <Text style={styles.quickInfoLabel}>Hours</Text>
            <Text style={styles.quickInfoValue}>24/7</Text>
          </View>
        </View>

        <Divider />

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {parking.amenities?.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Feather
                  name={
                    amenity === 'ev_charging'
                      ? 'zap'
                      : amenity === 'security'
                      ? 'shield'
                      : amenity === 'covered'
                      ? 'umbrella'
                      : 'check-circle'
                  }
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.amenityText}>
                  {amenity.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* Parking Spots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Spots</Text>
          <View style={styles.spotsContainer}>
            {parking.spots?.slice(0, 6).map((spot) => (
              <TouchableOpacity
                key={spot.id}
                style={[
                  styles.spotItem,
                  spot.status === 'available' && styles.spotAvailable,
                  selectedSpot === spot.id && styles.spotSelected,
                ]}
                onPress={() => setSelectedSpot(spot.id)}
                disabled={spot.status !== 'available'}
              >
                <Text
                  style={[
                    styles.spotNumber,
                    spot.status === 'available' && styles.spotNumberAvailable,
                    selectedSpot === spot.id && styles.spotNumberSelected,
                  ]}
                >
                  {spot.number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider />

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenMap}>
            <Feather name="map" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          {parking.phone && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Feather name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title="Book Now"
          onPress={() => onBook?.(parking)}
          variant="primary"
          size="large"
          style={styles.bookButton}
          disabled={parking.availableSpots === 0}
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
  backButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  statusBadge: {
    padding: SPACING.xs,
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
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  quickInfoItem: {
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: SPACING.xs / 2,
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
  section: {
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  amenityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  spotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  spotItem: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  spotAvailable: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '15',
  },
  spotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 3,
  },
  spotNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
  },
  spotNumberAvailable: {
    color: COLORS.success,
  },
  spotNumberSelected: {
    color: COLORS.primary,
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
});

export default ParkingDetails;