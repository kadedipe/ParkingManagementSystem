// ============================================================================
// ProfileVehiclesScreen - Manage User Vehicles
// ============================================================================

// parking-management-system/mobile/src/screens/Profile/ProfileVehiclesScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card, Button, Input, Alert as CustomAlert, Badge } from '../../components';
import { useAuth } from '../../hooks';

const ProfileVehiclesScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PROFILE.VEHICLES>['navigation']>();
  const { user, updateUser } = useAuth();

  const [vehicles, setVehicles] = useState(user?.vehicles || []);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    plateNumber: '',
    type: 'car',
    color: '',
  });
  const [error, setError] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    animateIn();
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    // Reload vehicles
    setRefreshing(false);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      plateNumber: '',
      type: 'car',
      color: '',
    });
    setShowAddModal(true);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type || 'car',
      color: vehicle.color || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteVehicle = (vehicle: any) => {
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // Delete vehicle logic
            const updatedVehicles = vehicles.filter(v => v.id !== vehicle.id);
            setVehicles(updatedVehicles);
            await updateUser({ vehicles: updatedVehicles });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSetDefault = (vehicle: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedVehicles = vehicles.map(v => ({
      ...v,
      isDefault: v.id === vehicle.id,
    }));
    setVehicles(updatedVehicles);
    updateUser({ vehicles: updatedVehicles });
  };

  const handleSaveVehicle = async () => {
    if (!formData.name || !formData.plateNumber) {
      setError('Please fill in all required fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError('');
    setLoading(true);

    try {
      let updatedVehicles;
      if (editingVehicle) {
        // Update existing vehicle
        updatedVehicles = vehicles.map(v =>
          v.id === editingVehicle.id
            ? { ...v, ...formData }
            : v
        );
      } else {
        // Add new vehicle
        const newVehicle = {
          id: `vehicle_${Date.now()}`,
          ...formData,
          isDefault: vehicles.length === 0,
        };
        updatedVehicles = [...vehicles, newVehicle];
      }

      setVehicles(updatedVehicles);
      await updateUser({ vehicles: updatedVehicles });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddModal(false);
    } catch (error: any) {
      setError(error.message || 'Failed to save vehicle');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'suv':
        return '🚙';
      case 'truck':
        return '🚛';
      case 'motorcycle':
        return '🏍️';
      case 'bicycle':
        return '🚲';
      case 'car':
      default:
        return '🚗';
    }
  };

  const renderVehicleItem = ({ item }: { item: any }) => (
    <Card variant="elevated" style={styles.vehicleCard}>
      <TouchableOpacity
        onPress={() => handleEditVehicle(item)}
        activeOpacity={0.7}
      >
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.vehicleEmoji}>{getVehicleIcon(item.type)}</Text>
          </View>
          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleHeader}>
              <Text style={styles.vehicleName}>{item.name}</Text>
              {item.isDefault && (
                <Badge
                  text="Default"
                  variant="primary"
                  size="small"
                  style={styles.defaultBadge}
                />
              )}
            </View>
            <Text style={styles.vehiclePlate}>{item.plateNumber}</Text>
            {item.color && (
              <View style={styles.vehicleColorContainer}>
                <View style={[styles.vehicleColorDot, { backgroundColor: item.color.toLowerCase() }]} />
                <Text style={styles.vehicleColor}>{item.color}</Text>
              </View>
            )}
          </View>
          <View style={styles.vehicleActions}>
            {!item.isDefault && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSetDefault(item)}
              >
                <Feather name="check-circle" size={18} color={COLORS.gray500} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditVehicle(item)}
            >
              <Feather name="edit-2" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteVehicle(item)}
            >
              <Feather name="trash-2" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="truck" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Vehicles Added</Text>
      <Text style={styles.emptyText}>
        Add your first vehicle to get started
      </Text>
      <Button
        title="Add Vehicle"
        onPress={handleAddVehicle}
        variant="primary"
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Vehicles</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddVehicle}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Vehicle List */}
        {vehicles.length === 0 ? (
          renderEmpty()
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
      </Animated.View>

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
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {error && (
              <CustomAlert
                type="error"
                message={error}
                onClose={() => setError('')}
                style={styles.modalAlert}
              />
            )}

            <View style={styles.modalForm}>
              <Input
                label="Vehicle Name"
                placeholder="e.g., Tesla Model 3"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                required
              />
              <Input
                label="Plate Number"
                placeholder="e.g., ABC-1234"
                value={formData.plateNumber}
                onChangeText={(text) => setFormData({ ...formData, plateNumber: text.toUpperCase() })}
                autoCapitalize="characters"
                required
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
                  onPress={handleSaveVehicle}
                  loading={loading}
                  disabled={loading}
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
  content: {
    flex: 1,
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
  headerTitle: {
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
    marginLeft: SPACING.sm,
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  vehicleColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  vehicleColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  vehicleColor: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  vehicleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
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
    textAlign: 'center',
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
  modalAlert: {
    marginBottom: SPACING.md,
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

export default ProfileVehiclesScreen;