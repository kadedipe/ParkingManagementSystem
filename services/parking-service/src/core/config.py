# ============================================================================
# Configuration Module - Service Configuration
# ============================================================================

# parking-management-system/services/parking-service/src/core/config.py

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator

class Settings(BaseSettings):
    """Application settings"""
    
    # Service Configuration
    SERVICE_NAME: str = "parking-service"
    APP_NAME: str = "Parking Service"
    VERSION: str = "2.0.0"
    API_VERSION: str = "v1"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8080, env="PORT")
    WORKERS: int = Field(default=4, env="WORKERS")
    DOCS_ENABLED: bool = Field(default=False, env="DOCS_ENABLED")
    AUTO_CREATE_TABLES: bool = Field(default=False, env="AUTO_CREATE_TABLES")
    
    # ====== NEW FIELDS ADDED ======
    SERVICE_PORT: int = Field(default=8080, env="SERVICE_PORT")
    API_PREFIX: str = Field(default="/api/v1", env="API_PREFIX")
    LOG_FILE: str = Field(default="/app/logs/parking-service.log", env="LOG_FILE")
    
    # Celery Configuration
    CELERY_BROKER_URL: str = Field(default="redis://redis:6379/1", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://redis:6379/2", env="CELERY_RESULT_BACKEND")
    CELERY_TASK_ACKS_LATE: bool = Field(default=True, env="CELERY_TASK_ACKS_LATE")
    
    # Pool Configuration
    POOL_SIZE: int = Field(default=10, env="POOL_SIZE")
    
    # Test Database Configuration
    TEST_DB_HOST: str = Field(default="test-postgres", env="TEST_DB_HOST")
    TEST_DB_NAME: str = Field(default="test_parking_db", env="TEST_DB_NAME")
    TEST_DB_USER: str = Field(default="test_user", env="TEST_DB_USER")
    TEST_DB_PASSWORD: str = Field(default="test_password", env="TEST_DB_PASSWORD")
    # ====== END NEW FIELDS ======
    
    # Database Configuration
    DB_HOST: str = Field(default="localhost", env="DB_HOST")
    DB_PORT: int = Field(default=5432, env="DB_PORT")
    DB_NAME: str = Field(default="parking_db", env="DB_NAME")
    DB_USER: str = Field(default="parking_user", env="DB_USER")
    DB_PASSWORD: str = Field(default="password", env="DB_PASSWORD")
    DB_POOL_SIZE: int = Field(default=20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=40, env="DB_MAX_OVERFLOW")
    DB_ECHO: bool = Field(default=False, env="DB_ECHO")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @validator("DB_PASSWORD", pre=True)
    def validate_db_password(cls, v):
        if not v or v == "password":
            import warnings
            warnings.warn("Using default database password. This is not secure in production!")
        return v
    
    # Redis Configuration
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # Cache Configuration
    CACHE_ENABLED: bool = Field(default=True, env="CACHE_ENABLED")
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")
    CACHE_MAX_SIZE: int = Field(default=1000, env="CACHE_MAX_SIZE")
    
    # Authentication
    JWT_SECRET: str = Field(default="your-secret-key", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRATION: int = Field(default=3600, env="JWT_EXPIRATION")
    
    @validator("JWT_SECRET", pre=True)
    def validate_jwt_secret(cls, v):
        if not v or len(v) < 32:
            import warnings
            warnings.warn("JWT secret is too short or not set. This is not secure!")
        return v
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(
        default=["*"],
        env="CORS_ORIGINS"
    )
    TRUSTED_HOSTS: List[str] = Field(
        default=[],
        env="TRUSTED_HOSTS"
    )
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=60, env="RATE_LIMIT_PERIOD")
    
    # Monitoring
    MONITORING_ENABLED: bool = Field(default=True, env="MONITORING_ENABLED")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    
    # External Services
    GOOGLE_MAPS_API_KEY: Optional[str] = Field(default=None, env="GOOGLE_MAPS_API_KEY")
    STRIPE_SECRET_KEY: Optional[str] = Field(default=None, env="STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(default=None, env="STRIPE_WEBHOOK_SECRET")
    
    # Geolocation
    GEOCODING_PROVIDER: str = Field(default="google", env="GEOCODING_PROVIDER")
    GEOCODING_API_KEY: Optional[str] = Field(default=None, env="GEOCODING_API_KEY")
    
    # Security
    REQUEST_TIMEOUT: int = Field(default=30, env="REQUEST_TIMEOUT")
    MAX_UPLOAD_SIZE: int = Field(default=5242880, env="MAX_UPLOAD_SIZE")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        # Allow extra fields in .env that aren't defined in Settings
        extra = "ignore"  # This will ignore extra fields instead of raising errors
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == "CORS_ORIGINS":
                return [origin.strip() for origin in raw_val.split(",") if origin.strip()]
            if field_name == "TRUSTED_HOSTS":
                return [host.strip() for host in raw_val.split(",") if host.strip()]
            return raw_val

settings = Settings()