// ============================================================================
// MainStack Index - Export All Main Stack Components
// ============================================================================

// parking-management-system/mobile/src/navigation/MainStack/index.ts

export { default as MainStack } from './MainStack';
export { default as MainTabs } from './MainTabs';
export * from './types';

// Re-export screens for direct access if needed
export { default as HomeScreen } from '../../screens/main/HomeScreen';
export { default as ParkingScreen } from '../../screens/main/ParkingScreen';
export { default as ChargingScreen } from '../../screens/main/ChargingScreen';
export { default as BookingsScreen } from '../../screens/main/BookingsScreen';
export { default as ProfileScreen } from '../../screens/main/ProfileScreen';

// Parking Screens
export { default as ParkingDetailsScreen } from '../../screens/parking/ParkingDetailsScreen';
export { default as ParkingMapScreen } from '../../screens/parking/ParkingMapScreen';
export { default as ParkingSpotSelectorScreen } from '../../screens/parking/ParkingSpotSelectorScreen';
export { default as ParkingReviewsScreen } from '../../screens/parking/ParkingReviewsScreen';
export { default as AddParkingReviewScreen } from '../../screens/parking/AddParkingReviewScreen';

// Charging Screens
export { default as ChargingDetailsScreen } from '../../screens/charging/ChargingDetailsScreen';
export { default as ChargingSessionScreen } from '../../screens/charging/ChargingSessionScreen';
export { default as ChargingHistoryScreen } from '../../screens/charging/ChargingHistoryScreen';
export { default as ChargingReservationScreen } from '../../screens/charging/ChargingReservationScreen';

// Booking Screens
export { default as BookingDetailsScreen } from '../../screens/booking/BookingDetailsScreen';
export { default as CreateBookingScreen } from '../../screens/booking/CreateBookingScreen';
export { default as ConfirmBookingScreen } from '../../screens/booking/ConfirmBookingScreen';
export { default as BookingQRCodeScreen } from '../../screens/booking/BookingQRCodeScreen';

// Payment Screens
export { default as PaymentMethodsScreen } from '../../screens/payment/PaymentMethodsScreen';
export { default as ProcessPaymentScreen } from '../../screens/payment/ProcessPaymentScreen';
export { default as PaymentHistoryScreen } from '../../screens/payment/PaymentHistoryScreen';
export { default as PaymentReceiptScreen } from '../../screens/payment/PaymentReceiptScreen';
export { default as WalletScreen } from '../../screens/payment/WalletScreen';

// Profile Screens
export { default as EditProfileScreen } from '../../screens/profile/EditProfileScreen';
export { default as ProfileVehiclesScreen } from '../../screens/profile/ProfileVehiclesScreen';
export { default as AddVehicleScreen } from '../../screens/profile/AddVehicleScreen';
export { default as SettingsScreen } from '../../screens/profile/SettingsScreen';
export { default as ChangePasswordScreen } from '../../screens/profile/ChangePasswordScreen';
export { default as NotificationSettingsScreen } from '../../screens/profile/NotificationSettingsScreen';
export { default as LoyaltyScreen } from '../../screens/profile/LoyaltyScreen';

// Notification Screens
export { default as NotificationListScreen } from '../../screens/notification/NotificationListScreen';
export { default as NotificationDetailsScreen } from '../../screens/notification/NotificationDetailsScreen';

export default MainStack;