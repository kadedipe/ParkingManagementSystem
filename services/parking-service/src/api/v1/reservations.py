from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.reservation_service import ReservationService
from src.repositories.reservation_repository import ReservationRepository
from src.repositories.parking_spot_repository import ParkingSpotRepository
from src.auth.dependencies import get_current_user
from src.auth.models import TokenData
from src.core.database import get_db

router = APIRouter(prefix="/reservations", tags=["reservations"])


class ReservationCreate(BaseModel):
    parking_spot_id: UUID
    vehicle_id: Optional[UUID] = None
    start_time: datetime
    end_time: datetime


class ReservationResponse(BaseModel):
    id: UUID
    user_id: UUID
    parking_spot_id: UUID
    vehicle_id: Optional[UUID]
    start_time: datetime
    end_time: datetime
    status: Optional[str]
    total_price: float
    created_at: datetime
    updated_at: Optional[datetime]


async def get_reservation_service(db: AsyncSession = Depends(get_db)) -> ReservationService:
    repo = ReservationRepository(db)
    spot_repo = ParkingSpotRepository(db)
    return ReservationService(repo, spot_repo)


@router.post("/", response_model=ReservationResponse, status_code=201)
async def create_reservation(
    reservation: ReservationCreate,
    current_user: TokenData = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    data = reservation.model_dump()
    data["user_id"] = UUID(current_user.user_id)
    return await service.create_reservation(data)


@router.get("/", response_model=List[ReservationResponse])
async def get_reservations(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return await service.get_reservations(UUID(current_user.user_id), skip, limit)


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return await service.get_reservation(reservation_id, UUID(current_user.user_id))


@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_reservation(
    reservation_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return await service.cancel_reservation(reservation_id, UUID(current_user.user_id))


@router.post("/{reservation_id}/confirm", response_model=ReservationResponse)
async def confirm_reservation(
    reservation_id: UUID,
    current_user: TokenData = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return await service.confirm_reservation(reservation_id, UUID(current_user.user_id))
