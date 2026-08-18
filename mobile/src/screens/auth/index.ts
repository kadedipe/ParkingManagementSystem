// ============================================================================
// Auth Screens Index - Export All Auth Screens
// ============================================================================

// parking-management-system/mobile/src/screens/Auth/index.ts

export { default as LoginScreen } from './LoginScreen';
export { default as RegisterScreen } from './RegisterScreen';
export { default as ForgotPasswordScreen } from './ForgotPasswordScreen';
export { default as ResetPasswordScreen } from './ResetPasswordScreen';
export { default as VerifyEmailScreen } from './VerifyEmailScreen';
export { default as TwoFactorAuthScreen } from './TwoFactorAuthScreen';
export { default as SocialLoginScreen } from './SocialLoginScreen';
export { default as OnboardingScreen } from './OnboardingScreen';
export { default as WelcomeScreen } from './WelcomeScreen';

// Export types
export type { LoginScreenProps } from './LoginScreen';
export type { RegisterScreenProps } from './RegisterScreen';

export default {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyEmailScreen,
  TwoFactorAuthScreen,
  SocialLoginScreen,
  OnboardingScreen,
  WelcomeScreen,
};