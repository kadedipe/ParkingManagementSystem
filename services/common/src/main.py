# ============================================================================
# Main Application - Common Service Entry Point
# ============================================================================

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from src.core.config import settings
from src.core.database import init_db, close_db
from src.core.redis import redis_client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Lifespan Context Manager
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Lifespan context manager for startup and shutdown events"""
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    try:
        logger.info("Initializing database connection...")
        await init_db()
        logger.info("Database connection established")
        
        # Initialize Redis (optional)
        try:
            await redis_client.initialize()
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")
        
        yield
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise
    finally:
        logger.info("Shutting down common service...")
        await close_db()

# ============================================================================
# Create FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Common Service for Shared Functionality",
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    lifespan=lifespan,
)

# ============================================================================
# Middleware Configuration
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "errors": errors,
            },
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
            },
        },
    )

# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Common Service API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# ============================================================================
# Include Routers
# ============================================================================

try:
    from src.api.v1.routes import router as v1_router
    app.include_router(v1_router)
    logger.info("V1 router loaded successfully")
except ImportError as e:
    logger.warning(f"V1 router not available: {e}")

# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    try:
        import uvicorn
        uvicorn.run(
            "src.main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info",
        )
    except KeyboardInterrupt:
        logger.info("Shutting down common service...")
    except Exception as e:
        logger.error(f"Failed to start common service: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()