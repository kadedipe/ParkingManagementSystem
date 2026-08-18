// ============================================================================
// SettingsScreen - App Settings Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Profile/SettingsScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card, Divider, Button } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PROFILE.SETTINGS>['navigation']>();
  const { mode, toggleTheme, colors } = useTheme();

  const [settings, setSettings] = useState({
    darkMode: mode === 'dark',
    notifications: true,
    locationServices: true,
    biometricLogin: false,
    autoPay: true,
    dataSaver: false,
  });

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

  const renderSettingItem = (
    icon: string,
    label: string,
    value: boolean,
    onToggle: () => void,
    description?: string
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
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
  );

  const renderMenuItem = (icon: string, label: string, onPress: () => void, badge?: string) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <Feather name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <Text style={styles.menuBadge}>{badge}</Text>
        )}
        <Feather name="chevron-right" size={20} color={COLORS.gray400} />
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
      </View>

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
          'bell',
          'Notifications',
          settings.notifications,
          () => handleToggle('notifications')
        )}
        {renderSettingItem(
          'map-pin',
          'Location Services',
          settings.locationServices,
          () => handleToggle('locationServices')
        )}
        {renderSettingItem(
          'fingerprint',
          'Biometric Login',
          settings.biometricLogin,
          () => handleToggle('biometricLogin')
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
        {renderSettingItem(
          'wifi',
          'Data Saver',
          settings.dataSaver,
          () => handleToggle('dataSaver'),
          'Reduce data usage'
        )}
        {renderMenuItem(
          'credit-card',
          'Payment Methods',
          () => handleNavigate(ROUTES.PAYMENT.METHODS)
        )}
        {renderMenuItem(
          'dollar-sign',
          'Wallet',
          () => handleNavigate(ROUTES.PAYMENT.WALLET)
        )}
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
          'shield',
          'Privacy & Security',
          () => handleNavigate(ROUTES.PROFILE.PRIVACY)
        )}
        {renderMenuItem(
          'globe',
          'Language',
          () => handleNavigate(ROUTES.PROFILE.LANGUAGE),
          'English'
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
          'info',
          'About',
          () => handleNavigate(ROUTES.PROFILE.ABOUT),
          'v2.0.0'
        )}
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
      </Card>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          Parking Management System v2.0.0
        </Text>
        <Text style={styles.versionSubtext}>
          © 2024 All rights reserved
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
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
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    marginRight: SPACING.sm,
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
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default SettingsScreen;