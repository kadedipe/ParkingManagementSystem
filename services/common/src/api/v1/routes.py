from fastapi import APIRouter
from datetime import datetime
from . import users, notifications, audit, auth

router = APIRouter(prefix="/v1", tags=["v1"])

# Include routers
router.include_router(users.router)
router.include_router(notifications.router)
router.include_router(audit.router)
router.include_router(auth.router)

@router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@router.get("/ping")
async def ping():
    return {"message": "pong", "timestamp": datetime.now().isoformat()}

@router.get("/")
async def root():
    return {"message": "Common Service API v1", "timestamp": datetime.now().isoformat()}