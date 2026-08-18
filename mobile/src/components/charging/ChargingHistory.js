// ============================================================================
// ChargingHistory Component - History of Charging Sessions
// ============================================================================

// parking-management-system/mobile/src/components/charging/ChargingHistory.js

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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card, Badge, PriceTag } from '../common';
import chargingService from '../../api/services/charging.service';

const ChargingHistory = ({
  onSessionPress,
  limit = 10,
  showViewAll = true,
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await chargingService.getChargingHistory({
        limit,
        sort: '-createdAt',
      });
      setSessions(response.sessions || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Error loading charging history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.danger;
      case 'paused':
        return COLORS.warning;
      default:
        return COLORS.gray600;
    }
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onSessionPress?.(item)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" style={styles.historyItem}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.stationName}>{item.stationName}</Text>
            <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <Badge
            text={item.status}
            variant={item.status === 'completed' ? 'success' : 'secondary'}
            size="small"
          />
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.itemDetail}>
            <Feather name="clock" size={14} color={COLORS.gray500} />
            <Text style={styles.itemDetailText}>
              {item.duration || '--:--'}
            </Text>
          </View>
          <View style={styles.itemDetail}>
            <Feather name="zap" size={14} color={COLORS.gray500} />
            <Text style={styles.itemDetailText}>
              {item.energyUsed || 0} kWh
            </Text>
          </View>
          <View style={styles.itemDetail}>
            <Feather name="battery" size={14} color={COLORS.gray500} />
            <Text style={styles.itemDetailText}>
              {item.finalBattery || 0}%
            </Text>
          </View>
        </View>
        
        <View style={styles.itemFooter}>
          <PriceTag
            amount={item.cost || 0}
            currency="$"
            variant="default"
            color={COLORS.primary}
            size="small"
          />
          <Text style={styles.itemConnector}>
            {item.connectorType?.toUpperCase() || 'Type 2'}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="zap" size={48} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Charging History</Text>
      <Text style={styles.emptyText}>
        Your charging sessions will appear here
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Charging History</Text>
        {showViewAll && totalCount > limit && (
          <TouchableOpacity onPress={() => onSessionPress?.('viewAll')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sessions}
        renderItem={renderHistoryItem}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  viewAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  historyItem: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  stationName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  itemDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    marginTop: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    marginVertical: SPACING.sm,
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  itemDetailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  itemConnector: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ChargingHistory;