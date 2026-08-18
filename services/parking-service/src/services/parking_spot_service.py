from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import HTTPException, status

from src.domain.models.parking_spot import ParkingSpot, ParkingSpotStatus
from src.repositories.parking_spot_repository import ParkingSpotRepository

class ParkingSpotService:
    def __init__(self, repository: ParkingSpotRepository):
        self.repository = repository
    
    async def create_spot(self, data: Dict[str, Any]) -> Dict[str, Any]:
        spot = await self.repository.create(data)
        return self._to_dict(spot)
    
    async def get_spots(self, parking_lot_id: UUID, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        spots = await self.repository.get_by_parking_lot(parking_lot_id, skip, limit)
        return [self._to_dict(spot) for spot in spots]
    
    async def get_spot(self, spot_id: UUID) -> Dict[str, Any]:
        spot = await self.repository.get_by_id(spot_id)
        if not spot:
            raise HTTPException(status_code=404, detail="Parking spot not found")
        return self._to_dict(spot)
    
    async def update_spot(self, spot_id: UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        spot = await self.repository.update(spot_id, data)
        if not spot:
            raise HTTPException(status_code=404, detail="Parking spot not found")
        return self._to_dict(spot)
    
    async def delete_spot(self, spot_id: UUID) -> bool:
        deleted = await self.repository.delete(spot_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Parking spot not found")
        return True
    
    def _to_dict(self, spot: ParkingSpot) -> Dict[str, Any]:
        return {
            "id": str(spot.id),
            "parking_lot_id": str(spot.parking_lot_id),
            "number": spot.number,
            "level": spot.level,
            "type": spot.type.value if spot.type else None,
            "status": spot.status.value if spot.status else None,
            "width": spot.width,
            "length": spot.length,
            "height": spot.height,
            "is_covered": spot.is_covered,
            "is_handicap": spot.is_handicap,
            "is_ev_charging": spot.is_ev_charging,
            "connector_type": spot.connector_type,
            "charging_power": spot.charging_power,
            "charging_price": spot.charging_price,
            "vehicle_id": str(spot.vehicle_id) if spot.vehicle_id else None,
            "vehicle_plate": spot.vehicle_plate,
            "reserved_until": spot.reserved_until.isoformat() if spot.reserved_until else None,
            "occupied_since": spot.occupied_since.isoformat() if spot.occupied_since else None,
            "created_at": spot.created_at.isoformat() if spot.created_at else None,
            "updated_at": spot.updated_at.isoformat() if spot.updated_at else None,
        }