# ============================================================================
# Base Service - Common Service Functionality
# ============================================================================

"""
Base Service class providing common functionality for all application services.
"""

from datetime import datetime
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class BaseService:
    """
    Base class for all application services.
    
    Provides common functionality and lifecycle management for services.
    """
    
    def __init__(self):
        """Initialize the base service."""
        self._registered_at: Optional[datetime] = None
        self._initialized: bool = False
        self._health_status: str = "unknown"
        self._metadata: Dict[str, Any] = {}
    
    async def initialize(self) -> None:
        """
        Initialize the service.
        
        Override this method to perform setup tasks.
        """
        self._initialized = True
        self._registered_at = datetime.utcnow()
        self._health_status = "healthy"
        logger.info(f"{self.__class__.__name__} initialized")
    
    async def shutdown(self) -> None:
        """
        Shutdown the service.
        
        Override this method to perform cleanup tasks.
        """
        self._initialized = False
        self._health_status = "shutdown"
        logger.info(f"{self.__class__.__name__} shutdown")
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check for the service.
        
        Returns:
            dict: Health status
        """
        return {
            "service": self.__class__.__name__,
            "status": self._health_status,
            "initialized": self._initialized,
            "registered_at": self._registered_at.isoformat() if self._registered_at else None,
        }
    
    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self._initialized
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get service metadata."""
        return self._metadata
    
    def set_metadata(self, key: str, value: Any) -> None:
        """Set service metadata."""
        self._metadata[key] = value
    
    async def reset(self) -> None:
        """Reset the service to its initial state."""
        await self.shutdown()
        await self.initialize()
        logger.info(f"{self.__class__.__name__} reset")