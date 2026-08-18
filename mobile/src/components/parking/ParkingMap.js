// ============================================================================
// ParkingMap Component - Map View with Parking Markers
// ============================================================================

// parking-management-system/mobile/src/components/parking/ParkingMap.js

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const ParkingMap = ({
  parkingLots,
  onMarkerPress,
  onRegionChange,
  initialRegion,
  showUserLocation = true,
}) => {
  const mapRef = useRef(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [region, setRegion] = useState(initialRegion || {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleMarkerPress = (lot) => {
    setSelectedLot(lot);
    onMarkerPress?.(lot);
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    onRegionChange?.(newRegion);
  };

  const getMarkerColor = (lot) => {
    if (lot.availableSpots === 0) return COLORS.danger;
    if (lot.availableSpots < lot.totalSpots * 0.3) return COLORS.warning;
    return COLORS.success;
  };

  const centerMap = () => {
    if (parkingLots && parkingLots.length > 0) {
      const latitudes = parkingLots.map(lot => lot.latitude);
      const longitudes = parkingLots.map(lot => lot.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const center = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: (maxLat - minLat) * 1.2,
        longitudeDelta: (maxLng - minLng) * 1.2,
      };
      
      mapRef.current?.animateToRegion(center, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {parkingLots?.map((lot) => (
          <Marker
            key={lot.id || lot._id}
            coordinate={{
              latitude: lot.latitude,
              longitude: lot.longitude,
            }}
            onPress={() => handleMarkerPress(lot)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(lot) }]}>
              <Feather name="home" size={16} color="#FFFFFF" />
              <Text style={styles.markerText}>{lot.availableSpots || 0}</Text>
            </View>
            <Callout
              style={styles.callout}
              onPress={() => handleMarkerPress(lot)}
            >
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{lot.name}</Text>
                <Text style={styles.calloutAddress}>{lot.address}</Text>
                <View style={styles.calloutDetails}>
                  <Text style={styles.calloutPrice}>
                    ${lot.pricePerHour || 0}/hr
                  </Text>
                  <Text style={styles.calloutSpots}>
                    {lot.availableSpots || 0} spots available
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.centerButton} onPress={centerMap}>
        <Feather name="crosshair" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      {selectedLot && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeSheet}
            onPress={() => setSelectedLot(null)}
          >
            <Feather name="x" size={20} color={COLORS.gray500} />
          </TouchableOpacity>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{selectedLot.name}</Text>
            <Text style={styles.sheetAddress}>{selectedLot.address}</Text>
            <View style={styles.sheetDetails}>
              <View style={styles.sheetDetail}>
                <Feather name="home" size={16} color={COLORS.primary} />
                <Text style={styles.sheetDetailText}>
                  {selectedLot.availableSpots} spots left
                </Text>
              </View>
              <View style={styles.sheetDetail}>
                <Feather name="dollar-sign" size={16} color={COLORS.primary} />
                <Text style={styles.sheetDetailText}>
                  ${selectedLot.pricePerHour}/hr
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.sheetButton}
              onPress={() => onMarkerPress(selectedLot)}
            >
              <Text style={styles.sheetButtonText}>View Details</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
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
    marginTop: SPACING.xs,
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
  centerButton: {
    position: 'absolute',
    bottom: 120,
    right: SPACING.lg,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  sheetButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginRight: SPACING.xs,
  },
});

export default ParkingMap;