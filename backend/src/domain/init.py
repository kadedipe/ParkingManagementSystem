# ============================================================================
# Domain Layer - Package Initialization
# ============================================================================

"""
Domain Layer - Core business entities and logic.

This package contains the domain models, value objects, enums, and interfaces
that represent the core business concepts of the Parking Management System.
"""

from src.domain.models import (
    Vehicle,
    ElectricVehicle,
    ParkingSlot,
    ParkingLot,
    ParkingTicket,
    ChargingStation,
    ChargingSession,
)
from src.domain.value_objects import (
    LicensePlate,
    Location,
    Money,
    Capacity,
)
from src.domain.enums import (
    VehicleType,
    PowerSource,
    SlotType,
    SlotStatus,
    BookingStatus,
    ChargingStatus,
)
from src.domain.interfaces import (
    IParkingRepository,
    IVehicleRepository,
    ITicketRepository,
)

__all__ = [
    # Models
    "Vehicle",
    "ElectricVehicle",
    "ParkingSlot",
    "ParkingLot",
    "ParkingTicket",
    "ChargingStation",
    "ChargingSession",
    # Value Objects
    "LicensePlate",
    "Location",
    "Money",
    "Capacity",
    # Enums
    "VehicleType",
    "PowerSource",
    "SlotType",
    "SlotStatus",
    "BookingStatus",
    "ChargingStatus",
    # Interfaces
    "IParkingRepository",
    "IVehicleRepository",
    "ITicketRepository",
]