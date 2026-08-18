// ============================================================================
// Navigation Service - Centralized Navigation Management
// ============================================================================

// parking-management-system/mobile/src/navigation/NavigationService.ts

import { NavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';
import { RootStackParamList } from './types';

class NavigationServiceClass {
  private navigatorRef: NavigationContainerRef<RootStackParamList> | null = null;

  /**
   * Set the top-level navigator reference
   */
  setTopLevelNavigator(ref: NavigationContainerRef<RootStackParamList> | null) {
    this.navigatorRef = ref;
  }

  /**
   * Navigate to a route
   */
  navigate<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) {
    if (this.navigatorRef) {
      // @ts-ignore - TypeScript can't infer the params properly here
      this.navigatorRef.navigate(name, params);
    }
  }

  /**
   * Go back to previous screen
   */
  goBack() {
    if (this.navigatorRef) {
      this.navigatorRef.dispatch(CommonActions.goBack());
    }
  }

  /**
   * Reset navigation to a specific route
   */
  resetTo<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) {
    if (this.navigatorRef) {
      this.navigatorRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: name as string, params }],
        })
      );
    }
  }

  /**
   * Push a new screen onto the stack
   */
  push<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) {
    if (this.navigatorRef) {
      this.navigatorRef.dispatch(StackActions.push(name as string, params));
    }
  }

  /**
   * Pop screens from the stack
   */
  pop(count: number = 1) {
    if (this.navigatorRef) {
      this.navigatorRef.dispatch(StackActions.pop(count));
    }
  }

  /**
   * Pop to the top of the stack
   */
  popToTop() {
    if (this.navigatorRef) {
      this.navigatorRef.dispatch(StackActions.popToTop());
    }
  }

  /**
   * Get current route name
   */
  getCurrentRoute() {
    if (this.navigatorRef) {
      return this.navigatorRef.getCurrentRoute();
    }
    return null;
  }

  /**
   * Check if navigator is mounted
   */
  isMounted() {
    return !!this.navigatorRef;
  }

  /**
   * Navigate to parking details
   */
  goToParkingDetails(parkingId: string, from?: string) {
    this.navigate('ParkingDetails', { parkingId, from });
  }

  /**
   * Navigate to booking details
   */
  goToBookingDetails(bookingId: string) {
    this.navigate('BookingDetails', { bookingId });
  }

  /**
   * Navigate to payment processing
   */
  goToPayment(amount: number, bookingId: string) {
    this.navigate('ProcessPayment', { amount, bookingId });
  }

  /**
   * Navigate to charging session
   */
  goToChargingSession(sessionId: string) {
    this.navigate('ChargingSession', { sessionId });
  }

  /**
   * Navigate to edit profile
   */
  goToEditProfile() {
    this.navigate('EditProfile');
  }

  /**
   * Navigate to profile vehicles
   */
  goToProfileVehicles() {
    this.navigate('ProfileVehicles');
  }

  /**
   * Navigate to settings
   */
  goToSettings() {
    this.navigate('Settings');
  }

  /**
   * Navigate to notifications
   */
  goToNotifications() {
    this.navigate('NotificationList');
  }

  /**
   * Navigate to login
   */
  goToLogin() {
    this.resetTo('Login');
  }

  /**
   * Navigate to home
   */
  goToHome() {
    this.resetTo('MainTabs');
  }
}

// Export singleton instance
export const NavigationService = new NavigationServiceClass();

export default NavigationService;