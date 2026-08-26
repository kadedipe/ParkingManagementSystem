from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.production"),
        extra="ignore",
        case_sensitive=True,
    )

    SERVICE_NAME: str = "notification-service"
    VERSION: str = "2.1.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8080
    DOCS_ENABLED: bool = False
    DATABASE_URL: str = "sqlite+aiosqlite:///./notification.db"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    REDIS_URL: str = "redis://localhost:6379/2"
    INTERNAL_SERVICE_TOKEN: str | None = None
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str | None = None
    SMTP_TLS: bool = True
    APP_URL: str = "http://localhost:5173"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if isinstance(value, str) and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        return value

    @model_validator(mode="after")
    def validate_production(self):
        if self.ENVIRONMENT != "production":
            return self
        if len(self.JWT_SECRET) < 32 or self.JWT_SECRET == "change-me-in-production":
            raise ValueError("JWT_SECRET must be a strong secret of at least 32 characters in production")
        if self.DATABASE_URL.startswith("sqlite"):
            raise ValueError("DATABASE_URL must point to PostgreSQL in production")
        if self.REDIS_URL.startswith("redis://localhost"):
            raise ValueError("REDIS_URL must point to the Railway Redis service in production")
        if "*" in self.CORS_ORIGINS:
            raise ValueError("CORS_ORIGINS must explicitly list trusted frontend origins in production")
        return self


settings = Settings()
