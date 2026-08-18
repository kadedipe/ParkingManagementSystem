from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Service
    SERVICE_NAME: str = "charging-service"
    APP_NAME: str = "EV Charging Service"
    VERSION: str = "1.0.0"

    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8080
    DOCS_ENABLED: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./charging.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    JWT_SECRET_KEY: str = "dev-secret-jwt-key-for-charging-service"

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()