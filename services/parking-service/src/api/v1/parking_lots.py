from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.repositories.parking_lot_repository import ParkingLotRepository
from src.services.parking_lot_service import ParkingLotService


router = APIRouter(
    prefix="/parking-lots",
    tags=["parking-lots"],
)


# ============================================================================
# Schemas
# ============================================================================

class ParkingLotCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Dict[str, Any]
    location: Optional[Dict[str, Any]] = None
    total_spots: int
    price_per_hour: float
    type: Optional[str] = "standard"
    amenities: Optional[List[str]] = None
    features: Optional[List[str]] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None


class ParkingLotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    total_spots: Optional[int] = None
    price_per_hour: Optional[float] = None
    status: Optional[str] = None
    type: Optional[str] = None
    amenities: Optional[List[str]] = None
    features: Optional[List[str]] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None


class ParkingLotResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    address: Dict[str, Any]
    location: Optional[Dict[str, Any]]
    total_spots: int
    available_spots: int
    reserved_spots: int
    price_per_hour: float
    type: Optional[str]
    status: Optional[str]
    amenities: Optional[List[str]]
    features: Optional[List[str]]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    rating: Optional[float]
    review_count: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]


# ============================================================================
# Dependencies
# ============================================================================

async def get_parking_lot_service(
    db: AsyncSession = Depends(get_db),
) -> ParkingLotService:
    repository = ParkingLotRepository(db)
    return ParkingLotService(repository)


# ============================================================================
# CRUD Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=ParkingLotResponse,
    status_code=201,
)
async def create_parking_lot(
    lot: ParkingLotCreate,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    data = lot.model_dump()
    data["base_price_per_hour"] = data.pop("price_per_hour")

    return await service.create_parking_lot(data)


@router.get(
    "/",
    response_model=List[ParkingLotResponse],
)
async def get_parking_lots(
    skip: int = 0,
    limit: int = 100,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    return await service.get_parking_lots(skip, limit)


@router.get(
    "/{lot_id}",
    response_model=ParkingLotResponse,
)
async def get_parking_lot(
    lot_id: UUID,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    return await service.get_parking_lot(lot_id)


@router.put(
    "/{lot_id}",
    response_model=ParkingLotResponse,
)
async def update_parking_lot(
    lot_id: UUID,
    lot_update: ParkingLotUpdate,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    data = lot_update.model_dump(exclude_unset=True)

    if "price_per_hour" in data:
        data["base_price_per_hour"] = data.pop("price_per_hour")

    return await service.update_parking_lot(lot_id, data)


@router.delete(
    "/{lot_id}",
    status_code=204,
)
async def delete_parking_lot(
    lot_id: UUID,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    await service.delete_parking_lot(lot_id)
    return None


# ============================================================================
# Availability / Reservation
# ============================================================================

@router.get("/{lot_id}/availability")
async def get_availability(
    lot_id: UUID,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    return await service.get_availability(lot_id)


@router.post("/{lot_id}/reserve")
async def reserve_spot(
    lot_id: UUID,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    return await service.reserve_spot(lot_id)


@router.post("/{lot_id}/release")
async def release_spot(
    lot_id: UUID,
    service: ParkingLotService = Depends(get_parking_lot_service),
):
    return await service.release_spot(lot_id)