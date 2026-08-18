# ============================================================================
# Application Interfaces Package
# ============================================================================

"""
Application layer interfaces defining service contracts.

These interfaces define the contracts that application services must implement,
enabling dependency inversion and loose coupling between layers.
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from uuid import UUID

from src.application.dtos.parking_dto import (
    ParkingLotCreateDTO,
    ParkingLotResponseDTO,
    ParkingLotUpdateDTO,
    ParkVehicleDTO,
    RemoveVehicleDTO,
    ParkingTicketDTO,
    LotStatusDTO,
)


class IParkingService(ABC):
    """Interface for parking service."""
    
    @abstractmethod
    async def create_parking_lot(self, data: ParkingLotCreateDTO) -> ParkingLotResponseDTO:
        """Create a new parking lot."""
        pass
    
    @abstractmethod
    async def get_parking_lot(self, lot_id: UUID) -> Optional[ParkingLotResponseDTO]:
        """Get a parking lot by ID."""
        pass
    
    @abstractmethod
    async def get_all_parking_lots(self) -> List[ParkingLotResponseDTO]:
        """Get all parking lots."""
        pass
    
    @abstractmethod
    async def update_parking_lot(
        self,
        lot_id: UUID,
        data: ParkingLotUpdateDTO,
    ) -> Optional[ParkingLotResponseDTO]:
        """Update a parking lot."""
        pass
    
    @abstractmethod
    async def delete_parking_lot(self, lot_id: UUID) -> bool:
        """Delete a parking lot."""
        pass
    
    @abstractmethod
    async def park_vehicle(self, data: ParkVehicleDTO) -> ParkingTicketDTO:
        """Park a vehicle in the lot."""
        pass
    
    @abstractmethod
    async def remove_vehicle(self, data: RemoveVehicleDTO) -> ParkingTicketDTO:
        """Remove a vehicle from the lot."""
        pass
    
    @abstractmethod
    async def get_lot_status(self, lot_id: UUID) -> LotStatusDTO:
        """Get parking lot status."""
        pass
    
    @abstractmethod
    async def get_revenue_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Get revenue report."""
        pass


class IUnitOfWork(ABC):
    """Interface for unit of work pattern."""
    
    @abstractmethod
    async def __aenter__(self):
        """Enter the context."""
        pass
    
    @abstractmethod
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit the context."""
        pass
    
    @abstractmethod
    async def commit(self) -> None:
        """Commit the transaction."""
        pass
    
    @abstractmethod
    async def rollback(self) -> None:
        """Rollback the transaction."""
        pass