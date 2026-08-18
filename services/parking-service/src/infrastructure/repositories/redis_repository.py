# ============================================================================
# Infrastructure - Redis Repository for Caching
# ============================================================================

# parking-management-system/services/parking-service/src/infrastructure/repositories/redis_repository.py

import json
from typing import Optional, Any, Dict, List
from datetime import timedelta
from redis.asyncio import Redis

from src.core.config import settings
from src.core.logging import get_logger

logger = get_logger(__name__)

class RedisRepository:
    """Redis repository for caching and session management"""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.default_ttl = settings.CACHE_TTL
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> bool:
        """Set a value in cache"""
        try:
            serialized = json.dumps(value, default=str)
            await self.redis.set(
                key,
                serialized,
                ex=ttl or self.default_ttl,
            )
            return True
        except Exception as e:
            logger.error(f"Redis set error: {str(e)}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis get error: {str(e)}")
            return None
    
    async def delete(self, key: str) -> bool:
        """Delete a value from cache"""
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis delete error: {str(e)}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            return await self.redis.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis exists error: {str(e)}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration on a key"""
        try:
            return await self.redis.expire(key, ttl)
        except Exception as e:
            logger.error(f"Redis expire error: {str(e)}")
            return False
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment a counter"""
        try:
            return await self.redis.incrby(key, amount)
        except Exception as e:
            logger.error(f"Redis increment error: {str(e)}")
            return 0
    
    async def get_keys(self, pattern: str) -> List[str]:
        """Get keys matching pattern"""
        try:
            return await self.redis.keys(pattern)
        except Exception as e:
            logger.error(f"Redis get keys error: {str(e)}")
            return []
    
    async def clear_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        try:
            keys = await self.get_keys(pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis clear pattern error: {str(e)}")
            return 0
    
    async def set_hash(
        self,
        key: str,
        field: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> bool:
        """Set a hash field in cache"""
        try:
            serialized = json.dumps(value, default=str)
            await self.redis.hset(key, field, serialized)
            if ttl:
                await self.redis.expire(key, ttl)
            return True
        except Exception as e:
            logger.error(f"Redis set hash error: {str(e)}")
            return False
    
    async def get_hash(
        self,
        key: str,
        field: str,
    ) -> Optional[Any]:
        """Get a hash field from cache"""
        try:
            value = await self.redis.hget(key, field)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis get hash error: {str(e)}")
            return None
    
    async def get_all_hash(self, key: str) -> Dict[str, Any]:
        """Get all fields from a hash"""
        try:
            values = await self.redis.hgetall(key)
            result = {}
            for field, value in values.items():
                try:
                    result[field.decode()] = json.loads(value)
                except:
                    result[field.decode()] = value
            return result
        except Exception as e:
            logger.error(f"Redis get all hash error: {str(e)}")
            return {}

class ParkingLotCache(RedisRepository):
    """Caching repository for parking lots"""
    
    def __init__(self, redis_client: Redis):
        super().__init__(redis_client)
        self.key_prefix = "parking_lot"
    
    def _get_key(self, lot_id: str) -> str:
        return f"{self.key_prefix}:{lot_id}"
    
    def _get_list_key(self) -> str:
        return f"{self.key_prefix}:list"
    
    async def cache_lot(self, lot_id: str, lot_data: Any) -> bool:
        """Cache a parking lot"""
        return await self.set(self._get_key(lot_id), lot_data)
    
    async def get_cached_lot(self, lot_id: str) -> Optional[Any]:
        """Get cached parking lot"""
        return await self.get(self._get_key(lot_id))
    
    async def invalidate_lot(self, lot_id: str) -> bool:
        """Invalidate cached parking lot"""
        return await self.delete(self._get_key(lot_id))
    
    async def cache_lot_list(self, lot_list: Any) -> bool:
        """Cache parking lot list"""
        return await self.set(self._get_list_key(), lot_list)
    
    async def get_cached_lot_list(self) -> Optional[Any]:
        """Get cached parking lot list"""
        return await self.get(self._get_list_key())
    
    async def invalidate_lot_list(self) -> bool:
        """Invalidate cached parking lot list"""
        return await self.delete(self._get_list_key())

class ParkingSpotCache(RedisRepository):
    """Caching repository for parking spots"""
    
    def __init__(self, redis_client: Redis):
        super().__init__(redis_client)
        self.key_prefix = "parking_spot"
    
    def _get_key(self, spot_id: str) -> str:
        return f"{self.key_prefix}:{spot_id}"
    
    def _get_lot_key(self, lot_id: str) -> str:
        return f"{self.key_prefix}:lot:{lot_id}"
    
    async def cache_spot(self, spot_id: str, spot_data: Any) -> bool:
        """Cache a parking spot"""
        return await self.set(self._get_key(spot_id), spot_data)
    
    async def get_cached_spot(self, spot_id: str) -> Optional[Any]:
        """Get cached parking spot"""
        return await self.get(self._get_key(spot_id))
    
    async def invalidate_spot(self, spot_id: str) -> bool:
        """Invalidate cached parking spot"""
        return await self.delete(self._get_key(spot_id))
    
    async def invalidate_lot_spots(self, lot_id: str) -> bool:
        """Invalidate cached spots for a lot"""
        return await self.delete(self._get_lot_key(lot_id))