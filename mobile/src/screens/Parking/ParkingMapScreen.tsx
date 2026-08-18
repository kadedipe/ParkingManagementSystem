// ============================================================================
// ParkingMapScreen - Map View with Parking Locations
// ============================================================================

// parking-management-system/mobile/src/screens/Parking/ParkingMapScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card, Button } from '../../components';
import { useParking, useLocation } from '../../hooks';

const { width, height } = Dimensions.get('window');

const ParkingMapScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PARKING.MAP>['navigation']>();
  const { parkingLots, loadParkingLots, loading } = useParking();
  const { location, getCurrentLocation } = useLocation();

  const mapRef = useRef<MapView>(null);
  const [selectedParking, setSelectedParking] = useState<any>(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setRegion({
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        await loadParkingLots({
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: 10,
        });
      } else {
        await loadParkingLots({ limit: 50 });
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  const handleMarkerPress = (parking: any) => {
    setSelectedParking(parking);
  };

  const handleParkingSelect = (parking: any) => {
    navigation.navigate(ROUTES.PARKING.DETAILS, { parkingId: parking.id });
  };

  const handleViewList = () => {
    navigation.goBack();
  };

  const centerMap = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  const getMarkerColor = (parking: any) => {
    if (parking.availableSpots === 0) return COLORS.danger;
    if (parking.availableSpots < parking.totalSpots * 0.3) return COLORS.warning;
    return COLORS.success;
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {parkingLots.map((parking) => (
          <Marker
            key={parking.id}
            coordinate={{
              latitude: parking.latitude,
              longitude: parking.longitude,
            }}
            onPress={() => handleMarkerPress(parking)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(parking) }]}>
              <Feather name="home" size={16} color="#FFFFFF" />
              <Text style={styles.markerText}>{parking.availableSpots}</Text>
            </View>
            <Callout
              style={styles.callout}
              onPress={() => handleParkingSelect(parking)}
            >
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{parking.name}</Text>
                <Text style={styles.calloutAddress}>{parking.address}</Text>
                <View style={styles.calloutDetails}>
                  <Text style={styles.calloutPrice}>
                    ${parking.pricePerHour}/hr
                  </Text>
                  <Text style={styles.calloutSpots}>
                    {parking.availableSpots} spots
                  </Text>
                </View>
                <Button
                  title="View Details"
                  onPress={() => handleParkingSelect(parking)}
                  variant="primary"
                  size="small"
                  style={styles.calloutButton}
                />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Controls */}
      <TouchableOpacity style={styles.backButton} onPress={handleViewList}>
        <Feather name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
        <Feather name="crosshair" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.listButton} onPress={handleViewList}>
        <Feather name="list" size={20} color={COLORS.text} />
        <Text style={styles.listButtonText}>List</Text>
      </TouchableOpacity>

      {/* Selected Parking Bottom Sheet */}
      {selectedParking && (
        <Card style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeSheet}
            onPress={() => setSelectedParking(null)}
          >
            <Feather name="x" size={20} color={COLORS.gray500} />
          </TouchableOpacity>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{selectedParking.name}</Text>
            <Text style={styles.sheetAddress}>{selectedParking.address}</Text>
            <View style={styles.sheetDetails}>
              <View style={styles.sheetDetail}>
                <Feather name="home" size={16} color={COLORS.primary} />
                <Text style={styles.sheetDetailText}>
                  {selectedParking.availableSpots} spots left
                </Text>
              </View>
              <View style={styles.sheetDetail}>
                <Feather name="dollar-sign" size={16} color={COLORS.primary} />
                <Text style={styles.sheetDetailText}>
                  ${selectedParking.pricePerHour}/hr
                </Text>
              </View>
            </View>
            <Button
              title="View Details"
              onPress={() => handleParkingSelect(selectedParking)}
              variant="primary"
              size="medium"
              style={styles.sheetButton}
            />
          </View>
        </Card>
      )}

      {loading && renderLoading()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerButton: {
    position: 'absolute',
    bottom: 120,
    right: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listButton: {
    position: 'absolute',
    bottom: 60,
    left: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  markerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginLeft: SPACING.xs,
  },
  callout: {
    width: 220,
    padding: 0,
  },
  calloutContent: {
    padding: SPACING.sm,
  },
  calloutTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  calloutAddress: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: 2,
  },
  calloutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  calloutPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  calloutSpots: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
  },
  calloutButton: {
    marginTop: SPACING.xs,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  closeSheet: {
    alignSelf: 'flex-end',
    padding: SPACING.xs,
  },
  sheetContent: {
    marginTop: -SPACING.md,
  },
  sheetTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  sheetAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  sheetDetails: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
  },
  sheetDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  sheetDetailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  sheetButton: {
    marginTop: SPACING.sm,
  },
});

export default ParkingMapScreen;