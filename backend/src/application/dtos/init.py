# ============================================================================
# Parking Management System - DTO Package
# ============================================================================

"""
Data Transfer Objects (DTOs) Package.

This package contains all Data Transfer Objects used for:
- API request/response validation
- Data serialization/deserialization
- Inter-service communication
- Domain model projection
"""

# ============================================================================
# Parking DTOs
# ============================================================================

from src.dtos.parking_dto import (
    # Request DTOs
    ParkingLotCreateRequest,
    ParkingLotUpdateRequest,
    ParkVehicleRequest,
    RemoveVehicleRequest,
    ParkingSearchRequest,
    ParkingFilterRequest,
    
    # Response DTOs
    ParkingLotResponse,
    ParkingSlotResponse,
    ParkingTicketResponse,
    ParkingStatusResponse,
    ParkingSearchResponse,
    ParkingAnalyticsResponse,
)

# ============================================================================
# Vehicle DTOs
# ============================================================================

from src.dtos.vehicle_dto import (
    # Request DTOs
    VehicleCreateRequest,
    VehicleUpdateRequest,
    VehicleSearchRequest,
    VehicleValidateRequest,
    
    # Response DTOs
    VehicleResponse,
    VehicleHistoryResponse,
    VehicleValidationResponse,
    VehicleStatisticsResponse,
)

# ============================================================================
# Charging DTOs
# ============================================================================

from src.dtos.charging_dto import (
    # Request DTOs
    ChargingStationCreateRequest,
    ChargingStationUpdateRequest,
    StartChargingRequest,
    StopChargingRequest,
    ChargingSessionSearchRequest,
    
    # Response DTOs
    ChargingStationResponse,
    ChargingSessionResponse,
    ChargingStatusResponse,
    ChargingAnalyticsResponse,
    ChargingReportResponse,
)

# ============================================================================
# User DTOs
# ============================================================================

from src.dtos.user_dto import (
    # Request DTOs
    UserCreateRequest,
    UserUpdateRequest,
    UserLoginRequest,
    UserRegisterRequest,
    UserChangePasswordRequest,
    UserResetPasswordRequest,
    
    # Response DTOs
    UserResponse,
    UserProfileResponse,
    UserAuthResponse,
    UserPreferencesResponse,
)

# ============================================================================
# Payment DTOs
# ============================================================================

from src.dtos.payment_dto import (
    # Request DTOs
    PaymentCreateRequest,
    PaymentIntentRequest,
    PaymentConfirmRequest,
    PaymentRefundRequest,
    PaymentMethodRequest,
    
    # Response DTOs
    PaymentResponse,
    PaymentIntentResponse,
    PaymentHistoryResponse,
    PaymentMethodResponse,
    PaymentSummaryResponse,
)

# ============================================================================
# Notification DTOs
# ============================================================================

from src.dtos.notification_dto import (
    # Request DTOs
    NotificationCreateRequest,
    NotificationSendRequest,
    NotificationPreferencesRequest,
    BulkNotificationRequest,
    
    # Response DTOs
    NotificationResponse,
    NotificationPreferencesResponse,
    NotificationSummaryResponse,
)

# ============================================================================
# Common DTOs
# ============================================================================

from src.dtos.common_dto import (
    # Base DTOs
    BaseDTO,
    BaseResponse,
    BaseRequest,
    
    # Pagination
    PaginatedRequest,
    PaginatedResponse,
    
    # Filtering
    FilterRequest,
    SortRequest,
    
    # Common Types
    AddressDTO,
    LocationDTO,
    MoneyDTO,
    TimeRangeDTO,
    DateRangeDTO,
    
    # Responses
    ErrorResponse,
    SuccessResponse,
    HealthResponse,
    StatusResponse,
)

# ============================================================================
# Webhook DTOs
# ============================================================================

from src.dtos.webhook_dto import (
    # Request DTOs
    WebhookCreateRequest,
    WebhookUpdateRequest,
    WebhookTriggerRequest,
    
    # Response DTOs
    WebhookResponse,
    WebhookEventResponse,
    WebhookDeliveryResponse,
)

# ============================================================================
# Reporting DTOs
# ============================================================================

from src.dtos.reporting_dto import (
    # Request DTOs
    ReportGenerateRequest,
    ReportFilterRequest,
    ReportExportRequest,
    
    # Response DTOs
    ReportResponse,
    ReportDataResponse,
    ReportExportResponse,
    DashboardStatsResponse,
)

# ============================================================================
# DTO Factory
# ============================================================================

class DTOFactory:
    """
    Factory for creating DTO instances.
    
    This factory provides methods for creating and transforming DTOs
    from domain models and vice versa.
    """
    
    @staticmethod
    def create_parking_lot_response(parking_lot) -> ParkingLotResponse:
        """
        Create a parking lot response DTO from domain model.
        
        Args:
            parking_lot: Domain model
            
        Returns:
            ParkingLotResponse: Response DTO
        """
        return ParkingLotResponse.from_entity(parking_lot)
    
    @staticmethod
    def create_vehicle_response(vehicle) -> VehicleResponse:
        """
        Create a vehicle response DTO from domain model.
        
        Args:
            vehicle: Domain model
            
        Returns:
            VehicleResponse: Response DTO
        """
        return VehicleResponse.from_entity(vehicle)
    
    @staticmethod
    def create_charging_session_response(session) -> ChargingSessionResponse:
        """
        Create a charging session response DTO from domain model.
        
        Args:
            session: Domain model
            
        Returns:
            ChargingSessionResponse: Response DTO
        """
        return ChargingSessionResponse.from_entity(session)
    
    @staticmethod
    def create_user_response(user) -> UserResponse:
        """
        Create a user response DTO from domain model.
        
        Args:
            user: Domain model
            
        Returns:
            UserResponse: Response DTO
        """
        return UserResponse.from_entity(user)
    
    @staticmethod
    def to_dict(dto):
        """
        Convert DTO to dictionary.
        
        Args:
            dto: DTO instance
            
        Returns:
            dict: Dictionary representation
        """
        if hasattr(dto, 'to_dict'):
            return dto.to_dict()
        return dto.__dict__
    
    @staticmethod
    def from_dict(dto_class, data: dict):
        """
        Create DTO from dictionary.
        
        Args:
            dto_class: DTO class
            data: Dictionary data
            
        Returns:
            dto_class: DTO instance
        """
        if hasattr(dto_class, 'from_dict'):
            return dto_class.from_dict(data)
        return dto_class(**data)


# ============================================================================
# DTO Validators
# ============================================================================

class DTOValidator:
    """
    Validator for DTOs.
    
    Provides validation methods for common DTO fields.
    """
    
    @staticmethod
    def validate_license_plate(plate: str) -> bool:
        """
        Validate license plate format.
        
        Args:
            plate: License plate
            
        Returns:
            bool: True if valid
        """
        import re
        pattern = r'^[A-Z0-9\-]{3,10}$'
        return bool(re.match(pattern, plate.upper().strip()))
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate email format.
        
        Args:
            email: Email address
            
        Returns:
            bool: True if valid
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """
        Validate phone number format.
        
        Args:
            phone: Phone number
            
        Returns:
            bool: True if valid
        """
        import re
        pattern = r'^\+?[1-9]\d{1,14}$'
        return bool(re.match(pattern, phone))
    
    @staticmethod
    def validate_year(year: int) -> bool:
        """
        Validate year.
        
        Args:
            year: Year
            
        Returns:
            bool: True if valid
        """
        from datetime import datetime
        return 1900 <= year <= datetime.now().year + 1
    
    @staticmethod
    def validate_money(amount: float) -> bool:
        """
        Validate money amount.
        
        Args:
            amount: Amount
            
        Returns:
            bool: True if valid
        """
        return amount >= 0
    
    @staticmethod
    def validate_uuid(value: str) -> bool:
        """
        Validate UUID format.
        
        Args:
            value: UUID string
            
        Returns:
            bool: True if valid
        """
        try:
            from uuid import UUID
            UUID(value)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_date_range(start_date, end_date) -> bool:
        """
        Validate date range.
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            bool: True if valid
        """
        if start_date and end_date:
            return start_date <= end_date
        return True
    
    @staticmethod
    def validate_pagination(page: int, limit: int) -> bool:
        """
        Validate pagination parameters.
        
        Args:
            page: Page number
            limit: Items per page
            
        Returns:
            bool: True if valid
        """
        return page >= 1 and 1 <= limit <= 100


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Parking DTOs
    "ParkingLotCreateRequest",
    "ParkingLotUpdateRequest",
    "ParkVehicleRequest",
    "RemoveVehicleRequest",
    "ParkingSearchRequest",
    "ParkingFilterRequest",
    "ParkingLotResponse",
    "ParkingSlotResponse",
    "ParkingTicketResponse",
    "ParkingStatusResponse",
    "ParkingSearchResponse",
    "ParkingAnalyticsResponse",
    
    # Vehicle DTOs
    "VehicleCreateRequest",
    "VehicleUpdateRequest",
    "VehicleSearchRequest",
    "VehicleValidateRequest",
    "VehicleResponse",
    "VehicleHistoryResponse",
    "VehicleValidationResponse",
    "VehicleStatisticsResponse",
    
    # Charging DTOs
    "ChargingStationCreateRequest",
    "ChargingStationUpdateRequest",
    "StartChargingRequest",
    "StopChargingRequest",
    "ChargingSessionSearchRequest",
    "ChargingStationResponse",
    "ChargingSessionResponse",
    "ChargingStatusResponse",
    "ChargingAnalyticsResponse",
    "ChargingReportResponse",
    
    # User DTOs
    "UserCreateRequest",
    "UserUpdateRequest",
    "UserLoginRequest",
    "UserRegisterRequest",
    "UserChangePasswordRequest",
    "UserResetPasswordRequest",
    "UserResponse",
    "UserProfileResponse",
    "UserAuthResponse",
    "UserPreferencesResponse",
    
    # Payment DTOs
    "PaymentCreateRequest",
    "PaymentIntentRequest",
    "PaymentConfirmRequest",
    "PaymentRefundRequest",
    "PaymentMethodRequest",
    "PaymentResponse",
    "PaymentIntentResponse",
    "PaymentHistoryResponse",
    "PaymentMethodResponse",
    "PaymentSummaryResponse",
    
    # Notification DTOs
    "NotificationCreateRequest",
    "NotificationSendRequest",
    "NotificationPreferencesRequest",
    "BulkNotificationRequest",
    "NotificationResponse",
    "NotificationPreferencesResponse",
    "NotificationSummaryResponse",
    
    # Common DTOs
    "BaseDTO",
    "BaseResponse",
    "BaseRequest",
    "PaginatedRequest",
    "PaginatedResponse",
    "FilterRequest",
    "SortRequest",
    "AddressDTO",
    "LocationDTO",
    "MoneyDTO",
    "TimeRangeDTO",
    "DateRangeDTO",
    "ErrorResponse",
    "SuccessResponse",
    "HealthResponse",
    "StatusResponse",
    
    # Webhook DTOs
    "WebhookCreateRequest",
    "WebhookUpdateRequest",
    "WebhookTriggerRequest",
    "WebhookResponse",
    "WebhookEventResponse",
    "WebhookDeliveryResponse",
    
    # Reporting DTOs
    "ReportGenerateRequest",
    "ReportFilterRequest",
    "ReportExportRequest",
    "ReportResponse",
    "ReportDataResponse",
    "ReportExportResponse",
    "DashboardStatsResponse",
    
    # Factory and Validator
    "DTOFactory",
    "DTOValidator",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"