// ============================================================================
// ChargingStationList Component - List of EV Charging Stations
// ============================================================================

// parking-management-system/mobile/src/components/charging/ChargingStationList.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { SearchInput, Badge, Card, PriceTag } from '../common';
import chargingService from '../../api/services/charging.service';

const ChargingStationList = ({
  onStationSelect,
  initialFilters = {},
  showSearch = true,
}) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    connectorType: 'all',
    powerLevel: 'all',
    status: 'all',
    ...initialFilters,
  });
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadStations();
  }, [filters, searchQuery]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        ...filters,
      };
      const response = await chargingService.getChargingStations(params);
      setStations(response.stations || []);
    } catch (error) {
      console.error('Error loading charging stations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStations();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
    let filteredStations = [...stations];
    switch (filter) {
      case 'available':
        filteredStations = filteredStations.filter(s => s.status === 'available');
        break;
      case 'fast':
        filteredStations = filteredStations.filter(s => s.powerLevel === 'fast');
        break;
      case 'dc':
        filteredStations = filteredStations.filter(s => s.connectorType === 'dc');
        break;
      case 'all':
      default:
        break;
    }
    setStations(filteredStations);
  };

  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'In Use';
      case 'reserved':
        return 'Reserved';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const renderFilterChips = () => {
    const filters = [
      { id: 'all', label: 'All' },
      { id: 'available', label: 'Available' },
      { id: 'fast', label: 'Fast Charging' },
      { id: 'dc', label: 'DC Connector' },
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

  const renderStationItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);

    return (
      <Card variant="elevated" style={styles.stationCard}>
        <TouchableOpacity
          onPress={() => onStationSelect?.(item)}
          activeOpacity={0.7}
        >
          <View style={styles.stationHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{item.name}</Text>
              <View style={styles.stationAddress}>
                <Feather name="map-pin" size={14} color={COLORS.gray500} />
                <Text style={styles.addressText}>{item.address}</Text>
              </View>
            </View>
            <Badge
              text={statusText}
              variant={item.status === 'available' ? 'success' : 'secondary'}
              size="small"
            />
          </View>

          <View style={styles.stationDetails}>
            <View style={styles.detailItem}>
              <Feather name="zap" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Power</Text>
              <Text style={styles.detailValue}>
                {item.powerLevel === 'fast' ? 'Fast' : 'Standard'}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Feather name="plug" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Connector</Text>
              <Text style={styles.detailValue}>
                {item.connectorType?.toUpperCase() || 'Type 2'}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Feather name="clock" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Est. Time</Text>
              <Text style={styles.detailValue}>
                {item.estimatedTime || '45min'}
              </Text>
            </View>
          </View>

          <View style={styles.stationFooter}>
            <PriceTag
              amount={item.pricePerKwh || 0.35}
              currency="$"
              period="/kWh"
              variant="filled"
              color={COLORS.primary}
              size="small"
            />
            <View style={styles.connectorStatus}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.availableConnectors || 0} connectors available
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="zap" size={48} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Charging Stations Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding charging stations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search charging stations..."
            value={searchQuery}
            onChangeText={handleSearch}
            onSearch={handleSearch}
            size="medium"
          />
        </View>
      )}

      {renderFilterChips()}

      <FlatList
        data={stations}
        renderItem={renderStationItem}
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
  stationCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stationInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  stationName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  stationAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  stationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.sm,
    marginVertical: SPACING.sm,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  detailDivider: {
    width: 1,
    backgroundColor: COLORS.gray300,
  },
  stationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  connectorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
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

export default ChargingStationList;