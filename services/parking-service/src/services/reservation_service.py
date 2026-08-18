from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import HTTPException, status

from src.domain.models.reservation import Reservation, ReservationStatus
from src.repositories.reservation_repository import ReservationRepository
from src.repositories.parking_spot_repository import ParkingSpotRepository
from src.repositories.parking_lot_repository import ParkingLotRepository
from src.websocket.manager import manager


class ReservationService:
    def __init__(self, repository: ReservationRepository, spot_repository: ParkingSpotRepository):
        self.repository = repository
        self.spot_repository = spot_repository
    
    async def create_reservation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Check if spot exists
        spot = await self.spot_repository.get_by_id(data["parking_spot_id"])
        if not spot:
            raise HTTPException(status_code=404, detail="Parking spot not found")
        
        # Check if spot is available
        if spot.status != "available":
            raise HTTPException(status_code=400, detail="Parking spot is not available")
        
        # Check for overlapping reservations
        existing = await self.repository.get_by_spot(
            data["parking_spot_id"],
            data["start_time"],
            data["end_time"]
        )
        if existing:
            raise HTTPException(status_code=400, detail="Spot is already reserved for this time slot")
        
        # Calculate price
        duration_hours = (data["end_time"] - data["start_time"]).total_seconds() / 3600
        data["total_price"] = duration_hours * spot.parking_lot.base_price_per_hour
        
        # Create reservation
        reservation = await self.repository.create(data)
        
        # Broadcast update via WebSocket
        lot_repo = ParkingLotRepository(self.repository.session)
        lot = await lot_repo.get_by_id(spot.parking_lot_id)
        if lot:
            await manager.broadcast_availability(
                str(lot.id),
                {
                    "available_spots": lot.available_spots,
                    "reserved_spots": lot.reserved_spots,
                    "total_spots": lot.total_spots
                }
            )
        
        return self._to_dict(reservation)
    
    async def get_reservations(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        reservations = await self.repository.get_by_user(user_id, skip, limit)
        return [self._to_dict(r) for r in reservations]
    
    async def get_reservation(self, reservation_id: UUID) -> Dict[str, Any]:
        reservation = await self.repository.get_by_id(reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return self._to_dict(reservation)
    
    async def cancel_reservation(self, reservation_id: UUID) -> Dict[str, Any]:
        reservation = await self.repository.update(
            reservation_id,
            {"status": ReservationStatus.CANCELLED.value}
        )
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Broadcast update after cancellation
        spot = await self.spot_repository.get_by_id(reservation.parking_spot_id)
        if spot:
            lot_repo = ParkingLotRepository(self.repository.session)
            lot = await lot_repo.get_by_id(spot.parking_lot_id)
            if lot:
                await manager.broadcast_availability(
                    str(lot.id),
                    {
                        "available_spots": lot.available_spots,
                        "reserved_spots": lot.reserved_spots,
                        "total_spots": lot.total_spots
                    }
                )
        
        return self._to_dict(reservation)
    
    async def confirm_reservation(self, reservation_id: UUID) -> Dict[str, Any]:
        reservation = await self.repository.update(
            reservation_id,
            {"status": ReservationStatus.CONFIRMED.value}
        )
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Update spot status to reserved
        await self.spot_repository.update_status(
            reservation.parking_spot_id,
            "reserved"
        )
        
        # Broadcast update after confirmation
        spot = await self.spot_repository.get_by_id(reservation.parking_spot_id)
        if spot:
            lot_repo = ParkingLotRepository(self.repository.session)
            lot = await lot_repo.get_by_id(spot.parking_lot_id)
            if lot:
                await manager.broadcast_availability(
                    str(lot.id),
                    {
                        "available_spots": lot.available_spots,
                        "reserved_spots": lot.reserved_spots,
                        "total_spots": lot.total_spots
                    }
                )
        
        return self._to_dict(reservation)
    
    def _to_dict(self, reservation: Reservation) -> Dict[str, Any]:
        return {
            "id": str(reservation.id),
            "user_id": str(reservation.user_id),
            "parking_spot_id": str(reservation.parking_spot_id),
            "vehicle_id": str(reservation.vehicle_id) if reservation.vehicle_id else None,
            "start_time": reservation.start_time.isoformat(),
            "end_time": reservation.end_time.isoformat(),
            "status": reservation.status.value if reservation.status else None,
            "total_price": reservation.total_price,
            "created_at": reservation.created_at.isoformat(),
            "updated_at": reservation.updated_at.isoformat() if reservation.updated_at else None,
        }