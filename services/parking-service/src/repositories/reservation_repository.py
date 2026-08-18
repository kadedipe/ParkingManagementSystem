from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from src.domain.models.reservation import Reservation, ReservationStatus

class ReservationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, data: Dict[str, Any]) -> Reservation:
        reservation = Reservation(**data)
        self.session.add(reservation)
        await self.session.commit()
        await self.session.refresh(reservation)
        return reservation
    
    async def get_by_id(self, reservation_id: UUID) -> Optional[Reservation]:
        result = await self.session.execute(
            select(Reservation).where(Reservation.id == reservation_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Reservation]:
        result = await self.session.execute(
            select(Reservation)
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.start_time.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_spot(self, spot_id: UUID, start_time: datetime, end_time: datetime) -> List[Reservation]:
        result = await self.session.execute(
            select(Reservation)
            .where(Reservation.parking_spot_id == spot_id)
            .where(
                or_(
                    and_(Reservation.start_time < end_time, Reservation.end_time > start_time),
                    and_(Reservation.start_time >= start_time, Reservation.start_time < end_time)
                )
            )
            .where(Reservation.status != ReservationStatus.CANCELLED)
        )
        return result.scalars().all()
    
    async def update(self, reservation_id: UUID, data: Dict[str, Any]) -> Optional[Reservation]:
        reservation = await self.get_by_id(reservation_id)
        if not reservation:
            return None
        for key, value in data.items():
            if hasattr(reservation, key) and value is not None:
                setattr(reservation, key, value)
        reservation.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(reservation)
        return reservation
    
    async def delete(self, reservation_id: UUID) -> bool:
        reservation = await self.get_by_id(reservation_id)
        if not reservation:
            return False
        await self.session.delete(reservation)
        await self.session.commit()
        return True