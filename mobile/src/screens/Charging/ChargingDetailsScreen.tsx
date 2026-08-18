// ============================================================================
// ChargingDetailsScreen - Charging Station Details Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Charging/ChargingDetailsScreen.tsx

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
import { useCharging, useAuth } from '../../hooks';

const ChargingDetailsScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.CHARGING.DETAILS>['navigation']>();
  const route = useRoute<MainScreenProps<typeof ROUTES.CHARGING.DETAILS>['route']>();
  const { stationId } = route.params || {};

  const { user } = useAuth();
  const { selectedStation, getStationDetails, loading, startCharging } = useCharging();

  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [showReservation, setShowReservation] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (stationId) {
      loadStationDetails();
    }
    animateIn();
  }, [stationId]);

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

  const loadStationDetails = async () => {
    try {
      await getStationDetails(stationId);
    } catch (error) {
      setError('Failed to load station details');
    }
  };

  const handleStartCharging = async () => {
    if (!user) {
      setError('Please login to start charging');
      return;
    }

    if (!selectedConnector) {
      setError('Please select a connector');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await startCharging({
        stationId: selectedStation.id,
        connectorId: selectedConnector,
        vehicleId: user.vehicles?.[0]?.id || '',
      });
      navigation.navigate(ROUTES.CHARGING.SESSION, { sessionId: 'new-session' });
    } catch (error) {
      setError('Failed to start charging');
    }
  };

  const handleReserve = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(ROUTES.CHARGING.RESERVATION, {
      stationId: selectedStation.id,
    });
  };

  const handleViewMap = () => {
    if (selectedStation) {
      const url = Platform.select({
        ios: `http://maps.apple.com/?q=${selectedStation.latitude},${selectedStation.longitude}`,
        android: `geo:${selectedStation.latitude},${selectedStation.longitude}?q=${selectedStation.latitude},${selectedStation.longitude}(Charging Station)`,
      });
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    if (selectedStation) {
      try {
        await Share.share({
          message: `🔌 EV Charging Station: ${selectedStation.name}\n📍 ${selectedStation.address}\n⚡ ${selectedStation.powerLevel || 'Standard'} Charging\n💰 $${selectedStation.pricePerKwh}/kWh`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'occupied':
        return COLORS.danger;
      case 'reserved':
        return COLORS.warning;
      case 'maintenance':
        return COLORS.gray600;
      default:
        return COLORS.gray600;
    }
  };

  const renderConnectors = () => {
    if (!selectedStation?.connectors) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connectors</Text>
        <View style={styles.connectorsContainer}>
          {selectedStation.connectors.map((connector: any) => {
            const isAvailable = connector.status === 'available';
            const isSelected = selectedConnector === connector.id;

            return (
              <TouchableOpacity
                key={connector.id}
                style={[
                  styles.connectorItem,
                  isAvailable && styles.connectorAvailable,
                  isSelected && styles.connectorSelected,
                ]}
                onPress={() => {
                  if (isAvailable) {
                    setSelectedConnector(connector.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <View style={styles.connectorHeader}>
                  <Text style={styles.connectorType}>
                    {connector.type?.toUpperCase() || 'Type 2'}
                  </Text>
                  <Badge
                    text={connector.status}
                    variant={isAvailable ? 'success' : 'secondary'}
                    size="small"
                  />
                </View>
                <View style={styles.connectorDetails}>
                  <View style={styles.connectorDetail}>
                    <Feather name="zap" size={14} color={COLORS.gray500} />
                    <Text style={styles.connectorDetailText}>
                      {connector.power || 22} kW
                    </Text>
                  </View>
                  <View style={styles.connectorDetail}>
                    <Feather name="clock" size={14} color={COLORS.gray500} />
                    <Text style={styles.connectorDetailText}>
                      {connector.estimatedTime || '30min'}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.connectorSelectedBadge}>
                    <Feather name="check" size={16} color={COLORS.primary} />
                    <Text style={styles.connectorSelectedText}>Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading station details...</Text>
      </View>
    );
  }

  if (!selectedStation) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={COLORS.danger} />
        <Text style={styles.errorText}>Charging station not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="primary"
          style={styles.errorButton}
        />
      </View>
    );
  }

  const statusColor = getStatusColor(selectedStation.status);

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
          {selectedStation.images?.[0] ? (
            <Image source={{ uri: selectedStation.images[0] }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="zap" size={48} color={COLORS.gray300} />
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Badge
              text={selectedStation.status}
              variant={selectedStation.status === 'available' ? 'success' : 'secondary'}
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

        {/* Station Info */}
        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{selectedStation.name}</Text>
              <View style={styles.ratingContainer}>
                <Rating rating={selectedStation.rating || 0} size="small" />
                <Text style={styles.ratingText}>
                  {selectedStation.rating?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({selectedStation.reviewCount || 0} reviews)
                </Text>
              </View>
            </View>
            <PriceTag
              amount={selectedStation.pricePerKwh || 0.35}
              currency="$"
              period="/kWh"
              variant="filled"
              color={COLORS.primary}
            />
          </View>

          <View style={styles.addressContainer}>
            <Feather name="map-pin" size={16} color={COLORS.gray500} />
            <Text style={styles.address}>{selectedStation.address}</Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Feather name="zap" size={20} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>Power</Text>
              <Text style={styles.quickInfoValue}>
                {selectedStation.powerLevel === 'fast' ? 'Fast' : 'Standard'}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Feather name="plug" size={20} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>Connectors</Text>
              <Text style={styles.quickInfoValue}>
                {selectedStation.availableConnectors || 0}
              </Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.quickInfoLabel}>Status</Text>
              <Text style={[styles.quickInfoValue, { color: statusColor }]}>
                {selectedStation.status}
              </Text>
            </View>
          </View>

          <Divider />

          {/* Connectors */}
          {renderConnectors()}

          <Divider />

          {/* Amenities */}
          {selectedStation.amenities && selectedStation.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {selectedStation.amenities.map((amenity: string, index: number) => (
                  <View key={index} style={styles.amenityItem}>
                    <Feather
                      name={
                        amenity === 'restroom'
                          ? 'users'
                          : amenity === 'wifi'
                          ? 'wifi'
                          : amenity === 'cafe'
                          ? 'coffee'
                          : 'check-circle'
                      }
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.amenityText}>
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Divider />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewMap}>
              <Feather name="map" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Feather name="share-2" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={selectedConnector ? 'Start Charging' : 'Select a Connector'}
              onPress={handleStartCharging}
              variant="primary"
              size="large"
              style={styles.startButton}
              disabled={!selectedConnector || selectedStation.status !== 'available'}
            />
            <Button
              title="Reserve"
              onPress={handleReserve}
              variant="outline"
              size="large"
              style={styles.reserveButton}
              disabled={selectedStation.status !== 'available'}
            />
          </View>
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
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
  connectorsContainer: {
    gap: SPACING.sm,
  },
  connectorItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: '#FFFFFF',
  },
  connectorAvailable: {
    borderColor: COLORS.success,
  },
  connectorSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  connectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  connectorType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  connectorDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  connectorDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectorDetailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  connectorSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  connectorSelectedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginLeft: SPACING.xs,
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
  buttonContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  startButton: {
    width: '100%',
  },
  reserveButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ChargingDetailsScreen;