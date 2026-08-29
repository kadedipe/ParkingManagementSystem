from typing import List, Dict, Any
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select

from src.domain.models.reservation import Reservation, ReservationStatus
from src.domain.models.parking_spot import ParkingSpot, ParkingSpotStatus
from src.repositories.reservation_repository import ReservationRepository
from src.repositories.parking_spot_repository import ParkingSpotRepository
from src.repositories.parking_lot_repository import ParkingLotRepository
from src.websocket.manager import manager


class ReservationService:
    def __init__(self, repository: ReservationRepository, spot_repository: ParkingSpotRepository):
        self.repository = repository
        self.spot_repository = spot_repository

    async def create_reservation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if data["end_time"] <= data["start_time"]:
            raise HTTPException(status_code=400, detail="Reservation end time must be after start time")

        spot = await self.spot_repository.get_by_id(data["parking_spot_id"])
        if not spot:
            raise HTTPException(status_code=404, detail="Parking spot not found")

        if spot.status != ParkingSpotStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Parking spot is not available")

        existing = await self.repository.get_by_spot(
            data["parking_spot_id"],
            data["start_time"],
            data["end_time"],
        )
        if existing:
            raise HTTPException(status_code=400, detail="Spot is already reserved for this time slot")

        duration_hours = (data["end_time"] - data["start_time"]).total_seconds() / 3600
        data["total_price"] = float(duration_hours * spot.parking_lot.base_price_per_hour)

        reservation = await self.repository.create(data)
        return self._to_dict(reservation)

    async def get_reservations(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        reservations = await self.repository.get_by_user(user_id, skip, limit)
        return [self._to_dict(r) for r in reservations]

    async def get_reservation(self, reservation_id: UUID, user_id: UUID) -> Dict[str, Any]:
        reservation = await self._get_owned_reservation(reservation_id, user_id)
        return self._to_dict(reservation)

    async def cancel_reservation(self, reservation_id: UUID, user_id: UUID) -> Dict[str, Any]:
        reservation = await self._get_owned_reservation(reservation_id, user_id)

        if reservation.status == ReservationStatus.CANCELLED:
            return self._to_dict(reservation)
        if reservation.status == ReservationStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Completed reservations cannot be cancelled")

        spot = await self.spot_repository.get_by_id(reservation.parking_spot_id)
        reservation.status = ReservationStatus.CANCELLED

        if spot and spot.status == ParkingSpotStatus.RESERVED:
            spot.status = ParkingSpotStatus.AVAILABLE
            spot.reserved_until = None

        await self.repository.session.commit()
        await self.repository.session.refresh(reservation)

        if spot:
            await self._sync_lot_inventory(spot.parking_lot_id)

        return self._to_dict(reservation)

    async def confirm_reservation(self, reservation_id: UUID, user_id: UUID) -> Dict[str, Any]:
        reservation = await self._get_owned_reservation(reservation_id, user_id)

        if reservation.status == ReservationStatus.CANCELLED:
            raise HTTPException(status_code=400, detail="Cancelled reservations cannot be confirmed")
        if reservation.status == ReservationStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Completed reservations cannot be confirmed")
        if reservation.status == ReservationStatus.CONFIRMED:
            return self._to_dict(reservation)

        spot = await self.spot_repository.get_by_id(reservation.parking_spot_id)
        if not spot:
            raise HTTPException(status_code=404, detail="Parking spot not found")
        if spot.status != ParkingSpotStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Parking spot is no longer available")

        reservation.status = ReservationStatus.CONFIRMED
        spot.status = ParkingSpotStatus.RESERVED
        spot.reserved_until = reservation.end_time

        await self.repository.session.commit()
        await self.repository.session.refresh(reservation)
        await self._sync_lot_inventory(spot.parking_lot_id)

        return self._to_dict(reservation)

    async def _get_owned_reservation(self, reservation_id: UUID, user_id: UUID) -> Reservation:
        reservation = await self.repository.get_by_id(reservation_id)
        if not reservation or reservation.user_id != user_id:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return reservation

    async def _sync_lot_inventory(self, parking_lot_id: UUID) -> None:
        lot_repo = ParkingLotRepository(self.repository.session)
        lot = await lot_repo.get_by_id(parking_lot_id)
        if not lot:
            return

        result = await self.repository.session.execute(
            select(ParkingSpot).where(ParkingSpot.parking_lot_id == parking_lot_id)
        )
        spots = result.scalars().all()

        lot.total_spots = len(spots)
        lot.available_spots = sum(1 for spot in spots if spot.status == ParkingSpotStatus.AVAILABLE)
        lot.reserved_spots = sum(1 for spot in spots if spot.status == ParkingSpotStatus.RESERVED)
        await self.repository.session.commit()

        await manager.broadcast_availability(
            str(lot.id),
            {
                "available_spots": lot.available_spots,
                "reserved_spots": lot.reserved_spots,
                "total_spots": lot.total_spots,
            },
        )

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
