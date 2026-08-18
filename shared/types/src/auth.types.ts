// ============================================================================
// Authentication Types - Auth Type Definitions
// ============================================================================

// parking-management-system/shared/types/src/auth.types.ts

import { User } from './user.types';

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

/**
 * Register request
 */
export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Register response
 */
export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Social login request
 */
export interface SocialLoginRequest {
  provider: 'google' | 'apple' | 'facebook' | 'twitter';
  token: string;
  email?: string;
  name?: string;
}

/**
 * Two-factor authentication request
 */
export interface TwoFactorAuthRequest {
  code: string;
}

/**
 * Two-factor authentication response
 */
export interface TwoFactorAuthResponse {
  secret: string;
  qrCode: string;
  message: string;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}