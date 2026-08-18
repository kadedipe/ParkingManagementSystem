// ============================================================================
// LoginScreen - Authentication Login Screen
// ============================================================================

// parking-management-system/mobile/src/screens/Auth/LoginScreen.tsx

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
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthScreenProps } from '../../navigation/types/authStack';
import { ROUTES } from '../../constants/routes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { Input, Button, SocialButton, Divider, Alert as CustomAlert } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useKeyboard } from '../../hooks/useKeyboard';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<AuthScreenProps<typeof ROUTES.AUTH.LOGIN>['navigation']>();
  const route = useRoute<AuthScreenProps<typeof ROUTES.AUTH.LOGIN>['route']>();
  const { login, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const { isKeyboardVisible } = useKeyboard();

  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
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

    // Check for deep link params
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, []);

  // Handle login
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
    ]).start();

    setError('');
    const success = await login(email, password);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigation is handled by the auth flow
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: string) => {
    setIsLoadingSocial(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Social login logic
      navigation.navigate(ROUTES.AUTH.SOCIAL_LOGIN, { provider });
    } catch (err: any) {
      setError(`Failed to login with ${provider}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoadingSocial(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD, { email });
  };

  // Handle register
  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(ROUTES.AUTH.REGISTER, { email });
  };

  // Handle biometric login (mock)
  const handleBiometricLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Biometric Login',
      'Please authenticate to continue',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Authenticate', onPress: () => {
          // Simulate biometric authentication
          setTimeout(() => {
            handleLogin();
          }, 1000);
        }},
      ]
    );
  };

  // Render loading overlay
  const renderLoadingOverlay = () => {
    if (!isLoading && !isLoadingSocial) return null;
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isLoading ? 'Signing in...' : 'Redirecting...'}
          </Text>
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
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && styles.scrollContentKeyboard,
        ]}
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
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
            <Image
              source={require('../../assets/images/logos/logo-primary.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Welcome Text */}
          <View style={styles.header}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome Back! 👋
            </Text>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              Sign in to continue parking with ease
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

          {/* Biometric Login Button */}
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
          >
            <View style={styles.biometricIcon}>
              <Feather name="fingerprint" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.biometricText, { color: colors.primary }]}>
              Use Face ID / Touch ID
            </Text>
          </TouchableOpacity>

          <Divider text="OR" style={styles.divider} />

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Feather name="mail" size={20} color={COLORS.gray500} />}
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus password input
              }}
              style={styles.input}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<Feather name="lock" size={20} color={COLORS.gray500} />}
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              }
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              style={styles.input}
            />

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Feather name="check" size={12} color="#FFFFFF" />}
                </View>
                <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="large"
                style={styles.loginButton}
              />
            </Animated.View>
          </View>

          <Divider text="OR" style={styles.divider} />

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <SocialButton
              provider="google"
              onPress={() => handleSocialLogin('google')}
              title="Continue with Google"
              icon={
                <Image
                  source={require('../../assets/images/social/google.png')}
                  style={styles.socialIcon}
                />
              }
              disabled={isLoadingSocial}
              style={styles.socialButton}
            />
            <SocialButton
              provider="apple"
              onPress={() => handleSocialLogin('apple')}
              title="Continue with Apple"
              icon={
                <View style={styles.appleIcon}>
                  <Feather name="apple" size={20} color="#FFFFFF" />
                </View>
              }
              disabled={isLoadingSocial}
              style={styles.socialButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={[styles.signUpText, { color: colors.primary }]}>
                Sign Up
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
  scrollContentKeyboard: {
    paddingVertical: SPACING.md,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  alert: {
    marginBottom: SPACING.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  biometricIcon: {
    marginRight: SPACING.sm,
  },
  biometricText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  form: {
    marginBottom: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  loginButton: {
    marginTop: SPACING.xs,
  },
  socialContainer: {
    gap: SPACING.sm,
  },
  socialButton: {
    marginBottom: SPACING.xs,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  appleIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  signUpText: {
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

export default LoginScreen;