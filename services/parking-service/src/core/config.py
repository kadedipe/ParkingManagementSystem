# Parking service configuration.
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
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
    SERVICE_PORT: int = Field(default=8080, env="SERVICE_PORT")
    API_PREFIX: str = Field(default="/api/v1", env="API_PREFIX")
    LOG_FILE: str = Field(default="/app/logs/parking-service.log", env="LOG_FILE")
    CELERY_BROKER_URL: str = Field(default="redis://redis:6379/1", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://redis:6379/2", env="CELERY_RESULT_BACKEND")
    CELERY_TASK_ACKS_LATE: bool = Field(default=True, env="CELERY_TASK_ACKS_LATE")
    POOL_SIZE: int = Field(default=10, env="POOL_SIZE")
    TEST_DB_HOST: str = Field(default="test-postgres", env="TEST_DB_HOST")
    TEST_DB_NAME: str = Field(default="test_parking_db", env="TEST_DB_NAME")
    TEST_DB_USER: str = Field(default="test_user", env="TEST_DB_USER")
    TEST_DB_PASSWORD: str = Field(default="test_password", env="TEST_DB_PASSWORD")
    DB_HOST: str = Field(default="localhost", env="DB_HOST")
    DB_PORT: int = Field(default=5432, env="DB_PORT")
    DB_NAME: str = Field(default="parking_db", env="DB_NAME")
    DB_USER: str = Field(default="parking_user", env="DB_USER")
    DATABASE_URL_ENV: Optional[str] = Field(default=None, alias="DATABASE_URL")
    DB_PASSWORD: str = Field(default="password", env="DB_PASSWORD")
    DB_POOL_SIZE: int = Field(default=20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=40, env="DB_MAX_OVERFLOW")
    DB_ECHO: bool = Field(default=False, env="DB_ECHO")
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    REDIS_URL_ENV: Optional[str] = Field(default=None, alias="REDIS_URL")
    CACHE_ENABLED: bool = Field(default=True, env="CACHE_ENABLED")
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")
    CACHE_MAX_SIZE: int = Field(default=1000, env="CACHE_MAX_SIZE")
    JWT_SECRET: str = Field(default="your-secret-key", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRATION: int = Field(default=3600, env="JWT_EXPIRATION")
    CORS_ORIGINS: List[str] = Field(default=["*"], env="CORS_ORIGINS")
    TRUSTED_HOSTS: List[str] = Field(default=[], env="TRUSTED_HOSTS")
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=60, env="RATE_LIMIT_PERIOD")
    MONITORING_ENABLED: bool = Field(default=True, env="MONITORING_ENABLED")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    GOOGLE_MAPS_API_KEY: Optional[str] = Field(default=None, env="GOOGLE_MAPS_API_KEY")
    STRIPE_SECRET_KEY: Optional[str] = Field(default=None, env="STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(default=None, env="STRIPE_WEBHOOK_SECRET")
    GEOCODING_PROVIDER: str = Field(default="google", env="GEOCODING_PROVIDER")
    GEOCODING_API_KEY: Optional[str] = Field(default=None, env="GEOCODING_API_KEY")
    REQUEST_TIMEOUT: int = Field(default=30, env="REQUEST_TIMEOUT")
    MAX_UPLOAD_SIZE: int = Field(default=5242880, env="MAX_UPLOAD_SIZE")

    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_URL_ENV:
            url = self.DATABASE_URL_ENV
            if url.startswith("postgres://"):
                url = "postgresql://" + url[len("postgres://"):]
            if url.startswith("postgresql://"):
                url = "postgresql+asyncpg://" + url[len("postgresql://"):]
            return url
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def REDIS_URL(self) -> str:
        if self.REDIS_URL_ENV:
            return self.REDIS_URL_ENV
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    @validator("JWT_SECRET")
    def validate_jwt_secret(cls, value, values):
        if values.get("ENVIRONMENT") == "production" and (len(value) < 32 or value == "your-secret-key"):
            raise ValueError("JWT_SECRET must be a strong secret of at least 32 characters in production")
        return value

    @validator("DB_PASSWORD")
    def validate_db_password(cls, value, values):
        if values.get("ENVIRONMENT") == "production" and value == "password" and not values.get("DATABASE_URL_ENV"):
            raise ValueError("DB_PASSWORD must be configured in production")
        return value

    @validator("CORS_ORIGINS")
    def validate_cors(cls, value, values):
        if values.get("ENVIRONMENT") == "production" and "*" in value:
            raise ValueError("CORS_ORIGINS must explicitly list trusted frontend origins in production")
        return value

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
