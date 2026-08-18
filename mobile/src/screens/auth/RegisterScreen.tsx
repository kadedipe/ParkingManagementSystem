// ============================================================================
// RegisterScreen - User Registration Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Auth/RegisterScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthScreenProps } from '../../navigation/types/authStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Input, Button, Alert as CustomAlert, Divider } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const navigation = useNavigation<AuthScreenProps<typeof ROUTES.AUTH.REGISTER>['navigation']>();
  const route = useRoute<AuthScreenProps<typeof ROUTES.AUTH.REGISTER>['route']>();
  const { register, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: route.params?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

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
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validate individual field
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value || value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value && value.length < 10) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    validateField(field, value);
  };

  // Handle password change with strength calculation
  const handlePasswordChange = (text: string) => {
    setFormData({ ...formData, password: text });
    
    // Calculate password strength
    let strength = 0;
    if (text.length >= 8) strength++;
    if (/[a-z]/.test(text) && /[A-Z]/.test(text)) strength++;
    if (/\d/.test(text)) strength++;
    if (/[^a-zA-Z0-9]/.test(text)) strength++;
    setPasswordStrength(strength);

    validateField('password', text);
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return COLORS.danger;
    if (passwordStrength === 2) return COLORS.warning;
    if (passwordStrength === 3) return COLORS.info;
    return COLORS.success;
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  // Get password requirements
  const getPasswordRequirements = () => {
    const password = formData.password;
    return [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[a-z]/.test(password) && /[A-Z]/.test(password), text: 'Upper & lowercase letters' },
      { met: /\d/.test(password), text: 'At least one number' },
      { met: /[^a-zA-Z0-9]/.test(password), text: 'At least one special character' },
    ];
  };

  // Validate entire form
  const validateForm = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword'];
    let isValid = true;

    fields.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (!validateField(field, value)) {
        isValid = false;
      }
    });

    if (!agreeToTerms) {
      setGeneralError('Please agree to the Terms of Service');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }

    if (!isValid) {
      setGeneralError('Please fix all errors before continuing');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }

    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigation is handled by the auth flow
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setGeneralError('Registration failed. Please try again.');
      }
    } catch (error: any) {
      setGeneralError(error.message || 'Registration failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social registration
  const handleSocialRegister = async (provider: string) => {
    setIsSubmitting(true);
    setGeneralError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      navigation.navigate(ROUTES.AUTH.SOCIAL_LOGIN, { provider, from: 'register' });
    } catch (error: any) {
      setGeneralError(`Failed to register with ${provider}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle navigation back to login
  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.AUTH.LOGIN, { email: formData.email });
  };

  // Handle terms press
  const handleTermsPress = () => {
    // Navigate to terms screen
  };

  // Handle privacy press
  const handlePrivacyPress = () => {
    // Navigate to privacy screen
  };

  // Render loading overlay
  const renderLoadingOverlay = () => {
    if (!isSubmitting) return null;
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Creating your account...</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -64 : 0}
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
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <Image
                source={require('../../assets/images/logos/logo-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={[styles.title, { color: colors.text }]}>
              Create Account 🚀
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join us for hassle-free parking
            </Text>
          </View>

          {/* General Error Alert */}
          {generalError && (
            <CustomAlert
              type="error"
              message={generalError}
              onClose={() => setGeneralError('')}
              style={styles.alert}
            />
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => handleFieldChange('name', text)}
              leftIcon={<Feather name="user" size={20} color={COLORS.gray500} />}
              required
              error={errors.name}
              style={styles.input}
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Feather name="mail" size={20} color={COLORS.gray500} />}
              required
              error={errors.email}
              style={styles.input}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => handleFieldChange('phone', text)}
              keyboardType="phone-pad"
              leftIcon={<Feather name="phone" size={20} color={COLORS.gray500} />}
              error={errors.phone}
              style={styles.input}
            />

            {/* Password with strength indicator */}
            <View>
              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
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
                required
                error={errors.password}
                style={styles.input}
              />
              
              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
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
                  <View style={styles.strengthInfo}>
                    <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Password Requirements */}
              {formData.password.length > 0 && (
                <View style={styles.requirementsContainer}>
                  {getPasswordRequirements().map((req, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <Feather
                        name={req.met ? 'check-circle' : 'circle'}
                        size={14}
                        color={req.met ? COLORS.success : COLORS.gray400}
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          {
                            color: req.met ? COLORS.success : COLORS.gray500,
                            textDecorationLine: req.met ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {req.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleFieldChange('confirmPassword', text)}
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
              required
              error={errors.confirmPassword}
              style={styles.input}
            />
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Feather name="check" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              I agree to the{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]} onPress={handleTermsPress}>
                Terms of Service
              </Text>
              {' and '}
              <Text style={[styles.termsLink, { color: colors.primary }]} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Register Button */}
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading || isSubmitting}
            variant="primary"
            size="large"
            style={styles.registerButton}
          />

          <Divider text="OR" style={styles.divider} />

          {/* Social Registration */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialRegister('google')}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/images/social/google.png')}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={() => handleSocialRegister('apple')}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Feather name="apple" size={20} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text style={[styles.loginText, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 2.0.0
          </Text>
        </Animated.View>
      </ScrollView>

      {renderLoadingOverlay()}
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
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 80,
    height: 80,
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
    textAlign: 'center',
  },
  alert: {
    marginBottom: SPACING.md,
  },
  form: {
    marginBottom: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.md,
  },
  passwordStrengthContainer: {
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: COLORS.gray200,
  },
  strengthSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  strengthInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  strengthText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  requirementsContainer: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  requirementText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginLeft: SPACING.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  checkbox: {
    marginRight: SPACING.sm,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  registerButton: {
    marginTop: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    maxWidth: 150,
    height: 48,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: SPACING.sm,
  },
  socialButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});

export default RegisterScreen;