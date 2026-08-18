# ============================================================================
# Parking Management System - PostgreSQL Database Client
# ============================================================================

"""
PostgreSQL Database Client implementation.

This module provides a robust PostgreSQL client with:
- Connection pooling
- Async/await support
- Health checks
- Retry logic
- Query logging
- Transaction management
"""

import asyncio
from typing import Optional, List, Dict, Any, Union
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import logging
import json

import asyncpg
from asyncpg import Connection, Pool, Record
from asyncpg.exceptions import PostgresError, InterfaceError

from src.infrastructure.database.base import DatabaseClient
from src.core.config import settings

logger = logging.getLogger(__name__)


class PostgresClient(DatabaseClient):
    """
    PostgreSQL database client with connection pooling and async support.
    
    Features:
    - Connection pooling with configurable pool size
    - Automatic reconnection
    - Query logging and performance monitoring
    - Transaction support
    - Health checks
    - Retry logic for transient errors
    """
    
    def __init__(
        self,
        dsn: Optional[str] = None,
        host: Optional[str] = None,
        port: Optional[int] = None,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        min_pool_size: int = 5,
        max_pool_size: int = 20,
        max_inactive_connection_lifetime: float = 300,
        connection_timeout: float = 30,
        statement_cache_size: int = 100,
        **kwargs
    ):
        """
        Initialize the PostgreSQL client.
        
        Args:
            dsn: PostgreSQL connection string (preferred)
            host: Database host (if not using dsn)
            port: Database port (if not using dsn)
            database: Database name (if not using dsn)
            user: Database user (if not using dsn)
            password: Database password (if not using dsn)
            min_pool_size: Minimum pool size
            max_pool_size: Maximum pool size
            max_inactive_connection_lifetime: Max time for inactive connections
            connection_timeout: Connection timeout in seconds
            statement_cache_size: Statement cache size
            **kwargs: Additional asyncpg connection arguments
        """
        self._dsn = dsn or self._build_dsn(host, port, database, user, password)
        self._pool_config = {
            "min_size": min_pool_size,
            "max_size": max_pool_size,
            "max_inactive_connection_lifetime": max_inactive_connection_lifetime,
            "timeout": connection_timeout,
            "statement_cache_size": statement_cache_size,
            **kwargs
        }
        
        self._pool: Optional[Pool] = None
        self._is_connected = False
        self._max_retries = 3
        self._retry_delay = 1  # seconds
        
        logger.info(f"PostgreSQL client initialized with pool size {min_pool_size}-{max_pool_size}")
    
    def _build_dsn(
        self,
        host: Optional[str],
        port: Optional[int],
        database: Optional[str],
        user: Optional[str],
        password: Optional[str]
    ) -> str:
        """
        Build DSN from individual parameters.
        
        Args:
            host: Database host
            port: Database port
            database: Database name
            user: Database user
            password: Database password
            
        Returns:
            str: DSN string
        """
        # Fallback to settings
        host = host or settings.POSTGRES_HOST
        port = port or settings.POSTGRES_PORT
        database = database or settings.POSTGRES_DB
        user = user or settings.POSTGRES_USER
        password = password or settings.POSTGRES_PASSWORD
        
        return f"postgresql://{user}:{password}@{host}:{port}/{database}"
    
    async def connect(self) -> None:
        """
        Establish connection to the database.
        
        Raises:
            ConnectionError: If connection fails after retries
        """
        if self._is_connected and self._pool:
            return
        
        for attempt in range(self._max_retries):
            try:
                logger.info(f"Connecting to PostgreSQL (attempt {attempt + 1}/{self._max_retries})...")
                
                self._pool = await asyncpg.create_pool(
                    self._dsn,
                    **self._pool_config
                )
                
                # Test connection
                async with self._pool.acquire() as conn:
                    await conn.execute("SELECT 1")
                
                self._is_connected = True
                logger.info("PostgreSQL connection established successfully")
                return
                
            except Exception as e:
                logger.error(f"Connection attempt {attempt + 1} failed: {e}")
                if attempt < self._max_retries - 1:
                    await asyncio.sleep(self._retry_delay * (2 ** attempt))
                else:
                    raise ConnectionError(f"Failed to connect to PostgreSQL after {self._max_retries} attempts: {e}")
    
    async def disconnect(self) -> None:
        """
        Close the database connection.
        """
        if self._pool:
            await self._pool.close()
            self._pool = None
        
        self._is_connected = False
        logger.info("PostgreSQL connection closed")
    
    async def execute(
        self,
        query: str,
        *args,
        **kwargs
    ) -> Union[str, None]:
        """
        Execute a query that doesn't return rows.
        
        Args:
            query: SQL query string
            *args: Query arguments
            **kwargs: Additional options
            
        Returns:
            Union[str, None]: Command status tag
            
        Raises:
            ConnectionError: If not connected
            PostgresError: If query execution fails
        """
        await self._ensure_connection()
        
        async with self._pool.acquire() as conn:
            try:
                start_time = datetime.now()
                result = await conn.execute(query, *args)
                duration = (datetime.now() - start_time).total_seconds() * 1000
                
                if duration > 1000:  # Log slow queries (> 1 second)
                    logger.warning(f"Slow query ({duration:.2f}ms): {query[:100]}...")
                
                return result
                
            except PostgresError as e:
                logger.error(f"Query execution failed: {e}\nQuery: {query[:200]}...")
                raise
    
    async def fetch(
        self,
        query: str,
        *args,
        **kwargs
    ) -> List[Record]:
        """
        Fetch all rows from a query.
        
        Args:
            query: SQL query string
            *args: Query arguments
            **kwargs: Additional options
            
        Returns:
            List[Record]: List of records
            
        Raises:
            ConnectionError: If not connected
            PostgresError: If query execution fails
        """
        await self._ensure_connection()
        
        async with self._pool.acquire() as conn:
            try:
                start_time = datetime.now()
                result = await conn.fetch(query, *args)
                duration = (datetime.now() - start_time).total_seconds() * 1000
                
                if duration > 1000:
                    logger.warning(f"Slow query ({duration:.2f}ms): {query[:100]}...")
                
                return result
                
            except PostgresError as e:
                logger.error(f"Fetch query failed: {e}\nQuery: {query[:200]}...")
                raise
    
    async def fetch_one(
        self,
        query: str,
        *args,
        **kwargs
    ) -> Optional[Record]:
        """
        Fetch a single row from a query.
        
        Args:
            query: SQL query string
            *args: Query arguments
            **kwargs: Additional options
            
        Returns:
            Optional[Record]: Single record or None
        """
        await self._ensure_connection()
        
        async with self._pool.acquire() as conn:
            try:
                start_time = datetime.now()
                result = await conn.fetchrow(query, *args)
                duration = (datetime.now() - start_time).total_seconds() * 1000
                
                if duration > 1000:
                    logger.warning(f"Slow query ({duration:.2f}ms): {query[:100]}...")
                
                return result
                
            except PostgresError as e:
                logger.error(f"Fetch one query failed: {e}\nQuery: {query[:200]}...")
                raise
    
    async def fetch_val(
        self,
        query: str,
        *args,
        **kwargs
    ) -> Any:
        """
        Fetch a single value from a query.
        
        Args:
            query: SQL query string
            *args: Query arguments
            **kwargs: Additional options
            
        Returns:
            Any: Single value
            
        Raises:
            ConnectionError: If not connected
            PostgresError: If query execution fails
        """
        await self._ensure_connection()
        
        async with self._pool.acquire() as conn:
            try:
                start_time = datetime.now()
                result = await conn.fetchval(query, *args)
                duration = (datetime.now() - start_time).total_seconds() * 1000
                
                if duration > 1000:
                    logger.warning(f"Slow query ({duration:.2f}ms): {query[:100]}...")
                
                return result
                
            except PostgresError as e:
                logger.error(f"Fetch val query failed: {e}\nQuery: {query[:200]}...")
                raise
    
    @asynccontextmanager
    async def transaction(self, isolation_level: str = "READ COMMITTED"):
        """
        Create a transaction context manager.
        
        Args:
            isolation_level: Transaction isolation level
            
        Yields:
            Connection: Database connection in transaction
        """
        await self._ensure_connection()
        
        async with self._pool.acquire() as conn:
            try:
                # Set isolation level
                if isolation_level:
                    await conn.execute(f"SET TRANSACTION ISOLATION LEVEL {isolation_level}")
                
                # Start transaction
                await conn.execute("BEGIN")
                yield conn
                await conn.execute("COMMIT")
                
            except Exception as e:
                await conn.execute("ROLLBACK")
                raise e
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the database.
        
        Returns:
            Dict[str, Any]: Health status
        """
        try:
            if not self._is_connected or not self._pool:
                return {
                    "status": "unhealthy",
                    "error": "Not connected",
                    "timestamp": datetime.now().isoformat(),
                }
            
            # Test connection with a simple query
            start_time = datetime.now()
            async with self._pool.acquire() as conn:
                result = await conn.fetchval("SELECT 1")
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                "status": "healthy" if result == 1 else "degraded",
                "response_time_ms": response_time,
                "pool_size": self._pool.get_size(),
                "pool_free": self._pool.get_free_size(),
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
    
    async def get_pool_stats(self) -> Dict[str, Any]:
        """
        Get connection pool statistics.
        
        Returns:
            Dict[str, Any]: Pool statistics
        """
        if not self._pool:
            return {"status": "not_initialized"}
        
        return {
            "pool_size": self._pool.get_size(),
            "pool_free": self._pool.get_free_size(),
            "pool_min": self._pool._min_size,
            "pool_max": self._pool._max_size,
            "is_connected": self._is_connected,
            "dsn": self._dsn[:20] + "..." if self._dsn else None,
        }
    
    async def _ensure_connection(self) -> None:
        """
        Ensure connection is established.
        
        Raises:
            ConnectionError: If not connected
        """
        if not self._is_connected or not self._pool:
            await self.connect()
    
    async def vacuum(self, table: Optional[str] = None) -> Dict[str, Any]:
        """
        Run VACUUM on the database.
        
        Args:
            table: Optional table name to vacuum
            
        Returns:
            Dict[str, Any]: Vacuum results
        """
        await self._ensure_connection()
        
        try:
            start_time = datetime.now()
            async with self._pool.acquire() as conn:
                if table:
                    await conn.execute(f"VACUUM ANALYZE {table}")
                else:
                    await conn.execute("VACUUM ANALYZE")
            duration = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"VACUUM completed in {duration:.2f}s")
            return {
                "status": "success",
                "duration_seconds": duration,
                "table": table,
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"VACUUM failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
    
    async def analyze(self, table: Optional[str] = None) -> Dict[str, Any]:
        """
        Run ANALYZE on the database.
        
        Args:
            table: Optional table name to analyze
            
        Returns:
            Dict[str, Any]: Analyze results
        """
        await self._ensure_connection()
        
        try:
            start_time = datetime.now()
            async with self._pool.acquire() as conn:
                if table:
                    await conn.execute(f"ANALYZE {table}")
                else:
                    await conn.execute("ANALYZE")
            duration = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"ANALYZE completed in {duration:.2f}s")
            return {
                "status": "success",
                "duration_seconds": duration,
                "table": table,
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"ANALYZE failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
    
    async def execute_many(
        self,
        query: str,
        params_list: List[List[Any]],
        batch_size: int = 1000,
    ) -> Dict[str, Any]:
        """
        Execute a query with multiple parameter sets.
        
        Args:
            query: SQL query string
            params_list: List of parameter lists
            batch_size: Number of records per batch
            
        Returns:
            Dict[str, Any]: Execution results
        """
        await self._ensure_connection()
        
        total = len(params_list)
        processed = 0
        failed = 0
        
        async with self._pool.acquire() as conn:
            try:
                async with conn.transaction():
                    for i in range(0, total, batch_size):
                        batch = params_list[i:i + batch_size]
                        try:
                            await conn.executemany(query, batch)
                            processed += len(batch)
                        except Exception as e:
                            logger.error(f"Batch execution failed at index {i}: {e}")
                            failed += len(batch)
                
                return {
                    "status": "success" if failed == 0 else "partial",
                    "total": total,
                    "processed": processed,
                    "failed": failed,
                    "timestamp": datetime.now().isoformat(),
                }
                
            except Exception as e:
                logger.error(f"Execute many failed: {e}")
                return {
                    "status": "failed",
                    "total": total,
                    "processed": processed,
                    "failed": failed,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                }