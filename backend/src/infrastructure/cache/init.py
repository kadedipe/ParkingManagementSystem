# ============================================================================
# Parking Management System - Cache Package
# ============================================================================

"""
Cache Infrastructure Package.

This package provides caching implementations for performance optimization:
- Redis cache
- In-memory cache
- Cache decorators
- Cache invalidation strategies
- Cache managers
- Distributed locking
"""

# ============================================================================
# Cache Core
# ============================================================================

from src.infrastructure.cache.client import (
    CacheClient,
    CacheConfig,
    CacheEntry,
    CacheStats,
)

# ============================================================================
# Cache Implementations
# ============================================================================

from src.infrastructure.cache.redis_cache import (
    RedisCache,
    RedisCacheConfig,
)

from src.infrastructure.cache.memory_cache import (
    MemoryCache,
    MemoryCacheConfig,
)

from src.infrastructure.cache.multi_cache import (
    MultiCache,
    MultiCacheConfig,
)

# ============================================================================
# Cache Decorators
# ============================================================================

from src.infrastructure.cache.decorators import (
    cached,
    cache_invalidate,
    cache_evict,
    cache_put,
    cache_async,
    CacheKeyGenerator,
    CacheKeyTemplate,
)

# ============================================================================
# Cache Manager
# ============================================================================

from src.infrastructure.cache.manager import (
    CacheManager,
    CacheStrategy,
    CacheInvalidationStrategy,
    CacheRegion,
)

# ============================================================================
# Cache Utilities
# ============================================================================

from src.infrastructure.cache.utils import (
    CacheKeyBuilder,
    CacheKeyPrefix,
    CacheTTL,
    CacheSerializer,
    CacheCompressor,
)

# ============================================================================
# Distributed Lock
# ============================================================================

from src.infrastructure.cache.lock import (
    DistributedLock,
    LockConfig,
    LockManager,
)

# ============================================================================
# Cache Registry
# ============================================================================

class CacheRegistry:
    """
    Registry for managing cache instances.
    
    This provides a central location for cache registration and discovery.
    """
    
    _caches = {}
    
    @classmethod
    def register(cls, name: str, cache: CacheClient):
        """Register a cache instance."""
        cls._caches[name] = cache
    
    @classmethod
    def get(cls, name: str) -> Optional[CacheClient]:
        """Get a registered cache instance."""
        return cls._caches.get(name)
    
    @classmethod
    def get_all(cls) -> dict:
        """Get all registered caches."""
        return cls._caches.copy()
    
    @classmethod
    def clear(cls):
        """Clear all registered caches."""
        cls._caches.clear()
    
    @classmethod
    def get_names(cls) -> list:
        """Get list of registered cache names."""
        return list(cls._caches.keys())


# ============================================================================
# Cache Factory
# ============================================================================

class CacheFactory:
    """
    Factory for creating cache instances.
    
    This centralizes cache creation with proper configuration.
    """
    
    _default_config = {
        "default_ttl": 300,  # 5 minutes
        "max_size": 1000,
        "serializer": "json",
        "compression": False,
    }
    
    @classmethod
    def create_redis_cache(
        cls,
        name: str = "default",
        config: Optional[Dict[str, Any]] = None,
    ) -> RedisCache:
        """
        Create a Redis cache instance.
        
        Args:
            name: Cache name
            config: Cache configuration
            
        Returns:
            RedisCache: Redis cache instance
        """
        from src.infrastructure.cache.redis_cache import RedisCache, RedisCacheConfig
        
        cache_config = RedisCacheConfig(
            name=name,
            **(cls._default_config),
            **(config or {}),
        )
        
        cache = RedisCache(cache_config)
        CacheRegistry.register(name, cache)
        return cache
    
    @classmethod
    def create_memory_cache(
        cls,
        name: str = "memory",
        config: Optional[Dict[str, Any]] = None,
    ) -> MemoryCache:
        """
        Create an in-memory cache instance.
        
        Args:
            name: Cache name
            config: Cache configuration
            
        Returns:
            MemoryCache: Memory cache instance
        """
        from src.infrastructure.cache.memory_cache import MemoryCache, MemoryCacheConfig
        
        cache_config = MemoryCacheConfig(
            name=name,
            **(cls._default_config),
            **(config or {}),
        )
        
        cache = MemoryCache(cache_config)
        CacheRegistry.register(name, cache)
        return cache
    
    @classmethod
    def create_multi_cache(
        cls,
        name: str = "multi",
        primary: Optional[CacheClient] = None,
        secondary: Optional[CacheClient] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> MultiCache:
        """
        Create a multi-tier cache instance.
        
        Args:
            name: Cache name
            primary: Primary cache (e.g., Redis)
            secondary: Secondary cache (e.g., Memory)
            config: Cache configuration
            
        Returns:
            MultiCache: Multi-tier cache instance
        """
        from src.infrastructure.cache.multi_cache import MultiCache, MultiCacheConfig
        
        cache_config = MultiCacheConfig(
            name=name,
            primary=primary,
            secondary=secondary,
            **(cls._default_config),
            **(config or {}),
        )
        
        cache = MultiCache(cache_config)
        CacheRegistry.register(name, cache)
        return cache


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Core
    "CacheClient",
    "CacheConfig",
    "CacheEntry",
    "CacheStats",
    
    # Implementations
    "RedisCache",
    "RedisCacheConfig",
    "MemoryCache",
    "MemoryCacheConfig",
    "MultiCache",
    "MultiCacheConfig",
    
    # Decorators
    "cached",
    "cache_invalidate",
    "cache_evict",
    "cache_put",
    "cache_async",
    "CacheKeyGenerator",
    "CacheKeyTemplate",
    
    # Manager
    "CacheManager",
    "CacheStrategy",
    "CacheInvalidationStrategy",
    "CacheRegion",
    
    # Utilities
    "CacheKeyBuilder",
    "CacheKeyPrefix",
    "CacheTTL",
    "CacheSerializer",
    "CacheCompressor",
    
    # Lock
    "DistributedLock",
    "LockConfig",
    "LockManager",
    
    # Registry
    "CacheRegistry",
    
    # Factory
    "CacheFactory",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"