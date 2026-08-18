// ============================================================================
// AuthStack Types - Type Definitions
// ============================================================================

// parking-management-system/mobile/src/navigation/types/authStack.ts

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ROUTES } from '../../constants/routes';

/**
 * Auth Stack Param List
 */
export type AuthStackParamList = {
  // Onboarding
  [ROUTES.ONBOARDING.WELCOME]: undefined;
  [ROUTES.ONBOARDING.STEPS]: { step?: number } | undefined;
  [ROUTES.ONBOARDING.COMPLETE]: undefined;

  // Authentication
  [ROUTES.AUTH.LOGIN]: { 
    redirectTo?: string; 
    email?: string;
    from?: string;
  } | undefined;
  
  [ROUTES.AUTH.REGISTER]: { 
    email?: string; 
    referralCode?: string;
    from?: string;
  } | undefined;
  
  [ROUTES.AUTH.FORGOT_PASSWORD]: { 
    email?: string;
  } | undefined;
  
  [ROUTES.AUTH.RESET_PASSWORD]: { 
    token: string;
    email?: string;
  } | undefined;
  
  [ROUTES.AUTH.VERIFY_EMAIL]: { 
    token: string; 
    email?: string;
    from?: string;
  } | undefined;
  
  [ROUTES.AUTH.TWO_FACTOR_AUTH]: { 
    email?: string;
    method?: 'authenticator' | 'sms' | 'email';
    from?: string;
  } | undefined;
  
  [ROUTES.AUTH.SOCIAL_LOGIN]: { 
    provider: 'google' | 'apple' | 'facebook' | 'twitter';
    token?: string;
    from?: string;
  } | undefined;
};

/**
 * Auth Stack Navigation Prop
 */
export type AuthStackNavigationProp<T extends keyof AuthStackParamList> = 
  StackNavigationProp<AuthStackParamList, T>;

/**
 * Auth Stack Route Prop
 */
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = 
  RouteProp<AuthStackParamList, T>;

/**
 * Auth Screen Props
 */
export interface AuthScreenProps<T extends keyof AuthStackParamList> {
  navigation: AuthStackNavigationProp<T>;
  route: AuthStackRouteProp<T>;
}

/**
 * Auth Screen Props with No Params
 */
export type AuthScreenWithoutParams<T extends keyof AuthStackParamList> = 
  AuthScreenProps<T> & {
    route: Omit<AuthStackRouteProp<T>, 'params'> & {
      params?: undefined;
    };
  };

export default AuthStackParamList;