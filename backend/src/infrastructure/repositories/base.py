# ============================================================================
# Base Repository - Abstract Repository Pattern Implementation
# ============================================================================

"""
Base Repository implementation providing common CRUD operations.
"""

from typing import Optional, List, Dict, Any, TypeVar, Generic, Union
from uuid import UUID
from abc import ABC, abstractmethod
from datetime import datetime
import logging

from src.infrastructure.database import DatabaseClient
from src.infrastructure.cache import CacheClient

logger = logging.getLogger(__name__)

# Type variables for generic repository
T = TypeVar('T')
ID = TypeVar('ID', UUID, str, int)


class Specification:
    """
    Specification pattern for building queries.
    """
    
    def __init__(self, **kwargs):
        self.filters = kwargs
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert specification to dict."""
        return self.filters


class FilterSpecification(Specification):
    """
    Specification for filtering.
    """
    
    def __init__(
        self,
        field: str,
        operator: str = "eq",
        value: Any = None
    ):
        self.field = field
        self.operator = operator
        self.value = value
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "field": self.field,
            "operator": self.operator,
            "value": self.value,
        }


class OrderSpecification:
    """
    Specification for ordering.
    """
    
    def __init__(self, field: str, ascending: bool = True):
        self.field = field
        self.ascending = ascending
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "field": self.field,
            "ascending": self.ascending,
        }


class PaginationSpecification:
    """
    Specification for pagination.
    """
    
    def __init__(self, page: int = 1, limit: int = 20):
        self.page = max(1, page)
        self.limit = max(1, min(100, limit))
    
    def get_offset(self) -> int:
        """Get offset for pagination."""
        return (self.page - 1) * self.limit


class BaseRepository(ABC):
    """
    Abstract base repository for domain entities.
    
    Provides common CRUD operations and query methods.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,  # 5 minutes
    ):
        """
        Initialize the repository.
        
        Args:
            database_client: Database client for data access
            cache_client: Optional cache client for performance
            cache_ttl: Cache TTL in seconds
        """
        self.db = database_client
        self.cache = cache_client
        self.cache_ttl = cache_ttl
        self._entity_class = None
        self._collection_name = None
    
    @abstractmethod
    def get_entity_class(self):
        """Get the entity class for this repository."""
        pass
    
    @abstractmethod
    def get_collection_name(self) -> str:
        """Get the collection/table name for this repository."""
        pass
    
    async def _get_cache_key(self, identifier: Union[ID, str]) -> str:
        """
        Generate cache key for an entity.
        
        Args:
            identifier: Entity identifier
            
        Returns:
            str: Cache key
        """
        return f"{self.get_collection_name()}:{identifier}"
    
    async def _cache_entity(self, entity: T) -> None:
        """
        Cache an entity.
        
        Args:
            entity: Entity to cache
        """
        if not self.cache:
            return
        
        try:
            entity_id = getattr(entity, 'id', None)
            if entity_id:
                cache_key = await self._get_cache_key(entity_id)
                await self.cache.set(cache_key, entity, ttl=self.cache_ttl)
        except Exception as e:
            logger.warning(f"Failed to cache entity: {e}")
    
    async def _invalidate_cache(self, entity_id: Union[ID, str]) -> None:
        """
        Invalidate cache for an entity.
        
        Args:
            entity_id: Entity ID
        """
        if not self.cache:
            return
        
        try:
            cache_key = await self._get_cache_key(entity_id)
            await self.cache.delete(cache_key)
        except Exception as e:
            logger.warning(f"Failed to invalidate cache: {e}")
    
    async def create(self, entity: T) -> T:
        """
        Create a new entity.
        
        Args:
            entity: Entity to create
            
        Returns:
            T: Created entity
        """
        # Validate entity
        self._validate_entity(entity)
        
        # Set timestamps if applicable
        if hasattr(entity, 'created_at'):
            entity.created_at = datetime.now()
        if hasattr(entity, 'updated_at'):
            entity.updated_at = datetime.now()
        
        # Create in database
        result = await self._do_create(entity)
        
        # Cache entity
        await self._cache_entity(result)
        
        logger.info(f"Created {self.get_collection_name()}: {getattr(result, 'id', 'unknown')}")
        return result
    
    async def get_by_id(self, entity_id: ID) -> Optional[T]:
        """
        Get an entity by ID.
        
        Args:
            entity_id: Entity ID
            
        Returns:
            Optional[T]: Entity or None
        """
        # Try cache first
        if self.cache:
            cache_key = await self._get_cache_key(entity_id)
            cached = await self.cache.get(cache_key)
            if cached:
                return cached
        
        # Get from database
        entity = await self._do_get_by_id(entity_id)
        
        # Cache if found
        if entity:
            await self._cache_entity(entity)
        
        return entity
    
    async def update(self, entity: T) -> T:
        """
        Update an entity.
        
        Args:
            entity: Entity to update
            
        Returns:
            T: Updated entity
        """
        # Validate entity
        self._validate_entity(entity)
        
        # Set updated timestamp
        if hasattr(entity, 'updated_at'):
            entity.updated_at = datetime.now()
        
        # Update in database
        result = await self._do_update(entity)
        
        # Invalidate and recache
        entity_id = getattr(result, 'id', None)
        if entity_id:
            await self._invalidate_cache(entity_id)
            await self._cache_entity(result)
        
        logger.info(f"Updated {self.get_collection_name()}: {entity_id}")
        return result
    
    async def delete(self, entity_id: ID) -> bool:
        """
        Delete an entity by ID.
        
        Args:
            entity_id: Entity ID
            
        Returns:
            bool: True if deleted
        """
        # Delete from database
        result = await self._do_delete(entity_id)
        
        # Invalidate cache
        await self._invalidate_cache(entity_id)
        
        if result:
            logger.info(f"Deleted {self.get_collection_name()}: {entity_id}")
        
        return result
    
    async def find_all(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[T]:
        """
        Find entities matching specifications.
        
        Args:
            filters: List of filter specifications
            order: List of order specifications
            pagination: Pagination specification
            
        Returns:
            List[T]: List of matching entities
        """
        return await self._do_find(filters, order, pagination)
    
    async def count(
        self,
        filters: Optional[List[FilterSpecification]] = None,
    ) -> int:
        """
        Count entities matching filters.
        
        Args:
            filters: List of filter specifications
            
        Returns:
            int: Count of matching entities
        """
        return await self._do_count(filters)
    
    async def exists(self, entity_id: ID) -> bool:
        """
        Check if an entity exists.
        
        Args:
            entity_id: Entity ID
            
        Returns:
            bool: True if entity exists
        """
        entity = await self.get_by_id(entity_id)
        return entity is not None
    
    def _validate_entity(self, entity: T) -> None:
        """
        Validate an entity.
        
        Args:
            entity: Entity to validate
            
        Raises:
            ValueError: If validation fails
        """
        if not entity:
            raise ValueError("Entity cannot be None")
        
        entity_class = self.get_entity_class()
        if not isinstance(entity, entity_class):
            raise ValueError(f"Expected {entity_class.__name__}, got {type(entity).__name__}")
    
    # Abstract database operations
    @abstractmethod
    async def _do_create(self, entity: T) -> T:
        """Database-specific create implementation."""
        pass
    
    @abstractmethod
    async def _do_get_by_id(self, entity_id: ID) -> Optional[T]:
        """Database-specific get by ID implementation."""
        pass
    
    @abstractmethod
    async def _do_update(self, entity: T) -> T:
        """Database-specific update implementation."""
        pass
    
    @abstractmethod
    async def _do_delete(self, entity_id: ID) -> bool:
        """Database-specific delete implementation."""
        pass
    
    @abstractmethod
    async def _do_find(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[T]:
        """Database-specific find implementation."""
        pass
    
    @abstractmethod
    async def _do_count(
        self,
        filters: Optional[List[FilterSpecification]] = None,
    ) -> int:
        """Database-specific count implementation."""
        pass


class GenericRepository(BaseRepository, Generic[T, ID]):
    """
    Generic repository implementation.
    
    This provides a concrete implementation for any entity type.
    """
    
    def __init__(
        self,
        entity_class: type,
        collection_name: str,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        """
        Initialize the generic repository.
        
        Args:
            entity_class: Entity class
            collection_name: Collection/table name
            database_client: Database client
            cache_client: Optional cache client
            cache_ttl: Cache TTL in seconds
        """
        super().__init__(database_client, cache_client, cache_ttl)
        self._entity_class = entity_class
        self._collection_name = collection_name
    
    def get_entity_class(self):
        return self._entity_class
    
    def get_collection_name(self) -> str:
        return self._collection_name
    
    async def _do_create(self, entity: T) -> T:
        """Database-specific create implementation."""
        # This should be implemented by database-specific subclass
        raise NotImplementedError
    
    async def _do_get_by_id(self, entity_id: ID) -> Optional[T]:
        """Database-specific get by ID implementation."""
        raise NotImplementedError
    
    async def _do_update(self, entity: T) -> T:
        """Database-specific update implementation."""
        raise NotImplementedError
    
    async def _do_delete(self, entity_id: ID) -> bool:
        """Database-specific delete implementation."""
        raise NotImplementedError
    
    async def _do_find(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[T]:
        """Database-specific find implementation."""
        raise NotImplementedError
    
    async def _do_count(
        self,
        filters: Optional[List[FilterSpecification]] = None,
    ) -> int:
        """Database-specific count implementation."""
        raise NotImplementedError