# ============================================================================
# API V1 Package
# ============================================================================

"""
API Version 1 Routes Package.

This package contains all API v1 route definitions for the Parking Management System.
"""

from fastapi import APIRouter

from src.interfaces.api.v1.auth_routes import router as auth_router
from src.interfaces.api.v1.parking_routes import router as parking_router
from src.interfaces.api.v1.vehicle_routes import router as vehicle_router
from src.interfaces.api.v1.charging_routes import router as charging_router
from src.interfaces.api.v1.booking_routes import router as booking_router
from src.interfaces.api.v1.payment_routes import router as payment_router
from src.interfaces.api.v1.notification_routes import router as notification_router
from src.interfaces.api.v1.user_routes import router as user_router
from src.interfaces.api.v1.admin_routes import router as admin_router
from src.interfaces.api.v1.report_routes import router as report_router
from src.interfaces.api.v1.webhook_routes import router as webhook_router
from src.interfaces.api.v1.health_routes import router as health_router

# Create main version 1 router
router = APIRouter(prefix="/v1", tags=["API V1"])

# Include all route routers
router.include_router(auth_router)
router.include_router(parking_router)
router.include_router(vehicle_router)
router.include_router(charging_router)
router.include_router(booking_router)
router.include_router(payment_router)
router.include_router(notification_router)
router.include_router(user_router)
router.include_router(admin_router)
router.include_router(report_router)
router.include_router(webhook_router)
router.include_router(health_router)

__all__ = [
    "router",
    "auth_router",
    "parking_router",
    "vehicle_router",
    "charging_router",
    "booking_router",
    "payment_router",
    "notification_router",
    "user_router",
    "admin_router",
    "report_router",
    "webhook_router",
    "health_router",
]