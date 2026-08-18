# ============================================================================
# Parking Management System - Use Cases Package
# ============================================================================

"""
Use Cases Package - Application Business Logic.

This package contains all use cases (business logic) organized by domain area.
Use cases represent specific business operations that the system can perform.

Each use case:
- Implements a single business operation
- Orchestrates domain entities and services
- Handles transactions and persistence
- Publishes domain events
- Returns DTOs to the caller
"""

# ============================================================================
# Parking Use Cases
# ============================================================================

from src.application.use_cases.parking.create_parking_lot import CreateParkingLotUseCase
from src.application.use_cases.parking.update_parking_lot import UpdateParkingLotUseCase
from src.application.use_cases.parking.delete_parking_lot import DeleteParkingLotUseCase
from src.application.use_cases.parking.get_parking_lot import GetParkingLotUseCase
from src.application.use_cases.parking.get_all_parking_lots import GetAllParkingLotsUseCase
from src.application.use_cases.parking.park_vehicle import ParkVehicleUseCase
from src.application.use_cases.parking.remove_vehicle import RemoveVehicleUseCase
from src.application.use_cases.parking.get_lot_status import GetLotStatusUseCase
from src.application.use_cases.parking.get_parking_tickets import GetParkingTicketsUseCase
from src.application.use_cases.parking.get_revenue_report import GetRevenueReportUseCase
from src.application.use_cases.parking.search_parking import SearchParkingUseCase

# ============================================================================
# Vehicle Use Cases
# ============================================================================

from src.application.use_cases.vehicle.register_vehicle import RegisterVehicleUseCase
from src.application.use_cases.vehicle.update_vehicle import UpdateVehicleUseCase
from src.application.use_cases.vehicle.delete_vehicle import DeleteVehicleUseCase
from src.application.use_cases.vehicle.get_vehicle import GetVehicleUseCase
from src.application.use_cases.vehicle.get_vehicle_by_plate import GetVehicleByPlateUseCase
from src.application.use_cases.vehicle.get_all_vehicles import GetAllVehiclesUseCase
from src.application.use_cases.vehicle.search_vehicles import SearchVehiclesUseCase
from src.application.use_cases.vehicle.get_vehicle_history import GetVehicleHistoryUseCase
from src.application.use_cases.vehicle.validate_vehicle import ValidateVehicleUseCase
from src.application.use_cases.vehicle.bulk_register_vehicles import BulkRegisterVehiclesUseCase

# ============================================================================
# Charging Use Cases
# ============================================================================

from src.application.use_cases.charging.create_charging_station import CreateChargingStationUseCase
from src.application.use_cases.charging.update_charging_station import UpdateChargingStationUseCase
from src.application.use_cases.charging.delete_charging_station import DeleteChargingStationUseCase
from src.application.use_cases.charging.get_charging_station import GetChargingStationUseCase
from src.application.use_cases.charging.get_all_charging_stations import GetAllChargingStationsUseCase
from src.application.use_cases.charging.start_charging import StartChargingUseCase
from src.application.use_cases.charging.stop_charging import StopChargingUseCase
from src.application.use_cases.charging.get_charging_session import GetChargingSessionUseCase
from src.application.use_cases.charging.get_active_sessions import GetActiveSessionsUseCase
from src.application.use_cases.charging.get_station_status import GetStationStatusUseCase
from src.application.use_cases.charging.get_station_analytics import GetStationAnalyticsUseCase
from src.application.use_cases.charging.generate_charging_report import GenerateChargingReportUseCase

# ============================================================================
# User Use Cases
# ============================================================================

from src.application.use_cases.user.register_user import RegisterUserUseCase
from src.application.use_cases.user.login_user import LoginUserUseCase
from src.application.use_cases.user.logout_user import LogoutUserUseCase
from src.application.use_cases.user.refresh_token import RefreshTokenUseCase
from src.application.use_cases.user.get_user_profile import GetUserProfileUseCase
from src.application.use_cases.user.update_user_profile import UpdateUserProfileUseCase
from src.application.use_cases.user.change_password import ChangePasswordUseCase
from src.application.use_cases.user.reset_password import ResetPasswordUseCase
from src.application.use_cases.user.forgot_password import ForgotPasswordUseCase
from src.application.use_cases.user.verify_email import VerifyEmailUseCase
from src.application.use_cases.user.delete_user import DeleteUserUseCase
from src.application.use_cases.user.get_user_preferences import GetUserPreferencesUseCase
from src.application.use_cases.user.update_user_preferences import UpdateUserPreferencesUseCase

# ============================================================================
# Payment Use Cases
# ============================================================================

from src.application.use_cases.payment.create_payment_intent import CreatePaymentIntentUseCase
from src.application.use_cases.payment.confirm_payment import ConfirmPaymentUseCase
from src.application.use_cases.payment.process_refund import ProcessRefundUseCase
from src.application.use_cases.payment.get_payment import GetPaymentUseCase
from src.application.use_cases.payment.get_payment_history import GetPaymentHistoryUseCase
from src.application.use_cases.payment.get_payment_methods import GetPaymentMethodsUseCase
from src.application.use_cases.payment.save_payment_method import SavePaymentMethodUseCase
from src.application.use_cases.payment.remove_payment_method import RemovePaymentMethodUseCase
from src.application.use_cases.payment.process_webhook import ProcessWebhookUseCase

# ============================================================================
# Notification Use Cases
# ============================================================================

from src.application.use_cases.notification.send_notification import SendNotificationUseCase
from src.application.use_cases.notification.send_bulk_notification import SendBulkNotificationUseCase
from src.application.use_cases.notification.get_notification import GetNotificationUseCase
from src.application.use_cases.notification.get_user_notifications import GetUserNotificationsUseCase
from src.application.use_cases.notification.mark_notification_read import MarkNotificationReadUseCase
from src.application.use_cases.notification.mark_all_notifications_read import MarkAllNotificationsReadUseCase
from src.application.use_cases.notification.delete_notification import DeleteNotificationUseCase
from src.application.use_cases.notification.delete_all_notifications import DeleteAllNotificationsUseCase
from src.application.use_cases.notification.get_notification_preferences import GetNotificationPreferencesUseCase
from src.application.use_cases.notification.update_notification_preferences import UpdateNotificationPreferencesUseCase
from src.application.use_cases.notification.register_push_token import RegisterPushTokenUseCase
from src.application.use_cases.notification.unregister_push_token import UnregisterPushTokenUseCase

# ============================================================================
# Use Case Factory
# ============================================================================

class UseCaseFactory:
    """
    Factory for creating use case instances.
    
    This factory centralizes use case creation with dependency injection.
    """
    
    def __init__(self, container):
        """
        Initialize the use case factory.
        
        Args:
            container: Dependency injection container
        """
        self.container = container
    
    # ===== Parking Use Cases =====
    
    def get_create_parking_lot_use_case(self) -> CreateParkingLotUseCase:
        """Get create parking lot use case."""
        return self.container.get(CreateParkingLotUseCase)
    
    def get_park_vehicle_use_case(self) -> ParkVehicleUseCase:
        """Get park vehicle use case."""
        return self.container.get(ParkVehicleUseCase)
    
    def get_remove_vehicle_use_case(self) -> RemoveVehicleUseCase:
        """Get remove vehicle use case."""
        return self.container.get(RemoveVehicleUseCase)
    
    def get_get_lot_status_use_case(self) -> GetLotStatusUseCase:
        """Get lot status use case."""
        return self.container.get(GetLotStatusUseCase)
    
    # ===== Vehicle Use Cases =====
    
    def get_register_vehicle_use_case(self) -> RegisterVehicleUseCase:
        """Get register vehicle use case."""
        return self.container.get(RegisterVehicleUseCase)
    
    def get_validate_vehicle_use_case(self) -> ValidateVehicleUseCase:
        """Get validate vehicle use case."""
        return self.container.get(ValidateVehicleUseCase)
    
    # ===== Charging Use Cases =====
    
    def get_start_charging_use_case(self) -> StartChargingUseCase:
        """Get start charging use case."""
        return self.container.get(StartChargingUseCase)
    
    def get_stop_charging_use_case(self) -> StopChargingUseCase:
        """Get stop charging use case."""
        return self.container.get(StopChargingUseCase)
    
    def get_get_station_status_use_case(self) -> GetStationStatusUseCase:
        """Get station status use case."""
        return self.container.get(GetStationStatusUseCase)
    
    # ===== User Use Cases =====
    
    def get_register_user_use_case(self) -> RegisterUserUseCase:
        """Get register user use case."""
        return self.container.get(RegisterUserUseCase)
    
    def get_login_user_use_case(self) -> LoginUserUseCase:
        """Get login user use case."""
        return self.container.get(LoginUserUseCase)
    
    def get_refresh_token_use_case(self) -> RefreshTokenUseCase:
        """Get refresh token use case."""
        return self.container.get(RefreshTokenUseCase)
    
    # ===== Payment Use Cases =====
    
    def get_create_payment_intent_use_case(self) -> CreatePaymentIntentUseCase:
        """Get create payment intent use case."""
        return self.container.get(CreatePaymentIntentUseCase)
    
    def get_confirm_payment_use_case(self) -> ConfirmPaymentUseCase:
        """Get confirm payment use case."""
        return self.container.get(ConfirmPaymentUseCase)
    
    # ===== Notification Use Cases =====
    
    def get_send_notification_use_case(self) -> SendNotificationUseCase:
        """Get send notification use case."""
        return self.container.get(SendNotificationUseCase)
    
    def get_get_user_notifications_use_case(self) -> GetUserNotificationsUseCase:
        """Get user notifications use case."""
        return self.container.get(GetUserNotificationsUseCase)


# ============================================================================
# Use Case Registry
# ============================================================================

class UseCaseRegistry:
    """
    Registry for tracking and managing use cases.
    
    Provides a central location for use case registration and discovery.
    """
    
    _use_cases = {}
    
    @classmethod
    def register(cls, name: str, use_case_class):
        """Register a use case."""
        cls._use_cases[name] = use_case_class
    
    @classmethod
    def get(cls, name: str):
        """Get a registered use case class."""
        return cls._use_cases.get(name)
    
    @classmethod
    def get_all(cls) -> dict:
        """Get all registered use cases."""
        return cls._use_cases.copy()
    
    @classmethod
    def clear(cls):
        """Clear all registered use cases."""
        cls._use_cases.clear()
    
    @classmethod
    def get_names(cls) -> list:
        """Get list of registered use case names."""
        return list(cls._use_cases.keys())
    
    @classmethod
    def get_by_category(cls, category: str) -> dict:
        """Get use cases by category."""
        return {
            name: use_case
            for name, use_case in cls._use_cases.items()
            if name.startswith(f"{category}.")
        }


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Parking Use Cases
    "CreateParkingLotUseCase",
    "UpdateParkingLotUseCase",
    "DeleteParkingLotUseCase",
    "GetParkingLotUseCase",
    "GetAllParkingLotsUseCase",
    "ParkVehicleUseCase",
    "RemoveVehicleUseCase",
    "GetLotStatusUseCase",
    "GetParkingTicketsUseCase",
    "GetRevenueReportUseCase",
    "SearchParkingUseCase",
    
    # Vehicle Use Cases
    "RegisterVehicleUseCase",
    "UpdateVehicleUseCase",
    "DeleteVehicleUseCase",
    "GetVehicleUseCase",
    "GetVehicleByPlateUseCase",
    "GetAllVehiclesUseCase",
    "SearchVehiclesUseCase",
    "GetVehicleHistoryUseCase",
    "ValidateVehicleUseCase",
    "BulkRegisterVehiclesUseCase",
    
    # Charging Use Cases
    "CreateChargingStationUseCase",
    "UpdateChargingStationUseCase",
    "DeleteChargingStationUseCase",
    "GetChargingStationUseCase",
    "GetAllChargingStationsUseCase",
    "StartChargingUseCase",
    "StopChargingUseCase",
    "GetChargingSessionUseCase",
    "GetActiveSessionsUseCase",
    "GetStationStatusUseCase",
    "GetStationAnalyticsUseCase",
    "GenerateChargingReportUseCase",
    
    # User Use Cases
    "RegisterUserUseCase",
    "LoginUserUseCase",
    "LogoutUserUseCase",
    "RefreshTokenUseCase",
    "GetUserProfileUseCase",
    "UpdateUserProfileUseCase",
    "ChangePasswordUseCase",
    "ResetPasswordUseCase",
    "ForgotPasswordUseCase",
    "VerifyEmailUseCase",
    "DeleteUserUseCase",
    "GetUserPreferencesUseCase",
    "UpdateUserPreferencesUseCase",
    
    # Payment Use Cases
    "CreatePaymentIntentUseCase",
    "ConfirmPaymentUseCase",
    "ProcessRefundUseCase",
    "GetPaymentUseCase",
    "GetPaymentHistoryUseCase",
    "GetPaymentMethodsUseCase",
    "SavePaymentMethodUseCase",
    "RemovePaymentMethodUseCase",
    "ProcessWebhookUseCase",
    
    # Notification Use Cases
    "SendNotificationUseCase",
    "SendBulkNotificationUseCase",
    "GetNotificationUseCase",
    "GetUserNotificationsUseCase",
    "MarkNotificationReadUseCase",
    "MarkAllNotificationsReadUseCase",
    "DeleteNotificationUseCase",
    "DeleteAllNotificationsUseCase",
    "GetNotificationPreferencesUseCase",
    "UpdateNotificationPreferencesUseCase",
    "RegisterPushTokenUseCase",
    "UnregisterPushTokenUseCase",
    
    # Factory and Registry
    "UseCaseFactory",
    "UseCaseRegistry",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"