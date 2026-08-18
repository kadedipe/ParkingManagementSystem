# ============================================================================
# Parking Management System - MongoDB Database Client
# ============================================================================

"""
MongoDB Database Client implementation.

This module provides a robust MongoDB client with:
- Connection pooling
- Async/await support
- Health checks
- Retry logic
- Query logging
- Transaction support
- Index management
"""

import asyncio
from typing import Optional, List, Dict, Any, Union
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import logging
import json

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from motor.motor_asyncio import AsyncIOMotorClientSession
from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError
from pymongo import ReadPreference, WriteConcern

from src.infrastructure.database.base import DatabaseClient
from src.core.config import settings

logger = logging.getLogger(__name__)


class MongoDBClient(DatabaseClient):
    """
    MongoDB client with connection pooling and async support.
    
    Features:
    - Connection pooling with configurable pool size
    - Automatic reconnection
    - Query logging and performance monitoring
    - Transaction support
    - Health checks
    - Retry logic for transient errors
    - Index management
    - Change streams support
    """
    
    def __init__(
        self,
        uri: Optional[str] = None,
        database_name: Optional[str] = None,
        min_pool_size: int = 5,
        max_pool_size: int = 20,
        max_idle_time_ms: int = 300000,  # 5 minutes
        connect_timeout_ms: int = 30000,
        socket_timeout_ms: int = 30000,
        server_selection_timeout_ms: int = 30000,
        retry_writes: bool = True,
        retry_reads: bool = True,
        **kwargs
    ):
        """
        Initialize the MongoDB client.
        
        Args:
            uri: MongoDB connection string
            database_name: Database name
            min_pool_size: Minimum pool size
            max_pool_size: Maximum pool size
            max_idle_time_ms: Max idle time for connections
            connect_timeout_ms: Connection timeout
            socket_timeout_ms: Socket timeout
            server_selection_timeout_ms: Server selection timeout
            retry_writes: Retry write operations
            retry_reads: Retry read operations
            **kwargs: Additional Motor client arguments
        """
        self._uri = uri or settings.MONGODB_URI
        self._database_name = database_name or settings.MONGODB_DB
        self._client: Optional[AsyncIOMotorClient] = None
        self._database: Optional[AsyncIOMotorDatabase] = None
        self._is_connected = False
        self._max_retries = 3
        self._retry_delay = 1  # seconds
        
        # Client options
        self._client_options = {
            "minPoolSize": min_pool_size,
            "maxPoolSize": max_pool_size,
            "maxIdleTimeMS": max_idle_time_ms,
            "connectTimeoutMS": connect_timeout_ms,
            "socketTimeoutMS": socket_timeout_ms,
            "serverSelectionTimeoutMS": server_selection_timeout_ms,
            "retryWrites": retry_writes,
            "retryReads": retry_reads,
            "readPreference": ReadPreference.PRIMARY_PREFERRED,
            "writeConcern": WriteConcern(w="majority", j=True),
            **kwargs
        }
        
        logger.info(f"MongoDB client initialized with database: {self._database_name}")
    
    async def connect(self) -> None:
        """
        Establish connection to the database.
        
        Raises:
            ConnectionError: If connection fails after retries
        """
        if self._is_connected and self._client:
            return
        
        for attempt in range(self._max_retries):
            try:
                logger.info(f"Connecting to MongoDB (attempt {attempt + 1}/{self._max_retries})...")
                
                self._client = AsyncIOMotorClient(
                    self._uri,
                    **self._client_options
                )
                
                # Test connection
                await self._client.admin.command('ping')
                
                self._database = self._client[self._database_name]
                self._is_connected = True
                
                logger.info("MongoDB connection established successfully")
                return
                
            except (ConnectionFailure, ServerSelectionTimeoutError) as e:
                logger.error(f"Connection attempt {attempt + 1} failed: {e}")
                if attempt < self._max_retries - 1:
                    await asyncio.sleep(self._retry_delay * (2 ** attempt))
                else:
                    raise ConnectionError(f"Failed to connect to MongoDB after {self._max_retries} attempts: {e}")
    
    async def disconnect(self) -> None:
        """
        Close the database connection.
        """
        if self._client:
            self._client.close()
            self._client = None
        
        self._database = None
        self._is_connected = False
        logger.info("MongoDB connection closed")
    
    @property
    def db(self) -> AsyncIOMotorDatabase:
        """
        Get the database instance.
        
        Returns:
            AsyncIOMotorDatabase: Database instance
        """
        if not self._database:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._database
    
    def get_collection(self, collection_name: str) -> AsyncIOMotorCollection:
        """
        Get a collection instance.
        
        Args:
            collection_name: Collection name
            
        Returns:
            AsyncIOMotorCollection: Collection instance
        """
        return self.db[collection_name]
    
    async def execute(
        self,
        collection: Union[str, AsyncIOMotorCollection],
        operation: str,
        *args,
        **kwargs
    ) -> Any:
        """
        Execute a database operation.
        
        Args:
            collection: Collection name or instance
            operation: Operation name (insert_one, find, etc.)
            *args: Operation arguments
            **kwargs: Operation keyword arguments
            
        Returns:
            Any: Operation result
            
        Raises:
            ConnectionError: If not connected
            OperationFailure: If operation fails
        """
        await self._ensure_connection()
        
        # Get collection
        if isinstance(collection, str):
            collection = self.get_collection(collection)
        
        # Get operation method
        method = getattr(collection, operation)
        if not method:
            raise ValueError(f"Invalid operation: {operation}")
        
        try:
            start_time = datetime.now()
            result = await method(*args, **kwargs)
            duration = (datetime.now() - start_time).total_seconds() * 1000
            
            if duration > 1000:  # Log slow queries (> 1 second)
                logger.warning(f"Slow operation ({duration:.2f}ms): {collection.name}.{operation}")
            
            return result
            
        except OperationFailure as e:
            logger.error(f"Operation failed: {e}")
            raise
    
    async def insert_one(
        self,
        collection: str,
        document: Dict[str, Any],
        **kwargs
    ) -> Any:
        """
        Insert a single document.
        
        Args:
            collection: Collection name
            document: Document to insert
            **kwargs: Additional options
            
        Returns:
            Any: Insert result
        """
        return await self.execute(collection, "insert_one", document, **kwargs)
    
    async def insert_many(
        self,
        collection: str,
        documents: List[Dict[str, Any]],
        **kwargs
    ) -> Any:
        """
        Insert multiple documents.
        
        Args:
            collection: Collection name
            documents: Documents to insert
            **kwargs: Additional options
            
        Returns:
            Any: Insert result
        """
        return await self.execute(collection, "insert_many", documents, **kwargs)
    
    async def find_one(
        self,
        collection: str,
        filter: Dict[str, Any],
        projection: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Find a single document.
        
        Args:
            collection: Collection name
            filter: Query filter
            projection: Projection specification
            **kwargs: Additional options
            
        Returns:
            Optional[Dict[str, Any]]: Document or None
        """
        result = await self.execute(
            collection,
            "find_one",
            filter,
            projection,
            **kwargs
        )
        return result
    
    async def find_many(
        self,
        collection: str,
        filter: Dict[str, Any],
        projection: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 100,
        sort: Optional[List[tuple]] = None,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Find multiple documents.
        
        Args:
            collection: Collection name
            filter: Query filter
            projection: Projection specification
            skip: Number of documents to skip
            limit: Maximum number of documents
            sort: Sort specification
            **kwargs: Additional options
            
        Returns:
            List[Dict[str, Any]]: List of documents
        """
        cursor = await self.execute(
            collection,
            "find",
            filter,
            projection,
            **kwargs
        )
        
        if sort:
            cursor = cursor.sort(sort)
        
        if skip:
            cursor = cursor.skip(skip)
        
        if limit:
            cursor = cursor.limit(limit)
        
        return await cursor.to_list(length=limit or 100)
    
    async def update_one(
        self,
        collection: str,
        filter: Dict[str, Any],
        update: Dict[str, Any],
        upsert: bool = False,
        **kwargs
    ) -> Any:
        """
        Update a single document.
        
        Args:
            collection: Collection name
            filter: Query filter
            update: Update specification
            upsert: Insert if not exists
            **kwargs: Additional options
            
        Returns:
            Any: Update result
        """
        return await self.execute(
            collection,
            "update_one",
            filter,
            update,
            upsert=upsert,
            **kwargs
        )
    
    async def update_many(
        self,
        collection: str,
        filter: Dict[str, Any],
        update: Dict[str, Any],
        upsert: bool = False,
        **kwargs
    ) -> Any:
        """
        Update multiple documents.
        
        Args:
            collection: Collection name
            filter: Query filter
            update: Update specification
            upsert: Insert if not exists
            **kwargs: Additional options
            
        Returns:
            Any: Update result
        """
        return await self.execute(
            collection,
            "update_many",
            filter,
            update,
            upsert=upsert,
            **kwargs
        )
    
    async def delete_one(
        self,
        collection: str,
        filter: Dict[str, Any],
        **kwargs
    ) -> Any:
        """
        Delete a single document.
        
        Args:
            collection: Collection name
            filter: Query filter
            **kwargs: Additional options
            
        Returns:
            Any: Delete result
        """
        return await self.execute(collection, "delete_one", filter, **kwargs)
    
    async def delete_many(
        self,
        collection: str,
        filter: Dict[str, Any],
        **kwargs
    ) -> Any:
        """
        Delete multiple documents.
        
        Args:
            collection: Collection name
            filter: Query filter
            **kwargs: Additional options
            
        Returns:
            Any: Delete result
        """
        return await self.execute(collection, "delete_many", filter, **kwargs)
    
    async def aggregate(
        self,
        collection: str,
        pipeline: List[Dict[str, Any]],
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Run an aggregation pipeline.
        
        Args:
            collection: Collection name
            pipeline: Aggregation pipeline
            **kwargs: Additional options
            
        Returns:
            List[Dict[str, Any]]: Aggregation results
        """
        cursor = await self.execute(collection, "aggregate", pipeline, **kwargs)
        return await cursor.to_list(length=None)
    
    async def count_documents(
        self,
        collection: str,
        filter: Dict[str, Any],
        **kwargs
    ) -> int:
        """
        Count documents matching the filter.
        
        Args:
            collection: Collection name
            filter: Query filter
            **kwargs: Additional options
            
        Returns:
            int: Document count
        """
        return await self.execute(collection, "count_documents", filter, **kwargs)
    
    @asynccontextmanager
    async def transaction(self):
        """
        Create a transaction context manager.
        
        Yields:
            AsyncIOMotorClientSession: Client session in transaction
        """
        await self._ensure_connection()
        
        async with await self._client.start_session() as session:
            try:
                async with session.start_transaction():
                    yield session
            except Exception as e:
                logger.error(f"Transaction failed: {e}")
                raise
    
    async def create_index(
        self,
        collection: str,
        keys: Union[str, List[tuple]],
        **kwargs
    ) -> str:
        """
        Create an index on a collection.
        
        Args:
            collection: Collection name
            keys: Index keys
            **kwargs: Additional options
            
        Returns:
            str: Index name
        """
        return await self.execute(collection, "create_index", keys, **kwargs)
    
    async def drop_index(
        self,
        collection: str,
        index_name: str,
        **kwargs
    ) -> Any:
        """
        Drop an index from a collection.
        
        Args:
            collection: Collection name
            index_name: Index name
            **kwargs: Additional options
            
        Returns:
            Any: Drop result
        """
        return await self.execute(collection, "drop_index", index_name, **kwargs)
    
    async def list_indexes(
        self,
        collection: str,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        List indexes on a collection.
        
        Args:
            collection: Collection name
            **kwargs: Additional options
            
        Returns:
            List[Dict[str, Any]]: Index information
        """
        cursor = self.get_collection(collection).list_indexes(**kwargs)
        return await cursor.to_list(length=None)
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the database.
        
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
            
            # Test connection with a simple command
            start_time = datetime.now()
            await self._client.admin.command('ping')
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Get database stats
            stats = await self.db.command('dbStats')
            
            return {
                "status": "healthy",
                "response_time_ms": response_time,
                "database_name": self._database_name,
                "collections": stats.get('collections', 0),
                "documents": stats.get('objects', 0),
                "size_mb": stats.get('dataSize', 0) / (1024 * 1024),
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get database statistics.
        
        Returns:
            Dict[str, Any]: Database statistics
        """
        await self._ensure_connection()
        
        try:
            stats = await self.db.command('dbStats')
            collections = await self.db.list_collection_names()
            
            collection_stats = {}
            for name in collections:
                try:
                    coll_stats = await self.db[name].aggregate([
                        {"$collStats": {"storageStats": {}}}
                    ]).to_list(length=1)
                    if coll_stats:
                        collection_stats[name] = coll_stats[0]
                except Exception as e:
                    logger.warning(f"Failed to get stats for collection {name}: {e}")
            
            return {
                "database_name": self._database_name,
                "stats": stats,
                "collections": {
                    "names": collections,
                    "details": collection_stats,
                },
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
    
    async def ensure_indexes(self, collection: str, indexes: List[Dict[str, Any]]) -> None:
        """
        Ensure indexes exist on a collection.
        
        Args:
            collection: Collection name
            indexes: List of index definitions
        """
        for index in indexes:
            try:
                await self.create_index(collection, **index)
                logger.info(f"Index ensured on {collection}: {index}")
            except Exception as e:
                logger.error(f"Failed to ensure index on {collection}: {e}")
    
    async def _ensure_connection(self) -> None:
        """
        Ensure connection is established.
        
        Raises:
            ConnectionError: If not connected
        """
        if not self._is_connected or not self._client:
            await self.connect()
    
    async def watch_collection(
        self,
        collection: str,
        pipeline: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ):
        """
        Watch a collection for changes.
        
        Args:
            collection: Collection name
            pipeline: Change stream pipeline
            **kwargs: Additional options
            
        Returns:
            AsyncIOMotorChangeStream: Change stream
        """
        await self._ensure_connection()
        return self.get_collection(collection).watch(pipeline, **kwargs)
    
    async def watch_database(
        self,
        pipeline: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ):
        """
        Watch the database for changes.
        
        Args:
            pipeline: Change stream pipeline
            **kwargs: Additional options
            
        Returns:
            AsyncIOMotorChangeStream: Change stream
        """
        await self._ensure_connection()
        return self.db.watch(pipeline, **kwargs)