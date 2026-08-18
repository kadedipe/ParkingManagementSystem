// ============================================================================
// ProfileVehicles Component - Manage User Vehicles
// ============================================================================

// parking-management-system/mobile/src/components/profile/ProfileVehicles.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Card, Button, Input, Alert } from '../common';
import userService from '../../api/services/user.service';

const ProfileVehicles = ({
  onVehicleSelect,
  onBack,
}) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    plateNumber: '',
    type: 'car',
    color: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserVehicles();
      setVehicles(response || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const handleAddVehicle = async () => {
    if (!formData.name || !formData.plateNumber) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      if (editingVehicle) {
        await userService.updateVehicle(editingVehicle.id, formData);
      } else {
        await userService.addVehicle(formData);
      }
      await loadVehicles();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      setFormError(error.message || 'Failed to save vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await userService.deleteVehicle(vehicleId);
      await loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleSetDefault = async (vehicleId) => {
    try {
      await userService.setDefaultVehicle(vehicleId);
      await loadVehicles();
    } catch (error) {
      console.error('Error setting default vehicle:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      plateNumber: '',
      type: 'car',
      color: '',
    });
    setFormError('');
    setEditingVehicle(null);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type || 'car',
      color: vehicle.color || '',
    });
    setShowAddModal(true);
  };

  const renderVehicleItem = ({ item }) => (
    <Card variant="elevated" style={styles.vehicleCard}>
      <TouchableOpacity
        onPress={() => onVehicleSelect?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.vehicleEmoji}>
              {item.type === 'suv' ? '🚙' : 
               item.type === 'truck' ? '🚛' : 
               item.type === 'motorcycle' ? '🏍️' : 
               item.type === 'bicycle' ? '🚲' : '🚗'}
            </Text>
          </View>
          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleHeader}>
              <Text style={styles.vehicleName}>{item.name}</Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.vehiclePlate}>{item.plateNumber}</Text>
            {item.color && (
              <Text style={styles.vehicleColor}>
                {item.color}
              </Text>
            )}
          </View>
          <View style={styles.vehicleActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Feather name="edit-2" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteVehicle(item.id)}
            >
              <Feather name="trash-2" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Vehicles</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Feather name="plus" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="truck" size={64} color={COLORS.gray300} />
          <Text style={styles.emptyTitle}>No Vehicles Added</Text>
          <Text style={styles.emptyText}>
            Add your first vehicle to get started
          </Text>
          <Button
            title="Add Vehicle"
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Add/Edit Vehicle Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowAddModal(false)}
              >
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {formError && (
              <Alert
                type="error"
                message={formError}
                onClose={() => setFormError('')}
              />
            )}

            <View style={styles.modalForm}>
              <Input
                label="Vehicle Name"
                placeholder="e.g., Tesla Model 3"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <Input
                label="Plate Number"
                placeholder="e.g., ABC-1234"
                value={formData.plateNumber}
                onChangeText={(text) => setFormData({ ...formData, plateNumber: text.toUpperCase() })}
                autoCapitalize="characters"
              />
              <Input
                label="Color"
                placeholder="e.g., White"
                value={formData.color}
                onChangeText={(text) => setFormData({ ...formData, color: text })}
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowAddModal(false)}
                  variant="outline"
                  style={styles.modalCancelButton}
                />
                <Button
                  title={editingVehicle ? 'Update' : 'Add'}
                  onPress={handleAddVehicle}
                  variant="primary"
                  style={styles.modalSaveButton}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  addButton: {
    padding: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  vehicleCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  vehicleEmoji: {
    fontSize: 28,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  defaultText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  vehicleColor: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  vehicleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.round,
  },
  setDefaultText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
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
    padding: SPACING.xl,
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
  emptyButton: {
    marginTop: SPACING.lg,
    minWidth: 160,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  modalClose: {
    padding: SPACING.xs,
  },
  modalForm: {
    paddingVertical: SPACING.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  modalSaveButton: {
    flex: 2,
    marginLeft: SPACING.sm,
  },
});

export default ProfileVehicles;