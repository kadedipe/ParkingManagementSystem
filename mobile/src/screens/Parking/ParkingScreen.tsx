// ============================================================================
// ParkingScreen - Main Parking List Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Parking/ParkingScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainTabScreenProps } from '../../navigation/types/mainTabs';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import {
  Card,
  Button,
  SearchInput,
  ParkingCard,
  ParkingFilter,
  Divider,
} from '../../components';
import { useParking, useLocation, useAuth } from '../../hooks';

const ParkingScreen = ({ navigation }: MainTabScreenProps<typeof ROUTES.APP.PARKING>) => {
  const { user } = useAuth();
  const { 
    parkingLots, 
    loadParkingLots, 
    loading,
    getNearbyParking,
    searchParking,
    filterByAmenities,
    sortParkingLots,
  } = useParking();
  const { location, getCurrentLocation } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating' | 'availability'>('distance');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    loadInitialData();
    animateIn();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

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

  const loadInitialData = async () => {
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        await getNearbyParking(loc.latitude, loc.longitude, 10);
      } else {
        await loadParkingLots({ limit: 20 });
      }
    } catch (error) {
      console.error('Error loading parking data:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchParking(searchQuery.trim());
    } else {
      await loadInitialData();
    }
  };

  const handleFilterApply = (filters: any) => {
    setSelectedFilters(filters);
    setShowFilters(false);
    
    // Apply filters
    let filtered = parkingLots;
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filterByAmenities(filters.amenities);
    }
    
    // Sort results
    sortParkingLots(sortBy);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSortChange = (sortType: 'distance' | 'price' | 'rating' | 'availability') => {
    setSortBy(sortType);
    sortParkingLots(sortType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleParkingSelect = (parking: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.PARKING.DETAILS, { parkingId: parking.id });
  };

  const handleViewMap = () => {
    navigation.navigate(ROUTES.PARKING.MAP);
  };

  const renderSortOptions = () => {
    const options = [
      { id: 'distance', label: 'Distance' },
      { id: 'price', label: 'Price' },
      { id: 'rating', label: 'Rating' },
      { id: 'availability', label: 'Availability' },
    ];

    return (
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.sortOptionActive,
              ]}
              onPress={() => handleSortChange(option.id as any)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.id && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading parking spots...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="map-pin" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Parking Spots Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or filters
      </Text>
      <Button
        title="Clear Filters"
        onPress={() => {
          setSelectedFilters({});
          loadInitialData();
        }}
        variant="outline"
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parking</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(true)}
            activeOpacity={0.7}
          >
            <Feather name="sliders" size={22} color={COLORS.text} />
            {Object.keys(selectedFilters).length > 0 && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleViewMap}
            activeOpacity={0.7}
          >
            <Feather name="map" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search parking lots..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={handleSearch}
            onSubmitEditing={handleSearch}
            size="medium"
          />
        </View>

        {/* Sort Options */}
        {renderSortOptions()}

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {parkingLots.length} parking {parkingLots.length === 1 ? 'spot' : 'spots'} available
          </Text>
        </View>

        {/* Parking List */}
        {loading ? (
          renderLoading()
        ) : parkingLots.length === 0 ? (
          renderEmpty()
        ) : (
          parkingLots.map((parking) => (
            <ParkingCard
              key={parking.id}
              {...parking}
              onPress={() => handleParkingSelect(parking)}
              onBookPress={() => handleParkingSelect(parking)}
              style={styles.parkingCard}
            />
          ))
        )}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Filter Modal */}
      <ParkingFilter
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        initialFilters={selectedFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.md,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sortContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sortOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray100,
    marginRight: SPACING.sm,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  parkingCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    minWidth: 160,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ParkingScreen;