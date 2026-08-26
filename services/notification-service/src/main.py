from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from src.core.config import settings
from src.core.database import close_db, engine, init_db
from src.api.routes import router


@asynccontextmanager
async def lifespan(app):
    if settings.ENVIRONMENT != "production":
        await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Notification Service",
    version=settings.VERSION,
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy", "service": settings.SERVICE_NAME, "version": settings.VERSION}


@app.get("/ready", tags=["health"])
async def ready():
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return {"status": "ready", "service": settings.SERVICE_NAME}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "service": settings.SERVICE_NAME},
        )
