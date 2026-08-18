// ============================================================================
// Alert Component - Notification Alert
// ============================================================================

// parking-management-system/mobile/src/components/common/Feedback/Alert.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../constants/theme';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  autoHide = false,
  duration = 5000,
  closable = true,
  style,
  ...props
}) => {
  const [visible, setVisible] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onClose) onClose();
    });
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: styles.successContainer,
          icon: 'check-circle',
          color: COLORS.success,
        };
      case 'error':
        return {
          container: styles.errorContainer,
          icon: 'alert-circle',
          color: COLORS.danger,
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          icon: 'alert-triangle',
          color: COLORS.warning,
        };
      case 'info':
      default:
        return {
          container: styles.infoContainer,
          icon: 'info',
          color: COLORS.info,
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        typeStyles.container,
        { opacity: fadeAnim },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        <Feather name={typeStyles.icon} size={20} color={typeStyles.color} />
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
      {closable && (
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={18} color={COLORS.gray600} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  autoHide: PropTypes.bool,
  duration: PropTypes.number,
  closable: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Alert.defaultProps = {
  type: 'info',
  title: '',
  onClose: null,
  autoHide: false,
  duration: 5000,
  closable: true,
  style: null,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  infoContainer: {
    backgroundColor: COLORS.info + '15',
    borderColor: COLORS.info + '30',
  },
  successContainer: {
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '30',
  },
  warningContainer: {
    backgroundColor: COLORS.warning + '15',
    borderColor: COLORS.warning + '30',
  },
  errorContainer: {
    backgroundColor: COLORS.danger + '15',
    borderColor: COLORS.danger + '30',
  },
});

export default Alert;