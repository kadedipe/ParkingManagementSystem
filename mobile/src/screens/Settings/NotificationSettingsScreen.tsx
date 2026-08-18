// ============================================================================
// NotificationSettingsScreen - Notification Preferences
// ============================================================================

// parking-management-system/mobile/src/screens/Settings/NotificationSettingsScreen.tsx

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
import { Card } from '../../components';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PROFILE.NOTIFICATION_SETTINGS>['navigation']>();

  const [settings, setSettings] = useState({
    // Push notifications
    pushEnabled: true,
    pushBookings: true,
    pushPayment: true,
    pushParking: true,
    pushCharging: true,
    pushPromotions: false,
    pushSystem: true,

    // Email notifications
    emailEnabled: true,
    emailBookings: true,
    emailPayment: true,
    emailNewsletter: false,

    // In-app notifications
    inAppEnabled: true,
    inAppBookings: true,
    inAppPayment: true,
    inAppParking: true,
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
  };

  const renderSettingItem = (
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
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
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

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <Card variant="elevated" style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: COLORS.primary + '15' }]}>
          <Feather name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Card>
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
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      {/* Push Notifications */}
      {renderSection('Push Notifications', 'bell',
        <>
          {renderSettingItem(
            'Enable Push Notifications',
            settings.pushEnabled,
            () => handleToggle('pushEnabled'),
            'Receive push notifications on your device'
          )}
          {settings.pushEnabled && (
            <>
              {renderSettingItem(
                'Booking Updates',
                settings.pushBookings,
                () => handleToggle('pushBookings'),
                'Get notified about your bookings'
              )}
              {renderSettingItem(
                'Payment Updates',
                settings.pushPayment,
                () => handleToggle('pushPayment'),
                'Get notified about payments'
              )}
              {renderSettingItem(
                'Parking Alerts',
                settings.pushParking,
                () => handleToggle('pushParking'),
                'Get notified about parking availability'
              )}
              {renderSettingItem(
                'Charging Updates',
                settings.pushCharging,
                () => handleToggle('pushCharging'),
                'Get notified about EV charging'
              )}
              {renderSettingItem(
                'Promotions & Offers',
                settings.pushPromotions,
                () => handleToggle('pushPromotions'),
                'Get notified about special offers'
              )}
              {renderSettingItem(
                'System Updates',
                settings.pushSystem,
                () => handleToggle('pushSystem'),
                'Get notified about system updates'
              )}
            </>
          )}
        </>
      )}

      {/* Email Notifications */}
      {renderSection('Email Notifications', 'mail',
        <>
          {renderSettingItem(
            'Enable Email Notifications',
            settings.emailEnabled,
            () => handleToggle('emailEnabled'),
            'Receive email notifications'
          )}
          {settings.emailEnabled && (
            <>
              {renderSettingItem(
                'Booking Confirmations',
                settings.emailBookings,
                () => handleToggle('emailBookings'),
                'Receive booking confirmation emails'
              )}
              {renderSettingItem(
                'Payment Receipts',
                settings.emailPayment,
                () => handleToggle('emailPayment'),
                'Receive payment receipt emails'
              )}
              {renderSettingItem(
                'Newsletter',
                settings.emailNewsletter,
                () => handleToggle('emailNewsletter'),
                'Receive monthly newsletters'
              )}
            </>
          )}
        </>
      )}

      {/* In-App Notifications */}
      {renderSection('In-App Notifications', 'smartphone',
        <>
          {renderSettingItem(
            'Enable In-App Notifications',
            settings.inAppEnabled,
            () => handleToggle('inAppEnabled'),
            'Show notifications within the app'
          )}
          {settings.inAppEnabled && (
            <>
              {renderSettingItem(
                'Booking Updates',
                settings.inAppBookings,
                () => handleToggle('inAppBookings')
              )}
              {renderSettingItem(
                'Payment Updates',
                settings.inAppPayment,
                () => handleToggle('inAppPayment')
              )}
              {renderSettingItem(
                'Parking Alerts',
                settings.inAppParking,
                () => handleToggle('inAppParking')
              )}
            </>
          )}
        </>
      )}

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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
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
  settingText: {
    flex: 1,
    marginRight: SPACING.md,
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
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default NotificationSettingsScreen;