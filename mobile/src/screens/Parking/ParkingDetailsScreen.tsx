// ============================================================================
// ParkingDetailsScreen - Detailed Parking Lot View
// ============================================================================

// parking-management-system/mobile/src/screens/Parking/ParkingDetailsScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ActivityIndicator,
  Animated,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import {
  Card,
  Button,
  Rating,
  PriceTag,
  Badge,
  Divider,
  Alert,
} from '../../components';
import { useParking, useBooking, useAuth } from '../../hooks';

const ParkingDetailsScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PARKING.DETAILS>['navigation']>();
  const route = useRoute<MainScreenProps<typeof ROUTES.PARKING.DETAILS>['route']>();
  const { parkingId } = route.params || {};

  const { user } = useAuth();
  const { selectedParking, getParkingDetails, loading } = useParking();
  const { createBooking } = useBooking();

  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [showAllSpots, setShowAllSpots] = useState(false);
  const [error, setError] = useState<string>('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (parkingId) {
      loadParkingDetails();
    }
    animateIn();
  }, [parkingId]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadParkingDetails = async () => {
    try {
      await getParkingDetails(parkingId);
    } catch (error) {
      setError('Failed to load parking details');
    }
  };

  const handleBookNow = () => {
    if (!user) {
      setError('Please login to book a spot');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(ROUTES.BOOKING.CREATE, {
      parkingId: selectedParking?.id,
      spotId: selectedSpot || undefined,
    });
  };

  const handleViewMap = () => {
    if (selectedParking) {
      const url = Platform.select({
        ios: `http://maps.apple.com/?q=${selectedParking.latitude},${selectedParking.longitude}`,
        android: `geo:${selectedParking.latitude},${selectedParking.longitude}?q=${selectedParking.latitude},${selectedParking.longitude}(Parking)`,
      });
      Linking.openURL(url);
    }
  };

  const handleCall = () => {
    if (selectedParking?.phone) {
      Linking.openURL(`tel:${selectedParking.phone}`);
    }
  };

  const handleShare = async () => {
    if (selectedParking) {
      try {
        await Share.share({
          message: `Check out ${selectedParking.name}!\n${selectedParking.address}\n\nAvailable spots: ${selectedParking.availableSpots}\nPrice: $${selectedParking.pricePerHour}/hr`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const renderSpots = () => {
    if (!selectedParking?.spots) return null;

    const spotsToShow = showAllSpots ? selectedParking.spots : selectedParking.spots.slice(0, 8);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Spots</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedParking.availableSpots} of {selectedParking.totalSpots} available
          </Text>
        </View>
        <View style={styles.spotsGrid}>
          {spotsToShow.map((spot: any) => (
            <TouchableOpacity
              key={spot.id}
              style={[
                styles.spotItem,
                spot.status === 'available' && styles.spotAvailable,
                selectedSpot === spot.id && styles.spotSelected,
              ]}
              onPress={() => {
                if (spot.status === 'available') {
                  setSelectedSpot(spot.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              disabled={spot.status !== 'available'}
              activeOpacity={0.7}
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
              {spot.status === 'occupied' && (
                <View style={styles.spotStatus}>
                  <Feather name="x" size={12} color={COLORS.danger} />
                </View>
              )}
              {spot.status === 'reserved' && (
                <View style={styles.spotStatus}>
                  <Feather name="clock" size={12} color={COLORS.warning} />
                </View>
              )}
              {selectedSpot === spot.id && (
                <View style={styles.spotStatus}>
                  <Feather name="check" size={12} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {selectedParking.spots.length > 8 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllSpots(!showAllSpots)}
            activeOpacity={0.7}
          >
            <Text style={styles.showMoreText}>
              {showAllSpots ? 'Show Less' : `Show ${selectedParking.spots.length - 8} More`}
            </Text>
            <Feather
              name={showAllSpots ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            style={styles.alert}
          />
        )}

        {/* Header Image */}
        <View style={styles.imageContainer}>
          {selectedParking.images?.[0] ? (
            <Image source={{ uri: selectedParking.images[0] }} style={styles.image} />
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
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Feather name="share-2" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Parking Info */}
        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{selectedParking.name}</Text>
              <View style={styles.ratingContainer}>
                <Rating rating={selectedParking.rating || 0} size="small" />
                <Text style={styles.ratingText}>
                  {selectedParking.rating?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({selectedParking.reviewCount || 0} reviews)
                </Text>
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

          <Divider />

          {/* Amenities */}
          {selectedParking.amenities && selectedParking.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {selectedParking.amenities.map((amenity: string, index: number) => (
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
          )}

          <Divider />

          {/* Spots */}
          {renderSpots()}

          <Divider />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewMap}>
              <Feather name="map" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            {selectedParking.phone && (
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Feather name="phone" size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Feather name="share-2" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={selectedSpot ? 'Book Selected Spot' : 'Book Now'}
            onPress={handleBookNow}
            variant="primary"
            size="large"
            style={styles.bookButton}
            disabled={selectedParking.availableSpots === 0}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
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
  alert: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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
  shareButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
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
    flexWrap: 'wrap',
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
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
  section: {
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
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
  spotsGrid: {
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
    position: 'relative',
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
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.gray500,
  },
  spotNumberAvailable: {
    color: COLORS.success,
  },
  spotNumberSelected: {
    color: COLORS.primary,
  },
  spotStatus: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  showMoreText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginRight: SPACING.xs,
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