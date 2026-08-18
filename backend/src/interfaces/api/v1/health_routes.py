# ============================================================================
# Health Check API Routes
# ============================================================================

"""
Health check API routes for version 1.
"""

import os
import time
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from src.interfaces.schemas import HealthResponse
from src.interfaces.dependencies import (
    get_db_client,
    get_redis_client,
    get_cache_client,
    get_message_bus,
)

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health_check():
    """
    Basic health check.
    
    Returns:
        HealthResponse: Health status
    """
    return HealthResponse(
        status="healthy",
        version=os.getenv("APP_VERSION", "1.0.0"),
        uptime=time.time() - os.getpid(),
        timestamp=datetime.now().isoformat(),
        services={},
    )


@router.get("/detailed", response_model=HealthResponse)
async def detailed_health_check(
    db_client=Depends(get_db_client),
    redis_client=Depends(get_redis_client),
    cache_client=Depends(get_cache_client),
    message_bus=Depends(get_message_bus),
):
    """
    Detailed health check with all services.
    
    Args:
        db_client: Database client
        redis_client: Redis client
        cache_client: Cache client
        message_bus: Message bus
        
    Returns:
        HealthResponse: Detailed health status
    """
    services = {}
    
    # Check database
    try:
        db_health = await db_client.health_check()
        services["database"] = db_health
    except Exception as e:
        services["database"] = {"status": "unhealthy", "error": str(e)}
    
    # Check Redis
    try:
        redis_health = await redis_client.health_check()
        services["redis"] = redis_health
    except Exception as e:
        services["redis"] = {"status": "unhealthy", "error": str(e)}
    
    # Check cache
    try:
        cache_health = await cache_client.health_check()
        services["cache"] = cache_health
    except Exception as e:
        services["cache"] = {"status": "unhealthy", "error": str(e)}
    
    # Check message bus
    try:
        bus_health = await message_bus.health_check()
        services["message_bus"] = bus_health
    except Exception as e:
        services["message_bus"] = {"status": "unhealthy", "error": str(e)}
    
    # Determine overall status
    overall_status = "healthy"
    for service_name, service_health in services.items():
        if service_health.get("status") == "unhealthy":
            overall_status = "degraded"
            break
    
    return HealthResponse(
        status=overall_status,
        version=os.getenv("APP_VERSION", "1.0.0"),
        uptime=time.time() - os.getpid(),
        timestamp=datetime.now().isoformat(),
        services=services,
    )


@router.get("/ready")
async def readiness_check(
    db_client=Depends(get_db_client),
    redis_client=Depends(get_redis_client),
):
    """
    Readiness check for Kubernetes.
    
    Args:
        db_client: Database client
        redis_client: Redis client
        
    Returns:
        JSONResponse: Readiness status
    """
    # Check if service is ready to accept traffic
    try:
        # Check database
        await db_client.health_check()
        
        # Check Redis
        await redis_client.health_check()
        
        return JSONResponse(
            status_code=200,
            content={"status": "ready", "timestamp": datetime.now().isoformat()},
        )
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not ready", "timestamp": datetime.now().isoformat()},
        )


@router.get("/live")
async def liveness_check():
    """
    Liveness check for Kubernetes.
    
    Returns:
        JSONResponse: Liveness status
    """
    # Simple liveness check - always returns 200 if process is running
    return JSONResponse(
        status_code=200,
        content={"status": "alive", "timestamp": datetime.now().isoformat()},
    )