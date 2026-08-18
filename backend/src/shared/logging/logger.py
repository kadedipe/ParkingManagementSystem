# ============================================================================
# Logger Module
# ============================================================================

"""
Logger module for the parking management system.

This module provides core logging functionality with support for
structured logging, context management, and multiple output formats.
"""

import sys
import logging
import json
import time
import traceback
from typing import Optional, Dict, Any, Union, List, Callable
from datetime import datetime
from functools import wraps
from enum import Enum
from contextvars import ContextVar
from pathlib import Path

from .context import LogContextManager
from .formatters import get_formatter
from .handlers import create_handler
from .filters import create_filter


# ============================================================================
# Log Level Enum
# ============================================================================

class LogLevel(str, Enum):
    """Log level enum."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


# ============================================================================
# Log Context
# ============================================================================

class LogContext:
    """
    Log context for storing contextual information.
    
    This class provides a thread-safe way to store and retrieve
    contextual information for logging.
    """
    
    _context: ContextVar[Dict[str, Any]] = ContextVar("log_context", default={})
    
    @classmethod
    def get(cls) -> Dict[str, Any]:
        """Get the current log context."""
        return cls._context.get()
    
    @classmethod
    def set(cls, context: Dict[str, Any]):
        """Set the log context."""
        cls._context.set(context)
    
    @classmethod
    def update(cls, **kwargs):
        """Update the log context with key-value pairs."""
        current = cls.get()
        current.update(kwargs)
        cls._context.set(current)
    
    @classmethod
    def clear(cls):
        """Clear the log context."""
        cls._context.set({})
    
    @classmethod
    def get_value(cls, key: str, default: Any = None) -> Any:
        """Get a value from the context."""
        return cls.get().get(key, default)


# ============================================================================
# Logger Class
# ============================================================================

class Logger:
    """
    Custom logger with structured logging support.
    
    This class extends the standard Python logger with additional
    features for structured logging, context management, and
    performance monitoring.
    """
    
    def __init__(
        self,
        name: str = "parking_system",
        level: Union[str, int] = logging.INFO,
        format_type: str = "json",
        handlers: Optional[List[Dict[str, Any]]] = None,
        filters: Optional[List[Dict[str, Any]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ):
        """
        Initialize the logger.
        
        Args:
            name: Logger name
            level: Log level
            format_type: Log format type (json, console, colored)
            handlers: List of handler configurations
            filters: List of filter configurations
            context: Initial context
        """
        self.name = name
        self.level = level
        self.format_type = format_type
        self.handlers = handlers or []
        self.filters = filters or []
        self.context = context or {}
        
        # Create logger instance
        self._logger = self._create_logger()
        
        # Initialize context
        if context:
            LogContext.update(**context)
    
    def _create_logger(self) -> logging.Logger:
        """
        Create the underlying logger instance.
        
        Returns:
            logging.Logger: Configured logger instance
        """
        # Get or create logger
        logger = logging.getLogger(self.name)
        logger.setLevel(self.level)
        
        # Remove existing handlers
        logger.handlers.clear()
        
        # Add handlers
        if self.handlers:
            for handler_config in self.handlers:
                handler = create_handler(handler_config)
                if handler:
                    # Set formatter
                    formatter = get_formatter(
                        self.format_type,
                        handler_config.get("format_config")
                    )
                    handler.setFormatter(formatter)
                    
                    # Set level
                    if "level" in handler_config:
                        handler.setLevel(handler_config["level"])
                    
                    # Add filters
                    for filter_config in self.filters:
                        filter_obj = create_filter(filter_config)
                        if filter_obj:
                            handler.addFilter(filter_obj)
                    
                    logger.addHandler(handler)
        else:
            # Default console handler
            console_handler = logging.StreamHandler(sys.stdout)
            formatter = get_formatter(self.format_type)
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        # Add filters to logger
        for filter_config in self.filters:
            filter_obj = create_filter(filter_config)
            if filter_obj:
                logger.addFilter(filter_obj)
        
        # Prevent propagation to root logger
        logger.propagate = False
        
        return logger
    
    def _prepare_log_data(
        self,
        message: str,
        level: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Optional[Exception] = None,
    ) -> Dict[str, Any]:
        """
        Prepare log data with context and extras.
        
        Args:
            message: Log message
            level: Log level
            extra: Extra data to include
            exc_info: Exception information
            
        Returns:
            Dict[str, Any]: Prepared log data
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "logger": self.name,
            "message": message,
        }
        
        # Add context
        context = LogContext.get()
        if context:
            log_data["context"] = context
        
        # Add extra data
        if extra:
            # Filter sensitive data
            log_data.update(extra)
        
        # Add exception info
        if exc_info:
            log_data["exception"] = {
                "type": type(exc_info).__name__,
                "message": str(exc_info),
                "traceback": traceback.format_exc() if exc_info else None,
            }
        
        return log_data
    
    def _log(
        self,
        level: str,
        message: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Optional[Exception] = None,
    ) -> None:
        """
        Log a message with the specified level.
        
        Args:
            level: Log level
            message: Log message
            extra: Extra data to include
            exc_info: Exception information
        """
        log_data = self._prepare_log_data(message, level, extra, exc_info)
        
        # Get the appropriate logging method
        log_method = getattr(self._logger, level.lower())
        
        # Log the message
        if exc_info:
            log_method(message, exc_info=exc_info, extra=extra)
        else:
            log_method(message, extra=log_data)
    
    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log debug message."""
        self._log("DEBUG", message, extra)
    
    def info(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log info message."""
        self._log("INFO", message, extra)
    
    def warning(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log warning message."""
        self._log("WARNING", message, extra)
    
    def error(
        self,
        message: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Optional[Exception] = None,
    ) -> None:
        """Log error message."""
        self._log("ERROR", message, extra, exc_info)
    
    def critical(
        self,
        message: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Optional[Exception] = None,
    ) -> None:
        """Log critical message."""
        self._log("CRITICAL", message, extra, exc_info)
    
    def exception(self, message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log exception with traceback."""
        self._log("ERROR", message, extra, sys.exc_info()[1])
    
    def log(self, level: Union[str, int], message: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """
        Log with specified level.
        
        Args:
            level: Log level (string or int)
            message: Log message
            extra: Extra data to include
        """
        if isinstance(level, int):
            level = logging.getLevelName(level)
        self._log(level, message, extra)
    
    def with_context(self, **kwargs) -> 'Logger':
        """
        Add context to the logger.
        
        Args:
            **kwargs: Context key-value pairs
            
        Returns:
            Logger: Logger instance
        """
        LogContext.update(**kwargs)
        return self
    
    def set_context(self, context: Dict[str, Any]) -> 'Logger':
        """
        Set the log context.
        
        Args:
            context: Context dictionary
            
        Returns:
            Logger: Logger instance
        """
        LogContext.set(context)
        return self
    
    def clear_context(self) -> 'Logger':
        """Clear the log context."""
        LogContext.clear()
        return self
    
    def set_level(self, level: Union[str, int]) -> 'Logger':
        """
        Set the log level.
        
        Args:
            level: Log level
            
        Returns:
            Logger: Logger instance
        """
        if isinstance(level, str):
            level = getattr(logging, level.upper())
        self._logger.setLevel(level)
        return self
    
    def get_logger(self) -> logging.Logger:
        """
        Get the underlying logger instance.
        
        Returns:
            logging.Logger: Underlying logger
        """
        return self._logger


# ============================================================================
# Logger Factory
# ============================================================================

class LoggerFactory:
    """
    Factory class for creating and managing loggers.
    """
    
    _loggers: Dict[str, Logger] = {}
    _default_config: Dict[str, Any] = {}
    
    @classmethod
    def configure(cls, config: Dict[str, Any]) -> None:
        """
        Configure the logger factory.
        
        Args:
            config: Configuration dictionary
        """
        cls._default_config = config
    
    @classmethod
    def get_logger(
        cls,
        name: str = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> Logger:
        """
        Get or create a logger instance.
        
        Args:
            name: Logger name (uses module name if None)
            config: Logger configuration
            
        Returns:
            Logger: Logger instance
        """
        # Use calling module name if not provided
        if name is None:
            import inspect
            frame = inspect.stack()[1]
            module = inspect.getmodule(frame[0])
            name = module.__name__ if module else "unknown"
        
        # Use provided config or default
        config = config or cls._default_config.copy()
        config["name"] = name
        
        # Create logger key
        key = f"{name}:{json.dumps(config, sort_keys=True)}"
        
        # Return cached logger if exists
        if key in cls._loggers:
            return cls._loggers[key]
        
        # Create new logger
        logger_obj = Logger(**config)
        cls._loggers[key] = logger_obj
        
        return logger_obj
    
    @classmethod
    def clear_cache(cls) -> None:
        """Clear the logger cache."""
        cls._loggers.clear()


# ============================================================================
# Convenience Functions
# ============================================================================

# Default logger instance
_logger: Optional[Logger] = None


def get_logger(
    name: Optional[str] = None,
    config: Optional[Dict[str, Any]] = None,
) -> Logger:
    """
    Get a logger instance.
    
    Args:
        name: Logger name (uses calling module name if None)
        config: Logger configuration
        
    Returns:
        Logger: Logger instance
    """
    return LoggerFactory.get_logger(name, config)


def setup_logging(config: Optional[Dict[str, Any]] = None) -> None:
    """
    Setup logging configuration.
    
    Args:
        config: Logging configuration
    """
    global _logger
    
    # Configure factory
    if config:
        LoggerFactory.configure(config)
    
    # Create root logger
    _logger = get_logger("parking_system")
    
    # Set level
    if config and "level" in config:
        _logger.set_level(config["level"])


def log_request(request_data: Dict[str, Any], extra: Optional[Dict[str, Any]] = None) -> None:
    """
    Log a request.
    
    Args:
        request_data: Request data
        extra: Extra data to include
    """
    logger = get_logger()
    log_data = {
        "event_type": "request",
        "request": request_data,
    }
    if extra:
        log_data.update(extra)
    logger.info("Request received", log_data)


def log_response(response_data: Dict[str, Any], extra: Optional[Dict[str, Any]] = None) -> None:
    """
    Log a response.
    
    Args:
        response_data: Response data
        extra: Extra data to include
    """
    logger = get_logger()
    log_data = {
        "event_type": "response",
        "response": response_data,
    }
    if extra:
        log_data.update(extra)
    logger.info("Response sent", log_data)


def log_exception(exception: Exception, extra: Optional[Dict[str, Any]] = None) -> None:
    """
    Log an exception.
    
    Args:
        exception: Exception to log
        extra: Extra data to include
    """
    logger = get_logger()
    logger.error(f"Exception: {str(exception)}", extra=extra, exc_info=exception)


def log_performance(
    operation: str,
    duration_ms: float,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log performance metrics.
    
    Args:
        operation: Operation name
        duration_ms: Duration in milliseconds
        extra: Extra data to include
    """
    logger = get_logger()
    log_data = {
        "event_type": "performance",
        "operation": operation,
        "duration_ms": duration_ms,
    }
    if extra:
        log_data.update(extra)
    logger.info(f"Performance: {operation} took {duration_ms}ms", log_data)


def log_security_event(
    event_type: str,
    user_id: Optional[Union[int, str]] = None,
    ip: Optional[str] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log a security event.
    
    Args:
        event_type: Security event type
        user_id: User ID
        ip: IP address
        extra: Extra data to include
    """
    logger = get_logger()
    log_data = {
        "event_type": "security",
        "security_event": event_type,
    }
    if user_id:
        log_data["user_id"] = user_id
    if ip:
        log_data["ip"] = ip
    if extra:
        log_data.update(extra)
    logger.info(f"Security event: {event_type}", log_data)


def log_business_event(
    event_type: str,
    data: Dict[str, Any],
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log a business event.
    
    Args:
        event_type: Business event type
        data: Event data
        extra: Extra data to include
    """
    logger = get_logger()
    log_data = {
        "event_type": "business",
        "business_event": event_type,
        "data": data,
    }
    if extra:
        log_data.update(extra)
    logger.info(f"Business event: {event_type}", log_data)


# ============================================================================
# Decorators
# ============================================================================

def log_function_call(level: str = "DEBUG"):
    """
    Decorator to log function calls.
    
    Args:
        level: Log level
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger()
            func_name = func.__name__
            module_name = func.__module__
            
            logger._log(
                level,
                f"Calling {module_name}.{func_name}",
                {"args": args, "kwargs": kwargs}
            )
            
            try:
                result = func(*args, **kwargs)
                logger._log(
                    level,
                    f"Completed {module_name}.{func_name}",
                    {"result": result}
                )
                return result
            except Exception as e:
                logger.error(
                    f"Exception in {module_name}.{func_name}",
                    exc_info=e
                )
                raise
        return wrapper
    return decorator


def log_performance_decorator(operation: Optional[str] = None):
    """
    Decorator to log performance metrics.
    
    Args:
        operation: Operation name
        
    Returns:
        Callable: Decorated function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger()
            op_name = operation or func.__name__
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                log_performance(op_name, duration_ms)
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                log_performance(op_name, duration_ms, {"error": str(e)})
                raise
        return wrapper
    return decorator


# ============================================================================
# Default Logger Instance
# ============================================================================

# Create default logger
logger = get_logger("parking_system")


# ============================================================================
# Module Documentation
# ============================================================================

"""
Logger Module
=============

This module provides the core logging functionality for the parking management
system.

Key Components:
--------------
1. Logger: Custom logger with structured logging support
2. LogContext: Thread-safe context management
3. LoggerFactory: Factory for creating and managing loggers
4. Decorators: Logging decorators for functions and methods
5. Convenience Functions: Common logging patterns

Usage:
------
```python
from src.shared.logging import get_logger, logger, log_performance

# Get a logger instance
logger = get_logger(__name__)

# Basic logging
logger.info("Application started")
logger.error("An error occurred", extra={"error_code": 500})

# With context
logger.with_context(user_id=123, action="login").info("User logged in")

# Performance logging
@log_performance("payment_processing")
def process_payment():
    # Automatically logs performance metrics
    pass

# Security logging
from src.shared.logging import log_security_event
log_security_event("login_failed", user_id=123, ip="192.168.1.1")