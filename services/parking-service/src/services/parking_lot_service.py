# ============================================================================
# Service - Parking Lot Business Logic
# ============================================================================

from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import HTTPException, status
from datetime import datetime

from src.domain.models.parking_lot import ParkingLot
from src.repositories.parking_lot_repository import ParkingLotRepository

class ParkingLotService:
    """Service for Parking Lot business logic"""
    
    def __init__(self, repository: ParkingLotRepository):
        self.repository = repository
    
    async def create_parking_lot(self, data: Dict[str, Any]) -> Dict[str, Any]:
        required_fields = ["name", "address", "total_spots", "base_price_per_hour"]
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        existing = await self.repository.get_by_name(data["name"])
        if existing:
            raise HTTPException(status_code=400, detail=f"Parking lot with name {data['name']} already exists")
        
        if "available_spots" not in data:
            data["available_spots"] = data["total_spots"]
        if "reserved_spots" not in data:
            data["reserved_spots"] = 0
        if "status" not in data:
            data["status"] = "active"
        if "type" not in data:
            data["type"] = "standard"
        if "location" not in data:
            data["location"] = {"latitude": 0.0, "longitude": 0.0}
        
        parking_lot = await self.repository.create(data)
        return self._to_dict(parking_lot)
    
    async def get_parking_lots(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        parking_lots = await self.repository.get_all(skip, limit)
        return [self._to_dict(lot) for lot in parking_lots]
    
    async def get_parking_lot(self, lot_id: UUID) -> Dict[str, Any]:
        parking_lot = await self.repository.get_by_id(lot_id)
        if not parking_lot:
            raise HTTPException(status_code=404, detail=f"Parking lot with ID {lot_id} not found")
        return self._to_dict(parking_lot)
    
    async def update_parking_lot(self, lot_id: UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        parking_lot = await self.repository.update(lot_id, data)
        if not parking_lot:
            raise HTTPException(status_code=404, detail=f"Parking lot with ID {lot_id} not found")
        return self._to_dict(parking_lot)
    
    async def delete_parking_lot(self, lot_id: UUID) -> bool:
        deleted = await self.repository.delete(lot_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Parking lot with ID {lot_id} not found")
        return True
    
    async def get_availability(self, lot_id: UUID) -> Dict[str, Any]:
        availability = await self.repository.get_availability(lot_id)
        if not availability:
            raise HTTPException(status_code=404, detail=f"Parking lot with ID {lot_id} not found")
        return availability
    
    async def reserve_spot(self, lot_id: UUID) -> Dict[str, Any]:
        parking_lot = await self.repository.update_availability(lot_id, -1)
        if not parking_lot:
            raise HTTPException(status_code=404, detail=f"Parking lot with ID {lot_id} not found")
        if parking_lot.available_spots < 0:
            await self.repository.update_availability(lot_id, 1)
            raise HTTPException(status_code=400, detail="No available spots")
        return {
            "message": "Spot reserved successfully",
            "parking_lot_id": str(lot_id),
            "remaining_spots": parking_lot.available_spots
        }
    
    async def release_spot(self, lot_id: UUID) -> Dict[str, Any]:
        parking_lot = await self.repository.update_availability(lot_id, 1)
        if not parking_lot:
            raise HTTPException(status_code=404, detail=f"Parking lot with ID {lot_id} not found")
        if parking_lot.available_spots > parking_lot.total_spots:
            await self.repository.update_availability(lot_id, -1)
            raise HTTPException(status_code=400, detail="All spots are already available")
        return {
            "message": "Spot released successfully",
            "parking_lot_id": str(lot_id),
            "available_spots": parking_lot.available_spots
        }
    
    def _to_dict(self, parking_lot: ParkingLot) -> Dict[str, Any]:
        return {
            "id": str(parking_lot.id),
            "name": parking_lot.name,
            "description": parking_lot.description,
            "type": parking_lot.type.value if parking_lot.type else None,
            "status": parking_lot.status.value if parking_lot.status else None,
            "address": parking_lot.address,
            "location": parking_lot.location,
            "total_spots": parking_lot.total_spots,
            "available_spots": parking_lot.available_spots,
            "reserved_spots": parking_lot.reserved_spots,
            "price_per_hour": float(parking_lot.base_price_per_hour) if parking_lot.base_price_per_hour else 0,
            "price_per_day": float(parking_lot.base_price_per_day) if parking_lot.base_price_per_day else None,
            "price_per_month": float(parking_lot.base_price_per_month) if parking_lot.base_price_per_month else None,
            "amenities": parking_lot.amenities,
            "features": parking_lot.features,
            "operating_hours": parking_lot.operating_hours,
            "phone": parking_lot.phone,
            "email": parking_lot.email,
            "website": parking_lot.website,
            "rating": parking_lot.rating,
            "review_count": parking_lot.review_count,
            "images": parking_lot.images,
            "created_at": parking_lot.created_at.isoformat() if parking_lot.created_at else None,
            "updated_at": parking_lot.updated_at.isoformat() if parking_lot.updated_at else None,
        }