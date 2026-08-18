// ============================================================================
// AboutScreen - About the App
// ============================================================================

// parking-management-system/mobile/src/screens/Settings/AboutScreen.tsx

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { MainScreenProps } from '../../navigation/types/mainStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Card, Divider } from '../../components';

const AboutScreen = () => {
  const navigation = useNavigation<MainScreenProps<typeof ROUTES.PROFILE.ABOUT>['navigation']>();

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

  const handleLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  const renderSocialButton = (icon: string, color: string, url: string) => (
    <TouchableOpacity
      style={[styles.socialButton, { backgroundColor: color + '15' }]}
      onPress={() => handleLink(url)}
      activeOpacity={0.7}
    >
      <Feather name={icon} size={24} color={color} />
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
        <Text style={styles.headerTitle}>About</Text>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logos/logo-primary.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Parking Management</Text>
        <Text style={styles.appVersion}>Version 2.0.0</Text>
        <Text style={styles.appBuild}>Build #2024.08.10</Text>
      </View>

      <Divider style={styles.divider} />

      {/* Description */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.description}>
          Parking Management System helps you find, book, and pay for parking
          spots with ease. With real-time availability and secure payments,
          parking has never been easier.
        </Text>
      </Card>

      {/* Features */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '15' }]}>
            <Feather name="search" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>Find available parking spots in real-time</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: COLORS.success + '15' }]}>
            <Feather name="calendar" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.featureText}>Book and reserve spots in advance</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: COLORS.warning + '15' }]}>
            <Feather name="credit-card" size={20} color={COLORS.warning} />
          </View>
          <Text style={styles.featureText}>Secure and seamless payments</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: COLORS.secondary + '15' }]}>
            <Feather name="zap" size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.featureText}>EV charging station locator</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: COLORS.info + '15' }]}>
            <Feather name="bell" size={20} color={COLORS.info} />
          </View>
          <Text style={styles.featureText}>Real-time notifications</Text>
        </View>
      </Card>

      {/* Team */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Developed By</Text>
        <Text style={styles.teamText}>Parking Management Team</Text>
        <Text style={styles.teamRole}>Built with ❤️ in California</Text>
      </Card>

      {/* Social */}
      <Card variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Connect With Us</Text>
        <View style={styles.socialContainer}>
          {renderSocialButton('globe', COLORS.primary, 'https://parkingapp.com')}
          {renderSocialButton('github', COLORS.text, 'https://github.com')}
          {renderSocialButton('twitter', '#1DA1F2', 'https://twitter.com')}
          {renderSocialButton('linkedin', '#0077B5', 'https://linkedin.com')}
          {renderSocialButton('youtube', '#FF0000', 'https://youtube.com')}
        </View>
      </Card>

      {/* Links */}
      <Card variant="elevated" style={styles.section}>
        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => handleNavigate(ROUTES.PROFILE.TERMS)}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>Terms of Service</Text>
          <Feather name="chevron-right" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => handleNavigate(ROUTES.PROFILE.PRIVACY_POLICY)}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Feather name="chevron-right" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => handleNavigate(ROUTES.PROFILE.OPEN_SOURCE)}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>Open Source Licenses</Text>
          <Feather name="chevron-right" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      </Card>

      {/* Copyright */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © 2024 Parking Management System
        </Text>
        <Text style={styles.copyrightText}>
          All rights reserved
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  appVersion: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    marginTop: 2,
  },
  appBuild: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  divider: {
    marginHorizontal: SPACING.lg,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  teamText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  teamRole: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  copyrightContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  copyrightText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginTop: 2,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default AboutScreen;