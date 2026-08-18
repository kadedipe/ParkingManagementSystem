// ============================================================================
// Profile Screen - Main Profile View
// ============================================================================

// parking-management-system/mobile/src/screens/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import { Container } from '../components/common';
import {
  ProfileHeader,
  ProfileStats,
  ProfileMenu,
  EditProfileForm,
  ChangePassword,
  ProfileVehicles,
} from '../components/profile';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../constants/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);

  const handleMenuItemPress = (itemId) => {
    switch (itemId) {
      case 'profile':
        setShowEditProfile(true);
        break;
      case 'vehicles':
        setShowVehicles(true);
        break;
      case 'payment':
        navigation.navigate('PaymentMethods');
        break;
      case 'loyalty':
        navigation.navigate('Loyalty');
        break;
      case 'notifications':
        navigation.navigate('NotificationSettings');
        break;
      case 'language':
        navigation.navigate('Language');
        break;
      case 'privacy':
        navigation.navigate('Privacy');
        break;
      case 'help':
        navigation.navigate('HelpCenter');
        break;
      case 'feedback':
        navigation.navigate('Feedback');
        break;
      case 'about':
        navigation.navigate('About');
        break;
      case 'logout':
        logout();
        navigation.navigate('Login');
        break;
      default:
        break;
    }
  };

  return (
    <Container>
      <ProfileHeader
        user={user}
        onEditPress={() => setShowEditProfile(true)}
        onSettingsPress={() => navigation.navigate('Settings')}
        onAvatarPress={() => console.log('Avatar pressed')}
      />

      <ProfileStats
        stats={{
          bookings: 12,
          vehicles: 3,
          charging: 8,
          loyaltyPoints: 450,
        }}
        onStatPress={(statId) => {
          if (statId === 'vehicles') {
            setShowVehicles(true);
          } else {
            navigation.navigate(statId.charAt(0).toUpperCase() + statId.slice(1));
          }
        }}
      />

      <ProfileMenu onItemPress={handleMenuItemPress} />

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowEditProfile(false)}
          />
          <View style={styles.modalContainer}>
            <EditProfileForm
              user={user}
              onCancel={() => setShowEditProfile(false)}
              onSuccess={() => setShowEditProfile(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowChangePassword(false)}
          />
          <View style={styles.modalContainer}>
            <ChangePassword
              onBack={() => setShowChangePassword(false)}
              onSuccess={() => setShowChangePassword(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Vehicles Modal */}
      <Modal
        visible={showVehicles}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVehicles(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowVehicles(false)}
          />
          <View style={styles.modalContainer}>
            <ProfileVehicles
              onBack={() => setShowVehicles(false)}
              onVehicleSelect={(vehicle) => {
                setShowVehicles(false);
                navigation.navigate('VehicleDetails', { vehicleId: vehicle.id });
              }}
            />
          </View>
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
});

export default ProfileScreen;