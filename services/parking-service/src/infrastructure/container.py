# ============================================================================
# Infrastructure - Dependency Injection Container
# ============================================================================

# parking-management-system/services/parking-service/src/infrastructure/container.py

from typing import Dict, Any, Type
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.database import get_session
from src.core.redis import get_redis_client
from src.domain.repositories import ParkingLotRepository, ParkingSpotRepository
from src.domain.services import (
    ParkingAvailabilityService,
    PricingCalculatorService,
    ParkingSpotAllocationService,
)
from src.application.services import ParkingService
from src.infrastructure.repositories import (
    SQLAlchemyParkingLotRepository,
    SQLAlchemyParkingSpotRepository,
    ParkingLotCache,
    ParkingSpotCache,
)
from src.infrastructure.clients import GoogleMapsClient
from src.infrastructure.message_broker import MessageBroker, EventHandler
from src.core.events import EventDispatcher

class Container:
    """Dependency Injection Container"""
    
    def __init__(self):
        self._instances: Dict[Type, Any] = {}
        self._singletons: Dict[Type, Any] = {}
    
    def register(self, interface: Type, implementation: Type, singleton: bool = True):
        """Register a dependency"""
        if singleton:
            self._singletons[interface] = implementation
        else:
            self._instances[interface] = implementation
    
    def get(self, interface: Type) -> Any:
        """Get a dependency instance"""
        if interface in self._singletons:
            implementation = self._singletons[interface]
            if isinstance(implementation, type):
                instance = implementation()
                self._singletons[interface] = instance
                return instance
            return implementation
        
        if interface in self._instances:
            implementation = self._instances[interface]
            return implementation()
        
        raise KeyError(f"Dependency not registered: {interface}")
    
    def build(self):
        """Build the container with all dependencies"""
        # Redis client
        self.register(Redis, lambda: get_redis_client())
        
        # Database session
        self.register(AsyncSession, get_session)
        
        # Repositories
        self.register(ParkingLotRepository, SQLAlchemyParkingLotRepository)
        self.register(ParkingSpotRepository, SQLAlchemyParkingSpotRepository)
        
        # Cache
        self.register(ParkingLotCache, lambda: ParkingLotCache(self.get(Redis)))
        self.register(ParkingSpotCache, lambda: ParkingSpotCache(self.get(Redis)))
        
        # External clients
        self.register(GoogleMapsClient, GoogleMapsClient)
        
        # Message broker
        self.register(MessageBroker, lambda: MessageBroker(self.get(Redis)))
        self.register(EventHandler, lambda: EventHandler(self.get(MessageBroker)))
        
        # Event dispatcher
        self.register(EventDispatcher, EventDispatcher)
        
        # Domain services
        self.register(ParkingAvailabilityService, lambda: ParkingAvailabilityService(
            parking_lot_repo=self.get(ParkingLotRepository),
            parking_spot_repo=self.get(ParkingSpotRepository),
        ))
        self.register(PricingCalculatorService, lambda: PricingCalculatorService(
            parking_lot_repo=self.get(ParkingLotRepository),
        ))
        self.register(ParkingSpotAllocationService, lambda: ParkingSpotAllocationService(
            parking_spot_repo=self.get(ParkingSpotRepository),
        ))
        
        # Application service
        self.register(ParkingService, lambda: ParkingService(
            parking_lot_repo=self.get(ParkingLotRepository),
            parking_spot_repo=self.get(ParkingSpotRepository),
            availability_service=self.get(ParkingAvailabilityService),
            pricing_service=self.get(PricingCalculatorService),
            allocation_service=self.get(ParkingSpotAllocationService),
            event_dispatcher=self.get(EventDispatcher),
        ))

# Global container instance
container = Container()

async def get_parking_service() -> ParkingService:
    """Get ParkingService instance"""
    return container.get(ParkingService)

async def get_redis_client() -> Redis:
    """Get Redis client"""
    return Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        decode_responses=True,
    )