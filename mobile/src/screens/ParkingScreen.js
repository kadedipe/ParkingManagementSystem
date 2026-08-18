// ============================================================================
// Parking Screen - Main Parking View
// ============================================================================

// parking-management-system/mobile/src/screens/ParkingScreen.js

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Container } from '../components/common';
import {
  ParkingList,
  ParkingDetails,
  ParkingFilter,
  ParkingMap,
} from '../components/parking';
import { COLORS, SPACING } from '../constants/theme';

const ParkingScreen = ({ navigation }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'map'
  const [selectedParking, setSelectedParking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  const handleParkingSelect = (parking) => {
    setSelectedParking(parking);
    navigation.navigate('ParkingDetails', { parkingId: parking.id });
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const renderContent = () => {
    if (viewMode === 'map') {
      return (
        <ParkingMap
          parkingLots={[]}
          onMarkerPress={handleParkingSelect}
          style={styles.map}
        />
      );
    }

    return (
      <ParkingList
        onParkingSelect={handleParkingSelect}
        initialFilters={filters}
      />
    );
  };

  return (
    <Container>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Parking</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(true)}
          >
            <Feather name="sliders" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          >
            <Feather
              name={viewMode === 'list' ? 'map' : 'list'}
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderContent()}

      <ParkingFilter
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.md,
  },
  map: {
    flex: 1,
  },
});

export default ParkingScreen;