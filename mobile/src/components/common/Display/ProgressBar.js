// ============================================================================
// ProgressBar Component - Loading Progress Bar
// ============================================================================

// parking-management-system/mobile/src/components/common/Display/ProgressBar.js

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

const ProgressBar = ({
  progress = 0,
  max = 100,
  height = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.gray200,
  showLabel = true,
  labelPosition = 'inside',
  labelFormat = 'percentage',
  animated = true,
  style,
  ...props
}) => {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress / max,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress / max);
    }
  }, [progress, max, animated]);

  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);
  const displayWidth = animated ? animatedWidth : percentage / 100;

  const getLabel = () => {
    if (labelFormat === 'percentage') {
      return `${Math.round(percentage)}%`;
    }
    if (labelFormat === 'fraction') {
      return `${Math.round(progress)}/${max}`;
    }
    if (labelFormat === 'value') {
      return `${Math.round(progress)}`;
    }
    return `${Math.round(percentage)}%`;
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {showLabel && labelPosition === 'above' && (
        <View style={styles.labelAbove}>
          <Text style={styles.labelText}>{getLabel()}</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: typeof displayWidth === 'number' 
                ? `${displayWidth * 100}%` 
                : displayWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
              height,
              backgroundColor: color,
            },
          ]}
        >
          {showLabel && labelPosition === 'inside' && percentage > 15 && (
            <Text style={[styles.insideLabel, { fontSize: height * 0.5 }]}>
              {getLabel()}
            </Text>
          )}
        </Animated.View>
      </View>
      {showLabel && labelPosition === 'below' && (
        <View style={styles.labelBelow}>
          <Text style={styles.labelText}>{getLabel()}</Text>
        </View>
      )}
    </View>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  max: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  showLabel: PropTypes.bool,
  labelPosition: PropTypes.oneOf(['above', 'below', 'inside']),
  labelFormat: PropTypes.oneOf(['percentage', 'fraction', 'value']),
  animated: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

ProgressBar.defaultProps = {
  progress: 0,
  max: 100,
  height: 8,
  color: COLORS.primary,
  backgroundColor: COLORS.gray200,
  showLabel: true,
  labelPosition: 'inside',
  labelFormat: 'percentage',
  animated: true,
  style: null,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    borderRadius: BORDER_RADIUS.round,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  insideLabel: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    textAlign: 'center',
    lineHeight: 8,
  },
  labelAbove: {
    marginBottom: SPACING.xs,
  },
  labelBelow: {
    marginTop: SPACING.xs,
  },
  labelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray600,
  },
});

export default ProgressBar;