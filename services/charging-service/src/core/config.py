from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SERVICE_NAME: str = "charging-service"
    APP_NAME: str = "EV Charging Service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8080
    DOCS_ENABLED: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./charging.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET_KEY: str = Field(default="dev-secret-jwt-key-for-charging-service", validation_alias=AliasChoices("JWT_SECRET_KEY", "JWT_SECRET"))
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            value = "postgresql://" + value[len("postgres://"):]
        if value.startswith("postgresql://"):
            value = "postgresql+asyncpg://" + value[len("postgresql://"):]
        return value

    @model_validator(mode="after")
    def validate_production(self):
        if self.ENVIRONMENT != "production":
            return self
        if len(self.JWT_SECRET_KEY) < 32 or self.JWT_SECRET_KEY == "dev-secret-jwt-key-for-charging-service":
            raise ValueError("JWT_SECRET_KEY must be a strong secret of at least 32 characters in production")
        if self.DATABASE_URL.startswith("sqlite"):
            raise ValueError("DATABASE_URL must point to PostgreSQL in production")
        if self.REDIS_URL.startswith("redis://localhost"):
            raise ValueError("REDIS_URL must point to the Railway Redis service in production")
        if "*" in self.CORS_ORIGINS:
            raise ValueError("CORS_ORIGINS must explicitly list trusted frontend origins in production")
        return self


settings = Settings()
