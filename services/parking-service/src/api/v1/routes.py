from datetime import datetime

from fastapi import APIRouter

from . import auth, parking_lots, parking_sessions, parking_spots, payments, reservations


router = APIRouter(
    prefix="/v1",
    tags=["v1"],
)


# ============================================================================
# Child Routers
# ============================================================================

router.include_router(parking_lots.router)
router.include_router(auth.router)
router.include_router(parking_spots.router)
router.include_router(reservations.router)
router.include_router(parking_sessions.router)
router.include_router(payments.router)


# ============================================================================
# Health / Utility Endpoints
# ============================================================================

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/ping")
async def ping():
    return {
        "message": "pong",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/")
async def root():
    return {
        "message": "Parking Service API v1",
        "timestamp": datetime.now().isoformat(),
    }
