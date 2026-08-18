# ============================================================================
# Database Base Client - Abstract Class
# ============================================================================

"""
Base database client interface.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from contextlib import asynccontextmanager


class DatabaseClient(ABC):
    """
    Abstract base class for database clients.
    """
    
    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the database."""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close the database connection."""
        pass
    
    @abstractmethod
    async def execute(self, query: str, *args, **kwargs) -> Union[str, None]:
        """Execute a query that doesn't return rows."""
        pass
    
    @abstractmethod
    async def fetch(self, query: str, *args, **kwargs) -> List[Any]:
        """Fetch all rows from a query."""
        pass
    
    @abstractmethod
    async def fetch_one(self, query: str, *args, **kwargs) -> Optional[Any]:
        """Fetch a single row from a query."""
        pass
    
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform a health check on the database."""
        pass