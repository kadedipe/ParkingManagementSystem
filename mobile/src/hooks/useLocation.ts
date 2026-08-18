// ============================================================================
// useLocation Hook - Location Hook
// ============================================================================

// parking-management-system/mobile/src/hooks/useLocation.ts

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined'
  >('undetermined');

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        return true;
      } else {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby parking spots',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        setLoading(false);
        return null;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation: UserLocation = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
        altitude: locationData.coords.altitude || undefined,
        timestamp: locationData.timestamp,
      };

      setLocation(userLocation);
      return userLocation;
    } catch (err: any) {
      const message = err.message || 'Failed to get location';
      setError(message);
      Alert.alert('Location Error', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  // Watch location changes
  const watchLocation = useCallback(
    async (callback?: (location: UserLocation) => void) => {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationData) => {
          const userLocation: UserLocation = {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy,
            altitude: locationData.coords.altitude || undefined,
            timestamp: locationData.timestamp,
          };
          setLocation(userLocation);
          if (callback) {
            callback(userLocation);
          }
        }
      );

      return subscription;
    },
    [requestPermission]
  );

  // Get location address
  const getLocationAddress = useCallback(
    async (lat: number, lng: number) => {
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        if (address && address.length > 0) {
          const { name, street, city, region, country } = address[0];
          return { name, street, city, region, country };
        }
        return null;
      } catch (err) {
        console.error('Error getting address:', err);
        return null;
      }
    },
    []
  );

  // Calculate distance between two locations (in kilometers)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      return d;
    },
    []
  );

  // Helper function for distance calculation
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Get distance from current location
  const getDistanceFromCurrent = useCallback(
    (latitude: number, longitude: number) => {
      if (!location) return null;
      return calculateDistance(
        location.latitude,
        location.longitude,
        latitude,
        longitude
      );
    },
    [location, calculateDistance]
  );

  // Check if location is enabled
  const checkLocationEnabled = useCallback(async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to find nearby parking',
          [{ text: 'OK' }]
        );
      }
      return enabled;
    } catch (err) {
      console.error('Error checking location services:', err);
      return false;
    }
  }, []);

  // Initialize location
  useEffect(() => {
    const initLocation = async () => {
      const enabled = await checkLocationEnabled();
      if (enabled) {
        await getCurrentLocation();
      } else {
        setLoading(false);
      }
    };

    initLocation();
  }, []);

  return {
    location,
    error,
    loading,
    permissionStatus,
    getCurrentLocation,
    watchLocation,
    getLocationAddress,
    calculateDistance,
    getDistanceFromCurrent,
    checkLocationEnabled,
    requestPermission,
  };
};

export default useLocation;