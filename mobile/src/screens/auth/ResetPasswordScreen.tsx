// ============================================================================
// ResetPasswordScreen - Reset Password Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Auth/ResetPasswordScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthScreenProps } from '../../navigation/types/authStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Input, Button, Alert as CustomAlert } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const ResetPasswordScreen = () => {
  const navigation = useNavigation<AuthScreenProps<typeof ROUTES.AUTH.RESET_PASSWORD>['navigation']>();
  const route = useRoute<AuthScreenProps<typeof ROUTES.AUTH.RESET_PASSWORD>['route']>();
  const { resetPassword, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    let strength = 0;
    if (text.length >= 8) strength++;
    if (/[a-z]/.test(text) && /[A-Z]/.test(text)) strength++;
    if (/\d/.test(text)) strength++;
    if (/[^a-zA-Z0-9]/.test(text)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return COLORS.danger;
    if (passwordStrength === 2) return COLORS.warning;
    if (passwordStrength === 3) return COLORS.info;
    return COLORS.success;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError('');
    try {
      await resetPassword({
        token: route.params?.token || '',
        newPassword: password,
      });
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        navigation.navigate(ROUTES.AUTH.LOGIN);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Password Reset! 🔒
          </Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Your password has been reset successfully.
            You can now log in with your new password.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}
            variant="primary"
            size="large"
            style={styles.successButton}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="lock" size={48} color={COLORS.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Set New Password 🔑
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create a new password for your account
            </Text>
          </View>

          {/* Error Alert */}
          {error && (
            <CustomAlert
              type="error"
              message={error}
              onClose={() => setError('')}
              style={styles.alert}
            />
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              leftIcon={<Feather name="lock" size={20} color={COLORS.gray500} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              }
              helper="Password must be at least 8 characters"
              style={styles.input}
            />

            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthSegment,
                        {
                          backgroundColor:
                            passwordStrength >= level
                              ? getPasswordStrengthColor()
                              : COLORS.gray200,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthText()}
                </Text>
              </View>
            )}

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              leftIcon={<Feather name="lock" size={20} color={COLORS.gray500} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              }
              style={styles.input}
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="large"
              style={styles.resetButton}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  content: {
    flex: 1,
  },
  backButton: {
    padding: SPACING.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  alert: {
    marginBottom: SPACING.md,
  },
  form: {
    marginTop: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  strengthBar: {
    flexDirection: 'row',
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  strengthSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  strengthText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  resetButton: {
    marginTop: SPACING.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  successButton: {
    minWidth: 200,
  },
});

export default ResetPasswordScreen;