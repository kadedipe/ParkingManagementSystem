# ============================================================================
# Main Application - Charging Service Entry Point
# ============================================================================

# parking-management-system/services/charging-service/src/main.py

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi

from src.core.config import settings
from src.core.logging import setup_logging, get_logger
from src.core.database import init_db, close_db
from src.core.redis import redis_client
from src.api.v1 import router as v1_router
from src.api.websocket import router as ws_router
from src.services.ocpp_service import OCPPService
from src.services.charging_service import ChargingService
from src.services.monitoring import monitoring_service
from src.exceptions import (
    ChargingException,
    ChargingStationNotFoundError,
    ChargingSessionError,
)

# Setup logging
logger = setup_logging()

# Global OCPP service instance
ocpp_service = None

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Lifespan context manager"""
    global ocpp_service
    
    # Startup
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.VERSION}")
    
    try:
        # Initialize database
        await init_db()
        
        # Initialize Redis
        await redis_client.initialize()
        
        # Initialize OCPP service
        ocpp_service = OCPPService()
        await ocpp_service.initialize()
        
        # Start monitoring
        await monitoring_service.start()
        
        logger.info("Charging service started successfully")
        yield
        
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise
    finally:
        # Shutdown
        logger.info("Shutting down charging service...")
        
        if ocpp_service:
            await ocpp_service.shutdown()
        
        await redis_client.close()
        await close_db()
        await monitoring_service.stop()
        
        logger.info("Shutdown complete")

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="EV Charging Service Microservice",
    docs_url="/api/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/api/redoc" if settings.DOCS_ENABLED else None,
    openapi_url="/api/openapi.json" if settings.DOCS_ENABLED else None,
    lifespan=lifespan,
)

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="EV Charging Service API",
        routes=app.routes,
    )
    
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(ChargingException)
async def charging_exception_handler(request: Request, exc: ChargingException):
    logger.error(f"Charging exception: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
            },
        },
    )

@app.exception_handler(ChargingStationNotFoundError)
async def not_found_handler(request: Request, exc: ChargingStationNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "success": False,
            "error": {
                "code": "STATION_NOT_FOUND",
                "message": exc.message,
                "station_id": exc.station_id,
            },
        },
    )

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

# Health check
@app.get("/health", tags=["health"])
async def get_health():
    """Health check endpoint"""
    try:
        ocpp_connected = ocpp_service.connected if ocpp_service else False
    except:
        ocpp_connected = False
    
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "ocpp_connected": ocpp_connected,
        "database": "connected"
    }

# Include routers
app.include_router(v1_router)
app.include_router(ws_router, prefix="/ws")

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
        logger.info("Shutting down charging service...")
    except Exception as e:
        logger.error(f"Failed to start charging service: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()