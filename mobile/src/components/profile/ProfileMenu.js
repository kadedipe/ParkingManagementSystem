// ============================================================================
// ProfileMenu Component - Profile Menu List
// ============================================================================

// parking-management-system/mobile/src/components/profile/ProfileMenu.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import ProfileMenuItem from './ProfileMenuItem';

const ProfileMenu = ({
  sections,
  onItemPress,
  style,
}) => {
  const defaultSections = [
    {
      title: 'Account',
      data: [
        {
          id: 'profile',
          icon: 'user',
          label: 'Edit Profile',
          onPress: () => onItemPress?.('profile'),
        },
        {
          id: 'vehicles',
          icon: 'truck',
          label: 'My Vehicles',
          value: '3',
          onPress: () => onItemPress?.('vehicles'),
        },
        {
          id: 'payment',
          icon: 'credit-card',
          label: 'Payment Methods',
          onPress: () => onItemPress?.('payment'),
        },
        {
          id: 'loyalty',
          icon: 'star',
          label: 'Loyalty Points',
          value: '450 pts',
          onPress: () => onItemPress?.('loyalty'),
        },
      ],
    },
    {
      title: 'Preferences',
      data: [
        {
          id: 'notifications',
          icon: 'bell',
          label: 'Notifications',
          badge: '3',
          onPress: () => onItemPress?.('notifications'),
        },
        {
          id: 'language',
          icon: 'globe',
          label: 'Language',
          value: 'English',
          onPress: () => onItemPress?.('language'),
        },
        {
          id: 'privacy',
          icon: 'lock',
          label: 'Privacy & Security',
          onPress: () => onItemPress?.('privacy'),
        },
      ],
    },
    {
      title: 'Support',
      data: [
        {
          id: 'help',
          icon: 'help-circle',
          label: 'Help Center',
          onPress: () => onItemPress?.('help'),
        },
        {
          id: 'feedback',
          icon: 'message-square',
          label: 'Send Feedback',
          onPress: () => onItemPress?.('feedback'),
        },
        {
          id: 'about',
          icon: 'info',
          label: 'About',
          value: 'v2.0.0',
          onPress: () => onItemPress?.('about'),
        },
      ],
    },
    {
      title: '',
      data: [
        {
          id: 'logout',
          icon: 'log-out',
          label: 'Log Out',
          danger: true,
          onPress: () => onItemPress?.('logout'),
        },
      ],
    },
  ];

  const displaySections = sections || defaultSections;

  const renderSectionHeader = ({ section: { title } }) => {
    if (!title) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <ProfileMenuItem
      icon={item.icon}
      label={item.label}
      value={item.value}
      badge={item.badge}
      danger={item.danger}
      onPress={item.onPress}
      showArrow={item.showArrow !== false}
    />
  );

  return (
    <SectionList
      style={[styles.container, style]}
      sections={displaySections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionHeader: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray600,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ProfileMenu;