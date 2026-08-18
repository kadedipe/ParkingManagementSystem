from __future__ import annotations

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", ".env.production"), extra="ignore", case_sensitive=True)

    SERVICE_NAME: str = "vehicle-service"
    VERSION: str = "2.1.0"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = Field(default=8080, ge=1, le=65535)
    DOCS_ENABLED: bool = False
    DATABASE_URL: str = "sqlite+aiosqlite:///./vehicle.db"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    INTERNAL_SERVICE_TOKEN: str | None = None

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_secret(cls, value: str) -> str:
        if len(value) < 32 and value != "change-me-in-production":
            raise ValueError("JWT_SECRET must be at least 32 characters")
        return value


settings = Settings()
