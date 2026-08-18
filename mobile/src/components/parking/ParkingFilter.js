// ============================================================================
// ParkingFilter Component - Filter Options for Parking Search
// ============================================================================

// parking-management-system/mobile/src/components/parking/ParkingFilter.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Button, Divider, Slider } from '../common';

const ParkingFilter = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 50],
    distance: 10,
    amenities: [],
    availability: 'all',
    rating: 0,
    ...initialFilters,
  });

  const amenities = [
    { id: 'ev_charging', label: 'EV Charging', icon: 'zap' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'covered', label: 'Covered', icon: 'umbrella' },
    { id: 'handicap', label: 'Handicap Access', icon: 'users' },
    { id: 'valet', label: 'Valet', icon: 'user-check' },
    { id: '24_hours', label: '24/7 Access', icon: 'clock' },
  ];

  const availabilityOptions = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available Now' },
    { id: 'reserved', label: 'Reserved' },
  ];

  const toggleAmenity = (amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 50],
      distance: 10,
      amenities: [],
      availability: 'all',
      rating: 0,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Parking</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>$0</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={50}
                  value={filters.priceRange[1]}
                  onValueChange={(value) => {
                    setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], value],
                    }));
                  }}
                  step={1}
                />
                <Text style={styles.priceLabel}>$50</Text>
              </View>
              <Text style={styles.priceValue}>
                Up to ${filters.priceRange[1]}/hr
              </Text>
            </View>

            <Divider />

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance</Text>
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>Within</Text>
                <TouchableOpacity
                  style={[
                    styles.distanceButton,
                    filters.distance === 5 && styles.distanceButtonActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, distance: 5 }))}
                >
                  <Text
                    style={[
                      styles.distanceButtonText,
                      filters.distance === 5 && styles.distanceButtonTextActive,
                    ]}
                  >
                    5 km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distanceButton,
                    filters.distance === 10 && styles.distanceButtonActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, distance: 10 }))}
                >
                  <Text
                    style={[
                      styles.distanceButtonText,
                      filters.distance === 10 && styles.distanceButtonTextActive,
                    ]}
                  >
                    10 km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distanceButton,
                    filters.distance === 20 && styles.distanceButtonActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, distance: 20 }))}
                >
                  <Text
                    style={[
                      styles.distanceButtonText,
                      filters.distance === 20 && styles.distanceButtonTextActive,
                    ]}
                  >
                    20 km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distanceButton,
                    filters.distance === 50 && styles.distanceButtonActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, distance: 50 }))}
                >
                  <Text
                    style={[
                      styles.distanceButtonText,
                      filters.distance === 50 && styles.distanceButtonTextActive,
                    ]}
                  >
                    50 km
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Divider />

            {/* Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.availabilityContainer}>
                {availabilityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.availabilityButton,
                      filters.availability === option.id &&
                        styles.availabilityButtonActive,
                    ]}
                    onPress={() =>
                      setFilters(prev => ({ ...prev, availability: option.id }))
                    }
                  >
                    <Text
                      style={[
                        styles.availabilityButtonText,
                        filters.availability === option.id &&
                          styles.availabilityButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider />

            {/* Amenities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {amenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity.id}
                    style={[
                      styles.amenityButton,
                      filters.amenities.includes(amenity.id) &&
                        styles.amenityButtonActive,
                    ]}
                    onPress={() => toggleAmenity(amenity.id)}
                  >
                    <Feather
                      name={amenity.icon}
                      size={16}
                      color={
                        filters.amenities.includes(amenity.id)
                          ? COLORS.primary
                          : COLORS.gray500
                      }
                    />
                    <Text
                      style={[
                        styles.amenityButtonText,
                        filters.amenities.includes(amenity.id) &&
                          styles.amenityButtonTextActive,
                      ]}
                    >
                      {amenity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider />

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFilters(prev => ({ ...prev, rating: star }))}
                  >
                    <Feather
                      name={star <= filters.rating ? 'star' : 'star'}
                      size={32}
                      color={star <= filters.rating ? COLORS.warning : COLORS.gray300}
                    />
                  </TouchableOpacity>
                ))}
                {filters.rating > 0 && (
                  <TouchableOpacity
                    onPress={() => setFilters(prev => ({ ...prev, rating: 0 }))}
                  >
                    <Text style={styles.clearRating}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              variant="primary"
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginHorizontal: SPACING.sm,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  distanceButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray100,
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  distanceButtonActive: {
    backgroundColor: COLORS.primary,
  },
  distanceButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },
  distanceButtonTextActive: {
    color: '#FFFFFF',
  },
  availabilityContainer: {
    flexDirection: 'row',
    marginHorizontal: -SPACING.xs,
  },
  availabilityButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  availabilityButtonActive: {
    backgroundColor: COLORS.primary,
  },
  availabilityButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  availabilityButtonTextActive: {
    color: '#FFFFFF',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  amenityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray100,
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  amenityButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  amenityButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginLeft: SPACING.xs,
  },
  amenityButtonTextActive: {
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearRating: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  resetButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  applyButton: {
    flex: 2,
    marginLeft: SPACING.sm,
  },
});

export default ParkingFilter;