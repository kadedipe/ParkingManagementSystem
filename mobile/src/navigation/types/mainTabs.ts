// ============================================================================
// MainTabs Types - Type Definitions
// ============================================================================

// parking-management-system/mobile/src/navigation/types/mainTabs.ts

import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ROUTES } from '../../constants/routes';

/**
 * Main Tab Param List
 */
export type MainTabParamList = {
  [ROUTES.APP.HOME]: undefined;
  [ROUTES.APP.PARKING]: undefined;
  [ROUTES.APP.CHARGING]: undefined;
  [ROUTES.APP.BOOKINGS]: undefined;
  [ROUTES.APP.PROFILE]: undefined;
};

/**
 * Main Tab Navigation Prop
 */
export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, T>;

/**
 * Main Tab Route Prop
 */
export type MainTabRouteProp<T extends keyof MainTabParamList> =
  RouteProp<MainTabParamList, T>;

/**
 * Main Tab Screen Props
 */
export interface MainTabScreenProps<T extends keyof MainTabParamList> {
  navigation: MainTabNavigationProp<T>;
  route: MainTabRouteProp<T>;
}

export default MainTabParamList;