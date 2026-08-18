# ============================================================================
# Parking Management System - Repositories Package
# ============================================================================

"""
Repositories Package - Data Access Layer.

This package contains all repository implementations for data access,
providing a clean abstraction between the domain layer and the database.

Each repository:
- Implements the repository pattern
- Provides CRUD operations for domain entities
- Handles database interactions
- Manages caching when applicable
- Implements query specifications
"""

# ============================================================================
# Base Repository
# ============================================================================

from src.infrastructure.repositories.base import (
    BaseRepository,
    GenericRepository,
    Specification,
    FilterSpecification,
    OrderSpecification,
    PaginationSpecification,
)

# ============================================================================
# Parking Repositories
# ============================================================================

from src.infrastructure.repositories.parking import (
    # Parking Lot
    ParkingLotRepository,
    
    # Parking Slot
    ParkingSlotRepository,
    
    # Parking Ticket
    ParkingTicketRepository,
    
    # Parking Analytics
    ParkingAnalyticsRepository,
)

# ============================================================================
# Vehicle Repositories
# ============================================================================

from src.infrastructure.repositories.vehicle import (
    VehicleRepository,
    ElectricVehicleRepository,
    VehicleTypeRepository,
)

# ============================================================================
# User Repositories
# ============================================================================

from src.infrastructure.repositories.user import (
    UserRepository,
    UserPreferencesRepository,
    UserSessionRepository,
)

# ============================================================================
# Charging Repositories
# ============================================================================

from src.infrastructure.repositories.charging import (
    ChargingStationRepository,
    ChargingSessionRepository,
    ChargingAnalyticsRepository,
)

# ============================================================================
# Notification Repositories
# ============================================================================

from src.infrastructure.repositories.notification import (
    NotificationRepository,
    NotificationTemplateRepository,
    PushTokenRepository,
)

# ============================================================================
# Payment Repositories
# ============================================================================

from src.infrastructure.repositories.payment import (
    PaymentRepository,
    PaymentMethodRepository,
    TransactionRepository,
)

# ============================================================================
# Audit Repositories
# ============================================================================

from src.infrastructure.repositories.audit import (
    AuditLogRepository,
    EventLogRepository,
    ActivityLogRepository,
)

# ============================================================================
# Repository Factory
# ============================================================================

from src.infrastructure.repositories.factory import RepositoryFactory

# ============================================================================
# Repository Registry
# ============================================================================

class RepositoryRegistry:
    """
    Registry for managing repository instances.
    
    This provides a central location for repository registration and discovery.
    """
    
    _repositories = {}
    
    @classmethod
    def register(cls, name: str, repository_class):
        """Register a repository class."""
        cls._repositories[name] = repository_class
    
    @classmethod
    def get(cls, name: str):
        """Get a registered repository class."""
        return cls._repositories.get(name)
    
    @classmethod
    def get_all(cls) -> dict:
        """Get all registered repositories."""
        return cls._repositories.copy()
    
    @classmethod
    def clear(cls):
        """Clear all registered repositories."""
        cls._repositories.clear()
    
    @classmethod
    def get_names(cls) -> list:
        """Get list of registered repository names."""
        return list(cls._repositories.keys())


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Base Repository
    "BaseRepository",
    "GenericRepository",
    "Specification",
    "FilterSpecification",
    "OrderSpecification",
    "PaginationSpecification",
    
    # Parking Repositories
    "ParkingLotRepository",
    "ParkingSlotRepository",
    "ParkingTicketRepository",
    "ParkingAnalyticsRepository",
    
    # Vehicle Repositories
    "VehicleRepository",
    "ElectricVehicleRepository",
    "VehicleTypeRepository",
    
    # User Repositories
    "UserRepository",
    "UserPreferencesRepository",
    "UserSessionRepository",
    
    # Charging Repositories
    "ChargingStationRepository",
    "ChargingSessionRepository",
    "ChargingAnalyticsRepository",
    
    # Notification Repositories
    "NotificationRepository",
    "NotificationTemplateRepository",
    "PushTokenRepository",
    
    # Payment Repositories
    "PaymentRepository",
    "PaymentMethodRepository",
    "TransactionRepository",
    
    # Audit Repositories
    "AuditLogRepository",
    "EventLogRepository",
    "ActivityLogRepository",
    
    # Factory
    "RepositoryFactory",
    
    # Registry
    "RepositoryRegistry",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"