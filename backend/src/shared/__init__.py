# ============================================================================
# Shared Package
# ============================================================================

"""
Shared package for common utilities, constants, and helpers.

This package provides shared functionality used across the entire application,
including configuration, logging, exceptions, constants, and utility functions.
"""

from .config import (
    Settings,
    DatabaseSettings,
    RedisSettings,
    JWTSettings,
    EmailSettings,
    SMSSettings,
    PaymentSettings,
    StorageSettings,
    RateLimitSettings,
    LoggingSettings,
    CorsSettings,
    SecuritySettings,
    WebhookSettings,
    NotificationSettings,
    get_settings,
    load_settings,
    settings,
)
from .constants import (
    # HTTP Status Codes
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_429_TOO_MANY_REQUESTS,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_502_BAD_GATEWAY,
    HTTP_503_SERVICE_UNAVAILABLE,
    
    # Regex Patterns
    EMAIL_REGEX,
    PHONE_REGEX,
    LICENSE_PLATE_REGEX,
    VIN_REGEX,
    PASSWORD_REGEX,
    URL_REGEX,
    UUID_REGEX,
    
    # Date/Time
    DATETIME_FORMAT,
    DATE_FORMAT,
    TIME_FORMAT,
    ISO_DATETIME_FORMAT,
    
    # Cache Keys
    CACHE_KEY_USER,
    CACHE_KEY_VEHICLE,
    CACHE_KEY_PARKING_SPOT,
    CACHE_KEY_PARKING_SESSION,
    CACHE_KEY_CHARGING_STATION,
    CACHE_KEY_CHARGING_SESSION,
    CACHE_KEY_NOTIFICATION,
    CACHE_KEY_RATE_LIMIT,
    CACHE_KEY_SESSION,
    
    # Queue Names
    QUEUE_PARKING,
    QUEUE_CHARGING,
    QUEUE_NOTIFICATION,
    QUEUE_PAYMENT,
    QUEUE_EMAIL,
    QUEUE_SMS,
    QUEUE_REPORT,
    QUEUE_AUDIT,
    QUEUE_WEBHOOK,
    
    # Event Types
    EVENT_VEHICLE_CREATED,
    EVENT_VEHICLE_UPDATED,
    EVENT_VEHICLE_DELETED,
    EVENT_PARKING_STARTED,
    EVENT_PARKING_ENDED,
    EVENT_CHARGING_STARTED,
    EVENT_CHARGING_ENDED,
    EVENT_PAYMENT_COMPLETED,
    EVENT_PAYMENT_FAILED,
    EVENT_NOTIFICATION_SENT,
    EVENT_USER_LOGGED_IN,
    EVENT_USER_LOGGED_OUT,
    
    # Limits
    MAX_PAGINATION_LIMIT,
    DEFAULT_PAGINATION_LIMIT,
    MAX_FILE_SIZE,
    MAX_BATCH_SIZE,
    MAX_MESSAGE_LENGTH,
    MAX_PASSWORD_LENGTH,
    MAX_USERNAME_LENGTH,
    MAX_EMAIL_LENGTH,
    
    # Roles
    ROLE_ADMIN,
    ROLE_USER,
    ROLE_MANAGER,
    ROLE_SUPER_ADMIN,
    ROLE_OPERATOR,
    ROLE_VIEWER,
    ROLE_GUEST,
    
    # Permissions
    PERMISSION_READ,
    PERMISSION_WRITE,
    PERMISSION_DELETE,
    PERMISSION_UPDATE,
    PERMISSION_EXPORT,
    PERMISSION_IMPORT,
    PERMISSION_MANAGE_USERS,
    PERMISSION_MANAGE_PARKING,
    PERMISSION_MANAGE_CHARGING,
    PERMISSION_MANAGE_PAYMENTS,
    PERMISSION_VIEW_REPORTS,
    PERMISSION_MANAGE_SETTINGS,
)
from .exceptions import (
    # Base Exceptions
    AppException,
    DomainError,
    BusinessRuleError,
    EntityNotFoundError,
    ValidationError,
    UnauthorizedError,
    PermissionDeniedError,
    ConflictError,
    ServiceUnavailableError,
    ExternalServiceError,
    
    # Specific Exceptions
    UserNotFoundError,
    VehicleNotFoundError,
    ParkingSpotNotFoundError,
    ParkingSessionNotFoundError,
    ChargingStationNotFoundError,
    ChargingSessionNotFoundError,
    PaymentNotFoundError,
    NotificationNotFoundError,
    RateLimitExceededError,
    InvalidCredentialsError,
    TokenExpiredError,
    InvalidTokenError,
    DuplicateEntryError,
    DatabaseError,
    CacheError,
    QueueError,
    FileUploadError,
    EmailError,
    SMSError,
)
from .logging import (
    Logger,
    get_logger,
    setup_logging,
    log_request,
    log_response,
    log_exception,
    LogContext,
    LogLevel,
    logger,
)
from .utils import (
    # General Utilities
    id_generator,
    generate_uuid,
    generate_random_string,
    generate_otp,
    hash_password,
    verify_password,
    mask_sensitive_data,
    truncate_string,
    
    # Date/Time Utilities
    utc_now,
    to_utc,
    to_local,
    format_datetime,
    parse_datetime,
    date_range,
    time_ago,
    is_within_time_range,
    
    # Validation Utilities
    validate_email,
    validate_phone,
    validate_license_plate,
    validate_vin,
    validate_password_strength,
    validate_url,
    is_valid_uuid,
    
    # JSON Utilities
    safe_json_loads,
    safe_json_dumps,
    json_serialize_datetime,
    
    # File Utilities
    get_file_extension,
    get_mime_type,
    sanitize_filename,
    get_file_size,
    is_allowed_extension,
    
    # Math Utilities
    calculate_percentage,
    round_decimal,
    format_currency,
    calculate_distance,
    
    # String Utilities
    slugify,
    camel_to_snake,
    snake_to_camel,
    capitalize_words,
    remove_whitespace,
    normalize_string,
    
    # Async Utilities
    run_async,
    gather_with_concurrency,
    retry_async,
    timeout_async,
)
from .validators import (
    Validator,
    validate_with_schema,
    validate_sync,
    validate_async,
    ValidationResult,
)
from .decorators import (
    retry,
    timeout,
    cache,
    rate_limit,
    log,
    measure_time,
    handle_exceptions,
    require_permission,
    require_role,
    transactional,
)
from .context import (
    ContextManager,
    request_context,
    get_current_context,
    set_context,
    clear_context,
    Context,
)
from .event_bus import (
    EventBus,
    Event,
    EventHandler,
    EventListener,
    event_bus,
    subscribe,
    publish,
    handle_event,
)
from .middleware import (
    SharedMiddleware,
    add_shared_middleware,
)
from .types import (
    JSONDict,
    JSONList,
    JSONPrimitive,
    JSONValue,
    ID,
    Timestamp,
    Money,
    Decimal,
    NonEmptyStr,
    EmailStr,
    PhoneStr,
    URLStr,
)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Config
    "Settings",
    "DatabaseSettings",
    "RedisSettings",
    "JWTSettings",
    "EmailSettings",
    "SMSSettings",
    "PaymentSettings",
    "StorageSettings",
    "RateLimitSettings",
    "LoggingSettings",
    "CorsSettings",
    "SecuritySettings",
    "WebhookSettings",
    "NotificationSettings",
    "get_settings",
    "load_settings",
    "settings",
    
    # Constants - HTTP Status
    "HTTP_200_OK",
    "HTTP_201_CREATED",
    "HTTP_204_NO_CONTENT",
    "HTTP_400_BAD_REQUEST",
    "HTTP_401_UNAUTHORIZED",
    "HTTP_403_FORBIDDEN",
    "HTTP_404_NOT_FOUND",
    "HTTP_409_CONFLICT",
    "HTTP_422_UNPROCESSABLE_ENTITY",
    "HTTP_429_TOO_MANY_REQUESTS",
    "HTTP_500_INTERNAL_SERVER_ERROR",
    "HTTP_502_BAD_GATEWAY",
    "HTTP_503_SERVICE_UNAVAILABLE",
    
    # Constants - Regex
    "EMAIL_REGEX",
    "PHONE_REGEX",
    "LICENSE_PLATE_REGEX",
    "VIN_REGEX",
    "PASSWORD_REGEX",
    "URL_REGEX",
    "UUID_REGEX",
    
    # Constants - Date/Time
    "DATETIME_FORMAT",
    "DATE_FORMAT",
    "TIME_FORMAT",
    "ISO_DATETIME_FORMAT",
    
    # Constants - Cache
    "CACHE_KEY_USER",
    "CACHE_KEY_VEHICLE",
    "CACHE_KEY_PARKING_SPOT",
    "CACHE_KEY_PARKING_SESSION",
    "CACHE_KEY_CHARGING_STATION",
    "CACHE_KEY_CHARGING_SESSION",
    "CACHE_KEY_NOTIFICATION",
    "CACHE_KEY_RATE_LIMIT",
    "CACHE_KEY_SESSION",
    
    # Constants - Queue
    "QUEUE_PARKING",
    "QUEUE_CHARGING",
    "QUEUE_NOTIFICATION",
    "QUEUE_PAYMENT",
    "QUEUE_EMAIL",
    "QUEUE_SMS",
    "QUEUE_REPORT",
    "QUEUE_AUDIT",
    "QUEUE_WEBHOOK",
    
    # Constants - Events
    "EVENT_VEHICLE_CREATED",
    "EVENT_VEHICLE_UPDATED",
    "EVENT_VEHICLE_DELETED",
    "EVENT_PARKING_STARTED",
    "EVENT_PARKING_ENDED",
    "EVENT_CHARGING_STARTED",
    "EVENT_CHARGING_ENDED",
    "EVENT_PAYMENT_COMPLETED",
    "EVENT_PAYMENT_FAILED",
    "EVENT_NOTIFICATION_SENT",
    "EVENT_USER_LOGGED_IN",
    "EVENT_USER_LOGGED_OUT",
    
    # Constants - Limits
    "MAX_PAGINATION_LIMIT",
    "DEFAULT_PAGINATION_LIMIT",
    "MAX_FILE_SIZE",
    "MAX_BATCH_SIZE",
    "MAX_MESSAGE_LENGTH",
    "MAX_PASSWORD_LENGTH",
    "MAX_USERNAME_LENGTH",
    "MAX_EMAIL_LENGTH",
    
    # Constants - Roles
    "ROLE_ADMIN",
    "ROLE_USER",
    "ROLE_MANAGER",
    "ROLE_SUPER_ADMIN",
    "ROLE_OPERATOR",
    "ROLE_VIEWER",
    "ROLE_GUEST",
    
    # Constants - Permissions
    "PERMISSION_READ",
    "PERMISSION_WRITE",
    "PERMISSION_DELETE",
    "PERMISSION_UPDATE",
    "PERMISSION_EXPORT",
    "PERMISSION_IMPORT",
    "PERMISSION_MANAGE_USERS",
    "PERMISSION_MANAGE_PARKING",
    "PERMISSION_MANAGE_CHARGING",
    "PERMISSION_MANAGE_PAYMENTS",
    "PERMISSION_VIEW_REPORTS",
    "PERMISSION_MANAGE_SETTINGS",
    
    # Exceptions
    "AppException",
    "DomainError",
    "BusinessRuleError",
    "EntityNotFoundError",
    "ValidationError",
    "UnauthorizedError",
    "PermissionDeniedError",
    "ConflictError",
    "ServiceUnavailableError",
    "ExternalServiceError",
    "UserNotFoundError",
    "VehicleNotFoundError",
    "ParkingSpotNotFoundError",
    "ParkingSessionNotFoundError",
    "ChargingStationNotFoundError",
    "ChargingSessionNotFoundError",
    "PaymentNotFoundError",
    "NotificationNotFoundError",
    "RateLimitExceededError",
    "InvalidCredentialsError",
    "TokenExpiredError",
    "InvalidTokenError",
    "DuplicateEntryError",
    "DatabaseError",
    "CacheError",
    "QueueError",
    "FileUploadError",
    "EmailError",
    "SMSError",
    
    # Logging
    "Logger",
    "get_logger",
    "setup_logging",
    "log_request",
    "log_response",
    "log_exception",
    "LogContext",
    "LogLevel",
    "logger",
    
    # Utilities
    "id_generator",
    "generate_uuid",
    "generate_random_string",
    "generate_otp",
    "hash_password",
    "verify_password",
    "mask_sensitive_data",
    "truncate_string",
    "utc_now",
    "to_utc",
    "to_local",
    "format_datetime",
    "parse_datetime",
    "date_range",
    "time_ago",
    "is_within_time_range",
    "validate_email",
    "validate_phone",
    "validate_license_plate",
    "validate_vin",
    "validate_password_strength",
    "validate_url",
    "is_valid_uuid",
    "safe_json_loads",
    "safe_json_dumps",
    "json_serialize_datetime",
    "get_file_extension",
    "get_mime_type",
    "sanitize_filename",
    "get_file_size",
    "is_allowed_extension",
    "calculate_percentage",
    "round_decimal",
    "format_currency",
    "calculate_distance",
    "slugify",
    "camel_to_snake",
    "snake_to_camel",
    "capitalize_words",
    "remove_whitespace",
    "normalize_string",
    "run_async",
    "gather_with_concurrency",
    "retry_async",
    "timeout_async",
    
    # Validators
    "Validator",
    "validate_with_schema",
    "validate_sync",
    "validate_async",
    "ValidationResult",
    
    # Decorators
    "retry",
    "timeout",
    "cache",
    "rate_limit",
    "log",
    "measure_time",
    "handle_exceptions",
    "require_permission",
    "require_role",
    "transactional",
    
    # Context
    "ContextManager",
    "request_context",
    "get_current_context",
    "set_context",
    "clear_context",
    "Context",
    
    # Event Bus
    "EventBus",
    "Event",
    "EventHandler",
    "EventListener",
    "event_bus",
    "subscribe",
    "publish",
    "handle_event",
    
    # Middleware
    "SharedMiddleware",
    "add_shared_middleware",
    
    # Types
    "JSONDict",
    "JSONList",
    "JSONPrimitive",
    "JSONValue",
    "ID",
    "Timestamp",
    "Money",
    "Decimal",
    "NonEmptyStr",
    "EmailStr",
    "PhoneStr",
    "URLStr",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Initialization
# ============================================================================

import logging
from .config import settings
from .logging import setup_logging, get_logger

# Setup logging
setup_logging()

# Get package logger
_logger = get_logger(__name__)


def initialize_shared():
    """
    Initialize the shared package.
    
    This function should be called during application startup
    to ensure all shared components are properly initialized.
    """
    try:
        _logger.info(f"Initializing shared package v{__version__}")
        _logger.info(f"Environment: {settings.ENVIRONMENT}")
        _logger.info(f"Debug mode: {settings.DEBUG}")
        
        # Log configuration summary
        _logger.info("Configuration loaded successfully")
        _logger.info(f"  - Database: {settings.DATABASE_URL[:50]}...")
        _logger.info(f"  - Redis: {settings.REDIS_URL[:50]}...")
        _logger.info(f"  - Log level: {settings.LOG_LEVEL}")
        
        return True
    except Exception as e:
        _logger.error(f"Failed to initialize shared package: {e}", exc_info=True)
        return False


# ============================================================================
# Convenience Functions
# ============================================================================

def get_version() -> str:
    """Get the package version."""
    return __version__


def get_package_info() -> dict:
    """
    Get package information.
    
    Returns:
        dict: Package information
    """
    return {
        "name": "shared",
        "version": __version__,
        "description": "Shared utilities and constants for the parking management system",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "modules": [
            "config",
            "constants",
            "exceptions",
            "logging",
            "utils",
            "validators",
            "decorators",
            "context",
            "event_bus",
            "middleware",
            "types",
        ],
    }


# ============================================================================
# Package Documentation
# ============================================================================

"""
Shared Package Documentation
============================

The shared package provides common utilities, constants, and helpers used
across the entire parking management system.

Modules:
--------

1. **config**: Application configuration management
   - Environment variables loading
   - Settings validation
   - Configuration for all services

2. **constants**: Shared constants and enums
   - HTTP status codes
   - Regex patterns
   - Date/time formats
   - Cache keys
   - Queue names
   - Event types
   - Limits
   - Roles and permissions

3. **exceptions**: Custom exception classes
   - Base application exceptions
   - Domain-specific exceptions
   - Error handling utilities

4. **logging**: Logging utilities
   - Custom logger configuration
   - Log context management
   - Request/response logging

5. **utils**: Utility functions
   - ID generation
   - Date/time manipulation
   - Validation helpers
   - JSON utilities
   - File operations
   - String manipulation
   - Async helpers

6. **validators**: Validation framework
   - Schema validation
   - Custom validators
   - Validation results

7. **decorators**: Common decorators
   - Retry logic
   - Timeout handling
   - Caching
   - Rate limiting
   - Logging
   - Performance measurement
   - Permission checking

8. **context**: Request context management
   - Context storage
   - Request-scoped data
   - Thread-safe context

9. **event_bus**: Event system
   - Event publishing/subscribing
   - Event handlers
   - Async event processing

10. **middleware**: Shared middleware
    - Common middleware components
    - Middleware registration

11. **types**: Type definitions
    - JSON types
    - Custom type aliases
    - Type hints

Usage:
------
The shared package is imported and used throughout the application:

```python
from src.shared import (
    settings,
    logger,
    get_logger,
    utc_now,
    generate_uuid,
    EntityNotFoundError,
    HTTP_404_NOT_FOUND,
    event_bus,
    subscribe,
    retry,
    cache,
)