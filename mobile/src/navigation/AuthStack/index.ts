// ============================================================================
// AuthStack Index - Export All Auth Stack Components
// ============================================================================

// parking-management-system/mobile/src/navigation/AuthStack/index.ts

export { default as AuthStack } from './AuthStack';
export * from './types';

// Re-export screens for direct access if needed
export { default as LoginScreen } from '../../screens/auth/LoginScreen';
export { default as RegisterScreen } from '../../screens/auth/RegisterScreen';
export { default as ForgotPasswordScreen } from '../../screens/auth/ForgotPasswordScreen';
export { default as ResetPasswordScreen } from '../../screens/auth/ResetPasswordScreen';
export { default as VerifyEmailScreen } from '../../screens/auth/VerifyEmailScreen';
export { default as OnboardingScreen } from '../../screens/auth/OnboardingScreen';
export { default as TwoFactorAuthScreen } from '../../screens/auth/TwoFactorAuthScreen';
export { default as SocialLoginScreen } from '../../screens/auth/SocialLoginScreen';

export default AuthStack;