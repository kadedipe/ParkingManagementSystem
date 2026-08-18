# ============================================================================
# Parking Management System - Redis Cache
# ============================================================================

"""
Redis Cache implementation for high-performance caching.

This module provides a robust Redis cache implementation with:
- Connection pooling
- Async/await support
- Serialization and compression
- TTL management
- Cache statistics
- Health checks
- Key pattern operations
"""

import asyncio
import json
import logging
import pickle
import zlib
from typing import Optional, Any, Dict, List, Union, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

import redis.asyncio as redis
from redis.asyncio import Redis, ConnectionPool
from redis.exceptions import RedisError, ConnectionError, TimeoutError

from src.infrastructure.cache.client import CacheClient, CacheConfig, CacheEntry, CacheStats
from src.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class RedisCacheConfig(CacheConfig):
    """
    Redis cache configuration.
    """
    url: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    db: Optional[int] = None
    password: Optional[str] = None
    max_connections: int = 50
    socket_timeout: float = 5.0
    socket_connect_timeout: float = 5.0
    retry_on_timeout: bool = True
    decode_responses: bool = False
    health_check_interval: int = 30
    key_prefix: str = "cache:"
    
    @classmethod
    def from_env(cls) -> "RedisCacheConfig":
        """Create configuration from environment variables."""
        return cls(
            url=settings.REDIS_URL,
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            default_ttl=settings.REDIS_CACHE_TTL,
            key_prefix=settings.REDIS_KEY_PREFIX,
        )


class RedisCache(CacheClient):
    """
    Redis cache implementation.
    
    Features:
    - Connection pooling
    - Async/await support
    - Serialization and compression
    - TTL management
    - Cache statistics
    - Health checks
    - Key pattern operations
    """
    
    def __init__(self, config: Optional[RedisCacheConfig] = None):
        """
        Initialize the Redis cache.
        
        Args:
            config: Redis cache configuration
        """
        self.config = config or RedisCacheConfig.from_env()
        super().__init__(self.config)
        
        self._client: Optional[Redis] = None
        self._pool: Optional[ConnectionPool] = None
        self._is_connected = False
        self._max_retries = 3
        self._retry_delay = 1  # seconds
        
        # Serialization settings
        self._compression_threshold = 1024  # 1KB
        
        logger.info(f"Redis cache initialized: {self.config.name}")
    
    async def connect(self) -> None:
        """
        Establish connection to Redis.
        
        Raises:
            ConnectionError: If connection fails after retries
        """
        if self._is_connected and self._client:
            return
        
        for attempt in range(self._max_retries):
            try:
                logger.info(f"Connecting to Redis (attempt {attempt + 1}/{self._max_retries})...")
                
                # Build connection URL
                if self.config.url:
                    url = self.config.url
                else:
                    url = self._build_url()
                
                # Create connection pool
                self._pool = ConnectionPool.from_url(
                    url,
                    max_connections=self.config.max_connections,
                    socket_timeout=self.config.socket_timeout,
                    socket_connect_timeout=self.config.socket_connect_timeout,
                    retry_on_timeout=self.config.retry_on_timeout,
                    decode_responses=self.config.decode_responses,
                    health_check_interval=self.config.health_check_interval,
                )
                
                self._client = Redis(connection_pool=self._pool)
                
                # Test connection
                await self._client.ping()
                
                self._is_connected = True
                logger.info("Redis connection established successfully")
                return
                
            except (ConnectionError, TimeoutError, RedisError) as e:
                logger.error(f"Connection attempt {attempt + 1} failed: {e}")
                if attempt < self._max_retries - 1:
                    await asyncio.sleep(self._retry_delay * (2 ** attempt))
                else:
                    raise ConnectionError(f"Failed to connect to Redis after {self._max_retries} attempts: {e}")
    
    def _build_url(self) -> str:
        """
        Build Redis URL from configuration.
        
        Returns:
            str: Redis URL
        """
        host = self.config.host or "localhost"
        port = self.config.port or 6379
        db = self.config.db or 0
        password = self.config.password
        
        if password:
            return f"redis://:{password}@{host}:{port}/{db}"
        return f"redis://{host}:{port}/{db}"
    
    async def disconnect(self) -> None:
        """
        Close the Redis connection.
        """
        if self._client:
            await self._client.close()
            self._client = None
        
        if self._pool:
            await self._pool.disconnect()
            self._pool = None
        
        self._is_connected = False
        logger.info("Redis connection closed")
    
    async def _ensure_connection(self) -> None:
        """
        Ensure connection is established.
        
        Raises:
            ConnectionError: If not connected
        """
        if not self._is_connected or not self._client:
            await self.connect()
    
    # ==========================================================================
    # Core Cache Operations
    # ==========================================================================
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Optional[Any]: Cached value or None
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            value = await self._client.get(full_key)
            
            if value is None:
                self._stats.misses += 1
                return None
            
            self._stats.hits += 1
            
            # Deserialize value
            return self._deserialize_value(value)
            
        except RedisError as e:
            logger.error(f"Failed to get key {key}: {e}")
            self._stats.misses += 1
            return None
    
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
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = self._serialize_value(value)
        ttl = ttl or self.config.default_ttl
        
        try:
            if ttl:
                result = await self._client.setex(full_key, ttl, serialized)
            else:
                result = await self._client.set(full_key, serialized)
            
            if result:
                self._stats.sets += 1
                self._stats.size += len(serialized)
            
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Failed to set key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            bool: True if deleted
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            result = await self._client.delete(full_key)
            if result > 0:
                self._stats.deletes += 1
                self._stats.size = max(0, self._stats.size - 1)
            return result > 0
            
        except RedisError as e:
            logger.error(f"Failed to delete key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in cache.
        
        Args:
            key: Cache key
            
        Returns:
            bool: True if key exists
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            return await self._client.exists(full_key) > 0
            
        except RedisError as e:
            logger.error(f"Failed to check key {key}: {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """
        Set expiration on a cache key.
        
        Args:
            key: Cache key
            ttl: Time to live in seconds
            
        Returns:
            bool: True if expiration was set
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            return await self._client.expire(full_key, ttl)
            
        except RedisError as e:
            logger.error(f"Failed to set expiration for key {key}: {e}")
            return False
    
    async def clear(self) -> bool:
        """
        Clear all cache entries.
        
        Returns:
            bool: True if cleared
        """
        await self._ensure_connection()
        
        try:
            pattern = self._get_full_key("*")
            keys = await self._client.keys(pattern)
            if keys:
                await self._client.delete(*keys)
            self._stats.size = 0
            return True
            
        except RedisError as e:
            logger.error(f"Failed to clear cache: {e}")
            return False
    
    async def get_stats(self) -> CacheStats:
        """
        Get cache statistics.
        
        Returns:
            CacheStats: Cache statistics
        """
        try:
            # Update hit rate
            total_requests = self._stats.hits + self._stats.misses
            self._stats.hit_rate = (
                (self._stats.hits / total_requests * 100) if total_requests > 0 else 0
            )
            
            return CacheStats(
                hits=self._stats.hits,
                misses=self._stats.misses,
                sets=self._stats.sets,
                deletes=self._stats.deletes,
                evictions=self._stats.evictions,
                size=self._stats.size,
                max_size=self.config.max_size,
                hit_rate=self._stats.hit_rate,
            )
            
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return self._stats
    
    # ==========================================================================
    # Advanced Operations
    # ==========================================================================
    
    async def get_keys(self, pattern: str = "*") -> List[str]:
        """
        Get all keys matching a pattern.
        
        Args:
            pattern: Key pattern
            
        Returns:
            List[str]: List of matching keys
        """
        await self._ensure_connection()
        
        full_pattern = self._get_full_key(pattern)
        
        try:
            keys = await self._client.keys(full_pattern)
            # Remove prefix
            prefix = self.config.key_prefix
            return [key.decode() if isinstance(key, bytes) else key for key in keys]
            
        except RedisError as e:
            logger.error(f"Failed to get keys for pattern {pattern}: {e}")
            return []
    
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """
        Get multiple values from cache.
        
        Args:
            keys: List of cache keys
            
        Returns:
            Dict[str, Any]: Dictionary of key-value pairs
        """
        await self._ensure_connection()
        
        full_keys = [self._get_full_key(key) for key in keys]
        
        try:
            values = await self._client.mget(full_keys)
            
            result = {}
            for key, value in zip(keys, values):
                if value is not None:
                    result[key] = self._deserialize_value(value)
                    self._stats.hits += 1
                else:
                    self._stats.misses += 1
            
            return result
            
        except RedisError as e:
            logger.error(f"Failed to get multiple keys: {e}")
            return {}
    
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
        await self._ensure_connection()
        
        ttl = ttl or self.config.default_ttl
        
        try:
            # Use pipeline for atomic operation
            async with self._client.pipeline() as pipe:
                for key, value in items.items():
                    full_key = self._get_full_key(key)
                    serialized = self._serialize_value(value)
                    pipe.setex(full_key, ttl, serialized)
                
                results = await pipe.execute()
                success = all(results)
                
                if success:
                    self._stats.sets += len(items)
                    self._stats.size += sum(len(self._serialize_value(v)) for v in items.values())
                
                return success
                
        except RedisError as e:
            logger.error(f"Failed to set multiple keys: {e}")
            return False
    
    async def delete_many(self, keys: List[str]) -> int:
        """
        Delete multiple values from cache.
        
        Args:
            keys: List of cache keys
            
        Returns:
            int: Number of keys deleted
        """
        await self._ensure_connection()
        
        full_keys = [self._get_full_key(key) for key in keys]
        
        try:
            result = await self._client.delete(*full_keys)
            self._stats.deletes += result
            return result
            
        except RedisError as e:
            logger.error(f"Failed to delete multiple keys: {e}")
            return 0
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """
        Increment a key by a given amount.
        
        Args:
            key: Cache key
            amount: Amount to increment
            
        Returns:
            int: New value
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            result = await self._client.incrby(full_key, amount)
            self._stats.sets += 1
            return result
            
        except RedisError as e:
            logger.error(f"Failed to increment key {key}: {e}")
            return 0
    
    async def decrement(self, key: str, amount: int = 1) -> int:
        """
        Decrement a key by a given amount.
        
        Args:
            key: Cache key
            amount: Amount to decrement
            
        Returns:
            int: New value
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            result = await self._client.decrby(full_key, amount)
            self._stats.sets += 1
            return result
            
        except RedisError as e:
            logger.error(f"Failed to decrement key {key}: {e}")
            return 0
    
    # ==========================================================================
    # Hash Operations
    # ==========================================================================
    
    async def hset(self, key: str, field: str, value: Any) -> int:
        """
        Set a field in a hash.
        
        Args:
            key: Cache key
            field: Hash field
            value: Value to store
            
        Returns:
            int: Number of fields added
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = self._serialize_value(value)
        
        try:
            result = await self._client.hset(full_key, field, serialized)
            self._stats.sets += 1
            return result
            
        except RedisError as e:
            logger.error(f"Failed to hset key {key}: {e}")
            return 0
    
    async def hget(self, key: str, field: str) -> Optional[Any]:
        """
        Get a field from a hash.
        
        Args:
            key: Cache key
            field: Hash field
            
        Returns:
            Optional[Any]: Value or None
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            value = await self._client.hget(full_key, field)
            
            if value is None:
                self._stats.misses += 1
                return None
            
            self._stats.hits += 1
            return self._deserialize_value(value)
            
        except RedisError as e:
            logger.error(f"Failed to hget key {key}: {e}")
            return None
    
    async def hgetall(self, key: str) -> Dict[str, Any]:
        """
        Get all fields from a hash.
        
        Args:
            key: Cache key
            
        Returns:
            Dict[str, Any]: All fields and values
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            data = await self._client.hgetall(full_key)
            
            result = {}
            for field, value in data.items():
                result[field] = self._deserialize_value(value)
                self._stats.hits += 1
            
            return result
            
        except RedisError as e:
            logger.error(f"Failed to hgetall key {key}: {e}")
            return {}
    
    async def hdel(self, key: str, *fields: str) -> int:
        """
        Delete fields from a hash.
        
        Args:
            key: Cache key
            *fields: Fields to delete
            
        Returns:
            int: Number of fields deleted
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            result = await self._client.hdel(full_key, *fields)
            self._stats.deletes += result
            return result
            
        except RedisError as e:
            logger.error(f"Failed to hdel key {key}: {e}")
            return 0
    
    # ==========================================================================
    # Set Operations
    # ==========================================================================
    
    async def sadd(self, key: str, *members: Any) -> int:
        """
        Add members to a set.
        
        Args:
            key: Cache key
            *members: Members to add
            
        Returns:
            int: Number of members added
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = [self._serialize_value(m) for m in members]
        
        try:
            result = await self._client.sadd(full_key, *serialized)
            self._stats.sets += 1
            return result
            
        except RedisError as e:
            logger.error(f"Failed to sadd key {key}: {e}")
            return 0
    
    async def srem(self, key: str, *members: Any) -> int:
        """
        Remove members from a set.
        
        Args:
            key: Cache key
            *members: Members to remove
            
        Returns:
            int: Number of members removed
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = [self._serialize_value(m) for m in members]
        
        try:
            result = await self._client.srem(full_key, *serialized)
            self._stats.deletes += result
            return result
            
        except RedisError as e:
            logger.error(f"Failed to srem key {key}: {e}")
            return 0
    
    async def smembers(self, key: str) -> Set[Any]:
        """
        Get all members of a set.
        
        Args:
            key: Cache key
            
        Returns:
            Set[Any]: Set of members
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            members = await self._client.smembers(full_key)
            
            result = set()
            for member in members:
                result.add(self._deserialize_value(member))
                self._stats.hits += 1
            
            return result
            
        except RedisError as e:
            logger.error(f"Failed to smembers key {key}: {e}")
            return set()
    
    async def sismember(self, key: str, member: Any) -> bool:
        """
        Check if a member is in a set.
        
        Args:
            key: Cache key
            member: Member to check
            
        Returns:
            bool: True if member exists
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = self._serialize_value(member)
        
        try:
            return await self._client.sismember(full_key, serialized)
            
        except RedisError as e:
            logger.error(f"Failed to sismember key {key}: {e}")
            return False
    
    # ==========================================================================
    # Sorted Set Operations
    # ==========================================================================
    
    async def zadd(self, key: str, mapping: Dict[Any, float]) -> int:
        """
        Add members to a sorted set with scores.
        
        Args:
            key: Cache key
            mapping: Mapping of members to scores
            
        Returns:
            int: Number of members added
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = {
            self._serialize_value(k): v
            for k, v in mapping.items()
        }
        
        try:
            result = await self._client.zadd(full_key, serialized)
            self._stats.sets += 1
            return result
            
        except RedisError as e:
            logger.error(f"Failed to zadd key {key}: {e}")
            return 0
    
    async def zrange(
        self,
        key: str,
        start: int,
        stop: int,
        withscores: bool = False,
    ) -> Union[List[Any], List[tuple]]:
        """
        Get a range of members from a sorted set.
        
        Args:
            key: Cache key
            start: Start index
            stop: Stop index
            withscores: Include scores in result
            
        Returns:
            Union[List[Any], List[tuple]]: Range of members
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        
        try:
            result = await self._client.zrange(
                full_key,
                start,
                stop,
                withscores=withscores,
            )
            
            if withscores:
                return [(self._deserialize_value(m), s) for m, s in result]
            else:
                return [self._deserialize_value(m) for m in result]
            
        except RedisError as e:
            logger.error(f"Failed to zrange key {key}: {e}")
            return []
    
    async def zrem(self, key: str, *members: Any) -> int:
        """
        Remove members from a sorted set.
        
        Args:
            key: Cache key
            *members: Members to remove
            
        Returns:
            int: Number of members removed
        """
        await self._ensure_connection()
        
        full_key = self._get_full_key(key)
        serialized = [self._serialize_value(m) for m in members]
        
        try:
            result = await self._client.zrem(full_key, *serialized)
            self._stats.deletes += result
            return result
            
        except RedisError as e:
            logger.error(f"Failed to zrem key {key}: {e}")
            return 0
    
    # ==========================================================================
    # Serialization Utilities
    # ==========================================================================
    
    def _get_full_key(self, key: str) -> str:
        """
        Get full key with prefix.
        
        Args:
            key: Cache key
            
        Returns:
            str: Full key with prefix
        """
        return f"{self.config.key_prefix}{key}"
    
    def _serialize_value(self, value: Any) -> Union[str, bytes]:
        """
        Serialize a value for Redis storage.
        
        Args:
            value: Value to serialize
            
        Returns:
            Union[str, bytes]: Serialized value
        """
        # If value is already a simple type, convert to string
        if isinstance(value, (str, int, float, bool)):
            return str(value)
        
        # Try JSON serialization
        try:
            serialized = json.dumps(value, default=str)
            if len(serialized) > self._compression_threshold:
                return zlib.compress(serialized.encode('utf-8'))
            return serialized
        except (TypeError, ValueError):
            pass
        
        # Fallback to pickle
        serialized = pickle.dumps(value)
        if len(serialized) > self._compression_threshold:
            return zlib.compress(serialized)
        return serialized
    
    def _deserialize_value(self, value: Union[str, bytes]) -> Any:
        """
        Deserialize a value from Redis.
        
        Args:
            value: Serialized value
            
        Returns:
            Any: Deserialized value
        """
        if isinstance(value, bytes):
            # Try decompress
            try:
                if len(value) > 10 and value[:2] == b'\x78\x9c':
                    value = zlib.decompress(value)
            except:
                pass
            
            # Try JSON decode
            try:
                return json.loads(value)
            except (json.JSONDecodeError, UnicodeDecodeError):
                pass
            
            # Try pickle
            try:
                return pickle.loads(value)
            except:
                pass
            
            # Return as string
            try:
                return value.decode('utf-8')
            except:
                return value
        
        # Try JSON decode for strings
        if isinstance(value, str):
            try:
                return json.loads(value)
            except (json.JSONDecodeError, ValueError):
                return value
        
        return value
    
    # ==========================================================================
    # Health Check
    # ==========================================================================
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on Redis.
        
        Returns:
            Dict[str, Any]: Health status
        """
        try:
            if not self._is_connected or not self._client:
                return {
                    "status": "unhealthy",
                    "error": "Not connected",
                    "timestamp": datetime.now().isoformat(),
                }
            
            # Test connection
            start_time = datetime.now()
            await self._client.ping()
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Get Redis info
            info = await self._client.info()
            
            return {
                "status": "healthy",
                "response_time_ms": response_time,
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_days": info.get("uptime_in_days", 0),
                "cache_size": self._stats.size,
                "hit_rate": self._stats.hit_rate,
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
    
    # ==========================================================================
    # Pub/Sub Operations
    # ==========================================================================
    
    async def publish(self, channel: str, message: Any) -> int:
        """
        Publish a message to a channel.
        
        Args:
            channel: Channel name
            message: Message to publish
            
        Returns:
            int: Number of subscribers that received the message
        """
        await self._ensure_connection()
        
        serialized = self._serialize_value(message)
        
        try:
            return await self._client.publish(channel, serialized)
            
        except RedisError as e:
            logger.error(f"Failed to publish to channel {channel}: {e}")
            return 0
    
    async def subscribe(self, channel: str):
        """
        Subscribe to a channel.
        
        Args:
            channel: Channel name
            
        Yields:
            Any: Messages received
        """
        await self._ensure_connection()
        
        pubsub = self._client.pubsub()
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        yield self._deserialize_value(message['data'])
                    except Exception as e:
                        logger.error(f"Failed to deserialize message: {e}")
                        yield message['data']
        finally:
            await pubsub.unsubscribe(channel)