// ============================================================================
// Rating Component - Star Rating Display
// ============================================================================

// parking-management-system/mobile/src/components/common/Display/Rating.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

const Rating = ({
  rating = 0,
  maxStars = 5,
  size = 'medium',
  color = COLORS.warning,
  showLabel = true,
  interactive = false,
  onRatingChange,
  style,
  ...props
}) => {
  const [selectedRating, setSelectedRating] = React.useState(rating);

  const handlePress = (value) => {
    if (!interactive) return;
    setSelectedRating(value);
    if (onRatingChange) onRatingChange(value);
  };

  const getStarSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      case 'medium':
      default:
        return 22;
    }
  };

  const starSize = getStarSize();
  const displayRating = interactive ? selectedRating : rating;

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.stars}>
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(displayRating);
          
          return interactive ? (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(starValue)}
              style={styles.starTouch}
              activeOpacity={0.7}
            >
              <Feather
                name={isFilled ? 'star' : 'star'}
                size={starSize}
                color={isFilled ? color : COLORS.gray300}
              />
            </TouchableOpacity>
          ) : (
            <Feather
              key={index}
              name={isFilled ? 'star' : 'star'}
              size={starSize}
              color={isFilled ? color : COLORS.gray300}
              style={styles.star}
            />
          );
        })}
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {displayRating.toFixed(1)}
          {!interactive && ` (${displayRating.toFixed(1)}/5)`}
        </Text>
      )}
    </View>
  );
};

Rating.propTypes = {
  rating: PropTypes.number,
  maxStars: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  showLabel: PropTypes.bool,
  interactive: PropTypes.bool,
  onRatingChange: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Rating.defaultProps = {
  rating: 0,
  maxStars: 5,
  size: 'medium',
  color: COLORS.warning,
  showLabel: true,
  interactive: false,
  onRatingChange: null,
  style: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: SPACING.xs / 2,
  },
  starTouch: {
    marginRight: SPACING.xs / 2,
    padding: SPACING.xs / 2,
  },
  label: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.gray600,
  },
});

export default Rating;