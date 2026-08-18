# ============================================================================
# Events - Application Events
# ============================================================================

# parking-management-system/services/parking-service/src/application/events.py

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID
from typing import Any, Dict

@dataclass
class DomainEvent:
    """Base domain event"""
    event_id: str
    aggregate_id: UUID
    aggregate_type: str
    event_type: str
    occurred_at: datetime
    data: Dict[str, Any]

@dataclass
class ParkingLotCreatedEvent(DomainEvent):
    """Event emitted when a parking lot is created"""
    
    def __init__(
        self,
        lot_id: UUID,
        name: str,
        total_spots: int,
        user_id: UUID,
    ):
        super().__init__(
            event_id=f"plc_{lot_id}_{datetime.utcnow().timestamp()}",
            aggregate_id=lot_id,
            aggregate_type="parking_lot",
            event_type="parking_lot_created",
            occurred_at=datetime.utcnow(),
            data={
                "name": name,
                "total_spots": total_spots,
                "created_by": str(user_id),
            },
        )

@dataclass
class ParkingSpotAllocatedEvent(DomainEvent):
    """Event emitted when a parking spot is allocated"""
    
    def __init__(
        self,
        spot_id: UUID,
        parking_lot_id: UUID,
        vehicle_id: UUID,
        vehicle_plate: str,
    ):
        super().__init__(
            event_id=f"psa_{spot_id}_{datetime.utcnow().timestamp()}",
            aggregate_id=spot_id,
            aggregate_type="parking_spot",
            event_type="parking_spot_allocated",
            occurred_at=datetime.utcnow(),
            data={
                "parking_lot_id": str(parking_lot_id),
                "vehicle_id": str(vehicle_id),
                "vehicle_plate": vehicle_plate,
            },
        )

@dataclass
class ParkingSpotReleasedEvent(DomainEvent):
    """Event emitted when a parking spot is released"""
    
    def __init__(
        self,
        spot_id: UUID,
        parking_lot_id: UUID,
        vehicle_id: UUID,
        vehicle_plate: str,
    ):
        super().__init__(
            event_id=f"psr_{spot_id}_{datetime.utcnow().timestamp()}",
            aggregate_id=spot_id,
            aggregate_type="parking_spot",
            event_type="parking_spot_released",
            occurred_at=datetime.utcnow(),
            data={
                "parking_lot_id": str(parking_lot_id),
                "vehicle_id": str(vehicle_id),
                "vehicle_plate": vehicle_plate,
            },
        )