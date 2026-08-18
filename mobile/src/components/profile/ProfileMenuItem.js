// ============================================================================
// ProfileMenuItem Component - Profile Menu Item
// ============================================================================

// parking-management-system/mobile/src/components/profile/ProfileMenuItem.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { Badge } from '../common';

const ProfileMenuItem = ({
  icon,
  label,
  value,
  onPress,
  badge,
  badgeColor = 'danger',
  showArrow = true,
  disabled = false,
  danger = false,
  style,
  labelStyle,
  valueStyle,
  iconColor,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        danger && styles.danger,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            {typeof icon === 'string' ? (
              <Feather
                name={icon}
                size={20}
                color={danger ? COLORS.danger : (iconColor || COLORS.text)}
              />
            ) : (
              icon
            )}
          </View>
        )}
        <Text
          style={[
            styles.label,
            danger && styles.dangerText,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {value && (
          <Text style={[styles.value, valueStyle]}>{value}</Text>
        )}
        {badge && (
          <Badge
            text={badge}
            variant={badgeColor}
            size="small"
            style={styles.badge}
          />
        )}
        {showArrow && (
          <Feather
            name="chevron-right"
            size={20}
            color={COLORS.gray400}
            style={styles.arrow}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  disabled: {
    opacity: 0.5,
  },
  danger: {
    borderBottomColor: COLORS.danger + '20',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  dangerText: {
    color: COLORS.danger,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginRight: SPACING.sm,
  },
  badge: {
    marginRight: SPACING.sm,
  },
  arrow: {
    marginLeft: SPACING.xs,
  },
});

export default ProfileMenuItem;