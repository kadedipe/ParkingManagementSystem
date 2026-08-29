import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import TokenData
from src.core.database import get_db
from src.domain.models.parking_spot import ParkingSpot
from src.domain.models.reservation import Reservation, ReservationStatus
from src.domain.models.user import User
from src.repositories.parking_spot_repository import ParkingSpotRepository
from src.repositories.reservation_repository import ReservationRepository
from src.services.reservation_service import ReservationService

logger = logging.getLogger(__name__)
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


class UpcomingReservationResponse(BaseModel):
    id: UUID
    spot: str
    customer: str
    date: datetime
    status: str


def _to_naive_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


async def get_reservation_service(db: AsyncSession = Depends(get_db)) -> ReservationService:
    repo = ReservationRepository(db)
    spot_repo = ParkingSpotRepository(db)
    return ReservationService(repo, spot_repo)


@router.post("/", response_model=ReservationResponse, status_code=201)
async def create_reservation(
    reservation: ReservationCreate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    service: ReservationService = Depends(get_reservation_service),
):
    user_id = UUID(current_user.user_id)

    # Fail with an actionable client response instead of an opaque FK 500 if a
    # stale/foreign auth token references a user that is not present locally.
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=409,
            detail="Your authenticated user is not present in the parking database. Please sign out and sign in again.",
        )

    data = reservation.model_dump()
    data["start_time"] = _to_naive_utc(data["start_time"])
    data["end_time"] = _to_naive_utc(data["end_time"])
    data["user_id"] = user_id

    try:
        return await service.create_reservation(data)
    except HTTPException:
        raise
    except IntegrityError as exc:
        await db.rollback()
        logger.exception("Reservation insert violated a database constraint")
        error_text = str(exc.orig).lower() if exc.orig else str(exc).lower()
        if "user_id" in error_text or "fk_reservations_user_id_users" in error_text:
            detail = "The reservation user account is not valid in the parking database. Please sign out and sign in again."
        elif "parking_spot_id" in error_text or "fk_reservations_parking_spot_id_parking_spots" in error_text:
            detail = "The selected parking spot no longer exists. Refresh Find Parking and choose another spot."
        else:
            detail = "The reservation could not be saved because of a database constraint. Refresh the page and try again."
        raise HTTPException(status_code=409, detail=detail) from exc
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("Reservation database operation failed")
        raise HTTPException(
            status_code=503,
            detail="The reservation database operation failed. Verify the parking-service database migration and try again.",
        ) from exc
    except Exception as exc:
        await db.rollback()
        logger.exception("Unexpected reservation creation failure")
        raise HTTPException(
            status_code=500,
            detail="Reservation creation failed unexpectedly. Check the parking-service logs for the recorded exception.",
        ) from exc


@router.get("/", response_model=List[ReservationResponse])
async def get_reservations(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return await service.get_reservations(UUID(current_user.user_id), skip, limit)


@router.get("/upcoming", response_model=List[UpcomingReservationResponse])
async def get_upcoming_reservations(
    limit: int = 10,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's future pending/confirmed reservations."""
    user_id = UUID(current_user.user_id)
    now = datetime.utcnow()
    rows = await db.execute(
        select(Reservation, ParkingSpot, User)
        .join(ParkingSpot, Reservation.parking_spot_id == ParkingSpot.id)
        .join(User, Reservation.user_id == User.id)
        .where(
            Reservation.user_id == user_id,
            Reservation.start_time >= now,
            Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
        )
        .order_by(Reservation.start_time.asc())
        .limit(max(1, min(limit, 100)))
    )
    return [
        {
            "id": reservation.id,
            "spot": spot.number,
            "customer": user.full_name,
            "date": reservation.start_time,
            "status": reservation.status.value,
        }
        for reservation, spot, user in rows.all()
    ]


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
