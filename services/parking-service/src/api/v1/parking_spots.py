from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.parking_spot_service import ParkingSpotService
from src.repositories.parking_spot_repository import ParkingSpotRepository
from src.core.database import get_db

router = APIRouter(prefix="/parking-spots", tags=["parking-spots"])

class ParkingSpotCreate(BaseModel):
    parking_lot_id: UUID
    number: str
    level: int = 1
    type: str = "standard"
    width: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    is_covered: bool = False
    is_handicap: bool = False
    is_ev_charging: bool = False
    connector_type: Optional[str] = None
    charging_power: Optional[int] = None
    charging_price: Optional[float] = None

class ParkingSpotUpdate(BaseModel):
    number: Optional[str] = None
    level: Optional[int] = None
    type: Optional[str] = None
    status: Optional[str] = None
    width: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    is_covered: Optional[bool] = None
    is_handicap: Optional[bool] = None
    is_ev_charging: Optional[bool] = None

class ParkingSpotResponse(BaseModel):
    id: UUID
    parking_lot_id: UUID
    number: str
    level: int
    type: Optional[str]
    status: Optional[str]
    width: Optional[float]
    length: Optional[float]
    height: Optional[float]
    is_covered: bool
    is_handicap: bool
    is_ev_charging: bool
    connector_type: Optional[str]
    charging_power: Optional[int]
    charging_price: Optional[float]
    vehicle_id: Optional[UUID]
    vehicle_plate: Optional[str]
    reserved_until: Optional[datetime]
    occupied_since: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

async def get_parking_spot_service(db: AsyncSession = Depends(get_db)) -> ParkingSpotService:
    repository = ParkingSpotRepository(db)
    return ParkingSpotService(repository)

@router.post("/", response_model=ParkingSpotResponse, status_code=201)
async def create_parking_spot(
    spot: ParkingSpotCreate,
    service: ParkingSpotService = Depends(get_parking_spot_service)
):
    return await service.create_spot(spot.model_dump())

@router.get("/", response_model=List[ParkingSpotResponse])
async def get_parking_spots(
    parking_lot_id: UUID,
    skip: int = 0,
    limit: int = 100,
    service: ParkingSpotService = Depends(get_parking_spot_service)
):
    return await service.get_spots(parking_lot_id, skip, limit)

@router.get("/{spot_id}", response_model=ParkingSpotResponse)
async def get_parking_spot(
    spot_id: UUID,
    service: ParkingSpotService = Depends(get_parking_spot_service)
):
    return await service.get_spot(spot_id)

@router.put("/{spot_id}", response_model=ParkingSpotResponse)
async def update_parking_spot(
    spot_id: UUID,
    spot_update: ParkingSpotUpdate,
    service: ParkingSpotService = Depends(get_parking_spot_service)
):
    data = spot_update.model_dump(exclude_unset=True)
    return await service.update_spot(spot_id, data)

@router.delete("/{spot_id}", status_code=204)
async def delete_parking_spot(
    spot_id: UUID,
    service: ParkingSpotService = Depends(get_parking_spot_service)
):
    await service.delete_spot(spot_id)
    return None