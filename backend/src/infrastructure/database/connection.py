# ============================================================================
# Database Connection Management
# ============================================================================

"""
Database connection management utilities.
"""

from typing import Optional
from src.infrastructure.database.postgres_client import PostgresClient
from src.infrastructure.database.mongodb_client import MongoDBClient
from src.infrastructure.database.redis_client import RedisClient
from src.core.config import settings

_db_client: Optional[PostgresClient] = None
_mongo_client: Optional[MongoDBClient] = None
_redis_client: Optional[RedisClient] = None


async def get_db() -> PostgresClient:
    """
    Get PostgreSQL database client instance.
    
    Returns:
        PostgresClient: Database client
    """
    global _db_client
    if _db_client is None:
        _db_client = PostgresClient(
            dsn=settings.DATABASE_URL,
            min_pool_size=settings.DB_POOL_SIZE,
            max_pool_size=settings.DB_MAX_OVERFLOW,
        )
        await _db_client.connect()
    return _db_client


async def get_mongodb() -> MongoDBClient:
    """
    Get MongoDB client instance.
    
    Returns:
        MongoDBClient: MongoDB client
    """
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoDBClient(
            uri=settings.MONGODB_URI,
        )
        await _mongo_client.connect()
    return _mongo_client


async def get_redis() -> RedisClient:
    """
    Get Redis client instance.
    
    Returns:
        RedisClient: Redis client
    """
    global _redis_client
    if _redis_client is None:
        _redis_client = RedisClient(
            url=settings.REDIS_URL,
        )
        await _redis_client.connect()
    return _redis_client


async def close_db_connections() -> None:
    """
    Close all database connections.
    """
    global _db_client, _mongo_client, _redis_client
    
    if _db_client:
        await _db_client.disconnect()
        _db_client = None
    
    if _mongo_client:
        await _mongo_client.disconnect()
        _mongo_client = None
    
    if _redis_client:
        await _redis_client.disconnect()
        _redis_client = None