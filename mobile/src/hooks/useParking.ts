// ============================================================================
// useParking Hook - Parking Management Hook
// ============================================================================

// parking-management-system/mobile/src/hooks/useParking.ts

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import parkingService from '../api/services/parking.service';
import { useAuth } from './useAuth';

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots: number;
  pricePerHour: number;
  rating: number;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
}

export const useParking = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load parking lots
  const loadParkingLots = useCallback(
    async (params?: {
      search?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      amenities?: string[];
      minRating?: number;
      maxPrice?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await parkingService.getParkingLots(params);
        setParkingLots(response.lots || []);
        return response.lots;
      } catch (err: any) {
        const message = err.message || 'Failed to load parking lots';
        setError(message);
        Alert.alert('Error', message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get nearby parking lots
  const getNearbyParking = useCallback(
    async (latitude: number, longitude: number, radius: number = 5) => {
      setLoading(true);
      setError(null);
      try {
        const response = await parkingService.getNearbyParkingLots({
          latitude,
          longitude,
          radius,
        });
        setParkingLots(response.lots || []);
        return response.lots;
      } catch (err: any) {
        const message = err.message || 'Failed to load nearby parking';
        setError(message);
        Alert.alert('Error', message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get parking lot details
  const getParkingDetails = useCallback(
    async (parkingId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await parkingService.getParkingLotById(parkingId);
        setSelectedParking(response);
        return response;
      } catch (err: any) {
        const message = err.message || 'Failed to load parking details';
        setError(message);
        Alert.alert('Error', message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Search parking lots
  const searchParking = useCallback(
    async (query: string, filters?: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await parkingService.searchParkingLots({
          query,
          ...filters,
        });
        setParkingLots(response.lots || []);
        return response.lots;
      } catch (err: any) {
        const message = err.message || 'Search failed';
        setError(message);
        Alert.alert('Error', message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get parking availability
  const getAvailability = useCallback(
    async (parkingId: string, date?: Date, time?: string) => {
      try {
        const response = await parkingService.getParkingCapacity(parkingId);
        return response;
      } catch (err: any) {
        console.error('Error getting availability:', err);
        return null;
      }
    },
    []
  );

  // Get parking statistics
  const getStatistics = useCallback(
    async (parkingId: string, dateRange?: { start: Date; end: Date }) => {
      try {
        const response = await parkingService.getParkingLotStatistics(
          parkingId,
          dateRange
        );
        return response;
      } catch (err: any) {
        console.error('Error getting statistics:', err);
        return null;
      }
    },
    []
  );

  // Get parking reviews
  const getReviews = useCallback(
    async (parkingId: string, page?: number, limit?: number) => {
      try {
        const response = await parkingService.getParkingLotReviews(parkingId, {
          page,
          limit,
        });
        return response;
      } catch (err: any) {
        console.error('Error getting reviews:', err);
        return null;
      }
    },
    []
  );

  // Add parking review
  const addReview = useCallback(
    async (parkingId: string, rating: number, comment: string) => {
      if (!user) {
        Alert.alert('Error', 'Please login to leave a review');
        return false;
      }

      setLoading(true);
      try {
        await parkingService.addParkingLotReview(parkingId, { rating, comment });
        Alert.alert('Success', 'Review added successfully');
        return true;
      } catch (err: any) {
        const message = err.message || 'Failed to add review';
        Alert.alert('Error', message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Filter parking lots by amenities
  const filterByAmenities = useCallback(
    (amenities: string[]) => {
      if (amenities.length === 0) {
        return parkingLots;
      }
      return parkingLots.filter((lot) =>
        amenities.every((amenity) => lot.amenities?.includes(amenity))
      );
    },
    [parkingLots]
  );

  // Sort parking lots by various criteria
  const sortParkingLots = useCallback(
    (sortBy: 'distance' | 'price' | 'rating' | 'availability') => {
      const sorted = [...parkingLots];
      switch (sortBy) {
        case 'distance':
          // Assumes distance is calculated elsewhere
          break;
        case 'price':
          sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
          break;
        case 'rating':
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'availability':
          sorted.sort((a, b) => b.availableSpots - a.availableSpots);
          break;
      }
      setParkingLots(sorted);
      return sorted;
    },
    [parkingLots]
  );

  // Get parking lot status
  const getParkingStatus = useCallback(
    (parkingId: string) => {
      const lot = parkingLots.find((p) => p.id === parkingId);
      if (!lot) return 'unknown';
      if (lot.availableSpots === 0) return 'full';
      if (lot.availableSpots < lot.totalSpots * 0.3) return 'limited';
      if (lot.availableSpots < lot.totalSpots * 0.6) return 'moderate';
      return 'available';
    },
    [parkingLots]
  );

  // Get parking lot occupancy percentage
  const getOccupancyPercentage = useCallback(
    (parkingId: string) => {
      const lot = parkingLots.find((p) => p.id === parkingId);
      if (!lot) return 0;
      return ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;
    },
    [parkingLots]
  );

  // Calculate parking price
  const calculatePrice = useCallback(
    (parkingId: string, hours: number) => {
      const lot = parkingLots.find((p) => p.id === parkingId);
      if (!lot) return 0;
      return lot.pricePerHour * hours;
    },
    [parkingLots]
  );

  return {
    parkingLots,
    selectedParking,
    loading,
    error,
    loadParkingLots,
    getNearbyParking,
    getParkingDetails,
    searchParking,
    getAvailability,
    getStatistics,
    getReviews,
    addReview,
    filterByAmenities,
    sortParkingLots,
    getParkingStatus,
    getOccupancyPercentage,
    calculatePrice,
    setParkingLots,
    setSelectedParking,
  };
};

export default useParking;