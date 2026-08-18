// ============================================================================
// Navigation Types - Combined Type Exports
// ============================================================================

// parking-management-system/mobile/src/navigation/types/index.ts

export * from './authStack';
export * from './mainStack';
export * from './mainTabs';

// Combined types for convenience
import { AuthStackParamList } from './authStack';
import { MainStackParamList } from './mainStack';
import { MainTabParamList } from './mainTabs';

export type RootStackParamList = AuthStackParamList & MainStackParamList;
export type RootTabParamList = MainTabParamList;

// Navigation prop helpers
export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  import('@react-navigation/stack').StackNavigationProp<RootStackParamList, T>;

export type RootTabNavigationProp<T extends keyof RootTabParamList> =
  import('@react-navigation/bottom-tabs').BottomTabNavigationProp<RootTabParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList> =
  import('@react-navigation/native').RouteProp<RootStackParamList, T>;

export type RootTabRouteProp<T extends keyof RootTabParamList> =
  import('@react-navigation/native').RouteProp<RootTabParamList, T>;

// Screen props
export interface RootScreenProps<T extends keyof RootStackParamList> {
  navigation: RootStackNavigationProp<T>;
  route: RootStackRouteProp<T>;
}

export interface RootTabScreenProps<T extends keyof RootTabParamList> {
  navigation: RootTabNavigationProp<T>;
  route: RootTabRouteProp<T>;
}