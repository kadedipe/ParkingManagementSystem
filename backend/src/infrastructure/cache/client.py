# ============================================================================
# Cache Client - Base Cache Interface
# ============================================================================

"""
Base cache client interface and configuration.
"""

from abc import ABC, abstractmethod
from typing import Optional, Any, Dict, List, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json


@dataclass
class CacheConfig:
    """
    Base cache configuration.
    """
    name: str = "default"
    default_ttl: int = 300  # 5 minutes
    max_size: int = 1000
    serializer: str = "json"
    compression: bool = False
    namespace: Optional[str] = None


@dataclass
class CacheEntry:
    """
    Cache entry with metadata.
    """
    key: str
    value: Any
    created_at: datetime
    expires_at: Optional[datetime] = None
    ttl: Optional[int] = None
    size: Optional[int] = None
    
    @property
    def is_expired(self) -> bool:
        """Check if cache entry is expired."""
        if not self.expires_at:
            return False
        return datetime.now() >= self.expires_at


@dataclass
class CacheStats:
    """
    Cache statistics.
    """
    hits: int = 0
    misses: int = 0
    sets: int = 0
    deletes: int = 0
    evictions: int = 0
    size: int = 0
    max_size: int = 1000
    hit_rate: float = 0.0
    
    @property
    def total_requests(self) -> int:
        """Total number of requests."""
        return self.hits + self.misses


class CacheClient(ABC):
    """
    Abstract base class for cache clients.
    """
    
    def __init__(self, config: CacheConfig):
        """
        Initialize the cache client.
        
        Args:
            config: Cache configuration
        """
        self.config = config
        self._stats = CacheStats(max_size=config.max_size)
    
    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Optional[Any]: Cached value or None
        """
        pass
    
    @abstractmethod
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> bool:
        """
        Set a value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            bool: True if set was successful
        """
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Delete a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            bool: True if deleted
        """
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache.
        
        Args:
            key: Cache key
            
        Returns:
            bool: True if key exists
        """
        pass
    
    @abstractmethod
    async def expire(self, key: str, ttl: int) -> bool:
        """
        Set expiration on a cache key.
        
        Args:
            key: Cache key
            ttl: Time to live in seconds
            
        Returns:
            bool: True if expiration was set
        """
        pass
    
    @abstractmethod
    async def clear(self) -> bool:
        """
        Clear all cache entries.
        
        Returns:
            bool: True if cleared
        """
        pass
    
    @abstractmethod
    async def get_stats(self) -> CacheStats:
        """
        Get cache statistics.
        
        Returns:
            CacheStats: Cache statistics
        """
        pass
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """
        Get multiple values from cache.
        
        Args:
            keys: List of cache keys
            
        Returns:
            Dict[str, Any]: Dictionary of key-value pairs
        """
        result = {}
        for key in keys:
            value = await self.get(key)
            if value is not None:
                result[key] = value
        return result
    
    async def set_many(
        self,
        items: Dict[str, Any],
        ttl: Optional[int] = None,
    ) -> bool:
        """
        Set multiple values in cache.
        
        Args:
            items: Dictionary of key-value pairs
            ttl: Time to live in seconds
            
        Returns:
            bool: True if all items were set
        """
        success = True
        for key, value in items.items():
            if not await self.set(key, value, ttl):
                success = False
        return success
    
    async def delete_many(self, keys: List[str]) -> int:
        """
        Delete multiple values from cache.
        
        Args:
            keys: List of cache keys
            
        Returns:
            int: Number of keys deleted
        """
        deleted = 0
        for key in keys:
            if await self.delete(key):
                deleted += 1
        return deleted