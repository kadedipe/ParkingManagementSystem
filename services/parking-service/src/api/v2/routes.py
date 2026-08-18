from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/v2", tags=["v2"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "v2",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/")
async def root():
    return {
        "message": "Parking Service API v2",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }