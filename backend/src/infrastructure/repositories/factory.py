# ============================================================================
# Repository Factory - Creates Repository Instances
# ============================================================================

"""
Repository Factory for creating repository instances with proper dependencies.
"""

from typing import Type, Dict, Any, Optional

from src.infrastructure.database import DatabaseClient
from src.infrastructure.cache import CacheClient
from src.infrastructure.repositories.base import GenericRepository
from src.infrastructure.repositories.parking import (
    ParkingLotRepository,
    ParkingSlotRepository,
    ParkingTicketRepository,
)
from src.infrastructure.repositories.vehicle import VehicleRepository
from src.infrastructure.repositories.user import UserRepository
from src.infrastructure.repositories.charging import (
    ChargingStationRepository,
    ChargingSessionRepository,
)
from src.infrastructure.repositories.notification import NotificationRepository
from src.infrastructure.repositories.payment import PaymentRepository


class RepositoryFactory:
    """
    Factory for creating repository instances.
    
    This centralizes repository creation with proper dependency injection.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
    ):
        """
        Initialize the repository factory.
        
        Args:
            database_client: Database client for data access
            cache_client: Optional cache client for performance
        """
        self.db = database_client
        self.cache = cache_client
        self._repositories: Dict[str, Any] = {}
    
    def get_parking_lot_repository(self) -> ParkingLotRepository:
        """Get parking lot repository."""
        if 'parking_lot' not in self._repositories:
            self._repositories['parking_lot'] = ParkingLotRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['parking_lot']
    
    def get_parking_slot_repository(self) -> ParkingSlotRepository:
        """Get parking slot repository."""
        if 'parking_slot' not in self._repositories:
            self._repositories['parking_slot'] = ParkingSlotRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['parking_slot']
    
    def get_parking_ticket_repository(self) -> ParkingTicketRepository:
        """Get parking ticket repository."""
        if 'parking_ticket' not in self._repositories:
            self._repositories['parking_ticket'] = ParkingTicketRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['parking_ticket']
    
    def get_vehicle_repository(self) -> VehicleRepository:
        """Get vehicle repository."""
        if 'vehicle' not in self._repositories:
            self._repositories['vehicle'] = VehicleRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['vehicle']
    
    def get_user_repository(self) -> UserRepository:
        """Get user repository."""
        if 'user' not in self._repositories:
            self._repositories['user'] = UserRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['user']
    
    def get_charging_station_repository(self) -> ChargingStationRepository:
        """Get charging station repository."""
        if 'charging_station' not in self._repositories:
            self._repositories['charging_station'] = ChargingStationRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['charging_station']
    
    def get_charging_session_repository(self) -> ChargingSessionRepository:
        """Get charging session repository."""
        if 'charging_session' not in self._repositories:
            self._repositories['charging_session'] = ChargingSessionRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['charging_session']
    
    def get_notification_repository(self) -> NotificationRepository:
        """Get notification repository."""
        if 'notification' not in self._repositories:
            self._repositories['notification'] = NotificationRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['notification']
    
    def get_payment_repository(self) -> PaymentRepository:
        """Get payment repository."""
        if 'payment' not in self._repositories:
            self._repositories['payment'] = PaymentRepository(
                database_client=self.db,
                cache_client=self.cache,
            )
        return self._repositories['payment']
    
    def clear_cache(self) -> None:
        """Clear all cached repositories."""
        self._repositories.clear()