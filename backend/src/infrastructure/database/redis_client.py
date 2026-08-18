# ============================================================================
# Parking Management System - Redis Client
# ============================================================================

"""
Redis Client implementation.

This module provides a robust Redis client with:
- Connection pooling
- Async/await support
- Health checks
- Retry logic
- Caching utilities
- Pub/Sub support
- Rate limiting
- Session management
"""

import asyncio
import json
import logging
import pickle
import zlib
from typing import Optional, Any, Dict, List, Union, Set, Tuple
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

import redis.asyncio as redis
from redis.asyncio import Redis, ConnectionPool
from redis.exceptions import RedisError, ConnectionError, TimeoutError

from src.infrastructure.database.base import DatabaseClient
from src.core.config import settings

logger = logging.getLogger(__name__)


class RedisClient(DatabaseClient):
    """
    Redis client with connection pooling and async support.
    
    Features:
    - Connection pooling
    - Automatic reconnection
    - Key management
    - Cache operations
    - Pub/Sub messaging
    - Rate limiting
    - Session management
    - Distributed locking
    - Health checks
    """
    
    def __init__(
        self,
        url: Optional[str] = None,
        host: Optional[str] = None,
        port: Optional[int] = None,
        db: Optional[int] = None,
        password: Optional[str] = None,
        max_connections: int = 50,
        socket_timeout: float = 5.0,
        socket_connect_timeout: float = 5.0,
        retry_on_timeout: bool = True,
        decode_responses: bool = False,
        **kwargs
    ):
        """
        Initialize the Redis client.
        
        Args:
            url: Redis connection URL (preferred)
            host: Redis host (if not using url)
            port: Redis port (if not using url)
            db: Redis database index (if not using url)
            password: Redis password (if not using url)
            max_connections: Maximum connection pool size
            socket_timeout: Socket timeout in seconds
            socket_connect_timeout: Socket connect timeout in seconds
            retry_on_timeout: Retry on timeout
            decode_responses: Decode responses to strings
            **kwargs: Additional Redis connection arguments
        """
        self._url = url or self._build_url(host, port, db, password)
        self._max_connections = max_connections
        self._socket_timeout = socket_timeout
        self._socket_connect_timeout = socket_connect_timeout
        self._retry_on_timeout = retry_on_timeout
        self._decode_responses = decode_responses
        
        self._pool: Optional[ConnectionPool] = None
        self._client: Optional[Redis] = None
        self._is_connected = False
        self._max_retries = 3
        self._retry_delay = 1  # seconds
        
        # Compression threshold (bytes)
        self._compression_threshold = 1024  # 1KB
        
        logger.info(f"Redis client initialized with max_connections: {max_connections}")
    
    def _build_url(
        self,
        host: Optional[str],
        port: Optional[int],
        db: Optional[int],
        password: Optional[str]
    ) -> str:
        """
        Build Redis URL from individual parameters.
        
        Args:
            host: Redis host
            port: Redis port
            db: Redis database index
            password: Redis password
            
        Returns:
            str: Redis URL
        """
        host = host or settings.REDIS_HOST
        port = port or settings.REDIS_PORT
        db = db or settings.REDIS_DB
        password = password or settings.REDIS_PASSWORD
        
        if password:
            return f"redis://:{password}@{host}:{port}/{db}"
        return f"redis://{host}:{port}/{db}"
    
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
                
                self._pool = ConnectionPool.from_url(
                    self._url,
                    max_connections=self._max_connections,
                    socket_timeout=self._socket_timeout,
                    socket_connect_timeout=self._socket_connect_timeout,
                    retry_on_timeout=self._retry_on_timeout,
                    decode_responses=self._decode_responses,
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
    
    @property
    def client(self) -> Redis:
        """
        Get the Redis client instance.
        
        Returns:
            Redis: Redis client
        """
        if not self._client:
            raise RuntimeError("Redis client not connected. Call connect() first.")
        return self._client
    
    async def _ensure_connection(self) -> None:
        """
        Ensure connection is established.
        
        Raises:
            ConnectionError: If not connected
        """
        if not self._is_connected or not self._client:
            await self.connect()
    
    # ==========================================================================
    # Key Operations
    # ==========================================================================
    
    async def exists(self, key: str) -> bool:
        """
        Check if a key exists.
        
        Args:
            key: Redis key
            
        Returns:
            bool: True if key exists
        """
        await self._ensure_connection()
        return await self.client.exists(key) > 0
    
    async def delete(self, *keys: str) -> int:
        """
        Delete one or more keys.
        
        Args:
            *keys: Keys to delete
            
        Returns:
            int: Number of keys deleted
        """
        if not keys:
            return 0
        await self._ensure_connection()
        return await self.client.delete(*keys)
    
    async def expire(self, key: str, ttl: int) -> bool:
        """
        Set expiration on a key.
        
        Args:
            key: Redis key
            ttl: Time to live in seconds
            
        Returns:
            bool: True if expiration was set
        """
        await self._ensure_connection()
        return await self.client.expire(key, ttl)
    
    async def ttl(self, key: str) -> int:
        """
        Get the TTL of a key.
        
        Args:
            key: Redis key
            
        Returns:
            int: TTL in seconds (-1 if no TTL, -2 if key doesn't exist)
        """
        await self._ensure_connection()
        return await self.client.ttl(key)
    
    async def keys(self, pattern: str = "*") -> List[str]:
        """
        Get all keys matching a pattern.
        
        Args:
            pattern: Key pattern
            
        Returns:
            List[str]: List of matching keys
        """
        await self._ensure_connection()
        return await self.client.keys(pattern)
    
    # ==========================================================================
    # String Operations
    # ==========================================================================
    
    async def get(self, key: str, default: Any = None) -> Any:
        """
        Get a value from Redis.
        
        Args:
            key: Redis key
            default: Default value if key doesn't exist
            
        Returns:
            Any: Value from Redis or default
        """
        await self._ensure_connection()
        value = await self.client.get(key)
        
        if value is None:
            return default
        
        # Try to deserialize
        try:
            return self._deserialize_value(value)
        except:
            return value
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        nx: bool = False,
        xx: bool = False
    ) -> bool:
        """
        Set a value in Redis.
        
        Args:
            key: Redis key
            value: Value to store
            ttl: Time to live in seconds
            nx: Set only if key doesn't exist
            xx: Set only if key exists
            
        Returns:
            bool: True if set was successful
        """
        await self._ensure_connection()
        
        # Serialize value
        serialized = self._serialize_value(value)
        
        # Compress if large
        if len(serialized) > self._compression_threshold:
            serialized = self._compress(serialized)
        
        if ttl:
            return await self.client.setex(key, ttl, serialized)
        else:
            return await self.client.set(key, serialized, nx=nx, xx=xx)
    
    async def getset(self, key: str, value: Any) -> Optional[Any]:
        """
        Set a new value and return the old value.
        
        Args:
            key: Redis key
            value: New value
            
        Returns:
            Optional[Any]: Old value or None
        """
        await self._ensure_connection()
        old_value = await self.client.getset(key, self._serialize_value(value))
        
        if old_value is None:
            return None
        
        try:
            return self._deserialize_value(old_value)
        except:
            return old_value
    
    async def incr(self, key: str, amount: int = 1) -> int:
        """
        Increment a key by a given amount.
        
        Args:
            key: Redis key
            amount: Amount to increment
            
        Returns:
            int: New value
        """
        await self._ensure_connection()
        return await self.client.incrby(key, amount)
    
    async def decr(self, key: str, amount: int = 1) -> int:
        """
        Decrement a key by a given amount.
        
        Args:
            key: Redis key
            amount: Amount to decrement
            
        Returns:
            int: New value
        """
        await self._ensure_connection()
        return await self.client.decrby(key, amount)
    
    # ==========================================================================
    # Hash Operations
    # ==========================================================================
    
    async def hset(self, key: str, field: str, value: Any) -> int:
        """
        Set a field in a hash.
        
        Args:
            key: Redis key
            field: Hash field
            value: Value to store
            
        Returns:
            int: Number of fields added
        """
        await self._ensure_connection()
        return await self.client.hset(key, field, self._serialize_value(value))
    
    async def hget(self, key: str, field: str) -> Optional[Any]:
        """
        Get a field from a hash.
        
        Args:
            key: Redis key
            field: Hash field
            
        Returns:
            Optional[Any]: Value or None
        """
        await self._ensure_connection()
        value = await self.client.hget(key, field)
        
        if value is None:
            return None
        
        try:
            return self._deserialize_value(value)
        except:
            return value
    
    async def hgetall(self, key: str) -> Dict[str, Any]:
        """
        Get all fields from a hash.
        
        Args:
            key: Redis key
            
        Returns:
            Dict[str, Any]: All fields and values
        """
        await self._ensure_connection()
        data = await self.client.hgetall(key)
        
        result = {}
        for field, value in data.items():
            try:
                result[field] = self._deserialize_value(value)
            except:
                result[field] = value
        
        return result
    
    async def hdel(self, key: str, *fields: str) -> int:
        """
        Delete fields from a hash.
        
        Args:
            key: Redis key
            *fields: Fields to delete
            
        Returns:
            int: Number of fields deleted
        """
        await self._ensure_connection()
        return await self.client.hdel(key, *fields)
    
    # ==========================================================================
    # List Operations
    # ==========================================================================
    
    async def lpush(self, key: str, *values: Any) -> int:
        """
        Push values to the left of a list.
        
        Args:
            key: Redis key
            *values: Values to push
            
        Returns:
            int: Length of the list after push
        """
        await self._ensure_connection()
        serialized = [self._serialize_value(v) for v in values]
        return await self.client.lpush(key, *serialized)
    
    async def rpush(self, key: str, *values: Any) -> int:
        """
        Push values to the right of a list.
        
        Args:
            key: Redis key
            *values: Values to push
            
        Returns:
            int: Length of the list after push
        """
        await self._ensure_connection()
        serialized = [self._serialize_value(v) for v in values]
        return await self.client.rpush(key, *serialized)
    
    async def lpop(self, key: str, count: int = 1) -> Optional[Any]:
        """
        Pop values from the left of a list.
        
        Args:
            key: Redis key
            count: Number of values to pop
            
        Returns:
            Optional[Any]: Popped value or None
        """
        await self._ensure_connection()
        value = await self.client.lpop(key, count)
        
        if value is None:
            return None
        
        try:
            return self._deserialize_value(value)
        except:
            return value
    
    async def rpop(self, key: str, count: int = 1) -> Optional[Any]:
        """
        Pop values from the right of a list.
        
        Args:
            key: Redis key
            count: Number of values to pop
            
        Returns:
            Optional[Any]: Popped value or None
        """
        await self._ensure_connection()
        value = await self.client.rpop(key, count)
        
        if value is None:
            return None
        
        try:
            return self._deserialize_value(value)
        except:
            return value
    
    async def lrange(self, key: str, start: int, stop: int) -> List[Any]:
        """
        Get a range of values from a list.
        
        Args:
            key: Redis key
            start: Start index
            stop: Stop index
            
        Returns:
            List[Any]: List of values
        """
        await self._ensure_connection()
        values = await self.client.lrange(key, start, stop)
        
        result = []
        for value in values:
            try:
                result.append(self._deserialize_value(value))
            except:
                result.append(value)
        
        return result
    
    # ==========================================================================
    # Set Operations
    # ==========================================================================
    
    async def sadd(self, key: str, *members: Any) -> int:
        """
        Add members to a set.
        
        Args:
            key: Redis key
            *members: Members to add
            
        Returns:
            int: Number of members added
        """
        await self._ensure_connection()
        serialized = [self._serialize_value(m) for m in members]
        return await self.client.sadd(key, *serialized)
    
    async def srem(self, key: str, *members: Any) -> int:
        """
        Remove members from a set.
        
        Args:
            key: Redis key
            *members: Members to remove
            
        Returns:
            int: Number of members removed
        """
        await self._ensure_connection()
        serialized = [self._serialize_value(m) for m in members]
        return await self.client.srem(key, *serialized)
    
    async def smembers(self, key: str) -> Set[Any]:
        """
        Get all members of a set.
        
        Args:
            key: Redis key
            
        Returns:
            Set[Any]: Set of members
        """
        await self._ensure_connection()
        members = await self.client.smembers(key)
        
        result = set()
        for member in members:
            try:
                result.add(self._deserialize_value(member))
            except:
                result.add(member)
        
        return result
    
    async def sismember(self, key: str, member: Any) -> bool:
        """
        Check if a member is in a set.
        
        Args:
            key: Redis key
            member: Member to check
            
        Returns:
            bool: True if member exists
        """
        await self._ensure_connection()
        return await self.client.sismember(key, self._serialize_value(member))
    
    # ==========================================================================
    # Sorted Set Operations
    # ==========================================================================
    
    async def zadd(self, key: str, mapping: Dict[Any, float]) -> int:
        """
        Add members to a sorted set with scores.
        
        Args:
            key: Redis key
            mapping: Mapping of members to scores
            
        Returns:
            int: Number of members added
        """
        await self._ensure_connection()
        serialized = {
            self._serialize_value(k): v
            for k, v in mapping.items()
        }
        return await self.client.zadd(key, serialized)
    
    async def zrange(
        self,
        key: str,
        start: int,
        stop: int,
        withscores: bool = False
    ) -> Union[List[Any], List[Tuple[Any, float]]]:
        """
        Get a range of members from a sorted set.
        
        Args:
            key: Redis key
            start: Start index
            stop: Stop index
            withscores: Include scores in result
            
        Returns:
            Union[List[Any], List[Tuple[Any, float]]]: Range of members
        """
        await self._ensure_connection()
        result = await self.client.zrange(key, start, stop, withscores=withscores)
        
        if withscores:
            return [(self._deserialize_value(m), s) for m, s in result]
        else:
            return [self._deserialize_value(m) for m in result]
    
    async def zrem(self, key: str, *members: Any) -> int:
        """
        Remove members from a sorted set.
        
        Args:
            key: Redis key
            *members: Members to remove
            
        Returns:
            int: Number of members removed
        """
        await self._ensure_connection()
        serialized = [self._serialize_value(m) for m in members]
        return await self.client.zrem(key, *serialized)
    
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
        return await self.client.publish(channel, serialized)
    
    async def subscribe(self, channel: str):
        """
        Subscribe to a channel.
        
        Args:
            channel: Channel name
            
        Yields:
            Any: Messages received
        """
        await self._ensure_connection()
        pubsub = self.client.pubsub()
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        yield self._deserialize_value(message['data'])
                    except:
                        yield message['data']
        finally:
            await pubsub.unsubscribe(channel)
    
    # ==========================================================================
    # Rate Limiting
    # ==========================================================================
    
    async def rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Check rate limit for a key.
        
        Args:
            key: Redis key
            max_requests: Maximum requests per window
            window_seconds: Window size in seconds
            
        Returns:
            Tuple[bool, Dict[str, Any]]: (allowed, rate limit info)
        """
        await self._ensure_connection()
        
        now = datetime.now().timestamp()
        window_start = now - window_seconds
        
        # Remove old requests
        await self.client.zremrangebyscore(key, 0, window_start)
        
        # Count requests in window
        count = await self.client.zcard(key)
        
        # Check if allowed
        allowed = count < max_requests
        
        if allowed:
            # Add current request
            await self.client.zadd(key, {str(now): now})
            await self.client.expire(key, window_seconds)
        
        return allowed, {
            "limit": max_requests,
            "remaining": max(0, max_requests - count - (1 if allowed else 0)),
            "reset": int(window_start + window_seconds),
            "retry_after": int(now + window_seconds - (await self.client.zrange(key, 0, 0, withscores=True) or [(None, now)])[0][1]) if not allowed else 0,
        }
    
    # ==========================================================================
    # Distributed Lock
    # ==========================================================================
    
    @asynccontextmanager
    async def lock(self, key: str, timeout: int = 10, blocking_timeout: int = 5):
        """
        Distributed lock context manager.
        
        Args:
            key: Lock key
            timeout: Lock timeout in seconds
            blocking_timeout: Maximum time to wait for lock
            
        Yields:
            bool: True if lock was acquired
        """
        import uuid
        
        await self._ensure_connection()
        lock_key = f"lock:{key}"
        lock_id = str(uuid.uuid4())
        acquired = False
        
        try:
            # Try to acquire lock
            start_time = datetime.now()
            while True:
                acquired = await self.client.set(
                    lock_key,
                    lock_id,
                    nx=True,
                    ex=timeout
                )
                
                if acquired or (blocking_timeout and (datetime.now() - start_time).seconds >= blocking_timeout):
                    break
                
                await asyncio.sleep(0.1)
            
            yield acquired
            
        finally:
            # Release lock if acquired
            if acquired:
                # Use Lua script to atomically check and delete
                script = """
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
                """
                await self.client.eval(script, 1, lock_key, lock_id)
    
    # ==========================================================================
    # Cache Operations
    # ==========================================================================
    
    async def cache_get(self, key: str) -> Optional[Any]:
        """
        Get a value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Optional[Any]: Cached value or None
        """
        return await self.get(key)
    
    async def cache_set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = 3600
    ) -> bool:
        """
        Set a value in cache with TTL.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: TTL in seconds (default: 1 hour)
            
        Returns:
            bool: True if set was successful
        """
        return await self.set(key, value, ttl=ttl)
    
    async def cache_delete(self, *keys: str) -> int:
        """
        Delete values from cache.
        
        Args:
            *keys: Cache keys to delete
            
        Returns:
            int: Number of keys deleted
        """
        return await self.delete(*keys)
    
    async def cache_invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidate all cache keys matching a pattern.
        
        Args:
            pattern: Key pattern
            
        Returns:
            int: Number of keys deleted
        """
        keys = await self.keys(pattern)
        if keys:
            return await self.delete(*keys)
        return 0
    
    # ==========================================================================
    # Session Management
    # ==========================================================================
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session data.
        
        Args:
            session_id: Session ID
            
        Returns:
            Optional[Dict[str, Any]]: Session data or None
        """
        return await self.get(f"session:{session_id}")
    
    async def set_session(
        self,
        session_id: str,
        data: Dict[str, Any],
        ttl: int = 86400  # 24 hours
    ) -> bool:
        """
        Set session data.
        
        Args:
            session_id: Session ID
            data: Session data
            ttl: TTL in seconds (default: 24 hours)
            
        Returns:
            bool: True if set was successful
        """
        return await self.set(f"session:{session_id}", data, ttl=ttl)
    
    async def delete_session(self, session_id: str) -> bool:
        """
        Delete session.
        
        Args:
            session_id: Session ID
            
        Returns:
            bool: True if session was deleted
        """
        return await self.delete(f"session:{session_id}") > 0
    
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
            await self.client.ping()
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Get Redis info
            info = await self.client.info()
            
            return {
                "status": "healthy",
                "response_time_ms": response_time,
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_days": info.get("uptime_in_days", 0),
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
    # Serialization Utilities
    # ==========================================================================
    
    def _serialize_value(self, value: Any) -> Union[str, bytes]:
        """
        Serialize a value for Redis storage.
        
        Args:
            value: Value to serialize
            
        Returns:
            Union[str, bytes]: Serialized value
        """
        if isinstance(value, (str, int, float, bool)):
            return str(value)
        
        try:
            return json.dumps(value, default=str)
        except:
            return pickle.dumps(value)
    
    def _deserialize_value(self, value: Union[str, bytes]) -> Any:
        """
        Deserialize a value from Redis.
        
        Args:
            value: Serialized value
            
        Returns:
            Any: Deserialized value
        """
        if isinstance(value, bytes):
            # Check if compressed
            try:
                # Try decompress
                if len(value) > 10 and value[:2] == b'\x78\x9c':
                    value = zlib.decompress(value)
            except:
                pass
            
            # Try JSON decode
            try:
                return json.loads(value)
            except:
                pass
            
            # Try pickle
            try:
                return pickle.loads(value)
            except:
                pass
            
            # Try decode as string
            try:
                return value.decode('utf-8')
            except:
                return value
        
        return value
    
    def _compress(self, data: Union[str, bytes]) -> bytes:
        """
        Compress data.
        
        Args:
            data: Data to compress
            
        Returns:
            bytes: Compressed data
        """
        if isinstance(data, str):
            data = data.encode('utf-8')
        return zlib.compress(data, level=6)