# ============================================================================
# Schemas Package
# ============================================================================

"""
Schemas package for request/response validation and serialization.

This package contains Pydantic models for all API request and response
validation, serialization, and documentation.
"""

from .auth import (
    # Authentication schemas
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutRequest,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    TokenPayload,
    JWTTokens,
)
from .user import (
    # User schemas
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse,
    UserListResponse,
    UserProfileRequest,
    UserProfileResponse,
    UserPreferencesRequest,
    UserPreferencesResponse,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
    UserSearchRequest,
)
from .vehicle import (
    # Vehicle schemas
    VehicleCreateRequest,
    VehicleUpdateRequest,
    VehicleResponse,
    VehicleListResponse,
    VehicleSearchRequest,
    VehicleDetailsResponse,
    VehicleOwnerResponse,
    VehicleTypeResponse,
    VehicleStatusResponse,
)
from .parking import (
    # Parking schemas
    ParkingSpotCreateRequest,
    ParkingSpotUpdateRequest,
    ParkingSpotResponse,
    ParkingSpotListResponse,
    ParkingSpotSearchRequest,
    ParkingSpotAvailabilityRequest,
    ParkingSpotAvailabilityResponse,
    ParkingSessionCreateRequest,
    ParkingSessionUpdateRequest,
    ParkingSessionResponse,
    ParkingSessionListResponse,
    ParkingSessionStartRequest,
    ParkingSessionEndRequest,
    ParkingRateRequest,
    ParkingRateResponse,
    ParkingReservationCreateRequest,
    ParkingReservationResponse,
    ParkingReservationListResponse,
)
from .charging import (
    # Charging schemas
    ChargingStationCreateRequest,
    ChargingStationUpdateRequest,
    ChargingStationResponse,
    ChargingStationListResponse,
    ChargingStationSearchRequest,
    ChargingStationAvailabilityRequest,
    ChargingStationAvailabilityResponse,
    ChargingSessionCreateRequest,
    ChargingSessionUpdateRequest,
    ChargingSessionResponse,
    ChargingSessionListResponse,
    ChargingSessionStartRequest,
    ChargingSessionStopRequest,
    ChargingRateRequest,
    ChargingRateResponse,
    ChargingEnergyUsageRequest,
    ChargingEnergyUsageResponse,
    ChargingConnectorTypeResponse,
    ChargingPowerResponse,
)
from .payment import (
    # Payment schemas
    PaymentCreateRequest,
    PaymentUpdateRequest,
    PaymentResponse,
    PaymentListResponse,
    PaymentStatusResponse,
    PaymentMethodCreateRequest,
    PaymentMethodResponse,
    PaymentMethodListResponse,
    PaymentRefundRequest,
    PaymentRefundResponse,
    PaymentWebhookRequest,
    PaymentWebhookResponse,
    PaymentIntentRequest,
    PaymentIntentResponse,
    PaymentConfirmationRequest,
    PaymentConfirmationResponse,
)
from .notification import (
    # Notification schemas
    NotificationCreateRequest,
    NotificationUpdateRequest,
    NotificationResponse,
    NotificationListResponse,
    NotificationPreferencesRequest,
    NotificationPreferencesResponse,
    NotificationMarkReadRequest,
    NotificationBulkActionRequest,
    NotificationStatsResponse,
    NotificationDeliveryRequest,
    NotificationDeliveryResponse,
    NotificationTemplateRequest,
    NotificationTemplateResponse,
    NotificationChannelResponse,
    NotificationScheduleRequest,
    NotificationScheduleResponse,
)
from .webhook import (
    # Webhook schemas
    WebhookRequest,
    WebhookResponse,
    WebhookEventRequest,
    WebhookEventResponse,
    WebhookSubscriptionRequest,
    WebhookSubscriptionResponse,
    WebhookSubscriptionListResponse,
    WebhookDeliveryRequest,
    WebhookDeliveryResponse,
    WebhookDeliveryListResponse,
    WebhookRetryRequest,
    WebhookRetryResponse,
)
from .report import (
    # Report schemas
    ReportGenerateRequest,
    ReportGenerateResponse,
    ReportResponse,
    ReportListResponse,
    ReportStatusResponse,
    ReportFilterRequest,
    ReportExportRequest,
    ReportExportResponse,
    ReportSummaryResponse,
    ReportRevenueResponse,
    ReportOccupancyResponse,
    ReportUtilizationResponse,
    ReportChargingResponse,
    ReportPaymentResponse,
)
from .common import (
    # Common schemas
    PaginationParams,
    PaginatedResponse,
    SortParams,
    FilterParams,
    DateRangeParams,
    BaseResponse,
    BaseErrorResponse,
    SuccessResponse,
    ErrorResponse,
    HealthCheckResponse,
    MetricsResponse,
    VersionResponse,
    StatusResponse,
)
from .api_key import (
    # API Key schemas
    APIKeyCreateRequest,
    APIKeyUpdateRequest,
    APIKeyResponse,
    APIKeyListResponse,
    APIKeyValidateRequest,
    APIKeyValidateResponse,
    APIKeyRevokeRequest,
    APIKeyRevokeResponse,
)
from .audit import (
    # Audit schemas
    AuditLogRequest,
    AuditLogResponse,
    AuditLogListResponse,
    AuditLogFilterRequest,
    AuditEventResponse,
    AuditUserResponse,
)
from .analytics import (
    # Analytics schemas
    AnalyticsRequest,
    AnalyticsResponse,
    AnalyticsDashboardResponse,
    AnalyticsMetricResponse,
    AnalyticsChartResponse,
    AnalyticsTableResponse,
    AnalyticsExportRequest,
    AnalyticsExportResponse,
)

# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse",
    "RefreshTokenRequest",
    "RefreshTokenResponse",
    "LogoutRequest",
    "LogoutResponse",
    "RegisterRequest",
    "RegisterResponse",
    "ForgotPasswordRequest",
    "ForgotPasswordResponse",
    "ResetPasswordRequest",
    "ResetPasswordResponse",
    "VerifyEmailRequest",
    "VerifyEmailResponse",
    "ChangePasswordRequest",
    "ChangePasswordResponse",
    "TokenPayload",
    "JWTTokens",
    
    # User
    "UserCreateRequest",
    "UserUpdateRequest",
    "UserResponse",
    "UserListResponse",
    "UserProfileRequest",
    "UserProfileResponse",
    "UserPreferencesRequest",
    "UserPreferencesResponse",
    "UserRoleUpdateRequest",
    "UserStatusUpdateRequest",
    "UserSearchRequest",
    
    # Vehicle
    "VehicleCreateRequest",
    "VehicleUpdateRequest",
    "VehicleResponse",
    "VehicleListResponse",
    "VehicleSearchRequest",
    "VehicleDetailsResponse",
    "VehicleOwnerResponse",
    "VehicleTypeResponse",
    "VehicleStatusResponse",
    
    # Parking
    "ParkingSpotCreateRequest",
    "ParkingSpotUpdateRequest",
    "ParkingSpotResponse",
    "ParkingSpotListResponse",
    "ParkingSpotSearchRequest",
    "ParkingSpotAvailabilityRequest",
    "ParkingSpotAvailabilityResponse",
    "ParkingSessionCreateRequest",
    "ParkingSessionUpdateRequest",
    "ParkingSessionResponse",
    "ParkingSessionListResponse",
    "ParkingSessionStartRequest",
    "ParkingSessionEndRequest",
    "ParkingRateRequest",
    "ParkingRateResponse",
    "ParkingReservationCreateRequest",
    "ParkingReservationResponse",
    "ParkingReservationListResponse",
    
    # Charging
    "ChargingStationCreateRequest",
    "ChargingStationUpdateRequest",
    "ChargingStationResponse",
    "ChargingStationListResponse",
    "ChargingStationSearchRequest",
    "ChargingStationAvailabilityRequest",
    "ChargingStationAvailabilityResponse",
    "ChargingSessionCreateRequest",
    "ChargingSessionUpdateRequest",
    "ChargingSessionResponse",
    "ChargingSessionListResponse",
    "ChargingSessionStartRequest",
    "ChargingSessionStopRequest",
    "ChargingRateRequest",
    "ChargingRateResponse",
    "ChargingEnergyUsageRequest",
    "ChargingEnergyUsageResponse",
    "ChargingConnectorTypeResponse",
    "ChargingPowerResponse",
    
    # Payment
    "PaymentCreateRequest",
    "PaymentUpdateRequest",
    "PaymentResponse",
    "PaymentListResponse",
    "PaymentStatusResponse",
    "PaymentMethodCreateRequest",
    "PaymentMethodResponse",
    "PaymentMethodListResponse",
    "PaymentRefundRequest",
    "PaymentRefundResponse",
    "PaymentWebhookRequest",
    "PaymentWebhookResponse",
    "PaymentIntentRequest",
    "PaymentIntentResponse",
    "PaymentConfirmationRequest",
    "PaymentConfirmationResponse",
    
    # Notification
    "NotificationCreateRequest",
    "NotificationUpdateRequest",
    "NotificationResponse",
    "NotificationListResponse",
    "NotificationPreferencesRequest",
    "NotificationPreferencesResponse",
    "NotificationMarkReadRequest",
    "NotificationBulkActionRequest",
    "NotificationStatsResponse",
    "NotificationDeliveryRequest",
    "NotificationDeliveryResponse",
    "NotificationTemplateRequest",
    "NotificationTemplateResponse",
    "NotificationChannelResponse",
    "NotificationScheduleRequest",
    "NotificationScheduleResponse",
    
    # Webhook
    "WebhookRequest",
    "WebhookResponse",
    "WebhookEventRequest",
    "WebhookEventResponse",
    "WebhookSubscriptionRequest",
    "WebhookSubscriptionResponse",
    "WebhookSubscriptionListResponse",
    "WebhookDeliveryRequest",
    "WebhookDeliveryResponse",
    "WebhookDeliveryListResponse",
    "WebhookRetryRequest",
    "WebhookRetryResponse",
    
    # Report
    "ReportGenerateRequest",
    "ReportGenerateResponse",
    "ReportResponse",
    "ReportListResponse",
    "ReportStatusResponse",
    "ReportFilterRequest",
    "ReportExportRequest",
    "ReportExportResponse",
    "ReportSummaryResponse",
    "ReportRevenueResponse",
    "ReportOccupancyResponse",
    "ReportUtilizationResponse",
    "ReportChargingResponse",
    "ReportPaymentResponse",
    
    # Common
    "PaginationParams",
    "PaginatedResponse",
    "SortParams",
    "FilterParams",
    "DateRangeParams",
    "BaseResponse",
    "BaseErrorResponse",
    "SuccessResponse",
    "ErrorResponse",
    "HealthCheckResponse",
    "MetricsResponse",
    "VersionResponse",
    "StatusResponse",
    
    # API Key
    "APIKeyCreateRequest",
    "APIKeyUpdateRequest",
    "APIKeyResponse",
    "APIKeyListResponse",
    "APIKeyValidateRequest",
    "APIKeyValidateResponse",
    "APIKeyRevokeRequest",
    "APIKeyRevokeResponse",
    
    # Audit
    "AuditLogRequest",
    "AuditLogResponse",
    "AuditLogListResponse",
    "AuditLogFilterRequest",
    "AuditEventResponse",
    "AuditUserResponse",
    
    # Analytics
    "AnalyticsRequest",
    "AnalyticsResponse",
    "AnalyticsDashboardResponse",
    "AnalyticsMetricResponse",
    "AnalyticsChartResponse",
    "AnalyticsTableResponse",
    "AnalyticsExportRequest",
    "AnalyticsExportResponse",
]

# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Documentation
# ============================================================================

"""
Schemas Package Documentation
=============================

This package contains all Pydantic schemas used for request/response
validation, serialization, and documentation in the API.

Structure:
----------
- auth.py: Authentication and authorization schemas
- user.py: User management schemas
- vehicle.py: Vehicle management schemas
- parking.py: Parking management schemas
- charging.py: EV charging management schemas
- payment.py: Payment processing schemas
- notification.py: Notification management schemas
- webhook.py: Webhook handling schemas
- report.py: Report generation schemas
- common.py: Common/shared schemas
- api_key.py: API key management schemas
- audit.py: Audit logging schemas
- analytics.py: Analytics and metrics schemas

Usage:
------
All schemas are Pydantic models that provide:

1. Request validation:
   ```python
   from src.interfaces.schemas import LoginRequest
   
   @router.post("/login")
   async def login(request: LoginRequest):
       # Request validated automatically
       return {"token": "..."}