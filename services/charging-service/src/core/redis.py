import logging
from typing import Optional
import redis.asyncio as redis

from src.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.client: Optional[redis.Redis] = None

    async def initialize(self):
        try:
            self.client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
            )
            await self.client.ping()
            logger.info("Redis connection established")
        except Exception as exc:
            logger.warning("Redis unavailable: %s", exc)
            self.client = None

    async def close(self):
        if self.client is not None:
            await self.client.close()
            self.client = None

redis_client = RedisClient()