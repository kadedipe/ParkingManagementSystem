// ============================================================================
// ChargingScreen - Main EV Charging List Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Charging/ChargingScreen.tsx

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
  Badge,
  PriceTag,
  Divider,
} from '../../components';
import { useCharging, useLocation, useAuth } from '../../hooks';

const ChargingScreen = ({ navigation }: MainTabScreenProps<typeof ROUTES.APP.CHARGING>) => {
  const { user } = useAuth();
  const {
    stations,
    loading,
    loadStations,
    getNearbyStations,
    searchStations,
    activeSession,
  } = useCharging();
  const { location, getCurrentLocation } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
        await getNearbyStations(loc.latitude, loc.longitude, 10);
      } else {
        await loadStations({ limit: 20 });
      }
    } catch (error) {
      console.error('Error loading charging data:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchStations(searchQuery.trim());
    } else {
      await loadInitialData();
    }
  };

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Apply filter
    let filtered = [...stations];
    switch (filter) {
      case 'available':
        filtered = filtered.filter(s => s.status === 'available');
        break;
      case 'fast':
        filtered = filtered.filter(s => s.powerLevel === 'fast');
        break;
      case 'dc':
        filtered = filtered.filter(s => s.connectorType === 'dc');
        break;
      case 'all':
      default:
        break;
    }
    // Update stations (would need to manage state differently)
  };

  const handleStationSelect = (station: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.CHARGING.DETAILS, { stationId: station.id });
  };

  const handleActiveSessionPress = () => {
    if (activeSession) {
      navigation.navigate(ROUTES.CHARGING.SESSION, { sessionId: activeSession.id });
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

  const getStatusText = (status: string) => {
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
              activeOpacity={0.7}
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

  const renderActiveSession = () => {
    if (!activeSession) return null;

    return (
      <TouchableOpacity
        style={styles.activeSessionCard}
        onPress={handleActiveSessionPress}
        activeOpacity={0.7}
      >
        <View style={styles.activeSessionHeader}>
          <Feather name="zap" size={20} color="#FFFFFF" />
          <Text style={styles.activeSessionTitle}>Charging in Progress</Text>
          <Badge text="Active" variant="success" size="small" />
        </View>
        <View style={styles.activeSessionDetails}>
          <Text style={styles.activeSessionStation}>
            {activeSession.stationName}
          </Text>
          <View style={styles.activeSessionStats}>
            <View style={styles.activeSessionStat}>
              <Feather name="battery" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.activeSessionStatText}>
                {activeSession.batteryPercentage || 0}%
              </Text>
            </View>
            <View style={styles.activeSessionStat}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.activeSessionStatText}>
                {activeSession.timeElapsed || '0:00'}
              </Text>
            </View>
            <View style={styles.activeSessionStat}>
              <Feather name="dollar-sign" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.activeSessionStatText}>
                ${activeSession.cost || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStationItem = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);

    return (
      <Card variant="elevated" style={styles.stationCard}>
        <TouchableOpacity
          onPress={() => handleStationSelect(item)}
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
                {item.availableConnectors || 0} available
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Finding charging stations...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="zap" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Charging Stations Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or filters
      </Text>
      <Button
        title="Clear Filters"
        onPress={() => {
          setSelectedFilter('all');
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
        <Text style={styles.headerTitle}>EV Charging</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate(ROUTES.CHARGING.MAP)}
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
        {/* Active Session */}
        {renderActiveSession()}

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search charging stations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={handleSearch}
            onSubmitEditing={handleSearch}
            size="medium"
          />
        </View>

        {/* Filters */}
        {renderFilterChips()}

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {stations.length} charging {stations.length === 1 ? 'station' : 'stations'} available
          </Text>
        </View>

        {/* Station List */}
        {loading ? (
          renderLoading()
        ) : stations.length === 0 ? (
          renderEmpty()
        ) : (
          stations.map((station) => (
            <View key={station.id}>
              {renderStationItem({ item: station })}
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  activeSessionCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activeSessionTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  activeSessionDetails: {
    marginLeft: SPACING.xl,
  },
  activeSessionStation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  activeSessionStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  activeSessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSessionStatText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray100,
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
  resultsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  stationCard: {
    marginHorizontal: SPACING.lg,
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
    marginBottom: 2,
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

export default ChargingScreen;