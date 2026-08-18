# ============================================================================
# Settings Module
# ============================================================================

"""
Settings configuration for the parking management system.

This module defines all configuration settings using Pydantic's BaseSettings,
with support for environment variables and default values.
"""

import os
import secrets
from typing import Optional, List, Dict, Any, Union
from pathlib import Path
from enum import Enum
from functools import lru_cache

from pydantic import (
    BaseModel,
    Field,
    validator,
    root_validator,
    PostgresDsn,
    RedisDsn,
    EmailStr,
    AnyUrl,
    SecretStr,
    ValidationError,
    ConfigDict,
)
from pydantic_settings import BaseSettings


# ============================================================================
# Environment Constants
# ============================================================================

class Environment(str, Enum):
    """Application environment enum."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class LogLevel(str, Enum):
    """Log level enum."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class DatabaseType(str, Enum):
    """Database type enum."""
    POSTGRESQL = "postgresql"
    POSTGRES = "postgres"
    SQLITE = "sqlite"


# ============================================================================
# Base Settings
# ============================================================================

class Settings(BaseSettings):
    """
    Main application settings.
    
    All settings can be configured using environment variables.
    Environment variables should be prefixed with the section name.
    """
    
    # ========================================================================
    # Application Settings
    # ========================================================================
    
    APP_NAME: str = Field(
        default="Parking Management System",
        description="Application name"
    )
    APP_VERSION: str = Field(
        default="1.0.0",
        description="Application version"
    )
    APP_DESCRIPTION: str = Field(
        default="A comprehensive parking management system",
        description="Application description"
    )
    ENVIRONMENT: Environment = Field(
        default=Environment.DEVELOPMENT,
        description="Application environment"
    )
    DEBUG: bool = Field(
        default=False,
        description="Enable debug mode"
    )
    SECRET_KEY: SecretStr = Field(
        default=SecretStr(secrets.token_urlsafe(32)),
        description="Application secret key"
    )
    API_VERSION: str = Field(
        default="v1",
        description="API version"
    )
    API_PREFIX: str = Field(
        default="/api",
        description="API URL prefix"
    )
    PROJECT_ROOT: Path = Field(
        default=Path(__file__).parent.parent.parent.parent,
        description="Project root directory"
    )
    
    # ========================================================================
    # Server Settings
    # ========================================================================
    
    HOST: str = Field(
        default="0.0.0.0",
        description="Server host"
    )
    PORT: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Server port"
    )
    WORKERS: int = Field(
        default=4,
        ge=1,
        description="Number of worker processes"
    )
    RELOAD: bool = Field(
        default=False,
        description="Enable auto-reload"
    )
    
    # ========================================================================
    # Database Settings
    # ========================================================================
    
    DATABASE_TYPE: DatabaseType = Field(
        default=DatabaseType.POSTGRESQL,
        description="Database type"
    )
    DATABASE_HOST: str = Field(
        default="localhost",
        description="Database host"
    )
    DATABASE_PORT: int = Field(
        default=5432,
        ge=1,
        le=65535,
        description="Database port"
    )
    DATABASE_NAME: str = Field(
        default="parking_db",
        description="Database name"
    )
    DATABASE_USER: str = Field(
        default="postgres",
        description="Database user"
    )
    DATABASE_PASSWORD: SecretStr = Field(
        default=SecretStr("password"),
        description="Database password"
    )
    DATABASE_SSL: bool = Field(
        default=False,
        description="Enable SSL for database connection"
    )
    DATABASE_POOL_SIZE: int = Field(
        default=10,
        ge=1,
        description="Database connection pool size"
    )
    DATABASE_MAX_OVERFLOW: int = Field(
        default=20,
        ge=0,
        description="Maximum overflow connections"
    )
    DATABASE_POOL_TIMEOUT: int = Field(
        default=30,
        ge=1,
        description="Connection pool timeout in seconds"
    )
    DATABASE_ECHO: bool = Field(
        default=False,
        description="Echo SQL queries"
    )
    DATABASE_ECHO_POOL: bool = Field(
        default=False,
        description="Echo connection pool events"
    )
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL from individual settings."""
        if self.DATABASE_TYPE == DatabaseType.SQLITE:
            return f"sqlite:///{self.DATABASE_NAME}.db"
        
        password = self.DATABASE_PASSWORD.get_secret_value()
        ssl_param = "?sslmode=require" if self.DATABASE_SSL else ""
        
        return (
            f"postgresql://{self.DATABASE_USER}:{password}@"
            f"{self.DATABASE_HOST}:{self.DATABASE_PORT}/"
            f"{self.DATABASE_NAME}{ssl_param}"
        )
    
    @property
    def DATABASE_SYNC_URL(self) -> str:
        """Construct sync database URL."""
        password = self.DATABASE_PASSWORD.get_secret_value()
        return f"postgresql://{self.DATABASE_USER}:{password}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
    
    # ========================================================================
    # Redis Settings
    # ========================================================================
    
    REDIS_HOST: str = Field(
        default="localhost",
        description="Redis host"
    )
    REDIS_PORT: int = Field(
        default=6379,
        ge=1,
        le=65535,
        description="Redis port"
    )
    REDIS_DB: int = Field(
        default=0,
        ge=0,
        le=15,
        description="Redis database number"
    )
    REDIS_PASSWORD: Optional[SecretStr] = Field(
        default=None,
        description="Redis password"
    )
    REDIS_SSL: bool = Field(
        default=False,
        description="Enable SSL for Redis connection"
    )
    REDIS_SOCKET_TIMEOUT: int = Field(
        default=5,
        ge=1,
        description="Redis socket timeout in seconds"
    )
    REDIS_SOCKET_CONNECT_TIMEOUT: int = Field(
        default=5,
        ge=1,
        description="Redis socket connect timeout in seconds"
    )
    REDIS_RETRY_ON_TIMEOUT: bool = Field(
        default=True,
        description="Retry on Redis timeout"
    )
    REDIS_MAX_CONNECTIONS: int = Field(
        default=10,
        ge=1,
        description="Maximum Redis connections"
    )
    
    @property
    def REDIS_URL(self) -> str:
        """Construct Redis URL."""
        password = self.REDIS_PASSWORD.get_secret_value() if self.REDIS_PASSWORD else None
        auth = f":{password}@" if password else ""
        scheme = "rediss" if self.REDIS_SSL else "redis"
        return f"{scheme}://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # ========================================================================
    # JWT Settings
    # ========================================================================
    
    JWT_SECRET: SecretStr = Field(
        default=SecretStr(secrets.token_urlsafe(32)),
        description="JWT secret key"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm"
    )
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        ge=1,
        description="Access token expiry in minutes"
    )
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        ge=1,
        description="Refresh token expiry in days"
    )
    JWT_RESET_TOKEN_EXPIRE_HOURS: int = Field(
        default=24,
        ge=1,
        description="Reset token expiry in hours"
    )
    JWT_VERIFY_TOKEN_EXPIRE_HOURS: int = Field(
        default=72,
        ge=1,
        description="Verification token expiry in hours"
    )
    JWT_ISSUER: str = Field(
        default="parking-system",
        description="JWT issuer"
    )
    JWT_AUDIENCE: str = Field(
        default="parking-system-api",
        description="JWT audience"
    )
    
    # ========================================================================
    # Email Settings
    # ========================================================================
    
    EMAIL_ENABLED: bool = Field(
        default=True,
        description="Enable email functionality"
    )
    EMAIL_HOST: str = Field(
        default="smtp.gmail.com",
        description="SMTP host"
    )
    EMAIL_PORT: int = Field(
        default=587,
        ge=1,
        le=65535,
        description="SMTP port"
    )
    EMAIL_USERNAME: Optional[str] = Field(
        default=None,
        description="SMTP username"
    )
    EMAIL_PASSWORD: Optional[SecretStr] = Field(
        default=None,
        description="SMTP password"
    )
    EMAIL_FROM: EmailStr = Field(
        default="noreply@parking-system.com",
        description="Default from email"
    )
    EMAIL_FROM_NAME: str = Field(
        default="Parking System",
        description="Default from name"
    )
    EMAIL_USE_TLS: bool = Field(
        default=True,
        description="Use TLS for email"
    )
    EMAIL_USE_SSL: bool = Field(
        default=False,
        description="Use SSL for email"
    )
    EMAIL_TIMEOUT: int = Field(
        default=30,
        ge=1,
        description="Email timeout in seconds"
    )
    EMAIL_TEMPLATE_DIR: str = Field(
        default="templates/email",
        description="Email template directory"
    )
    
    # ========================================================================
    # SMS Settings
    # ========================================================================
    
    SMS_ENABLED: bool = Field(
        default=False,
        description="Enable SMS functionality"
    )
    SMS_PROVIDER: str = Field(
        default="twilio",
        description="SMS provider"
    )
    SMS_ACCOUNT_SID: Optional[str] = Field(
        default=None,
        description="SMS account SID"
    )
    SMS_AUTH_TOKEN: Optional[SecretStr] = Field(
        default=None,
        description="SMS auth token"
    )
    SMS_FROM_NUMBER: str = Field(
        default="",
        description="SMS from number"
    )
    SMS_API_URL: Optional[str] = Field(
        default=None,
        description="SMS API URL"
    )
    
    # ========================================================================
    # Payment Settings
    # ========================================================================
    
    PAYMENT_ENABLED: bool = Field(
        default=False,
        description="Enable payment functionality"
    )
    PAYMENT_PROVIDER: str = Field(
        default="stripe",
        description="Payment provider"
    )
    PAYMENT_API_KEY: Optional[SecretStr] = Field(
        default=None,
        description="Payment API key"
    )
    PAYMENT_WEBHOOK_SECRET: Optional[SecretStr] = Field(
        default=None,
        description="Payment webhook secret"
    )
    PAYMENT_CURRENCY: str = Field(
        default="USD",
        description="Default currency"
    )
    PAYMENT_TAX_RATE: float = Field(
        default=0.0,
        ge=0,
        le=1,
        description="Tax rate percentage"
    )
    PAYMENT_SERVICE_FEE: float = Field(
        default=0.0,
        ge=0,
        description="Service fee percentage"
    )
    PAYMENT_MIN_AMOUNT: float = Field(
        default=0.01,
        ge=0,
        description="Minimum payment amount"
    )
    PAYMENT_MAX_AMOUNT: float = Field(
        default=10000,
        ge=0,
        description="Maximum payment amount"
    )
    
    # ========================================================================
    # Storage Settings
    # ========================================================================
    
    STORAGE_TYPE: str = Field(
        default="local",
        description="Storage type (local, s3, gcs, azure)"
    )
    STORAGE_ROOT: Path = Field(
        default=Path("storage"),
        description="Root storage directory"
    )
    STORAGE_BUCKET: Optional[str] = Field(
        default=None,
        description="Storage bucket name"
    )
    STORAGE_ACCESS_KEY: Optional[SecretStr] = Field(
        default=None,
        description="Storage access key"
    )
    STORAGE_SECRET_KEY: Optional[SecretStr] = Field(
        default=None,
        description="Storage secret key"
    )
    STORAGE_REGION: Optional[str] = Field(
        default=None,
        description="Storage region"
    )
    STORAGE_ENDPOINT: Optional[str] = Field(
        default=None,
        description="Storage endpoint URL"
    )
    STORAGE_MAX_FILE_SIZE: int = Field(
        default=10 * 1024 * 1024,  # 10 MB
        ge=1,
        description="Maximum file size in bytes"
    )
    STORAGE_ALLOWED_EXTENSIONS: List[str] = Field(
        default=["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx"],
        description="Allowed file extensions"
    )
    STORAGE_URL_EXPIRY_SECONDS: int = Field(
        default=3600,
        ge=60,
        description="Storage URL expiry in seconds"
    )
    
    # ========================================================================
    # Rate Limit Settings
    # ========================================================================
    
    RATE_LIMIT_ENABLED: bool = Field(
        default=True,
        description="Enable rate limiting"
    )
    RATE_LIMIT_PER_MINUTE: int = Field(
        default=60,
        ge=1,
        description="Requests per minute limit"
    )
    RATE_LIMIT_PER_HOUR: int = Field(
        default=1000,
        ge=1,
        description="Requests per hour limit"
    )
    RATE_LIMIT_PER_DAY: int = Field(
        default=10000,
        ge=1,
        description="Requests per day limit"
    )
    RATE_LIMIT_BURST: int = Field(
        default=10,
        ge=1,
        description="Burst request limit"
    )
    RATE_LIMIT_BLOCK_DURATION: int = Field(
        default=300,  # 5 minutes
        ge=1,
        description="Block duration in seconds"
    )
    RATE_LIMIT_STRATEGY: str = Field(
        default="sliding_window",
        description="Rate limiting strategy"
    )
    RATE_LIMIT_PATH_PREFIXES: List[str] = Field(
        default=["/api"],
        description="Paths to apply rate limiting"
    )
    RATE_LIMIT_EXEMPT_PATHS: List[str] = Field(
        default=["/health", "/metrics", "/docs"],
        description="Paths exempt from rate limiting"
    )
    RATE_LIMIT_EXEMPT_IPS: List[str] = Field(
        default=[],
        description="IPs exempt from rate limiting"
    )
    
    # ========================================================================
    # Logging Settings
    # ========================================================================
    
    LOG_LEVEL: LogLevel = Field(
        default=LogLevel.INFO,
        description="Log level"
    )
    LOG_FORMAT: str = Field(
        default="json",
        description="Log format (json, console)"
    )
    LOG_FILE: Optional[Path] = Field(
        default=None,
        description="Log file path"
    )
    LOG_MAX_SIZE: int = Field(
        default=10 * 1024 * 1024,  # 10 MB
        ge=1,
        description="Maximum log file size in bytes"
    )
    LOG_BACKUP_COUNT: int = Field(
        default=5,
        ge=0,
        description="Number of backup log files"
    )
    LOG_INCLUDE_REQUEST: bool = Field(
        default=True,
        description="Include request details in logs"
    )
    LOG_INCLUDE_RESPONSE: bool = Field(
        default=False,
        description="Include response details in logs"
    )
    LOG_INCLUDE_HEADERS: bool = Field(
        default=False,
        description="Include headers in logs"
    )
    LOG_INCLUDE_BODY: bool = Field(
        default=False,
        description="Include request body in logs"
    )
    
    # ========================================================================
    # CORS Settings
    # ========================================================================
    
    CORS_ALLOWED_ORIGINS: List[str] = Field(
        default=["*"],
        description="Allowed CORS origins"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(
        default=True,
        description="Allow CORS credentials"
    )
    CORS_ALLOWED_METHODS: List[str] = Field(
        default=["*"],
        description="Allowed CORS methods"
    )
    CORS_ALLOWED_HEADERS: List[str] = Field(
        default=["*"],
        description="Allowed CORS headers"
    )
    CORS_EXPOSED_HEADERS: List[str] = Field(
        default=[],
        description="Exposed CORS headers"
    )
    CORS_MAX_AGE: int = Field(
        default=3600,
        ge=0,
        description="CORS max age in seconds"
    )
    
    # ========================================================================
    # Security Settings
    # ========================================================================
    
    SECURITY_HSTS_ENABLED: bool = Field(
        default=True,
        description="Enable HSTS"
    )
    SECURITY_HSTS_MAX_AGE: int = Field(
        default=31536000,  # 1 year
        ge=0,
        description="HSTS max age in seconds"
    )
    SECURITY_XSS_PROTECTION: bool = Field(
        default=True,
        description="Enable XSS protection"
    )
    SECURITY_CSRF_ENABLED: bool = Field(
        default=True,
        description="Enable CSRF protection"
    )
    SECURITY_CONTENT_SECURITY_POLICY: Optional[str] = Field(
        default=None,
        description="Content Security Policy"
    )
    SECURITY_REFERRER_POLICY: str = Field(
        default="strict-origin-when-cross-origin",
        description="Referrer policy"
    )
    SECURITY_PASSWORD_MIN_LENGTH: int = Field(
        default=8,
        ge=1,
        description="Minimum password length"
    )
    SECURITY_PASSWORD_REQUIRE_UPPER: bool = Field(
        default=True,
        description="Password requires uppercase"
    )
    SECURITY_PASSWORD_REQUIRE_LOWER: bool = Field(
        default=True,
        description="Password requires lowercase"
    )
    SECURITY_PASSWORD_REQUIRE_DIGIT: bool = Field(
        default=True,
        description="Password requires digit"
    )
    SECURITY_PASSWORD_REQUIRE_SPECIAL: bool = Field(
        default=True,
        description="Password requires special character"
    )
    SECURITY_MAX_LOGIN_ATTEMPTS: int = Field(
        default=5,
        ge=1,
        description="Maximum login attempts"
    )
    SECURITY_LOGIN_LOCKOUT_MINUTES: int = Field(
        default=30,
        ge=1,
        description="Login lockout duration in minutes"
    )
    
    # ========================================================================
    # Webhook Settings
    # ========================================================================
    
    WEBHOOK_ENABLED: bool = Field(
        default=True,
        description="Enable webhooks"
    )
    WEBHOOK_RETRY_MAX_ATTEMPTS: int = Field(
        default=3,
        ge=1,
        description="Maximum webhook retry attempts"
    )
    WEBHOOK_RETRY_DELAY: int = Field(
        default=60,
        ge=1,
        description="Webhook retry delay in seconds"
    )
    WEBHOOK_TIMEOUT: int = Field(
        default=30,
        ge=1,
        description="Webhook timeout in seconds"
    )
    WEBHOOK_SIGNATURE_HEADER: str = Field(
        default="X-Webhook-Signature",
        description="Webhook signature header"
    )
    WEBHOOK_MAX_PAYLOAD_SIZE: int = Field(
        default=1024 * 1024,  # 1 MB
        ge=1,
        description="Maximum webhook payload size in bytes"
    )
    
    # ========================================================================
    # Notification Settings
    # ========================================================================
    
    NOTIFICATION_ENABLED: bool = Field(
        default=True,
        description="Enable notifications"
    )
    NOTIFICATION_RETRY_MAX_ATTEMPTS: int = Field(
        default=3,
        ge=1,
        description="Maximum notification retry attempts"
    )
    NOTIFICATION_RETRY_DELAY: int = Field(
        default=60,
        ge=1,
        description="Notification retry delay in seconds"
    )
    NOTIFICATION_BATCH_SIZE: int = Field(
        default=100,
        ge=1,
        description="Notification batch size"
    )
    NOTIFICATION_MAX_PER_USER: int = Field(
        default=1000,
        ge=1,
        description="Maximum notifications per user"
    )
    NOTIFICATION_RETENTION_DAYS: int = Field(
        default=90,
        ge=1,
        description="Notification retention in days"
    )
    
    # ========================================================================
    # Analytics Settings
    # ========================================================================
    
    ANALYTICS_ENABLED: bool = Field(
        default=True,
        description="Enable analytics"
    )
    ANALYTICS_COLLECTION_INTERVAL: int = Field(
        default=60,
        ge=1,
        description="Analytics collection interval in seconds"
    )
    ANALYTICS_RETENTION_DAYS: int = Field(
        default=30,
        ge=1,
        description="Analytics retention in days"
    )
    ANALYTICS_REALTIME: bool = Field(
        default=True,
        description="Enable real-time analytics"
    )
    
    # ========================================================================
    # Monitoring Settings
    # ========================================================================
    
    MONITORING_ENABLED: bool = Field(
        default=True,
        description="Enable monitoring"
    )
    MONITORING_INTERVAL: int = Field(
        default=60,
        ge=1,
        description="Monitoring interval in seconds"
    )
    MONITORING_ALERT_EMAILS: List[EmailStr] = Field(
        default=[],
        description="Alert email recipients"
    )
    MONITORING_ALERT_WEBHOOKS: List[str] = Field(
        default=[],
        description="Alert webhook URLs"
    )
    MONITORING_METRICS_EXPORT: str = Field(
        default="prometheus",
        description="Metrics export format"
    )
    
    # ========================================================================
    # Cache Settings
    # ========================================================================
    
    CACHE_ENABLED: bool = Field(
        default=True,
        description="Enable caching"
    )
    CACHE_DEFAULT_TTL: int = Field(
        default=300,  # 5 minutes
        ge=1,
        description="Default cache TTL in seconds"
    )
    CACHE_PREFIX: str = Field(
        default="parking",
        description="Cache key prefix"
    )
    CACHE_MAX_SIZE: int = Field(
        default=1000,
        ge=1,
        description="Maximum cache items"
    )
    
    # ========================================================================
    # Queue Settings
    # ========================================================================
    
    QUEUE_ENABLED: bool = Field(
        default=True,
        description="Enable queue processing"
    )
    QUEUE_BATCH_SIZE: int = Field(
        default=10,
        ge=1,
        description="Queue batch size"
    )
    QUEUE_RETRY_MAX_ATTEMPTS: int = Field(
        default=3,
        ge=1,
        description="Maximum queue retry attempts"
    )
    QUEUE_RETRY_DELAY: int = Field(
        default=60,
        ge=1,
        description="Queue retry delay in seconds"
    )
    QUEUE_MAX_SIZE: int = Field(
        default=10000,
        ge=1,
        description="Maximum queue size"
    )
    
    # ========================================================================
    # Feature Flag Settings
    # ========================================================================
    
    ENABLE_PARKING_RESERVATIONS: bool = Field(
        default=True,
        description="Enable parking reservations"
    )
    ENABLE_DYNAMIC_PRICING: bool = Field(
        default=False,
        description="Enable dynamic pricing"
    )
    ENABLE_EV_CHARGING: bool = Field(
        default=True,
        description="Enable EV charging"
    )
    ENABLE_MOBILE_PAYMENTS: bool = Field(
        default=True,
        description="Enable mobile payments"
    )
    ENABLE_NOTIFICATIONS: bool = Field(
        default=True,
        description="Enable notifications"
    )
    ENABLE_ANALYTICS: bool = Field(
        default=True,
        description="Enable analytics"
    )
    ENABLE_API_DOCS: bool = Field(
        default=True,
        description="Enable API documentation"
    )
    ENABLE_WEBHOOKS: bool = Field(
        default=True,
        description="Enable webhooks"
    )
    ENABLE_AUDIT_LOGS: bool = Field(
        default=True,
        description="Enable audit logs"
    )
    ENABLE_ADVANCED_REPORTING: bool = Field(
        default=True,
        description="Enable advanced reporting"
    )
    ENABLE_MULTI_TENANCY: bool = Field(
        default=False,
        description="Enable multi-tenancy"
    )
    
    # ========================================================================
    # Model Configuration
    # ========================================================================
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        validate_default=True,
        frozen=False,
    )
    
    # ========================================================================
    # Validators
    # ========================================================================
    
    @validator("DATABASE_PORT", "REDIS_PORT", "EMAIL_PORT")
    def validate_port(cls, v, values, **kwargs):
        """Validate port numbers."""
        field_name = kwargs.get("field", {}).name
        if hasattr(v, "ge") and v < 1:
            raise ValueError(f"{field_name} must be between 1 and 65535")
        if hasattr(v, "le") and v > 65535:
            raise ValueError(f"{field_name} must be between 1 and 65535")
        return v
    
    @validator("CORS_ALLOWED_ORIGINS")
    def validate_cors_origins(cls, v):
        """Validate CORS origins."""
        if "*" in v and len(v) > 1:
            raise ValueError("Cannot combine '*' with other origins")
        return v
    
    @validator("STORAGE_ALLOWED_EXTENSIONS")
    def validate_storage_extensions(cls, v):
        """Validate storage extensions."""
        if not v:
            raise ValueError("At least one extension must be allowed")
        # Clean extensions
        return [ext.lower().strip() for ext in v]
    
    @root_validator
    def validate_email_credentials(cls, values):
        """Validate email credentials when email is enabled."""
        if values.get("EMAIL_ENABLED"):
            if not values.get("EMAIL_USERNAME") or not values.get("EMAIL_PASSWORD"):
                raise ValueError("Email username and password required when email is enabled")
        return values
    
    @root_validator
    def validate_sms_credentials(cls, values):
        """Validate SMS credentials when SMS is enabled."""
        if values.get("SMS_ENABLED"):
            if not values.get("SMS_ACCOUNT_SID") or not values.get("SMS_AUTH_TOKEN"):
                raise ValueError("SMS account SID and auth token required when SMS is enabled")
        return values
    
    @root_validator
    def validate_payment_credentials(cls, values):
        """Validate payment credentials when payment is enabled."""
        if values.get("PAYMENT_ENABLED"):
            if not values.get("PAYMENT_API_KEY"):
                raise ValueError("Payment API key required when payment is enabled")
        return values
    
    @root_validator
    def validate_environment(cls, values):
        """Validate environment-specific settings."""
        env = values.get("ENVIRONMENT")
        if env == Environment.PRODUCTION:
            # Production-specific validations
            if values.get("DEBUG"):
                raise ValueError("Debug mode must be disabled in production")
            if values.get("DATABASE_SSL") is False:
                raise ValueError("Database SSL must be enabled in production")
        return values


# ============================================================================
# Nested Settings Classes
# ============================================================================

class DatabaseSettings(BaseModel):
    """Database configuration settings."""
    
    type: DatabaseType = Field(default=DatabaseType.POSTGRESQL)
    host: str = Field(default="localhost")
    port: int = Field(default=5432, ge=1, le=65535)
    name: str = Field(default="parking_db")
    user: str = Field(default="postgres")
    password: SecretStr = Field(default=SecretStr("password"))
    ssl: bool = Field(default=False)
    pool_size: int = Field(default=10, ge=1)
    max_overflow: int = Field(default=20, ge=0)
    pool_timeout: int = Field(default=30, ge=1)
    echo: bool = Field(default=False)
    echo_pool: bool = Field(default=False)
    
    @property
    def url(self) -> str:
        """Get database URL."""
        password = self.password.get_secret_value()
        ssl_param = "?sslmode=require" if self.ssl else ""
        return f"postgresql://{self.user}:{password}@{self.host}:{self.port}/{self.name}{ssl_param}"


class RedisSettings(BaseModel):
    """Redis configuration settings."""
    
    host: str = Field(default="localhost")
    port: int = Field(default=6379, ge=1, le=65535)
    db: int = Field(default=0, ge=0, le=15)
    password: Optional[SecretStr] = Field(default=None)
    ssl: bool = Field(default=False)
    socket_timeout: int = Field(default=5, ge=1)
    socket_connect_timeout: int = Field(default=5, ge=1)
    retry_on_timeout: bool = Field(default=True)
    max_connections: int = Field(default=10, ge=1)
    
    @property
    def url(self) -> str:
        """Get Redis URL."""
        password = self.password.get_secret_value() if self.password else None
        auth = f":{password}@" if password else ""
        scheme = "rediss" if self.ssl else "redis"
        return f"{scheme}://{auth}{self.host}:{self.port}/{self.db}"


class JWTSettings(BaseModel):
    """JWT configuration settings."""
    
    secret: SecretStr = Field(default=SecretStr(secrets.token_urlsafe(32)))
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60, ge=1)
    refresh_token_expire_days: int = Field(default=7, ge=1)
    reset_token_expire_hours: int = Field(default=24, ge=1)
    verify_token_expire_hours: int = Field(default=72, ge=1)
    issuer: str = Field(default="parking-system")
    audience: str = Field(default="parking-system-api")


class EmailSettings(BaseModel):
    """Email configuration settings."""
    
    enabled: bool = Field(default=True)
    host: str = Field(default="smtp.gmail.com")
    port: int = Field(default=587, ge=1, le=65535)
    username: Optional[str] = Field(default=None)
    password: Optional[SecretStr] = Field(default=None)
    from_email: EmailStr = Field(default="noreply@parking-system.com")
    from_name: str = Field(default="Parking System")
    use_tls: bool = Field(default=True)
    use_ssl: bool = Field(default=False)
    timeout: int = Field(default=30, ge=1)
    template_dir: str = Field(default="templates/email")


class PaymentSettings(BaseModel):
    """Payment configuration settings."""
    
    enabled: bool = Field(default=False)
    provider: str = Field(default="stripe")
    api_key: Optional[SecretStr] = Field(default=None)
    webhook_secret: Optional[SecretStr] = Field(default=None)
    currency: str = Field(default="USD")
    tax_rate: float = Field(default=0.0, ge=0, le=1)
    service_fee: float = Field(default=0.0, ge=0)
    min_amount: float = Field(default=0.01, ge=0)
    max_amount: float = Field(default=10000, ge=0)


# ============================================================================
# Settings Singleton
# ============================================================================

_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """
    Get the settings singleton instance.
    
    Returns:
        Settings: Application settings
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def load_settings(environment: Optional[str] = None, env_file: Optional[str] = None) -> Settings:
    """
    Load settings with optional environment and env file.
    
    Args:
        environment: Override environment
        env_file: Override env file path
        
    Returns:
        Settings: Loaded settings
    """
    global _settings
    
    # Build environment variables
    env_vars = {}
    
    if environment:
        env_vars["ENVIRONMENT"] = environment
    
    if env_file:
        # Load from env file
        from dotenv import load_dotenv
        load_dotenv(env_file)
    
    # Create settings with environment variables
    _settings = Settings(**env_vars)
    
    return _settings


def reset_settings():
    """Reset the settings singleton."""
    global _settings
    _settings = None


# ============================================================================
# Convenience Functions
# ============================================================================

def is_development() -> bool:
    """Check if running in development environment."""
    return get_settings().ENVIRONMENT == Environment.DEVELOPMENT


def is_production() -> bool:
    """Check if running in production environment."""
    return get_settings().ENVIRONMENT == Environment.PRODUCTION


def is_testing() -> bool:
    """Check if running in testing environment."""
    return get_settings().ENVIRONMENT == Environment.TESTING


def is_staging() -> bool:
    """Check if running in staging environment."""
    return get_settings().ENVIRONMENT == Environment.STAGING


def is_debug() -> bool:
    """Check if debug mode is enabled."""
    return get_settings().DEBUG


# ============================================================================
# Export Settings Instance
# ============================================================================

# Create default settings instance
settings = get_settings()