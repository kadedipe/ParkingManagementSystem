from fastapi import APIRouter
from datetime import datetime
from . import charging_stations
from . import charging_sessions

router = APIRouter(prefix="/v1", tags=["v1"])

# Include routers
router.include_router(charging_stations.router)
router.include_router(charging_sessions.router)

@router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@router.get("/ping")
async def ping():
    return {"message": "pong", "timestamp": datetime.now().isoformat()}

@router.get("/")
async def root():
    return {"message": "Charging Service API v1", "timestamp": datetime.now().isoformat()}