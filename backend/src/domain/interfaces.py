# ============================================================================
# Domain Interfaces
# ============================================================================

"""
Domain interfaces for repository pattern and dependency injection.
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from uuid import UUID

from src.domain.models import (
    Vehicle,
    ParkingLot,
    ParkingSlot,
    ParkingTicket,
    ElectricVehicle,
)


class IParkingRepository(ABC):
    """Interface for parking repository."""

    @abstractmethod
    def save_lot(self, lot: ParkingLot) -> ParkingLot:
        """Save a parking lot."""
        pass

    @abstractmethod
    def get_lot(self, lot_id: UUID) -> Optional[ParkingLot]:
        """Get a parking lot by ID."""
        pass

    @abstractmethod
    def get_all_lots(self) -> List[ParkingLot]:
        """Get all parking lots."""
        pass

    @abstractmethod
    def update_lot(self, lot: ParkingLot) -> ParkingLot:
        """Update a parking lot."""
        pass

    @abstractmethod
    def delete_lot(self, lot_id: UUID) -> bool:
        """Delete a parking lot."""
        pass

    @abstractmethod
    def get_available_slots(self, lot_id: UUID) -> List[ParkingSlot]:
        """Get available slots in a lot."""
        pass


class IVehicleRepository(ABC):
    """Interface for vehicle repository."""

    @abstractmethod
    def save_vehicle(self, vehicle: Vehicle) -> Vehicle:
        """Save a vehicle."""
        pass

    @abstractmethod
    def get_vehicle(self, vehicle_id: UUID) -> Optional[Vehicle]:
        """Get a vehicle by ID."""
        pass

    @abstractmethod
    def find_by_plate(self, plate: str) -> Optional[Vehicle]:
        """Find a vehicle by license plate."""
        pass

    @abstractmethod
    def get_all_vehicles(self) -> List[Vehicle]:
        """Get all vehicles."""
        pass

    @abstractmethod
    def get_electric_vehicles(self) -> List[ElectricVehicle]:
        """Get all electric vehicles."""
        pass


class ITicketRepository(ABC):
    """Interface for ticket repository."""

    @abstractmethod
    def save_ticket(self, ticket: ParkingTicket) -> ParkingTicket:
        """Save a parking ticket."""
        pass

    @abstractmethod
    def get_ticket(self, ticket_id: UUID) -> Optional[ParkingTicket]:
        """Get a ticket by ID."""
        pass

    @abstractmethod
    def get_ticket_by_number(self, ticket_number: str) -> Optional[ParkingTicket]:
        """Get a ticket by ticket number."""
        pass

    @abstractmethod
    def get_active_tickets(self) -> List[ParkingTicket]:
        """Get all active tickets."""
        pass

    @abstractmethod
    def get_completed_tickets(self) -> List[ParkingTicket]:
        """Get all completed tickets."""
        pass