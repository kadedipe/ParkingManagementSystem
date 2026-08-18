// ============================================================================
// SettingsScreen - Main Settings Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Settings/SettingsScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card, Divider, Button, Alert as CustomAlert } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const SettingsScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PROFILE.SETTINGS>['navigation']>();
  const { mode, toggleTheme, colors } = useTheme();
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState({
    darkMode: mode === 'dark',
    notifications: true,
    locationServices: true,
    biometricLogin: false,
    autoPay: true,
    dataSaver: false,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [success, setSuccess] = useState('');
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

  const handleToggle = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
    
    if (key === 'darkMode') {
      toggleTheme();
    }
  };

  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route as any);
  };

  const handleRateApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
      } else {
        // Fallback to app store link
        const url = Platform.select({
          ios: 'https://apps.apple.com/app/id123456789',
          android: 'https://play.google.com/store/apps/details?id=com.parkingapp',
        });
        if (url) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      console.error('Error opening store review:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSuccess('Cache cleared successfully');
            setTimeout(() => setSuccess(''), 3000);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderSettingItem = (
    icon: string,
    label: string,
    value: boolean,
    onToggle: () => void,
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <TouchableOpacity
        style={styles.settingContent}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '15' }]}>
            <Feather name={icon} size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>{label}</Text>
            {description && (
              <Text style={styles.settingDescription}>{description}</Text>
            )}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor={COLORS.gray300}
        />
      </TouchableOpacity>
    </View>
  );

  const renderMenuItem = (
    icon: string,
    label: string,
    onPress: () => void,
    badge?: string,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.menuItemDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[
          styles.menuIcon,
          danger ? { backgroundColor: COLORS.danger + '15' } : { backgroundColor: COLORS.primary + '15' }
        ]}>
          <Feather name={icon} size={20} color={danger ? COLORS.danger : COLORS.primary} />
        </View>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
          {label}
        </Text>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <Text style={styles.menuBadge}>{badge}</Text>
        )}
        <Feather name="chevron-right" size={20} color={danger ? COLORS.danger : COLORS.gray400} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.ScrollView
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Success/Error Alerts */}
      {success && (
        <CustomAlert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
          style={styles.alert}
        />
      )}
      {error && (
        <CustomAlert
          type="error"
          message={error}
          onClose={() => setError('')}
          style={styles.alert}
        />
      )}

      {/* Preferences */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {renderSettingItem(
          'moon',
          'Dark Mode',
          settings.darkMode,
          () => handleToggle('darkMode')
        )}
        {renderSettingItem(
          'globe',
          'Language',
          settings.language,
          () => handleNavigate(ROUTES.PROFILE.LANGUAGE),
          'English'
        )}
        {renderSettingItem(
          'map-pin',
          'Location Services',
          settings.locationServices,
          () => handleToggle('locationServices'),
          'Allow app to access your location'
        )}
        {renderSettingItem(
          'wifi',
          'Data Saver',
          settings.dataSaver,
          () => handleToggle('dataSaver'),
          'Reduce data usage'
        )}
      </Card>

      {/* Notifications */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {renderSettingItem(
          'bell',
          'Push Notifications',
          settings.pushNotifications,
          () => handleToggle('pushNotifications'),
          'Receive push notifications'
        )}
        {renderSettingItem(
          'mail',
          'Email Notifications',
          settings.emailNotifications,
          () => handleToggle('emailNotifications'),
          'Receive email notifications'
        )}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate(ROUTES.PROFILE.NOTIFICATION_SETTINGS)}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Feather name="settings" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>Notification Preferences</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      </Card>

      {/* Account */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderMenuItem(
          'user',
          'Edit Profile',
          () => handleNavigate(ROUTES.PROFILE.EDIT)
        )}
        {renderMenuItem(
          'truck',
          'My Vehicles',
          () => handleNavigate(ROUTES.PROFILE.VEHICLES)
        )}
        {renderMenuItem(
          'lock',
          'Change Password',
          () => handleNavigate(ROUTES.PROFILE.CHANGE_PASSWORD)
        )}
        {renderMenuItem(
          'credit-card',
          'Payment Methods',
          () => handleNavigate(ROUTES.PAYMENT.METHODS)
        )}
        {renderMenuItem(
          'shield',
          'Privacy & Security',
          () => handleNavigate(ROUTES.PROFILE.PRIVACY)
        )}
      </Card>

      {/* Payment */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        {renderSettingItem(
          'credit-card',
          'Auto Pay',
          settings.autoPay,
          () => handleToggle('autoPay'),
          'Automatically pay for bookings'
        )}
        {renderMenuItem(
          'dollar-sign',
          'Wallet',
          () => handleNavigate(ROUTES.PAYMENT.WALLET)
        )}
        {renderMenuItem(
          'receipt',
          'Payment History',
          () => handleNavigate(ROUTES.PAYMENT.HISTORY)
        )}
      </Card>

      {/* Support */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        {renderMenuItem(
          'help-circle',
          'Help Center',
          () => handleNavigate(ROUTES.PROFILE.HELP)
        )}
        {renderMenuItem(
          'message-square',
          'Send Feedback',
          () => handleNavigate(ROUTES.PROFILE.FEEDBACK)
        )}
        {renderMenuItem(
          'star',
          'Rate App',
          handleRateApp
        )}
        {renderMenuItem(
          'info',
          'About',
          () => handleNavigate(ROUTES.PROFILE.ABOUT),
          'v2.0.0'
        )}
      </Card>

      {/* Legal */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        {renderMenuItem(
          'file-text',
          'Terms of Service',
          () => handleNavigate(ROUTES.PROFILE.TERMS)
        )}
        {renderMenuItem(
          'shield',
          'Privacy Policy',
          () => handleNavigate(ROUTES.PROFILE.PRIVACY_POLICY)
        )}
        {renderMenuItem(
          'info',
          'Open Source Licenses',
          () => handleNavigate(ROUTES.PROFILE.OPEN_SOURCE)
        )}
      </Card>

      {/* Data */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        {renderMenuItem(
          'trash-2',
          'Clear Cache',
          handleClearCache
        )}
        {renderMenuItem(
          'download',
          'Export Data',
          () => handleNavigate(ROUTES.PROFILE.EXPORT_DATA)
        )}
        {renderMenuItem(
          'user-x',
          'Delete Account',
          () => handleNavigate(ROUTES.PROFILE.DELETE_ACCOUNT),
          undefined,
          true
        )}
      </Card>

      {/* Logout */}
      <Button
        title="Log Out"
        onPress={handleLogout}
        variant="danger"
        size="large"
        style={styles.logoutButton}
        iconLeft={<Feather name="log-out" size={20} color="#FFFFFF" />}
      />

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          Parking Management System v2.0.0
        </Text>
        <Text style={styles.versionSubtext}>
          © 2024 All rights reserved
        </Text>
        <Text style={styles.versionBuild}>
          Build #2024.08.10
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
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
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  alert: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  menuItemDanger: {
    borderBottomColor: COLORS.danger + '20',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
  },
  menuLabelDanger: {
    color: COLORS.danger,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    marginRight: SPACING.sm,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray400,
    marginTop: 2,
  },
  versionBuild: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray400,
    marginTop: 2,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default SettingsScreen;