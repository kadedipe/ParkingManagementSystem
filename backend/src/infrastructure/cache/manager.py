# ============================================================================
# Cache Manager
# ============================================================================

"""
Cache Manager for handling cache operations and strategies.
"""

from typing import Optional, Any, Dict, List, Union
from enum import Enum
import logging

from src.infrastructure.cache.client import CacheClient, CacheStats

logger = logging.getLogger(__name__)


class CacheStrategy(str, Enum):
    """Cache strategies."""
    CACHE_THROUGH = "cache_through"
    CACHE_ASIDE = "cache_aside"
    WRITE_THROUGH = "write_through"
    WRITE_BEHIND = "write_behind"
    REFRESH_AHEAD = "refresh_ahead"


class CacheInvalidationStrategy(str, Enum):
    """Cache invalidation strategies."""
    IMMEDIATE = "immediate"
    DELAYED = "delayed"
    MANUAL = "manual"
    TIME_BASED = "time_based"
    EVENT_BASED = "event_based"


class CacheRegion:
    """
    Cache region for organizing cache keys.
    """
    
    def __init__(
        self,
        name: str,
        ttl: Optional[int] = None,
        max_size: Optional[int] = None,
    ):
        """
        Initialize cache region.
        
        Args:
            name: Region name
            ttl: Default TTL for region
            max_size: Maximum size for region
        """
        self.name = name
        self.ttl = ttl
        self.max_size = max_size
        self._keys = set()
    
    def add_key(self, key: str) -> None:
        """Add key to region."""
        self._keys.add(key)
    
    def remove_key(self, key: str) -> None:
        """Remove key from region."""
        self._keys.discard(key)
    
    def get_keys(self) -> set:
        """Get all keys in region."""
        return self._keys.copy()


class CacheManager:
    """
    Cache Manager for handling cache operations.
    """
    
    _default_instance = None
    
    def __init__(
        self,
        cache_client: CacheClient,
        strategy: CacheStrategy = CacheStrategy.CACHE_ASIDE,
        invalidation_strategy: CacheInvalidationStrategy = CacheInvalidationStrategy.TIME_BASED,
    ):
        """
        Initialize the cache manager.
        
        Args:
            cache_client: Cache client instance
            strategy: Cache strategy
            invalidation_strategy: Cache invalidation strategy
        """
        self.cache = cache_client
        self.strategy = strategy
        self.invalidation_strategy = invalidation_strategy
        self._regions: Dict[str, CacheRegion] = {}
        self._default_ttl = cache_client.config.default_ttl
    
    @classmethod
    def set_default(cls, manager: "CacheManager") -> None:
        """Set default cache manager instance."""
        cls._default_instance = manager
    
    @classmethod
    def get_default(cls) -> "CacheManager":
        """Get default cache manager instance."""
        return cls._default_instance
    
    async def get(self, key: str, region: Optional[str] = None) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            region: Cache region
            
        Returns:
            Optional[Any]: Cached value or None
        """
        if region:
            key = f"{region}:{key}"
        
        return await self.cache.get(key)
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        region: Optional[str] = None,
    ) -> bool:
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            region: Cache region
            
        Returns:
            bool: True if set was successful
        """
        if region:
            key = f"{region}:{key}"
            # Track key in region
            if region not in self._regions:
                self._regions[region] = CacheRegion(region, self._default_ttl)
            self._regions[region].add_key(key)
        
        if ttl is None and region and region in self._regions:
            ttl = self._regions[region].ttl
        
        return await self.cache.set(key, value, ttl)
    
    async def delete(self, key: str, region: Optional[str] = None) -> bool:
        """
        Delete value from cache.
        
        Args:
            key: Cache key
            region: Cache region
            
        Returns:
            bool: True if deleted
        """
        if region:
            key = f"{region}:{key}"
            if region in self._regions:
                self._regions[region].remove_key(key)
        
        return await self.cache.delete(key)
    
    async def exists(self, key: str, region: Optional[str] = None) -> bool:
        """
        Check if key exists in cache.
        
        Args:
            key: Cache key
            region: Cache region
            
        Returns:
            bool: True if key exists
        """
        if region:
            key = f"{region}:{key}"
        
        return await self.cache.exists(key)
    
    async def expire(self, key: str, ttl: int, region: Optional[str] = None) -> bool:
        """
        Set expiration on a cache key.
        
        Args:
            key: Cache key
            ttl: Time to live in seconds
            region: Cache region
            
        Returns:
            bool: True if expiration was set
        """
        if region:
            key = f"{region}:{key}"
        
        return await self.cache.expire(key, ttl)
    
    async def invalidate_pattern(self, pattern: str, region: Optional[str] = None) -> int:
        """
        Invalidate cache keys matching pattern.
        
        Args:
            pattern: Key pattern
            region: Cache region
            
        Returns:
            int: Number of keys invalidated
        """
        if region:
            pattern = f"{region}:{pattern}"
        
        # This is a simplified implementation
        # In production, you'd use Redis SCAN or similar
        deleted = 0
        for key in await self.cache.get_keys(pattern):
            if await self.cache.delete(key):
                deleted += 1
        
        return deleted
    
    async def get_stats(self) -> CacheStats:
        """
        Get cache statistics.
        
        Returns:
            CacheStats: Cache statistics
        """
        return await self.cache.get_stats()
    
    def get_region(self, name: str) -> Optional[CacheRegion]:
        """
        Get cache region.
        
        Args:
            name: Region name
            
        Returns:
            Optional[CacheRegion]: Cache region or None
        """
        return self._regions.get(name)
    
    def create_region(
        self,
        name: str,
        ttl: Optional[int] = None,
        max_size: Optional[int] = None,
    ) -> CacheRegion:
        """
        Create a cache region.
        
        Args:
            name: Region name
            ttl: Default TTL for region
            max_size: Maximum size for region
            
        Returns:
            CacheRegion: Created region
        """
        region = CacheRegion(name, ttl, max_size)
        self._regions[name] = region
        return region
    
    async def clear_region(self, name: str) -> int:
        """
        Clear a cache region.
        
        Args:
            name: Region name
            
        Returns:
            int: Number of keys cleared
        """
        if name not in self._regions:
            return 0
        
        region = self._regions[name]
        deleted = 0
        for key in region.get_keys():
            if await self.cache.delete(key):
                deleted += 1
        
        region._keys.clear()
        return deleted