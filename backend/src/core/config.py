# ============================================================================
# Parking Management System - Configuration
# ============================================================================

"""
Application configuration management using Pydantic Settings.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings."""
    
    # ===== App Settings =====
    APP_NAME: str = "Parking Management System"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Production-ready FastAPI backend for Parking Management System"
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")
    DEBUG: bool = Field(False, env="APP_DEBUG")
    
    # ===== Server Settings =====
    BACKEND_HOST: str = Field("0.0.0.0", env="BACKEND_HOST")
    BACKEND_PORT: int = Field(8000, env="BACKEND_PORT")
    API_PREFIX: str = Field("/api/v1", env="API_PREFIX")
    WORKER_COUNT: int = Field(4, env="WORKER_COUNT")
    
    # ===== Documentation =====
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    OPENAPI_URL: str = "/openapi.json"
    TERMS_OF_SERVICE: str = "https://parking-system.com/terms"
    CONTACT_NAME: str = "Parking Management Team"
    CONTACT_EMAIL: str = "team@parking-system.com"
    CONTACT_URL: str = "https://parking-system.com"
    
    # ===== Security =====
    SECRET_KEY: str = Field(..., env="APP_SECRET_KEY", min_length=32)
    SESSION_SECRET_KEY: str = Field(..., env="SESSION_SECRET_KEY", min_length=32)
    SESSION_MAX_AGE: int = 86400  # 24 hours
    ALLOWED_HOSTS: List[str] = Field(["*"], env="ALLOWED_HOSTS")
    CORS_ORIGINS: List[str] = Field(
        ["http://localhost:3000", "http://localhost:5173"],
        env="CORS_ORIGINS"
    )
    
    # ===== Database =====
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    MONGODB_URI: Optional[str] = Field(None, env="MONGODB_URI")
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")
    
    # ===== JWT =====
    JWT_SECRET: str = Field(..., env="JWT_SECRET", min_length=32)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ===== Kafka =====
    KAFKA_BROKERS: List[str] = Field(["localhost:9092"], env="KAFKA_BROKERS")
    KAFKA_GROUP_ID: str = "parking-group"
    
    # ===== Logging =====
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    LOG_FILE: Optional[str] = Field(None, env="LOG_FILE")
    
    # ===== Monitoring =====
    SENTRY_DSN: Optional[str] = Field(None, env="SENTRY_DSN")
    SENTRY_ENV: Optional[str] = Field(None, env="SENTRY_ENV")
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1
    
    # ===== Stripe =====
    STRIPE_SECRET_KEY: Optional[str] = Field(None, env="STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY: Optional[str] = Field(None, env="STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(None, env="STRIPE_WEBHOOK_SECRET")
    
    # ===== Email =====
    SMTP_HOST: Optional[str] = Field(None, env="SMTP_HOST")
    SMTP_PORT: int = Field(587, env="SMTP_PORT")
    SMTP_USER: Optional[str] = Field(None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(None, env="SMTP_PASS")
    SMTP_FROM: Optional[str] = Field(None, env="SMTP_FROM")
    
    # ===== Rate Limiting =====
    RATE_LIMIT_ENABLED: bool = Field(True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_WINDOW_MS: int = Field(60000, env="RATE_LIMIT_WINDOW_MS")
    RATE_LIMIT_MAX_REQUESTS: int = Field(100, env="RATE_LIMIT_MAX_REQUESTS")
    
    # ===== Validation =====
    @validator("ALLOWED_HOSTS", pre=True)
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",") if host.strip()]
        return v
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    @validator("KAFKA_BROKERS", pre=True)
    def parse_kafka_brokers(cls, v):
        if isinstance(v, str):
            return [broker.strip() for broker in v.split(",") if broker.strip()]
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance
settings = Settings()