# ============================================================================
# Parking Management System - Application Services Package
# ============================================================================

"""
Application Services Package

This package contains the core application services that orchestrate
domain logic and implement business use cases for the Parking Management System.

Services are responsible for:
- Coordinating domain objects to perform specific tasks
- Implementing use cases that represent business requirements
- Handling transactions and unit of work
- Validating input data
- Mapping between domain objects and DTOs
- Managing cross-cutting concerns like logging and security
- Publishing domain events
"""

# ============================================================================
# Service Imports
# ============================================================================

from src.application.services.parking_service import ParkingService
from src.application.services.charging_service import ChargingService
from src.application.services.vehicle_service import VehicleService
from src.application.services.user_service import UserService
from src.application.services.notification_service import NotificationService
from src.application.services.payment_service import PaymentService
from src.application.services.report_service import ReportService
from src.application.services.auth_service import AuthService
from src.application.services.cache_service import CacheService
from src.application.services.geo_service import GeoService
from src.application.services.webhook_service import WebhookService

# ============================================================================
# Service Factory
# ============================================================================

class ServiceFactory:
    """
    Factory for creating application service instances.
    
    This factory centralizes service creation, making it easier to manage
    dependencies and configurations across the application.
    """
    
    def __init__(self, container):
        """
        Initialize the service factory.
        
        Args:
            container: Dependency injection container
        """
        self.container = container
    
    def get_parking_service(self) -> ParkingService:
        """Get parking service instance."""
        return self.container.get(ParkingService)
    
    def get_charging_service(self) -> ChargingService:
        """Get charging service instance."""
        return self.container.get(ChargingService)
    
    def get_vehicle_service(self) -> VehicleService:
        """Get vehicle service instance."""
        return self.container.get(VehicleService)
    
    def get_user_service(self) -> UserService:
        """Get user service instance."""
        return self.container.get(UserService)
    
    def get_notification_service(self) -> NotificationService:
        """Get notification service instance."""
        return self.container.get(NotificationService)
    
    def get_payment_service(self) -> PaymentService:
        """Get payment service instance."""
        return self.container.get(PaymentService)
    
    def get_report_service(self) -> ReportService:
        """Get report service instance."""
        return self.container.get(ReportService)
    
    def get_auth_service(self) -> AuthService:
        """Get auth service instance."""
        return self.container.get(AuthService)
    
    def get_cache_service(self) -> CacheService:
        """Get cache service instance."""
        return self.container.get(CacheService)
    
    def get_geo_service(self) -> GeoService:
        """Get geo service instance."""
        return self.container.get(GeoService)


# ============================================================================
# Service Registry
# ============================================================================

class ServiceRegistry:
    """
    Registry for tracking and managing service instances.
    
    This provides a central location for service registration and discovery,
    useful for monitoring, health checks, and dependency management.
    """
    
    _services = {}
    
    @classmethod
    def register(cls, name: str, service):
        """Register a service instance."""
        cls._services[name] = service
    
    @classmethod
    def get(cls, name: str):
        """Get a registered service."""
        return cls._services.get(name)
    
    @classmethod
    def get_all(cls) -> dict:
        """Get all registered services."""
        return cls._services.copy()
    
    @classmethod
    def clear(cls):
        """Clear all registered services."""
        cls._services.clear()
    
    @classmethod
    def get_service_names(cls) -> list:
        """Get list of registered service names."""
        return list(cls._services.keys())
    
    @classmethod
    def get_service_status(cls) -> dict:
        """Get status of all services."""
        status = {}
        for name, service in cls._services.items():
            status[name] = {
                "status": "healthy",
                "type": service.__class__.__name__,
                "registered_at": getattr(service, '_registered_at', None),
            }
        return status


# ============================================================================
# Service Base Class
# ============================================================================

class BaseService:
    """
    Base class for all application services.
    
    Provides common functionality and lifecycle management for services.
    """
    
    def __init__(self):
        """Initialize the base service."""
        self._registered_at = None
        self._initialized = False
    
    async def initialize(self) -> None:
        """
        Initialize the service.
        
        Override this method to perform setup tasks.
        """
        self._initialized = True
        self._registered_at = datetime.utcnow()
    
    async def shutdown(self) -> None:
        """
        Shutdown the service.
        
        Override this method to perform cleanup tasks.
        """
        self._initialized = False
    
    async def health_check(self) -> dict:
        """
        Perform health check for the service.
        
        Returns:
            dict: Health status
        """
        return {
            "status": "healthy" if self._initialized else "unhealthy",
            "initialized": self._initialized,
        }
    
    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self._initialized


# ============================================================================
# Service Dependencies
# ============================================================================

class ServiceDependencies:
    """
    Manages service dependencies.
    
    This class helps manage dependencies between services, ensuring
    proper initialization order and dependency injection.
    """
    
    def __init__(self):
        """Initialize dependency manager."""
        self._dependencies = {}
    
    def add_dependency(self, service_name: str, depends_on: list):
        """
        Add a dependency relationship.
        
        Args:
            service_name: Name of the service
            depends_on: List of services this service depends on
        """
        self._dependencies[service_name] = depends_on
    
    def get_dependencies(self, service_name: str) -> list:
        """Get dependencies for a service."""
        return self._dependencies.get(service_name, [])
    
    def get_dependency_graph(self) -> dict:
        """Get the full dependency graph."""
        return self._dependencies
    
    def get_service_order(self) -> list:
        """
        Get services in dependency order.
        
        Returns:
            list: Services sorted by dependencies
        """
        from collections import deque
        
        # Build dependency graph
        graph = self._dependencies
        visited = set()
        order = deque()
        
        def dfs(node):
            if node in visited:
                return
            visited.add(node)
            for dep in graph.get(node, []):
                if dep not in visited:
                    dfs(dep)
            order.appendleft(node)
        
        for service in graph:
            if service not in visited:
                dfs(service)
        
        return list(order)


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Services
    "ParkingService",
    "ChargingService",
    "VehicleService",
    "UserService",
    "NotificationService",
    "PaymentService",
    "ReportService",
    "AuthService",
    "CacheService",
    "GeoService",
    "WebhookService",
    
    # Factory and Registry
    "ServiceFactory",
    "ServiceRegistry",
    "ServiceDependencies",
    
    # Base Class
    "BaseService",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"