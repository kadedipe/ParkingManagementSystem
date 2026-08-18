# ============================================================================
# Config Package
# ============================================================================

"""
Configuration package for the parking management system.

This package provides configuration management using Pydantic settings,
environment variables, and configuration files.
"""

from .settings import (
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
    AnalyticsSettings,
    MonitoringSettings,
    CacheSettings,
    QueueSettings,
    FeatureFlagSettings,
    get_settings,
    load_settings,
)
from .environment import (
    Environment,
    get_environment,
    is_development,
    is_production,
    is_testing,
    is_staging,
    get_env_variable,
    set_env_variable,
    load_env_file,
)
from .validators import (
    validate_database_url,
    validate_redis_url,
    validate_email_config,
    validate_jwt_config,
    validate_payment_config,
    validate_storage_config,
    validate_rate_limit_config,
    validate_cors_config,
    validate_security_config,
    ConfigValidationError,
    ConfigValidator,
)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Settings
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
    "AnalyticsSettings",
    "MonitoringSettings",
    "CacheSettings",
    "QueueSettings",
    "FeatureFlagSettings",
    "get_settings",
    "load_settings",
    
    # Environment
    "Environment",
    "get_environment",
    "is_development",
    "is_production",
    "is_testing",
    "is_staging",
    "get_env_variable",
    "set_env_variable",
    "load_env_file",
    
    # Validators
    "validate_database_url",
    "validate_redis_url",
    "validate_email_config",
    "validate_jwt_config",
    "validate_payment_config",
    "validate_storage_config",
    "validate_rate_limit_config",
    "validate_cors_config",
    "validate_security_config",
    "ConfigValidationError",
    "ConfigValidator",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Initialization
# ============================================================================

import logging
from pathlib import Path
from .environment import get_environment, load_env_file
from .settings import get_settings

# Setup logging for config package
logger = logging.getLogger(__name__)


def initialize_config(env_file: str = ".env", validate: bool = True):
    """
    Initialize the configuration package.
    
    Args:
        env_file: Path to the environment file
        validate: Whether to validate the configuration
        
    Returns:
        Settings: Loaded settings instance
    """
    try:
        # Load environment file
        load_env_file(env_file)
        
        # Get settings
        settings = get_settings()
        
        # Validate configuration
        if validate:
            _validate_configuration(settings)
        
        logger.info(f"Configuration initialized for environment: {settings.ENVIRONMENT}")
        logger.info(f"Debug mode: {settings.DEBUG}")
        
        return settings
        
    except Exception as e:
        logger.error(f"Failed to initialize configuration: {e}")
        raise


def _validate_configuration(settings: Settings):
    """
    Validate the configuration.
    
    Args:
        settings: Settings instance to validate
    """
    from .validators import ConfigValidator
    
    validator = ConfigValidator()
    validator.validate_settings(settings)
    
    if validator.has_errors():
        errors = validator.get_errors()
        error_messages = "\n".join(f"  - {error}" for error in errors)
        raise ValueError(f"Configuration validation failed:\n{error_messages}")


def get_config_info() -> dict:
    """
    Get configuration information.
    
    Returns:
        dict: Configuration information
    """
    settings = get_settings()
    
    return {
        "version": __version__,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "database": {
            "host": settings.DATABASE_HOST,
            "port": settings.DATABASE_PORT,
            "name": settings.DATABASE_NAME,
            "pool_size": settings.DATABASE_POOL_SIZE,
        },
        "redis": {
            "host": settings.REDIS_HOST,
            "port": settings.REDIS_PORT,
            "db": settings.REDIS_DB,
        },
        "logging": {
            "level": settings.LOG_LEVEL,
            "format": settings.LOG_FORMAT,
        },
        "cors": {
            "allowed_origins": settings.CORS_ALLOWED_ORIGINS,
            "allow_credentials": settings.CORS_ALLOW_CREDENTIALS,
        },
        "rate_limit": {
            "enabled": settings.RATE_LIMIT_ENABLED,
            "requests_per_minute": settings.RATE_LIMIT_PER_MINUTE,
        },
    }


# ============================================================================
# Package Documentation
# ============================================================================

"""
Config Package Documentation
============================

The config package provides a unified configuration management system
using Pydantic settings with environment variable support.

Features:
---------
- Type-safe configuration using Pydantic
- Environment variable support
- Configuration validation
- Nested configuration groups
- Default values
- Environment-specific overrides

Configuration Sources (in order of precedence):
---------------------------------------------
1. Environment variables
2. .env file
3. Default values

Usage:
------
```python
from src.shared.config import settings, get_settings, is_production

# Access settings
database_url = settings.DATABASE_URL
redis_url = settings.REDIS_URL

# Check environment
if is_production():
    # Production-specific logic
    pass

# Get settings instance
settings = get_settings()

# Access nested settings
jwt_secret = settings.JWT_SECRET
email_host = settings.EMAIL_HOST