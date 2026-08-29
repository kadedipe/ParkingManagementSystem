from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.domain.models.parking_spot import ParkingSpot


class ParkingSpotRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: Dict[str, Any]) -> ParkingSpot:
        spot = ParkingSpot(**data)
        self.session.add(spot)
        await self.session.commit()
        await self.session.refresh(spot)
        return spot

    async def get_by_id(self, spot_id: UUID) -> Optional[ParkingSpot]:
        result = await self.session.execute(
            select(ParkingSpot)
            .options(selectinload(ParkingSpot.parking_lot))
            .where(ParkingSpot.id == spot_id)
        )
        return result.scalar_one_or_none()

    async def get_by_parking_lot(self, parking_lot_id: UUID, skip: int = 0, limit: int = 100) -> List[ParkingSpot]:
        result = await self.session.execute(
            select(ParkingSpot)
            .where(ParkingSpot.parking_lot_id == parking_lot_id)
            .offset(skip)
            .limit(limit)
            .order_by(ParkingSpot.number)
        )
        return result.scalars().all()

    async def get_available_spots(self, parking_lot_id: UUID) -> List[ParkingSpot]:
        from src.domain.models.parking_spot import ParkingSpotStatus
        result = await self.session.execute(
            select(ParkingSpot)
            .where(ParkingSpot.parking_lot_id == parking_lot_id)
            .where(ParkingSpot.status == ParkingSpotStatus.AVAILABLE)
            .order_by(ParkingSpot.number)
        )
        return result.scalars().all()

    async def update(self, spot_id: UUID, data: Dict[str, Any]) -> Optional[ParkingSpot]:
        spot = await self.get_by_id(spot_id)
        if not spot:
            return None
        for key, value in data.items():
            if hasattr(spot, key) and value is not None:
                setattr(spot, key, value)
        spot.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(spot)
        return spot

    async def delete(self, spot_id: UUID) -> bool:
        spot = await self.get_by_id(spot_id)
        if not spot:
            return False
        await self.session.delete(spot)
        await self.session.commit()
        return True

    async def update_status(self, spot_id: UUID, status: str) -> Optional[ParkingSpot]:
        spot = await self.get_by_id(spot_id)
        if not spot:
            return None
        spot.status = status
        spot.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(spot)
        return spot
