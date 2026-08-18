# ============================================================================
# Logging Package
# ============================================================================

"""
Logging package for the parking management system.

This package provides comprehensive logging functionality with support for
structured logging, context management, and multiple output formats.
"""

from .logger import (
    Logger,
    get_logger,
    setup_logging,
    log_request,
    log_response,
    log_exception,
    log_performance,
    log_security_event,
    log_business_event,
    LogContext,
    LogLevel,
    logger,
)
from .formatters import (
    JSONFormatter,
    ConsoleFormatter,
    ColoredConsoleFormatter,
    LogstashFormatter,
    GCPFormatter,
    AWSFormatter,
    format_log_message,
    get_formatter,
)
from .handlers import (
    FileHandler,
    RotatingFileHandler,
    TimedRotatingFileHandler,
    SysLogHandler,
    SocketHandler,
    HTTPHandler,
    QueueHandler,
    KafkaHandler,
    ElasticsearchHandler,
    create_handler,
    get_handler,
)
from .context import (
    LogContextManager,
    add_context,
    get_context,
    clear_context,
    set_request_id,
    get_request_id,
    set_user_id,
    get_user_id,
    set_correlation_id,
    get_correlation_id,
    set_session_id,
    get_session_id,
    context,
    request_context,
)
from .filters import (
    LevelFilter,
    ContextFilter,
    RequestFilter,
    UserFilter,
    ModuleFilter,
    SensitiveDataFilter,
    ExcludeFilter,
    IncludeFilter,
    create_filter,
    get_filter,
)
from .middleware import (
    LoggingMiddleware,
    RequestLoggingMiddleware,
    ResponseLoggingMiddleware,
    ErrorLoggingMiddleware,
    add_logging_middleware,
)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Logger
    "Logger",
    "get_logger",
    "setup_logging",
    "log_request",
    "log_response",
    "log_exception",
    "log_performance",
    "log_security_event",
    "log_business_event",
    "LogContext",
    "LogLevel",
    "logger",
    
    # Formatters
    "JSONFormatter",
    "ConsoleFormatter",
    "ColoredConsoleFormatter",
    "LogstashFormatter",
    "GCPFormatter",
    "AWSFormatter",
    "format_log_message",
    "get_formatter",
    
    # Handlers
    "FileHandler",
    "RotatingFileHandler",
    "TimedRotatingFileHandler",
    "SysLogHandler",
    "SocketHandler",
    "HTTPHandler",
    "QueueHandler",
    "KafkaHandler",
    "ElasticsearchHandler",
    "create_handler",
    "get_handler",
    
    # Context
    "LogContextManager",
    "add_context",
    "get_context",
    "clear_context",
    "set_request_id",
    "get_request_id",
    "set_user_id",
    "get_user_id",
    "set_correlation_id",
    "get_correlation_id",
    "set_session_id",
    "get_session_id",
    "context",
    "request_context",
    
    # Filters
    "LevelFilter",
    "ContextFilter",
    "RequestFilter",
    "UserFilter",
    "ModuleFilter",
    "SensitiveDataFilter",
    "ExcludeFilter",
    "IncludeFilter",
    "create_filter",
    "get_filter",
    
    # Middleware
    "LoggingMiddleware",
    "RequestLoggingMiddleware",
    "ResponseLoggingMiddleware",
    "ErrorLoggingMiddleware",
    "add_logging_middleware",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Initialization
# ============================================================================

import logging
from typing import Optional
from .logger import setup_logging, get_logger
from .context import LogContextManager

# Setup default logging
_logger = None


def initialize_logging(config: Optional[dict] = None):
    """
    Initialize the logging package.
    
    Args:
        config: Optional logging configuration
    """
    global _logger
    
    # Setup logging with configuration
    setup_logging(config)
    
    # Get root logger
    _logger = get_logger(__name__)
    _logger.info(f"Logging package initialized v{__version__}")
    
    # Log context manager initialized
    LogContextManager.get_instance()
    
    return _logger


def get_package_logger():
    """Get the package logger."""
    if _logger is None:
        return initialize_logging()
    return _logger


# Initialize logging
initialize_logging()


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
        "name": "logging",
        "version": __version__,
        "description": "Comprehensive logging utilities for the parking management system",
        "features": [
            "Structured logging",
            "Context management",
            "Multiple output formats",
            "Log filtering",
            "Request/response logging",
            "Performance logging",
            "Security event logging",
            "Business event logging",
        ],
        "modules": [
            "logger",
            "formatters",
            "handlers",
            "context",
            "filters",
            "middleware",
        ],
    }


# ============================================================================
# Package Documentation
# ============================================================================

"""
Logging Package Documentation
=============================

The logging package provides comprehensive logging functionality with
support for structured logging, context management, and multiple output formats.

Key Features:
------------
1. **Structured Logging**: JSON-formatted logs for easy parsing
2. **Context Management**: Request-scoped logging context
3. **Multiple Formats**: JSON, console, colored, Logstash, GCP, AWS
4. **Multiple Handlers**: File, rotating file, syslog, socket, HTTP, queue, Kafka, Elasticsearch
5. **Log Filtering**: Level, context, request, user, module, sensitive data
6. **Middleware Integration**: Request/response logging middleware
7. **Performance Logging**: Log execution time and performance metrics
8. **Security Logging**: Log security events and audit trails
9. **Business Logging**: Log business events and transactions

Quick Start:
-----------
```python
from src.shared.logging import get_logger, logger, log_request, log_response

# Get a logger instance
logger = get_logger(__name__)

# Basic logging
logger.info("Application started")
logger.error("An error occurred", extra={"error_code": 500})

# Structured logging
logger.info("User logged in", extra={
    "user_id": 123,
    "username": "john_doe",
    "ip": "192.168.1.1"
})

# Request logging
@log_request
async def handle_request(request):
    return {"status": "success"}

# Response logging
@log_response
async def handle_response(request):
    return {"status": "success"}

# Using context
from src.shared.logging import add_context, set_request_id

set_request_id("req-123")
add_context({"user_id": 123, "action": "login"})
logger.info("User action logged")  # Automatically includes context