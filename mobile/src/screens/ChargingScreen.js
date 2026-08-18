// ============================================================================
// Charging Screen - Main Charging View
// ============================================================================

// parking-management-system/mobile/src/screens/ChargingScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Container, Button } from '../components/common';
import {
  ChargingStationList,
  ChargingSession,
  ChargingHistory,
  ChargingStatus,
} from '../components/charging';
import chargingService from '../api/services/charging.service';

const ChargingScreen = ({ navigation }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [activeTab, setActiveTab] = useState('stations'); // 'stations', 'active', 'history'
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const response = await chargingService.getActiveSessions();
      if (response && response.length > 0) {
        setActiveSession(response[0]);
        setHasActiveSession(true);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleStationSelect = (station) => {
    navigation.navigate('ChargingDetails', { stationId: station.id });
  };

  const handleEndSession = () => {
    setActiveSession(null);
    setHasActiveSession(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'active':
        if (hasActiveSession && activeSession) {
          return (
            <ChargingSession
              sessionId={activeSession.id}
              onEndSession={handleEndSession}
            />
          );
        }
        return (
          <View style={styles.emptyState}>
            <Feather name="zap-off" size={64} color={COLORS.gray300} />
            <Text style={styles.emptyStateTitle}>No Active Session</Text>
            <Text style={styles.emptyStateText}>
              Start charging at a station to begin
            </Text>
            <Button
              title="Find Stations"
              onPress={() => setActiveTab('stations')}
              variant="primary"
              style={styles.emptyStateButton}
            />
          </View>
        );
      
      case 'history':
        return (
          <ChargingHistory
            onSessionPress={(session) => {
              if (session === 'viewAll') {
                navigation.navigate('ChargingHistory');
              } else {
                navigation.navigate('ChargingDetails', { sessionId: session.id });
              }
            }}
          />
        );
      
      case 'stations':
      default:
        return (
          <ChargingStationList
            onStationSelect={handleStationSelect}
          />
        );
    }
  };

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EV Charging</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ChargingMap')}
        >
          <Feather name="map" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Active Session Status (if exists) */}
      {hasActiveSession && activeSession && (
        <ChargingStatus
          status={activeSession.status}
          batteryPercentage={activeSession.batteryPercentage || 0}
          stationName={activeSession.stationName}
          estimatedTime={activeSession.estimatedCompletion}
          onPress={() => setActiveTab('active')}
          style={styles.statusCard}
        />
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'stations', label: 'Stations', icon: 'list' },
          { id: 'active', label: 'Active', icon: 'zap' },
          { id: 'history', label: 'History', icon: 'clock' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? COLORS.primary : COLORS.gray500}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
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
  headerButton: {
    padding: SPACING.xs,
  },
  statusCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    marginLeft: SPACING.xs,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: SPACING.lg,
    minWidth: 160,
  },
});

export default ChargingScreen;