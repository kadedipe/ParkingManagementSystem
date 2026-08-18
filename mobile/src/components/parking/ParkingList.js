// ============================================================================
// ParkingList Component - List of Parking Lots
// ============================================================================

// parking-management-system/mobile/src/components/parking/ParkingList.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { ParkingCard, SearchInput, Badge } from '../common';
import parkingService from '../../api/services/parking.service';

const ParkingList = ({
  onParkingSelect,
  initialFilters = {},
  showSearch = true,
  showFilters = true,
}) => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'distance',
    priceRange: 'all',
    availability: 'all',
    ...initialFilters,
  });
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadParkingLots();
  }, [filters, searchQuery]);

  const loadParkingLots = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        sortBy: filters.sortBy,
        ...filters,
      };
      const response = await parkingService.getParkingLots(params);
      setParkingLots(response.lots || []);
    } catch (error) {
      console.error('Error loading parking lots:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadParkingLots();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
    // Apply filter logic
    let filteredLots = [...parkingLots];
    switch (filter) {
      case 'available':
        filteredLots = filteredLots.filter(lot => lot.availableSpots > 0);
        break;
      case 'ev_charging':
        filteredLots = filteredLots.filter(lot => lot.amenities?.includes('ev_charging'));
        break;
      case 'premium':
        filteredLots = filteredLots.filter(lot => lot.type === 'premium');
        break;
      case 'all':
      default:
        break;
    }
    setParkingLots(filteredLots);
  };

  const renderFilterChips = () => {
    const filters = [
      { id: 'all', label: 'All' },
      { id: 'available', label: 'Available' },
      { id: 'ev_charging', label: 'EV Charging' },
      { id: 'premium', label: 'Premium' },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <ParkingCard
      {...item}
      onPress={() => onParkingSelect?.(item)}
      onBookPress={() => onParkingSelect?.(item)}
      style={styles.parkingCard}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={48} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Parking Lots Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding parking lots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search parking lots..."
            value={searchQuery}
            onChangeText={handleSearch}
            onSearch={handleSearch}
            size="medium"
          />
        </View>
      )}

      {showFilters && renderFilterChips()}

      <FlatList
        data={parkingLots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.gray200,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  parkingCard: {
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
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
    marginTop: SPACING.xs,
  },
});

export default ParkingList;