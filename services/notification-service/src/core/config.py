from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config=SettingsConfigDict(env_file=(".env",".env.production"),extra="ignore",case_sensitive=True)
    SERVICE_NAME:str="notification-service"
    VERSION:str="2.1.0"
    ENVIRONMENT:str="development"
    PORT:int=8080
    DOCS_ENABLED:bool=False
    DATABASE_URL:str="sqlite+aiosqlite:///./notification.db"
    JWT_SECRET:str="change-me-in-production"
    JWT_ALGORITHM:str="HS256"
    CORS_ORIGINS:list[str]=["http://localhost:5173"]
    REDIS_URL:str="redis://localhost:6379/2"
    INTERNAL_SERVICE_TOKEN:str|None=None
    SMTP_HOST:str|None=None
    SMTP_PORT:int=587
    SMTP_USER:str|None=None
    SMTP_PASSWORD:str|None=None
    SMTP_FROM:str|None=None
    SMTP_TLS:bool=True
    APP_URL:str="http://localhost:5173"

settings=Settings()
