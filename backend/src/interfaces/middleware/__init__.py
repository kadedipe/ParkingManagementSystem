# ============================================================================
# Middleware Package
# ============================================================================

"""
Middleware package for API request/response processing.

This package provides various middleware components for handling
cross-cutting concerns such as rate limiting, error handling,
authentication, logging, and request tracing.
"""

from .rate_limit import (
    RateLimitMiddleware,
    RateLimitExemptMiddleware,
    RateLimitReportMiddleware,
    RateLimiter,
    RateLimitConfig,
    RateLimitStrategy,
    RateLimitAdmin,
    rate_limit,
    get_rate_limiter,
    create_rate_limit_config_from_settings,
)
from .error_handler import (
    ErrorHandlerMiddleware,
    ErrorResponse,
    ErrorDetail,
    ErrorHandlerRegistry,
    ErrorMapper,
    ErrorLogger,
    error_type_to_code,
    create_error_response,
    handle_exceptions,
    setup_fastapi_exception_handlers,
)
from .logging import (
    LoggingMiddleware,
    RequestLogger,
    ResponseLogger,
    CorrelationIdMiddleware,
    log_request,
    log_response,
    get_correlation_id,
    generate_correlation_id,
)
from .auth import (
    AuthMiddleware,
    JWTAuthMiddleware,
    BasicAuthMiddleware,
    APIKeyAuthMiddleware,
    PermissionMiddleware,
    get_current_user,
    require_auth,
    require_permission,
    require_role,
)
from .cors import (
    CORSMiddleware,
    setup_cors,
    get_cors_config,
)
from .compression import (
    CompressionMiddleware,
    GzipCompression,
    BrotliCompression,
    compress_response,
)
from .security import (
    SecurityMiddleware,
    SecurityHeadersMiddleware,
    XSSProtectionMiddleware,
    CSRFMiddleware,
    HSTS_Middleware,
    secure_headers,
)
from .validation import (
    ValidationMiddleware,
    RequestValidationMiddleware,
    ResponseValidationMiddleware,
    validate_request,
    validate_response,
)
from .cache import (
    CacheMiddleware,
    CacheControlMiddleware,
    ETagMiddleware,
    cache_response,
    invalidate_cache,
)
from .metrics import (
    MetricsMiddleware,
    RequestMetrics,
    ResponseMetrics,
    collect_metrics,
    get_metrics,
)
from .tracing import (
    TracingMiddleware,
    RequestTracingMiddleware,
    TraceContext,
    get_trace_id,
    generate_trace_id,
    add_trace_context,
)
from .timeout import (
    TimeoutMiddleware,
    RequestTimeoutMiddleware,
    timeout,
    set_timeout,
)
from .retry import (
    RetryMiddleware,
    retry_request,
    RetryConfig,
    ExponentialBackoff,
)
from .circuit_breaker import (
    CircuitBreakerMiddleware,
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitBreakerState,
)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Rate Limit
    "RateLimitMiddleware",
    "RateLimitExemptMiddleware",
    "RateLimitReportMiddleware",
    "RateLimiter",
    "RateLimitConfig",
    "RateLimitStrategy",
    "RateLimitAdmin",
    "rate_limit",
    "get_rate_limiter",
    "create_rate_limit_config_from_settings",
    
    # Error Handler
    "ErrorHandlerMiddleware",
    "ErrorResponse",
    "ErrorDetail",
    "ErrorHandlerRegistry",
    "ErrorMapper",
    "ErrorLogger",
    "error_type_to_code",
    "create_error_response",
    "handle_exceptions",
    "setup_fastapi_exception_handlers",
    
    # Logging
    "LoggingMiddleware",
    "RequestLogger",
    "ResponseLogger",
    "CorrelationIdMiddleware",
    "log_request",
    "log_response",
    "get_correlation_id",
    "generate_correlation_id",
    
    # Auth
    "AuthMiddleware",
    "JWTAuthMiddleware",
    "BasicAuthMiddleware",
    "APIKeyAuthMiddleware",
    "PermissionMiddleware",
    "get_current_user",
    "require_auth",
    "require_permission",
    "require_role",
    
    # CORS
    "CORSMiddleware",
    "setup_cors",
    "get_cors_config",
    
    # Compression
    "CompressionMiddleware",
    "GzipCompression",
    "BrotliCompression",
    "compress_response",
    
    # Security
    "SecurityMiddleware",
    "SecurityHeadersMiddleware",
    "XSSProtectionMiddleware",
    "CSRFMiddleware",
    "HSTS_Middleware",
    "secure_headers",
    
    # Validation
    "ValidationMiddleware",
    "RequestValidationMiddleware",
    "ResponseValidationMiddleware",
    "validate_request",
    "validate_response",
    
    # Cache
    "CacheMiddleware",
    "CacheControlMiddleware",
    "ETagMiddleware",
    "cache_response",
    "invalidate_cache",
    
    # Metrics
    "MetricsMiddleware",
    "RequestMetrics",
    "ResponseMetrics",
    "collect_metrics",
    "get_metrics",
    
    # Tracing
    "TracingMiddleware",
    "RequestTracingMiddleware",
    "TraceContext",
    "get_trace_id",
    "generate_trace_id",
    "add_trace_context",
    
    # Timeout
    "TimeoutMiddleware",
    "RequestTimeoutMiddleware",
    "timeout",
    "set_timeout",
    
    # Retry
    "RetryMiddleware",
    "retry_request",
    "RetryConfig",
    "ExponentialBackoff",
    
    # Circuit Breaker
    "CircuitBreakerMiddleware",
    "CircuitBreaker",
    "CircuitBreakerConfig",
    "CircuitBreakerState",
]


# ============================================================================
# Package Initialization
# ============================================================================

def setup_middlewares(app):
    """
    Setup all middleware for the FastAPI application.
    
    This function sets up all middleware in the correct order,
    with outer middleware wrapping inner middleware.
    
    Args:
        app: FastAPI application
    """
    from fastapi.middleware.cors import CORSMiddleware as FastAPI_CORSMiddleware
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    
    # 1. Security headers (outermost)
    app.add_middleware(SecurityHeadersMiddleware)
    
    # 2. CORS
    app.add_middleware(
        FastAPI_CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 3. Trusted hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"],  # Configure appropriately
    )
    
    # 4. Compression
    app.add_middleware(CompressionMiddleware)
    
    # 5. Correlation ID / Tracing
    app.add_middleware(CorrelationIdMiddleware)
    app.add_middleware(TracingMiddleware)
    
    # 6. Logging
    app.add_middleware(LoggingMiddleware)
    
    # 7. Metrics
    app.add_middleware(MetricsMiddleware)
    
    # 8. Rate limiting
    app.add_middleware(RateLimitMiddleware)
    
    # 9. Authentication
    app.add_middleware(AuthMiddleware)
    
    # 10. Caching
    app.add_middleware(CacheMiddleware)
    
    # 11. Validation
    app.add_middleware(ValidationMiddleware)
    
    # 12. Error handling (innermost)
    app.add_middleware(ErrorHandlerMiddleware)
    
    # Setup exception handlers
    setup_fastapi_exception_handlers(app)


# ============================================================================
# Middleware Configuration
# ============================================================================

class MiddlewareConfig:
    """Configuration for all middleware components."""
    
    def __init__(self, **kwargs):
        """
        Initialize middleware configuration.
        
        Args:
            **kwargs: Configuration options for each middleware
        """
        self.rate_limit = kwargs.get("rate_limit", {})
        self.auth = kwargs.get("auth", {})
        self.cors = kwargs.get("cors", {})
        self.security = kwargs.get("security", {})
        self.logging = kwargs.get("logging", {})
        self.cache = kwargs.get("cache", {})
        self.metrics = kwargs.get("metrics", {})
        self.tracing = kwargs.get("tracing", {})
        self.timeout = kwargs.get("timeout", {})
        self.retry = kwargs.get("retry", {})
        self.circuit_breaker = kwargs.get("circuit_breaker", {})
        self.compression = kwargs.get("compression", {})
        self.validation = kwargs.get("validation", {})
    
    @classmethod
    def from_settings(cls, settings):
        """
        Create configuration from application settings.
        
        Args:
            settings: Application settings object
            
        Returns:
            MiddlewareConfig: Middleware configuration
        """
        return cls(
            rate_limit={
                "enabled": getattr(settings, "RATE_LIMIT_ENABLED", True),
                "requests_per_minute": getattr(settings, "RATE_LIMIT_PER_MINUTE", 60),
                "requests_per_hour": getattr(settings, "RATE_LIMIT_PER_HOUR", 1000),
                "requests_per_day": getattr(settings, "RATE_LIMIT_PER_DAY", 10000),
                "strategy": getattr(settings, "RATE_LIMIT_STRATEGY", "sliding_window"),
            },
            auth={
                "jwt_secret": getattr(settings, "JWT_SECRET", None),
                "jwt_algorithm": getattr(settings, "JWT_ALGORITHM", "HS256"),
                "token_expiry": getattr(settings, "JWT_EXPIRY", 3600),
            },
            cors={
                "allow_origins": getattr(settings, "CORS_ALLOW_ORIGINS", ["*"]),
                "allow_credentials": getattr(settings, "CORS_ALLOW_CREDENTIALS", True),
                "allow_methods": getattr(settings, "CORS_ALLOW_METHODS", ["*"]),
                "allow_headers": getattr(settings, "CORS_ALLOW_HEADERS", ["*"]),
            },
            security={
                "hsts_enabled": getattr(settings, "HSTS_ENABLED", True),
                "xss_protection": getattr(settings, "XSS_PROTECTION", True),
                "csrf_enabled": getattr(settings, "CSRF_ENABLED", True),
            },
            logging={
                "log_requests": getattr(settings, "LOG_REQUESTS", True),
                "log_responses": getattr(settings, "LOG_RESPONSES", True),
                "log_body": getattr(settings, "LOG_BODY", False),
                "log_headers": getattr(settings, "LOG_HEADERS", False),
            },
            cache={
                "enabled": getattr(settings, "CACHE_ENABLED", True),
                "default_ttl": getattr(settings, "CACHE_DEFAULT_TTL", 300),
            },
            metrics={
                "enabled": getattr(settings, "METRICS_ENABLED", True),
                "collect_headers": getattr(settings, "METRICS_COLLECT_HEADERS", False),
            },
            tracing={
                "enabled": getattr(settings, "TRACING_ENABLED", True),
                "sample_rate": getattr(settings, "TRACING_SAMPLE_RATE", 1.0),
            },
            timeout={
                "default_timeout": getattr(settings, "REQUEST_TIMEOUT", 30),
            },
            compression={
                "enabled": getattr(settings, "COMPRESSION_ENABLED", True),
                "min_size": getattr(settings, "COMPRESSION_MIN_SIZE", 1024),
            },
            validation={
                "enabled": getattr(settings, "VALIDATION_ENABLED", True),
                "strict": getattr(settings, "VALIDATION_STRICT", False),
            },
        )


# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Module Documentation
# ============================================================================

"""
Middleware Package Documentation
================================

This package provides comprehensive middleware components for FastAPI applications.

Core Components:
----------------
1. **Rate Limit**: Controls request rate to prevent abuse
2. **Error Handler**: Manages errors and provides consistent error responses
3. **Logging**: Logs requests and responses for debugging and monitoring
4. **Authentication**: Handles authentication and authorization
5. **CORS**: Manages Cross-Origin Resource Sharing
6. **Compression**: Compresses responses for better performance
7. **Security**: Adds security headers and protections
8. **Validation**: Validates requests and responses
9. **Cache**: Implements response caching
10. **Metrics**: Collects request/response metrics
11. **Tracing**: Implements distributed tracing
12. **Timeout**: Sets request timeouts
13. **Retry**: Implements retry logic for failed requests
14. **Circuit Breaker**: Protects against service failures

Usage:
------
To use the middleware package:

1. Import the required middleware:
   ```python
   from src.interfaces.middleware import (
       RateLimitMiddleware,
       ErrorHandlerMiddleware,
       LoggingMiddleware,
   )