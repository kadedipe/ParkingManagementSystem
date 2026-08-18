#!/usr/bin/env python3
# ============================================================================
# Parking Management System - Backend Main Entry Point
# ============================================================================

"""
Parking Management System Backend - Main Application Entry Point

This module serves as the main entry point for the FastAPI application.
It initializes the application, configures middleware, and sets up routes.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.app import create_app
from src.core.config import settings
from src.core.logging import setup_logging
from src.core.database import init_db, close_db
from src.core.redis import init_redis, close_redis
from src.core.kafka import init_kafka, close_kafka
from src.api.v1 import router as api_router
from src.api.websocket import router as ws_router
from src.middleware.auth import AuthMiddleware
from src.middleware.rate_limit import RateLimitMiddleware
from src.middleware.request_id import RequestIDMiddleware
from src.middleware.error_handler import ErrorHandlerMiddleware
from src.middleware.logging import LoggingMiddleware
from src.utils.health import health_router

# ============================================================================
# Application Lifespan Manager
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan context manager.
    
    Handles startup and shutdown events:
    - Initialize database connections
    - Initialize Redis connections
    - Initialize Kafka connections
    - Setup logging
    - Cleanup resources on shutdown
    """
    # ===== Startup =====
    logging.info("🚀 Starting Parking Management System...")
    
    # Setup logging
    setup_logging()
    
    # Initialize database
    await init_db()
    logging.info("✅ Database initialized")
    
    # Initialize Redis
    await init_redis()
    logging.info("✅ Redis initialized")
    
    # Initialize Kafka
    await init_kafka()
    logging.info("✅ Kafka initialized")
    
    # Run any pending migrations
    if settings.ENVIRONMENT == "production":
        from src.core.migrations import run_migrations
        await run_migrations()
        logging.info("✅ Database migrations applied")
    
    logging.info(f"✅ Application started in {settings.ENVIRONMENT} mode")
    
    # ===== Yield to application =====
    yield
    
    # ===== Shutdown =====
    logging.info("🔄 Shutting down Parking Management System...")
    
    # Cleanup resources
    await close_kafka()
    await close_redis()
    await close_db()
    
    logging.info("✅ Application shutdown complete")


# ============================================================================
# Create Application
# ============================================================================

def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    # Create app with lifespan
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        docs_url=settings.DOCS_URL,
        redoc_url=settings.REDOC_URL,
        openapi_url=settings.OPENAPI_URL,
        lifespan=lifespan,
        terms_of_service=settings.TERMS_OF_SERVICE,
        contact={
            "name": settings.CONTACT_NAME,
            "email": settings.CONTACT_EMAIL,
            "url": settings.CONTACT_URL,
        },
        license_info={
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT",
        },
    )
    
    # ===== Middleware Configuration =====
    # Order matters - these are executed in reverse order
    
    # Trusted Hosts
    if settings.ENVIRONMENT == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS,
        )
    
    # GZip Compression
    app.add_middleware(
        GZipMiddleware,
        minimum_size=1000,
    )
    
    # Session Middleware
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SESSION_SECRET_KEY,
        session_cookie="parking_session",
        max_age=settings.SESSION_MAX_AGE,
        same_site="lax",
        https_only=settings.ENVIRONMENT == "production",
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
        max_age=3600,
    )
    
    # Custom Middleware (in order)
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(AuthMiddleware)
    app.add_middleware(RateLimitMiddleware)
    
    # ===== Include Routers =====
    # API v1 routes
    app.include_router(
        api_router,
        prefix=settings.API_PREFIX,
        tags=["API v1"],
    )
    
    # WebSocket routes
    app.include_router(
        ws_router,
        prefix="/ws",
        tags=["WebSocket"],
    )
    
    # Health check routes
    app.include_router(
        health_router,
        prefix="/health",
        tags=["Health"],
    )
    
    # ===== Root Endpoint =====
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "running",
            "environment": settings.ENVIRONMENT,
            "documentation": settings.DOCS_URL,
        }
    
    # ===== Exception Handlers =====
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """Global exception handler."""
        logging.error(f"Unhandled exception: {exc}", exc_info=True)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "request_id": request.state.request_id if hasattr(request.state, "request_id") else None,
            },
        )
    
    return app


# ============================================================================
# Application Instance
# ============================================================================

app = create_application()


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """
    Main entry point for the application.
    
    This function is called when running the module directly.
    It starts the uvicorn server with appropriate configuration.
    """
    import uvicorn
    
    # Get configuration from environment or defaults
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development").lower() == "development"
    
    # Log startup information
    logging.info("=" * 60)
    logging.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logging.info(f"📡 Environment: {settings.ENVIRONMENT}")
    logging.info(f"🌐 Host: {host}:{port}")
    logging.info(f"📚 Documentation: http://{host}:{port}{settings.DOCS_URL}")
    logging.info("=" * 60)
    
    # Start server
    uvicorn.run(
        "src.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
        use_colors=True,
        workers=settings.WORKER_COUNT if settings.ENVIRONMENT == "production" else 1,
        loop="uvloop",
        http="httptools",
        ws="websockets",
    )


# ============================================================================
# Module Execution
# ============================================================================

if __name__ == "__main__":
    main()