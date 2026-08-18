// ============================================================================
// AuthStack - Authentication Stack Navigator
// ============================================================================

// parking-management-system/mobile/src/navigation/AuthStack.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/colors';
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyEmailScreen,
  TwoFactorAuthScreen,
  SocialLoginScreen,
  OnboardingScreen,
} from '../screens/Auth';

// Auth Screens
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import TwoFactorAuthScreen from '../screens/auth/TwoFactorAuthScreen';
import SocialLoginScreen from '../screens/auth/SocialLoginScreen';

// Types
import { AuthStackParamList } from './types';

// Create stack navigator
const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Auth Stack Navigator - Handles all authentication flows
 */
export const AuthStack = () => {
  const { colors, isDark } = useTheme();

  // Screen options
  const screenOptions = {
    headerShown: false,
    gestureEnabled: true,
    cardStyle: {
      backgroundColor: colors.background,
    },
    ...Platform.select({
      ios: {
        ...TransitionPresets.SlideFromRightIOS,
      },
      android: {
        ...TransitionPresets.FadeFromBottomAndroid,
      },
    }),
  };

  // Modal screen options
  const modalScreenOptions = {
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: colors.primary,
    headerStyle: {
      backgroundColor: colors.background,
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTitleStyle: {
      fontWeight: '600',
    },
    cardStyle: {
      backgroundColor: colors.background,
    },
    presentation: 'modal' as const,
    ...TransitionPresets.ModalSlideFromBottomIOS,
  };

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.ONBOARDING.WELCOME}
      screenOptions={screenOptions}
    >
      {/* Onboarding */}
      <Stack.Screen
        name={ROUTES.ONBOARDING.WELCOME}
        component={OnboardingScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Authentication */}
      <Stack.Screen
        name={ROUTES.AUTH.LOGIN}
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={ROUTES.AUTH.REGISTER}
        component={RegisterScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={ROUTES.AUTH.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={ROUTES.AUTH.RESET_PASSWORD}
        component={ResetPasswordScreen}
        options={modalScreenOptions}
      />

      <Stack.Screen
        name={ROUTES.AUTH.VERIFY_EMAIL}
        component={VerifyEmailScreen}
        options={modalScreenOptions}
      />

      <Stack.Screen
        name={ROUTES.AUTH.TWO_FACTOR_AUTH}
        component={TwoFactorAuthScreen}
        options={modalScreenOptions}
      />

      <Stack.Screen
        name={ROUTES.AUTH.SOCIAL_LOGIN}
        component={SocialLoginScreen}
        options={modalScreenOptions}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;