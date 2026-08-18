// ============================================================================
// EmptyState Component - Empty State Display
// ============================================================================

// parking-management-system/mobile/src/components/common/Feedback/EmptyState.js

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../constants/theme';

const EmptyState = ({
  title,
  description,
  icon,
  image,
  buttonTitle,
  onButtonPress,
  style,
  titleStyle,
  descriptionStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {image && <Image source={image} style={styles.image} resizeMode="contain" />}
      {icon && <View style={styles.icon}>{icon}</View>}
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {description && (
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      )}
      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  image: PropTypes.oneOfType([
    PropTypes.shape({ uri: PropTypes.string }),
    PropTypes.number,
  ]),
  buttonTitle: PropTypes.string,
  onButtonPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  titleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  descriptionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

EmptyState.defaultProps = {
  title: '',
  description: '',
  icon: null,
  image: null,
  buttonTitle: '',
  onButtonPress: null,
  style: null,
  titleStyle: null,
  descriptionStyle: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: SPACING.lg,
  },
  icon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 160,
  },
});

export default EmptyState;