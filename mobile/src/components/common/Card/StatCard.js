// ============================================================================
// StatCard Component - Card for Displaying Statistics
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/StatCard.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Card from './Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

/**
 * StatCard Component - Card for displaying statistical data
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'elevated',
  color = COLORS.primary,
  style,
  titleStyle,
  valueStyle,
  subtitleStyle,
  ...props
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return COLORS.success;
    if (trend === 'down') return COLORS.danger;
    return COLORS.gray600;
  };

  return (
    <Card variant={variant} padding="medium" style={[styles.container, style]} {...props}>
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }, valueStyle]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        )}
      </View>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, { color: getTrendColor() }]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </Text>
        </View>
      )}
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  titleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  valueStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  subtitleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

StatCard.defaultProps = {
  title: '',
  subtitle: '',
  icon: null,
  trend: null,
  trendValue: '',
  variant: 'elevated',
  color: COLORS.primary,
  style: null,
  titleStyle: null,
  valueStyle: null,
  subtitleStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  trendContainer: {
    marginTop: SPACING.xs,
  },
  trend: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});

export default StatCard;