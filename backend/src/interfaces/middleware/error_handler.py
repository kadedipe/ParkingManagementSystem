# ============================================================================
# Error Handler Middleware
# ============================================================================

"""
Error handling middleware for API error management.

This module provides comprehensive error handling with proper logging,
error categorization, and consistent error responses.
"""

import json
import traceback
import sys
from typing import Dict, Any, Optional, Type, Union, List, Callable, Awaitable
from datetime import datetime
from functools import wraps

from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from redis.exceptions import RedisError
from jose import JWTError

from src.utils.logger import logger
from src.config import settings
from src.application.exceptions import (
    DomainError,
    BusinessRuleError,
    EntityNotFoundError,
    UnauthorizedError,
    PermissionDeniedError,
    ValidationError as DomainValidationError,
    ConflictError,
    ServiceUnavailableError,
    ExternalServiceError,
)


# ============================================================================
# Error Response Models
# ============================================================================

class ErrorDetail:
    """Error detail structure."""
    
    def __init__(
        self,
        code: str,
        message: str,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.field = field
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "code": self.code,
            "message": self.message,
        }
        if self.field:
            result["field"] = self.field
        if self.details:
            result["details"] = self.details
        return result


class ErrorResponse:
    """Standard error response structure."""
    
    def __init__(
        self,
        error_type: str,
        message: str,
        status_code: int,
        errors: Optional[List[ErrorDetail]] = None,
        request_id: Optional[str] = None,
        timestamp: Optional[str] = None,
        path: Optional[str] = None,
        method: Optional[str] = None,
    ):
        self.error_type = error_type
        self.message = message
        self.status_code = status_code
        self.errors = errors or []
        self.request_id = request_id
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.path = path
        self.method = method
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "error_type": self.error_type,
            "message": self.message,
            "status_code": self.status_code,
            "timestamp": self.timestamp,
        }
        if self.errors:
            result["errors"] = [error.to_dict() for error in self.errors]
        if self.request_id:
            result["request_id"] = self.request_id
        if self.path:
            result["path"] = self.path
        if self.method:
            result["method"] = self.method
        return result
    
    def to_json_response(self) -> JSONResponse:
        """Convert to JSONResponse."""
        return JSONResponse(
            status_code=self.status_code,
            content=self.to_dict(),
            headers=self._get_headers(),
        )
    
    def _get_headers(self) -> Dict[str, str]:
        """Get response headers."""
        headers = {}
        if self.request_id:
            headers["X-Request-ID"] = self.request_id
        return headers


# ============================================================================
# Error Handler Registry
# ============================================================================

class ErrorHandlerRegistry:
    """Registry for custom error handlers."""
    
    def __init__(self):
        self.handlers: Dict[Type[Exception], Callable] = {}
        self.fallback_handler: Optional[Callable] = None
    
    def register(self, exception_type: Type[Exception]):
        """Register a handler for an exception type."""
        def decorator(handler_func: Callable):
            self.handlers[exception_type] = handler_func
            return handler_func
        return decorator
    
    def get_handler(self, exception: Exception) -> Optional[Callable]:
        """Get handler for an exception."""
        for exception_type, handler in self.handlers.items():
            if isinstance(exception, exception_type):
                return handler
        return self.fallback_handler


# ============================================================================
# Exception to Status Code Mapping
# ============================================================================

class ErrorMapper:
    """Maps exceptions to HTTP status codes and error types."""
    
    def __init__(self):
        self.error_map: Dict[Type[Exception], tuple] = {
            # Domain exceptions
            EntityNotFoundError: (status.HTTP_404_NOT_FOUND, "not_found"),
            UnauthorizedError: (status.HTTP_401_UNAUTHORIZED, "unauthorized"),
            PermissionDeniedError: (status.HTTP_403_FORBIDDEN, "forbidden"),
            DomainValidationError: (status.HTTP_400_BAD_REQUEST, "validation_error"),
            BusinessRuleError: (status.HTTP_422_UNPROCESSABLE_ENTITY, "business_rule_error"),
            ConflictError: (status.HTTP_409_CONFLICT, "conflict"),
            ServiceUnavailableError: (status.HTTP_503_SERVICE_UNAVAILABLE, "service_unavailable"),
            ExternalServiceError: (status.HTTP_502_BAD_GATEWAY, "external_service_error"),
            
            # FastAPI exceptions
            HTTPException: (None, "http_exception"),  # Will use exception.status_code
            ValidationError: (status.HTTP_422_UNPROCESSABLE_ENTITY, "validation_error"),
            
            # Database exceptions
            IntegrityError: (status.HTTP_409_CONFLICT, "database_integrity_error"),
            SQLAlchemyError: (status.HTTP_500_INTERNAL_SERVER_ERROR, "database_error"),
            
            # Redis exceptions
            RedisError: (status.HTTP_503_SERVICE_UNAVAILABLE, "cache_error"),
            
            # JWT exceptions
            JWTError: (status.HTTP_401_UNAUTHORIZED, "invalid_token"),
            
            # Catch-all
            DomainError: (status.HTTP_400_BAD_REQUEST, "domain_error"),
        }
    
    def get_status_and_type(self, exception: Exception) -> tuple:
        """Get status code and error type for an exception."""
        # Check for direct match
        for exc_type, (status_code, error_type) in self.error_map.items():
            if isinstance(exception, exc_type):
                # Special handling for HTTPException
                if isinstance(exception, HTTPException):
                    return exception.status_code, error_type
                return status_code, error_type
        
        # Handle HTTPException
        if isinstance(exception, HTTPException):
            return exception.status_code, "http_exception"
        
        # Default
        return status.HTTP_500_INTERNAL_SERVER_ERROR, "internal_error"


# ============================================================================
# Error Logger
# ============================================================================

class ErrorLogger:
    """Error logging utility."""
    
    def __init__(self):
        self.logger = logger
    
    def log_error(
        self,
        exception: Exception,
        request: Optional[Request] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Log error with context.
        
        Args:
            exception: The exception to log
            request: HTTP request
            context: Additional context
        """
        error_data = {
            "error_type": type(exception).__name__,
            "error_message": str(exception),
            "timestamp": datetime.utcnow().isoformat(),
            "context": context or {},
        }
        
        if request:
            error_data.update({
                "request_path": request.url.path,
                "request_method": request.method,
                "request_headers": dict(request.headers),
                "client_ip": self._get_client_ip(request),
            })
        
        # Check if we should log stack trace
        if self._should_log_stack_trace(exception):
            error_data["stack_trace"] = traceback.format_exc()
        
        # Use appropriate log level
        if self._is_server_error(exception):
            self.logger.error(f"Server error: {exception}", extra=error_data)
        elif self._is_client_error(exception):
            self.logger.warning(f"Client error: {exception}", extra=error_data)
        else:
            self.logger.info(f"Error: {exception}", extra=error_data)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _should_log_stack_trace(self, exception: Exception) -> bool:
        """Determine if stack trace should be logged."""
        if settings.DEBUG:
            return True
        
        # Log stack trace for server errors
        if self._is_server_error(exception):
            return True
        
        # Log stack trace for unexpected errors
        if isinstance(exception, Exception) and not isinstance(exception, HTTPException):
            return True
        
        return False
    
    def _is_server_error(self, exception: Exception) -> bool:
        """Check if exception is a server error."""
        if isinstance(exception, HTTPException):
            return exception.status_code >= 500
        return True
    
    def _is_client_error(self, exception: Exception) -> bool:
        """Check if exception is a client error."""
        if isinstance(exception, HTTPException):
            return 400 <= exception.status_code < 500
        return isinstance(exception, (ValidationError, DomainValidationError))


# ============================================================================
# Error Handler Middleware
# ============================================================================

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for comprehensive error handling.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        debug: bool = False,
        include_stack_trace: Optional[bool] = None,
        error_response_processor: Optional[Callable] = None,
    ):
        """
        Initialize error handler middleware.
        
        Args:
            app: ASGI application
            debug: Enable debug mode
            include_stack_trace: Include stack trace in responses
            error_response_processor: Function to process error responses
        """
        super().__init__(app)
        self.debug = debug or settings.DEBUG
        self.include_stack_trace = include_stack_trace if include_stack_trace is not None else self.debug
        self.error_response_processor = error_response_processor
        
        self.error_mapper = ErrorMapper()
        self.error_logger = ErrorLogger()
        self.handler_registry = ErrorHandlerRegistry()
        
        # Register default handlers
        self._register_default_handlers()
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request with error handling.
        
        Args:
            request: HTTP request
            call_next: Next middleware or route handler
            
        Returns:
            Response: HTTP response
        """
        try:
            # Process request
            response = await call_next(request)
            
            # Check if response is an error response
            if isinstance(response, JSONResponse) and response.status_code >= 400:
                # Log error response
                self._log_error_response(response, request)
            
            return response
            
        except Exception as exc:
            # Handle exception
            return await self._handle_exception(exc, request)
    
    async def _handle_exception(self, exception: Exception, request: Request) -> Response:
        """
        Handle exception and return appropriate response.
        
        Args:
            exception: The exception to handle
            request: HTTP request
            
        Returns:
            Response: Error response
        """
        # Check for registered handler
        handler = self.handler_registry.get_handler(exception)
        if handler:
            response = await handler(request, exception)
            if response:
                return response
        
        # Use default handling
        return await self._default_error_handler(exception, request)
    
    async def _default_error_handler(self, exception: Exception, request: Request) -> Response:
        """
        Default error handler.
        
        Args:
            exception: The exception to handle
            request: HTTP request
            
        Returns:
            Response: Error response
        """
        # Log error
        self.error_logger.log_error(exception, request)
        
        # Get status code and error type
        status_code, error_type = self.error_mapper.get_status_and_type(exception)
        
        # Build error response
        error_response = self._build_error_response(
            exception=exception,
            request=request,
            status_code=status_code,
            error_type=error_type,
        )
        
        # Process response if processor is provided
        if self.error_response_processor:
            error_response = self.error_response_processor(error_response)
        
        # Return JSON response
        return error_response.to_json_response()
    
    def _build_error_response(
        self,
        exception: Exception,
        request: Request,
        status_code: int,
        error_type: str,
    ) -> ErrorResponse:
        """
        Build error response.
        
        Args:
            exception: The exception
            request: HTTP request
            status_code: HTTP status code
            error_type: Error type
            
        Returns:
            ErrorResponse: Error response
        """
        # Get request ID
        request_id = request.headers.get("X-Request-ID")
        
        # Build error details
        errors = self._extract_error_details(exception)
        
        # Get message
        message = self._get_error_message(exception)
        
        # Create response
        response = ErrorResponse(
            error_type=error_type,
            message=message,
            status_code=status_code,
            errors=errors,
            request_id=request_id,
            path=request.url.path,
            method=request.method,
        )
        
        # Add stack trace in debug mode
        if self.include_stack_trace:
            response.details = {"stack_trace": traceback.format_exc()}
        
        return response
    
    def _extract_error_details(self, exception: Exception) -> List[ErrorDetail]:
        """
        Extract error details from exception.
        
        Args:
            exception: The exception
            
        Returns:
            List[ErrorDetail]: List of error details
        """
        errors = []
        
        # Handle Pydantic validation errors
        if isinstance(exception, ValidationError):
            for error in exception.errors():
                field = ".".join(str(loc) for loc in error.get("loc", []))
                errors.append(
                    ErrorDetail(
                        code=error.get("type", "validation_error"),
                        message=error.get("msg", "Validation error"),
                        field=field,
                    )
                )
        
        # Handle domain validation errors
        elif isinstance(exception, DomainValidationError):
            if hasattr(exception, "errors") and exception.errors:
                for field, error in exception.errors.items():
                    errors.append(
                        ErrorDetail(
                            code=error.get("code", "validation_error"),
                            message=error.get("message", str(exception)),
                            field=field,
                            details=error.get("details"),
                        )
                    )
            else:
                errors.append(
                    ErrorDetail(
                        code="validation_error",
                        message=str(exception),
                    )
                )
        
        # Handle business rule errors
        elif isinstance(exception, BusinessRuleError):
            errors.append(
                ErrorDetail(
                    code="business_rule_violation",
                    message=str(exception),
                    details=getattr(exception, "details", {}),
                )
            )
        
        # Handle entity not found
        elif isinstance(exception, EntityNotFoundError):
            errors.append(
                ErrorDetail(
                    code="entity_not_found",
                    message=str(exception),
                    details=getattr(exception, "details", {}),
                )
            )
        
        # Handle all other exceptions
        else:
            errors.append(
                ErrorDetail(
                    code=error_type_to_code(exception),
                    message=str(exception),
                )
            )
        
        return errors
    
    def _get_error_message(self, exception: Exception) -> str:
        """
        Get user-friendly error message.
        
        Args:
            exception: The exception
            
        Returns:
            str: Error message
        """
        # Return custom message for known exceptions
        if isinstance(exception, EntityNotFoundError):
            return "The requested resource was not found"
        
        if isinstance(exception, UnauthorizedError):
            return "Authentication required"
        
        if isinstance(exception, PermissionDeniedError):
            return "You don't have permission to perform this action"
        
        if isinstance(exception, DomainValidationError):
            return "Validation error occurred"
        
        if isinstance(exception, BusinessRuleError):
            return "Business rule violation"
        
        if isinstance(exception, ConflictError):
            return "Resource conflict occurred"
        
        if isinstance(exception, ServiceUnavailableError):
            return "Service temporarily unavailable"
        
        if isinstance(exception, ExternalServiceError):
            return "External service error"
        
        if isinstance(exception, ValidationError):
            return "Request validation failed"
        
        if isinstance(exception, HTTPException):
            # Use HTTP exception detail
            return str(exception.detail)
        
        if isinstance(exception, IntegrityError):
            return "Database integrity error"
        
        # Default message for server errors
        if isinstance(exception, Exception):
            if settings.DEBUG:
                return str(exception)
            return "Internal server error"
        
        return "An unexpected error occurred"
    
    def _log_error_response(self, response: JSONResponse, request: Request) -> None:
        """
        Log error response.
        
        Args:
            response: Error response
            request: HTTP request
        """
        try:
            content = response.body
            if content:
                data = json.loads(content)
                error_type = data.get("error_type", "unknown")
                message = data.get("message", "Unknown error")
                status_code = response.status_code
                
                logger.warning(
                    f"Error response: {status_code} - {error_type} - {message}",
                    extra={
                        "status_code": status_code,
                        "error_type": error_type,
                        "message": message,
                        "path": request.url.path,
                        "method": request.method,
                    }
                )
        except Exception:
            pass
    
    def _register_default_handlers(self):
        """Register default error handlers."""
        # Register handler for ValidationError
        @self.handler_registry.register(ValidationError)
        async def handle_validation_error(request: Request, exc: ValidationError) -> JSONResponse:
            """Handle Pydantic validation errors."""
            errors = []
            for error in exc.errors():
                field = ".".join(str(loc) for loc in error.get("loc", []))
                errors.append({
                    "code": error.get("type", "validation_error"),
                    "message": error.get("msg", "Validation error"),
                    "field": field,
                })
            
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error_type": "validation_error",
                    "message": "Request validation failed",
                    "errors": errors,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
        
        # Register handler for UnauthorizedError
        @self.handler_registry.register(UnauthorizedError)
        async def handle_unauthorized_error(request: Request, exc: UnauthorizedError) -> JSONResponse:
            """Handle unauthorized errors."""
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error_type": "unauthorized",
                    "message": str(exc) or "Authentication required",
                    "timestamp": datetime.utcnow().isoformat(),
                },
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Register handler for PermissionDeniedError
        @self.handler_registry.register(PermissionDeniedError)
        async def handle_permission_denied_error(request: Request, exc: PermissionDeniedError) -> JSONResponse:
            """Handle permission denied errors."""
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error_type": "forbidden",
                    "message": str(exc) or "Permission denied",
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
        
        # Register handler for EntityNotFoundError
        @self.handler_registry.register(EntityNotFoundError)
        async def handle_not_found_error(request: Request, exc: EntityNotFoundError) -> JSONResponse:
            """Handle entity not found errors."""
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "error_type": "not_found",
                    "message": str(exc) or "Resource not found",
                    "timestamp": datetime.utcnow().isoformat(),
                    "resource_type": getattr(exc, "resource_type", None),
                    "resource_id": getattr(exc, "resource_id", None),
                }
            )
        
        # Register handler for BusinessRuleError
        @self.handler_registry.register(BusinessRuleError)
        async def handle_business_rule_error(request: Request, exc: BusinessRuleError) -> JSONResponse:
            """Handle business rule errors."""
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error_type": "business_rule_error",
                    "message": str(exc),
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": getattr(exc, "details", {}),
                }
            )
        
        # Register handler for DomainValidationError
        @self.handler_registry.register(DomainValidationError)
        async def handle_domain_validation_error(request: Request, exc: DomainValidationError) -> JSONResponse:
            """Handle domain validation errors."""
            errors = []
            if hasattr(exc, "errors") and exc.errors:
                for field, error in exc.errors.items():
                    errors.append({
                        "code": error.get("code", "validation_error"),
                        "message": error.get("message", str(exc)),
                        "field": field,
                        "details": error.get("details"),
                    })
            
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error_type": "validation_error",
                    "message": str(exc) or "Validation error",
                    "errors": errors,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
        
        # Register handler for ConflictError
        @self.handler_registry.register(ConflictError)
        async def handle_conflict_error(request: Request, exc: ConflictError) -> JSONResponse:
            """Handle conflict errors."""
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "error_type": "conflict",
                    "message": str(exc),
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": getattr(exc, "details", {}),
                }
            )
        
        # Register handler for ServiceUnavailableError
        @self.handler_registry.register(ServiceUnavailableError)
        async def handle_service_unavailable_error(request: Request, exc: ServiceUnavailableError) -> JSONResponse:
            """Handle service unavailable errors."""
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "error_type": "service_unavailable",
                    "message": str(exc) or "Service temporarily unavailable",
                    "timestamp": datetime.utcnow().isoformat(),
                    "retry_after": getattr(exc, "retry_after", 60),
                },
                headers={"Retry-After": str(getattr(exc, "retry_after", 60))},
            )
        
        # Register handler for ExternalServiceError
        @self.handler_registry.register(ExternalServiceError)
        async def handle_external_service_error(request: Request, exc: ExternalServiceError) -> JSONResponse:
            """Handle external service errors."""
            return JSONResponse(
                status_code=status.HTTP_502_BAD_GATEWAY,
                content={
                    "error_type": "external_service_error",
                    "message": str(exc) or "External service error",
                    "timestamp": datetime.utcnow().isoformat(),
                    "service": getattr(exc, "service_name", None),
                    "details": getattr(exc, "details", {}),
                }
            )
        
        # Register handler for IntegrityError
        @self.handler_registry.register(IntegrityError)
        async def handle_integrity_error(request: Request, exc: IntegrityError) -> JSONResponse:
            """Handle database integrity errors."""
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "error_type": "database_integrity_error",
                    "message": "Database integrity constraint violation",
                    "timestamp": datetime.utcnow().isoformat(),
                    "detail": str(exc.orig) if settings.DEBUG else None,
                }
            )
        
        # Register handler for SQLAlchemyError
        @self.handler_registry.register(SQLAlchemyError)
        async def handle_sqlalchemy_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
            """Handle SQLAlchemy errors."""
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error_type": "database_error",
                    "message": "Database error occurred",
                    "timestamp": datetime.utcnow().isoformat(),
                    "detail": str(exc) if settings.DEBUG else None,
                }
            )
        
        # Register handler for RedisError
        @self.handler_registry.register(RedisError)
        async def handle_redis_error(request: Request, exc: RedisError) -> JSONResponse:
            """Handle Redis errors."""
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "error_type": "cache_error",
                    "message": "Cache service temporarily unavailable",
                    "timestamp": datetime.utcnow().isoformat(),
                    "retry_after": 60,
                },
                headers={"Retry-After": "60"},
            )
        
        # Register handler for JWTError
        @self.handler_registry.register(JWTError)
        async def handle_jwt_error(request: Request, exc: JWTError) -> JSONResponse:
            """Handle JWT errors."""
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error_type": "invalid_token",
                    "message": "Invalid or expired token",
                    "timestamp": datetime.utcnow().isoformat(),
                },
                headers={"WWW-Authenticate": "Bearer"},
            )


# ============================================================================
# Helper Functions
# ============================================================================

def error_type_to_code(exception: Exception) -> str:
    """
    Convert exception to error code.
    
    Args:
        exception: The exception
        
    Returns:
        str: Error code
    """
    # Convert exception class name to snake_case
    name = type(exception).__name__
    # Remove common suffixes
    for suffix in ["Error", "Exception"]:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    # Convert to snake_case
    import re
    name = re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
    return name


def create_error_response(
    message: str,
    status_code: int,
    error_type: str = "error",
    errors: Optional[List[Dict[str, Any]]] = None,
    **kwargs
) -> JSONResponse:
    """
    Create a standardized error response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        error_type: Error type
        errors: List of error details
        **kwargs: Additional fields
        
    Returns:
        JSONResponse: Error response
    """
    content = {
        "error_type": error_type,
        "message": message,
        "status_code": status_code,
        "timestamp": datetime.utcnow().isoformat(),
        **kwargs
    }
    
    if errors:
        content["errors"] = errors
    
    return JSONResponse(
        status_code=status_code,
        content=content,
    )


# ============================================================================
# Decorator for Exception Handling
# ============================================================================

def handle_exceptions(
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    error_type: str = "internal_error",
    log_error: bool = True,
):
    """
    Decorator for handling exceptions in route handlers.
    
    Args:
        status_code: HTTP status code for unhandled exceptions
        error_type: Error type for unhandled exceptions
        log_error: Whether to log the error
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as exc:
                if log_error:
                    logger.error(f"Error in {func.__name__}: {exc}", exc_info=True)
                
                # Return error response
                return create_error_response(
                    message=str(exc),
                    status_code=status_code,
                    error_type=error_type,
                )
        return wrapper
    return decorator


# ============================================================================
# FastAPI Exception Handlers
# ============================================================================

def setup_fastapi_exception_handlers(app):
    """
    Setup exception handlers for FastAPI app.
    
    Args:
        app: FastAPI application
    """
    error_mapper = ErrorMapper()
    error_logger = ErrorLogger()
    
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        """Handle all exceptions."""
        error_logger.log_error(exc, request)
        status_code, error_type = error_mapper.get_status_and_type(exc)
        
        return create_error_response(
            message=str(exc) if settings.DEBUG else "Internal server error",
            status_code=status_code,
            error_type=error_type,
            stack_trace=traceback.format_exc() if settings.DEBUG else None,
        )
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions."""
        error_logger.log_error(exc, request)
        
        return create_error_response(
            message=str(exc.detail),
            status_code=exc.status_code,
            error_type="http_exception",
        )
    
    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError):
        """Handle validation errors."""
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error.get("loc", []))
            errors.append({
                "code": error.get("type", "validation_error"),
                "message": error.get("msg", "Validation error"),
                "field": field,
            })
        
        return create_error_response(
            message="Request validation failed",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="validation_error",
            errors=errors,
        )