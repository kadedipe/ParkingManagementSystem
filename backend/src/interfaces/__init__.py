# ============================================================================
# Parking Management System - Interfaces Package
# ============================================================================

"""
Interfaces Package - API Layer and External Interfaces.

This package contains all interface implementations including:
- REST API endpoints (FastAPI)
- WebSocket endpoints
- GraphQL resolvers (optional)
- Middleware
- Request/Response models
- Authentication/Authorization
- Rate limiting
- Request validation
"""

# ============================================================================
# API Version 1
# ============================================================================

from src.interfaces.api.v1 import (
    # Routes
    parking_router,
    vehicle_router,
    charging_router,
    booking_router,
    payment_router,
    notification_router,
    user_router,
    admin_router,
    report_router,
    webhook_router,
    health_router,
)

# ============================================================================
# Middleware
# ============================================================================

from src.interfaces.middleware import (
    # Core middleware
    auth_middleware,
    rate_limit_middleware,
    request_id_middleware,
    logging_middleware,
    error_handler_middleware,
    cors_middleware,
    compression_middleware,
    session_middleware,
    
    # Security middleware
    security_headers_middleware,
    csrf_middleware,
    csp_middleware,
)

# ============================================================================
# Schemas / DTOs
# ============================================================================

from src.interfaces.schemas import (
    # Common schemas
    BaseResponse,
    ErrorResponse,
    SuccessResponse,
    PaginatedResponse,
    HealthResponse,
    
    # Parking schemas
    ParkingLotCreate,
    ParkingLotUpdate,
    ParkingLotResponse,
    ParkVehicleRequest,
    ParkVehicleResponse,
    RemoveVehicleRequest,
    RemoveVehicleResponse,
    LotStatusResponse,
    ParkingTicketResponse,
    
    # Vehicle schemas
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleSearchRequest,
    VehicleSearchResponse,
    
    # Charging schemas
    ChargingStationCreate,
    ChargingStationUpdate,
    ChargingStationResponse,
    StartChargingRequest,
    StartChargingResponse,
    StopChargingRequest,
    StopChargingResponse,
    ChargingSessionResponse,
    ChargingStatusResponse,
    
    # User schemas
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    UserLoginResponse,
    UserRegister,
    UserRegisterResponse,
    ChangePasswordRequest,
    ResetPasswordRequest,
    ForgotPasswordRequest,
    
    # Payment schemas
    PaymentIntentRequest,
    PaymentIntentResponse,
    PaymentConfirmRequest,
    PaymentConfirmResponse,
    PaymentRefundRequest,
    PaymentRefundResponse,
    PaymentHistoryResponse,
    PaymentMethodRequest,
    PaymentMethodResponse,
    
    # Notification schemas
    NotificationCreate,
    NotificationResponse,
    NotificationPreferences,
    BulkNotificationRequest,
    BulkNotificationResponse,
    
    # Webhook schemas
    WebhookRequest,
    WebhookResponse,
)

# ============================================================================
# Dependencies
# ============================================================================

from src.interfaces.dependencies import (
    # Service dependencies
    get_parking_service,
    get_vehicle_service,
    get_charging_service,
    get_booking_service,
    get_payment_service,
    get_notification_service,
    get_user_service,
    get_report_service,
    get_webhook_service,
    
    # Repository dependencies
    get_parking_repository,
    get_vehicle_repository,
    get_charging_repository,
    get_booking_repository,
    get_payment_repository,
    get_notification_repository,
    get_user_repository,
    
    # Infrastructure dependencies
    get_db_client,
    get_redis_client,
    get_cache_client,
    get_message_bus,
    get_event_bus,
    get_email_client,
    get_sms_client,
    get_payment_client,
    
    # Authentication dependencies
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    get_current_super_admin,
    get_optional_user,
    
    # Rate limiting dependencies
    get_rate_limiter,
    get_rate_limit_status,
)

# ============================================================================
# Exception Handlers
# ============================================================================

from src.interfaces.exception_handlers import (
    # Core exception handlers
    validation_exception_handler,
    authentication_exception_handler,
    authorization_exception_handler,
    not_found_exception_handler,
    conflict_exception_handler,
    rate_limit_exception_handler,
    database_exception_handler,
    service_exception_handler,
    
    # Custom exception handlers
    business_exception_handler,
    domain_exception_handler,
    infrastructure_exception_handler,
)

# ============================================================================
# WebSocket Handlers
# ============================================================================

from src.interfaces.websocket import (
    # WebSocket handlers
    parking_ws_handler,
    charging_ws_handler,
    notification_ws_handler,
    booking_ws_handler,
    admin_ws_handler,
    
    # WebSocket middleware
    ws_auth_middleware,
    ws_rate_limit_middleware,
)

# ============================================================================
# Interface Registry
# ============================================================================

class InterfaceRegistry:
    """
    Registry for managing interface components.
    
    This provides a central location for interface registration and discovery.
    """
    
    _routes = {}
    _middleware = {}
    _websocket_handlers = {}
    
    @classmethod
    def register_route(cls, name: str, route):
        """Register a route."""
        cls._routes[name] = route
    
    @classmethod
    def get_route(cls, name: str):
        """Get a registered route."""
        return cls._routes.get(name)
    
    @classmethod
    def register_middleware(cls, name: str, middleware):
        """Register a middleware."""
        cls._middleware[name] = middleware
    
    @classmethod
    def get_middleware(cls, name: str):
        """Get a registered middleware."""
        return cls._middleware.get(name)
    
    @classmethod
    def register_websocket_handler(cls, name: str, handler):
        """Register a WebSocket handler."""
        cls._websocket_handlers[name] = handler
    
    @classmethod
    def get_websocket_handler(cls, name: str):
        """Get a registered WebSocket handler."""
        return cls._websocket_handlers.get(name)


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # API V1 Routes
    "parking_router",
    "vehicle_router",
    "charging_router",
    "booking_router",
    "payment_router",
    "notification_router",
    "user_router",
    "admin_router",
    "report_router",
    "webhook_router",
    "health_router",
    
    # Middleware
    "auth_middleware",
    "rate_limit_middleware",
    "request_id_middleware",
    "logging_middleware",
    "error_handler_middleware",
    "cors_middleware",
    "compression_middleware",
    "session_middleware",
    "security_headers_middleware",
    "csrf_middleware",
    "csp_middleware",
    
    # Schemas
    "BaseResponse",
    "ErrorResponse",
    "SuccessResponse",
    "PaginatedResponse",
    "HealthResponse",
    "ParkingLotCreate",
    "ParkingLotUpdate",
    "ParkingLotResponse",
    "ParkVehicleRequest",
    "ParkVehicleResponse",
    "RemoveVehicleRequest",
    "RemoveVehicleResponse",
    "LotStatusResponse",
    "ParkingTicketResponse",
    "VehicleCreate",
    "VehicleUpdate",
    "VehicleResponse",
    "VehicleSearchRequest",
    "VehicleSearchResponse",
    "ChargingStationCreate",
    "ChargingStationUpdate",
    "ChargingStationResponse",
    "StartChargingRequest",
    "StartChargingResponse",
    "StopChargingRequest",
    "StopChargingResponse",
    "ChargingSessionResponse",
    "ChargingStatusResponse",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLogin",
    "UserLoginResponse",
    "UserRegister",
    "UserRegisterResponse",
    "ChangePasswordRequest",
    "ResetPasswordRequest",
    "ForgotPasswordRequest",
    "PaymentIntentRequest",
    "PaymentIntentResponse",
    "PaymentConfirmRequest",
    "PaymentConfirmResponse",
    "PaymentRefundRequest",
    "PaymentRefundResponse",
    "PaymentHistoryResponse",
    "PaymentMethodRequest",
    "PaymentMethodResponse",
    "NotificationCreate",
    "NotificationResponse",
    "NotificationPreferences",
    "BulkNotificationRequest",
    "BulkNotificationResponse",
    "WebhookRequest",
    "WebhookResponse",
    
    # Dependencies
    "get_parking_service",
    "get_vehicle_service",
    "get_charging_service",
    "get_booking_service",
    "get_payment_service",
    "get_notification_service",
    "get_user_service",
    "get_report_service",
    "get_webhook_service",
    "get_parking_repository",
    "get_vehicle_repository",
    "get_charging_repository",
    "get_booking_repository",
    "get_payment_repository",
    "get_notification_repository",
    "get_user_repository",
    "get_db_client",
    "get_redis_client",
    "get_cache_client",
    "get_message_bus",
    "get_event_bus",
    "get_email_client",
    "get_sms_client",
    "get_payment_client",
    "get_current_user",
    "get_current_active_user",
    "get_current_admin_user",
    "get_current_super_admin",
    "get_optional_user",
    "get_rate_limiter",
    "get_rate_limit_status",
    
    # Exception Handlers
    "validation_exception_handler",
    "authentication_exception_handler",
    "authorization_exception_handler",
    "not_found_exception_handler",
    "conflict_exception_handler",
    "rate_limit_exception_handler",
    "database_exception_handler",
    "service_exception_handler",
    "business_exception_handler",
    "domain_exception_handler",
    "infrastructure_exception_handler",
    
    # WebSocket Handlers
    "parking_ws_handler",
    "charging_ws_handler",
    "notification_ws_handler",
    "booking_ws_handler",
    "admin_ws_handler",
    "ws_auth_middleware",
    "ws_rate_limit_middleware",
    
    # Registry
    "InterfaceRegistry",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"