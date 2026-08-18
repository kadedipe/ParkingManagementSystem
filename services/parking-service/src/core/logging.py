# ============================================================================
# Logging Module - Logging Configuration
# ============================================================================

# parking-management-system/services/parking-service/src/core/logging.py

import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger

from src.core.config import settings

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter for structured logging"""
    
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['service'] = settings.SERVICE_NAME
        log_record['environment'] = settings.ENVIRONMENT
        log_record['version'] = settings.VERSION
        
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
        
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id
        
        if hasattr(record, 'correlation_id'):
            log_record['correlation_id'] = record.correlation_id

class CustomFormatter(logging.Formatter):
    """Custom formatter for console output"""
    
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    green = "\x1b[32;20m"
    blue = "\x1b[34;20m"
    reset = "\x1b[0m"
    
    format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)'
    
    FORMATS = {
        logging.DEBUG: blue + format + reset,
        logging.INFO: green + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: red + format + reset,
        logging.CRITICAL: bold_red + format + reset,
    }
    
    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, self.format)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)

def setup_logging() -> logging.Logger:
    """Setup logging configuration"""
    
    # Get root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    if settings.LOG_FORMAT == "json":
        console_handler.setFormatter(CustomJsonFormatter())
    else:
        console_handler.setFormatter(CustomFormatter())
    logger.addHandler(console_handler)
    
    # File handler
    if settings.LOG_FILE:
        file_handler = RotatingFileHandler(
            settings.LOG_FILE,
            maxBytes=10485760,  # 10MB
            backupCount=5,
        )
        if settings.LOG_FORMAT == "json":
            file_handler.setFormatter(CustomJsonFormatter())
        else:
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            ))
        logger.addHandler(file_handler)
    
    # Set log levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    # Get application logger
    app_logger = logging.getLogger(settings.SERVICE_NAME)
    
    return app_logger

def get_logger(name: str = None) -> logging.Logger:
    """Get logger instance"""
    if name:
        return logging.getLogger(name)
    return logging.getLogger(settings.SERVICE_NAME)

class LoggerContext:
    """Context manager for adding extra fields to logs"""
    
    def __init__(self, logger: logging.Logger, **kwargs):
        self.logger = logger
        self.kwargs = kwargs
        self.old_extra = {}
    
    def __enter__(self):
        for key, value in self.kwargs.items():
            if hasattr(self.logger, key):
                self.old_extra[key] = getattr(self.logger, key)
                setattr(self.logger, key, value)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        for key, value in self.old_extra.items():
            if value is not None:
                setattr(self.logger, key, value)
            else:
                delattr(self.logger, key)

logger = get_logger()