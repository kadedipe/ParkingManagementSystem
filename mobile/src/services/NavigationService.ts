// ============================================================================
// Navigation Service Usage
// ============================================================================

// parking-management-system/mobile/src/services/NavigationService.ts

import { NavigationService } from '../types/navigation.types';
import { ROUTES } from '../constants/routes';

class NavigationServiceClass implements NavigationService {
  private navigatorRef: any = null;

  setTopLevelNavigator(ref: any) {
    this.navigatorRef = ref;
  }

  navigate<T extends keyof MainStackParamList>(
    name: T,
    params?: MainStackParamList[T]
  ): void {
    if (this.navigatorRef) {
      this.navigatorRef.navigate(name as string, params);
    }
  }

  navigateToAuth<T extends keyof AuthStackParamList>(
    name: T,
    params?: AuthStackParamList[T]
  ): void {
    if (this.navigatorRef) {
      this.navigatorRef.navigate(name as string, params);
    }
  }

  goBack(): void {
    if (this.navigatorRef) {
      this.navigatorRef.goBack();
    }
  }

  resetTo<T extends keyof MainStackParamList>(
    name: T,
    params?: MainStackParamList[T]
  ): void {
    if (this.navigatorRef) {
      this.navigatorRef.reset({
        index: 0,
        routes: [{ name: name as string, params }],
      });
    }
  }

  push<T extends keyof MainStackParamList>(
    name: T,
    params?: MainStackParamList[T]
  ): void {
    if (this.navigatorRef) {
      this.navigatorRef.push(name as string, params);
    }
  }

  pop(count: number = 1): void {
    if (this.navigatorRef) {
      this.navigatorRef.pop(count);
    }
  }

  popToTop(): void {
    if (this.navigatorRef) {
      this.navigatorRef.popToTop();
    }
  }

  getCurrentRoute(): string | null {
    if (this.navigatorRef) {
      return this.navigatorRef.getCurrentRoute()?.name || null;
    }
    return null;
  }

  isMounted(): boolean {
    return !!this.navigatorRef;
  }

  // Navigation helpers
  goToParkingDetails(parkingId: string, from?: string): void {
    this.navigate(ROUTES.PARKING.DETAILS, { parkingId, from });
  }

  goToBookingDetails(bookingId: string, from?: string): void {
    this.navigate(ROUTES.BOOKING.DETAILS, { bookingId, from });
  }

  goToPayment(amount: number, bookingId: string): void {
    this.navigate(ROUTES.PAYMENT.PROCESS, { amount, bookingId });
  }

  goToChargingSession(sessionId: string): void {
    this.navigate(ROUTES.CHARGING.SESSION, { sessionId });
  }

  goToEditProfile(from?: string): void {
    this.navigate(ROUTES.PROFILE.EDIT, { from });
  }

  goToProfileVehicles(
    selectMode: boolean = false,
    onSelect?: (vehicle: any) => void
  ): void {
    this.navigate(ROUTES.PROFILE.VEHICLES, { selectMode, onSelect });
  }

  goToSettings(): void {
    this.navigate(ROUTES.PROFILE.SETTINGS);
  }

  goToNotifications(filter?: string): void {
    this.navigate(ROUTES.NOTIFICATION.LIST, { filter });
  }

  goToLogin(redirectTo?: string): void {
    this.navigateToAuth(ROUTES.AUTH.LOGIN, { redirectTo });
  }

  goToHome(tab?: string): void {
    this.navigate(ROUTES.APP.HOME, { tab });
  }

  goToParking(search?: string): void {
    this.navigate(ROUTES.APP.PARKING, { search });
  }

  goToCharging(stationId?: string): void {
    this.navigate(ROUTES.APP.CHARGING, { stationId });
  }

  goToBookings(filter?: string): void {
    this.navigate(ROUTES.APP.BOOKINGS, { filter });
  }

  goToProfile(userId?: string): void {
    this.navigate(ROUTES.APP.PROFILE, { userId });
  }
}

export const NavigationService = new NavigationServiceClass();