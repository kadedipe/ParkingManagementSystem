# ============================================================================
# Domain Models - Core Entities
# ============================================================================

"""
Domain models representing the core business entities.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from src.domain.enums import (
    VehicleType,
    PowerSource,
    SlotType,
    SlotStatus,
    BookingStatus,
    ChargingStatus,
)
from src.domain.value_objects import LicensePlate, Location, Money, Capacity


@dataclass
class Vehicle:
    """Vehicle entity."""
    license_plate: LicensePlate
    make: str
    model: str
    color: str
    year: int
    vehicle_type: VehicleType
    power_source: PowerSource
    id: UUID = field(default_factory=uuid4)
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)

    # ... rest of vehicle implementation


@dataclass
class ElectricVehicle(Vehicle):
    """Electric vehicle extension."""
    battery_capacity_kwh: float = 60.0
    current_charge_percent: float = 50.0
    max_charge_rate_kw: float = 7.4
    charging_status: ChargingStatus = ChargingStatus.IDLE

    # ... rest of electric vehicle implementation


@dataclass
class ParkingSlot:
    """Parking slot entity."""
    slot_number: int
    floor_level: int
    slot_type: SlotType
    status: SlotStatus = SlotStatus.AVAILABLE
    id: UUID = field(default_factory=uuid4)
    current_vehicle_id: Optional[UUID] = None
    occupied_since: Optional[datetime] = None

    # ... rest of parking slot implementation


@dataclass
class ParkingLot:
    """Parking lot aggregate root."""
    name: str
    location: Location
    total_capacity: int
    ev_capacity: int = 0
    disabled_capacity: int = 0
    hourly_rate: float = 5.0
    is_active: bool = True
    slots: List[ParkingSlot] = field(default_factory=list)
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.now)

    # ... rest of parking lot implementation


@dataclass
class ParkingTicket:
    """Parking ticket entity."""
    ticket_number: str
    parking_lot_id: UUID
    slot_number: int
    vehicle_id: UUID
    entry_time: datetime
    id: UUID = field(default_factory=uuid4)
    exit_time: Optional[datetime] = None
    total_amount: Optional[float] = None
    status: BookingStatus = BookingStatus.ACTIVE

    # ... rest of parking ticket implementation