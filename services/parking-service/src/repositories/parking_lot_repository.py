# ============================================================================
# Repository - Parking Lot Database Operations
# ============================================================================

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.models.parking_lot import ParkingLot, ParkingLotStatus

class ParkingLotRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, data: Dict[str, Any]) -> ParkingLot:
        parking_lot = ParkingLot(**data)
        self.session.add(parking_lot)
        await self.session.commit()
        await self.session.refresh(parking_lot)
        return parking_lot
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ParkingLot]:
        result = await self.session.execute(
            select(ParkingLot).offset(skip).limit(limit).order_by(ParkingLot.created_at.desc())
        )
        return result.scalars().all()
    
    async def get_by_id(self, lot_id: UUID) -> Optional[ParkingLot]:
        result = await self.session.execute(
            select(ParkingLot).where(ParkingLot.id == lot_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_name(self, name: str) -> Optional[ParkingLot]:
        result = await self.session.execute(
            select(ParkingLot).where(ParkingLot.name == name)
        )
        return result.scalar_one_or_none()
    
    async def update(self, lot_id: UUID, data: Dict[str, Any]) -> Optional[ParkingLot]:
        parking_lot = await self.get_by_id(lot_id)
        if not parking_lot:
            return None
        for key, value in data.items():
            if hasattr(parking_lot, key) and value is not None:
                setattr(parking_lot, key, value)
        parking_lot.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(parking_lot)
        return parking_lot
    
    async def delete(self, lot_id: UUID) -> bool:
        parking_lot = await self.get_by_id(lot_id)
        if not parking_lot:
            return False
        await self.session.delete(parking_lot)
        await self.session.commit()
        return True
    
    async def update_availability(self, lot_id: UUID, spots_change: int) -> Optional[ParkingLot]:
        parking_lot = await self.get_by_id(lot_id)
        if not parking_lot:
            return None
        new_available = parking_lot.available_spots + spots_change
        if new_available < 0:
            new_available = 0
        if new_available > parking_lot.total_spots:
            new_available = parking_lot.total_spots
        parking_lot.available_spots = new_available
        parking_lot.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(parking_lot)
        return parking_lot
    
    async def get_availability(self, lot_id: UUID) -> Optional[Dict[str, Any]]:
        parking_lot = await self.get_by_id(lot_id)
        if not parking_lot:
            return None
        return {
            "parking_lot_id": str(parking_lot.id),
            "total_spots": parking_lot.total_spots,
            "available_spots": parking_lot.available_spots,
            "reserved_spots": parking_lot.reserved_spots,
            "occupied_spots": parking_lot.total_spots - parking_lot.available_spots,
            "utilization_rate": (
                (parking_lot.total_spots - parking_lot.available_spots) / parking_lot.total_spots * 100
                if parking_lot.total_spots > 0 else 0
            )
        }