# ============================================================================
# Parking Management System - Kafka Producer
# ============================================================================

"""
Kafka Producer implementation for message bus.

This module provides a robust Kafka producer with:
- Async message publishing
- Message serialization
- Retry logic
- Batch publishing
- Message compression
- Topic management
- Metrics tracking
"""

import asyncio
import json
import logging
import time
from typing import Optional, List, Dict, Any, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaError, KafkaTimeoutError
from aiokafka.structs import RecordMetadata

from src.infrastructure.message_bus.message import Message, Event, Command, Query, MessageType
from src.infrastructure.message_bus.serialization import Serializer, JSONSerializer
from src.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class KafkaProducerConfig:
    """
    Configuration for Kafka producer.
    """
    bootstrap_servers: List[str] = field(default_factory=lambda: ["localhost:9092"])
    client_id: str = "parking-producer"
    acks: int = 1  # 0, 1, or all
    retries: int = 3
    max_in_flight_requests_per_connection: int = 5
    compression_type: str = "gzip"  # none, gzip, snappy, lz4, zstd
    batch_size: int = 16384
    linger_ms: int = 0
    buffer_memory: int = 33554432
    max_request_size: int = 1048576
    security_protocol: str = "PLAINTEXT"
    sasl_mechanism: Optional[str] = None
    sasl_username: Optional[str] = None
    sasl_password: Optional[str] = None
    ssl_cafile: Optional[str] = None
    ssl_certfile: Optional[str] = None
    ssl_keyfile: Optional[str] = None
    enable_idempotence: bool = False
    transaction_timeout_ms: int = 60000
    max_retry_attempts: int = 5
    retry_backoff_ms: int = 100
    
    @classmethod
    def from_env(cls) -> "KafkaProducerConfig":
        """Create configuration from environment variables."""
        return cls(
            bootstrap_servers=settings.KAFKA_BROKERS,
            client_id=f"parking-producer-{settings.ENVIRONMENT}",
            compression_type=settings.KAFKA_COMPRESSION_TYPE,
            security_protocol=settings.KAFKA_SECURITY_PROTOCOL,
            sasl_mechanism=settings.KAFKA_SASL_MECHANISM,
            sasl_username=settings.KAFKA_SASL_USERNAME,
            sasl_password=settings.KAFKA_SASL_PASSWORD,
        )


@dataclass
class PublishResult:
    """
    Result of a publish operation.
    """
    topic: str
    partition: int
    offset: int
    timestamp: datetime
    message_id: str
    success: bool
    error: Optional[str] = None
    
    @classmethod
    def from_record_metadata(cls, metadata: RecordMetadata, message_id: str) -> "PublishResult":
        """Create result from Kafka RecordMetadata."""
        return cls(
            topic=metadata.topic,
            partition=metadata.partition,
            offset=metadata.offset,
            timestamp=datetime.fromtimestamp(metadata.timestamp / 1000),
            message_id=message_id,
            success=True,
        )
    
    @classmethod
    def from_error(cls, topic: str, message_id: str, error: str) -> "PublishResult":
        """Create result from error."""
        return cls(
            topic=topic,
            partition=-1,
            offset=-1,
            timestamp=datetime.now(),
            message_id=message_id,
            success=False,
            error=error,
        )


class KafkaProducer:
    """
    Kafka producer with advanced features.
    
    Features:
    - Async message publishing
    - Message serialization
    - Retry logic
    - Batch publishing
    - Message compression
    - Topic management
    - Metrics tracking
    """
    
    def __init__(
        self,
        config: Optional[KafkaProducerConfig] = None,
        serializer: Optional[Serializer] = None,
    ):
        """
        Initialize the Kafka producer.
        
        Args:
            config: Producer configuration
            serializer: Message serializer
        """
        self.config = config or KafkaProducerConfig.from_env()
        self.serializer = serializer or JSONSerializer()
        self._producer: Optional[AIOKafkaProducer] = None
        self._is_running = False
        self._metrics = {
            "messages_sent": 0,
            "messages_failed": 0,
            "bytes_sent": 0,
            "last_error": None,
        }
        self._batch_buffer: List[tuple] = []
        self._batch_size = 100
        self._batch_timeout = 5.0  # seconds
    
    async def start(self) -> None:
        """
        Start the Kafka producer.
        
        Raises:
            KafkaError: If connection fails
        """
        if self._is_running:
            return
        
        try:
            self._producer = AIOKafkaProducer(
                bootstrap_servers=self.config.bootstrap_servers,
                client_id=self.config.client_id,
                acks=self.config.acks,
                retries=self.config.retries,
                max_in_flight_requests_per_connection=self.config.max_in_flight_requests_per_connection,
                compression_type=self.config.compression_type,
                batch_size=self.config.batch_size,
                linger_ms=self.config.linger_ms,
                buffer_memory=self.config.buffer_memory,
                max_request_size=self.config.max_request_size,
                security_protocol=self.config.security_protocol,
                sasl_mechanism=self.config.sasl_mechanism,
                sasl_plain_username=self.config.sasl_username,
                sasl_plain_password=self.config.sasl_password,
                ssl_cafile=self.config.ssl_cafile,
                ssl_certfile=self.config.ssl_certfile,
                ssl_keyfile=self.config.ssl_keyfile,
                enable_idempotence=self.config.enable_idempotence,
                transaction_timeout_ms=self.config.transaction_timeout_ms,
            )
            
            await self._producer.start()
            self._is_running = True
            logger.info(f"Kafka producer started: {self.config.client_id}")
            
            # Start batch processor
            asyncio.create_task(self._process_batch())
            
        except KafkaError as e:
            logger.error(f"Failed to start Kafka producer: {e}")
            raise
    
    async def stop(self) -> None:
        """
        Stop the Kafka producer.
        """
        if not self._is_running:
            return
        
        # Flush any remaining messages
        await self.flush()
        
        if self._producer:
            await self._producer.stop()
            self._producer = None
        
        self._is_running = False
        logger.info(f"Kafka producer stopped: {self.config.client_id}")
    
    async def publish(
        self,
        topic: str,
        message: Union[Message, Event, Command, Query],
        key: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
        partition: Optional[int] = None,
        timestamp_ms: Optional[int] = None,
    ) -> PublishResult:
        """
        Publish a message to a topic.
        
        Args:
            topic: Topic name
            message: Message to publish
            key: Message key
            headers: Message headers
            partition: Partition number
            timestamp_ms: Message timestamp
            
        Returns:
            PublishResult: Publish result
        """
        if not self._is_running:
            await self.start()
        
        try:
            # Convert message to dict
            if isinstance(message, Message):
                message_dict = message.to_dict()
            else:
                message_dict = message
            
            # Serialize message
            serialized = self.serializer.serialize(message_dict)
            
            # Prepare headers
            all_headers = headers or {}
            all_headers.update({
                "message_id": message_dict.get("id", str(uuid4())),
                "message_type": message_dict.get("type", "event"),
                "timestamp": datetime.now().isoformat(),
            })
            
            # Convert headers to list of tuples
            header_list = [(k, v.encode('utf-8') if isinstance(v, str) else v) 
                          for k, v in all_headers.items()]
            
            # Publish message
            start_time = time.time()
            
            result = await self._producer.send(
                topic=topic,
                value=serialized,
                key=key.encode('utf-8') if key else None,
                headers=header_list,
                partition=partition,
                timestamp_ms=timestamp_ms or int(time.time() * 1000),
            )
            
            # Wait for result
            metadata = await result
            
            # Update metrics
            self._metrics["messages_sent"] += 1
            self._metrics["bytes_sent"] += len(serialized)
            
            publish_result = PublishResult.from_record_metadata(
                metadata,
                all_headers["message_id"]
            )
            
            logger.debug(
                f"Message published to {topic}: "
                f"partition={publish_result.partition}, "
                f"offset={publish_result.offset}"
            )
            
            return publish_result
            
        except KafkaTimeoutError as e:
            self._metrics["messages_failed"] += 1
            self._metrics["last_error"] = str(e)
            logger.error(f"Timeout publishing message to {topic}: {e}")
            return PublishResult.from_error(topic, str(uuid4()), f"Timeout: {e}")
            
        except KafkaError as e:
            self._metrics["messages_failed"] += 1
            self._metrics["last_error"] = str(e)
            logger.error(f"Failed to publish message to {topic}: {e}")
            return PublishResult.from_error(topic, str(uuid4()), str(e))
        
        except Exception as e:
            self._metrics["messages_failed"] += 1
            self._metrics["last_error"] = str(e)
            logger.error(f"Unexpected error publishing message to {topic}: {e}")
            return PublishResult.from_error(topic, str(uuid4()), str(e))
    
    async def publish_batch(
        self,
        messages: List[tuple],
    ) -> List[PublishResult]:
        """
        Publish a batch of messages.
        
        Args:
            messages: List of (topic, message, key, headers) tuples
            
        Returns:
            List[PublishResult]: Publish results
        """
        results = []
        
        for topic, message, key, headers in messages:
            result = await self.publish(
                topic=topic,
                message=message,
                key=key,
                headers=headers,
            )
            results.append(result)
        
        return results
    
    async def publish_event(
        self,
        event: Event,
        key: Optional[str] = None,
    ) -> PublishResult:
        """
        Publish an event.
        
        Args:
            event: Event to publish
            key: Message key
            
        Returns:
            PublishResult: Publish result
        """
        topic = f"events.{event.event_type}"
        return await self.publish(topic, event, key=key)
    
    async def send_command(
        self,
        command: Command,
        key: Optional[str] = None,
    ) -> PublishResult:
        """
        Send a command.
        
        Args:
            command: Command to send
            key: Message key
            
        Returns:
            PublishResult: Publish result
        """
        topic = f"commands.{command.command_type}"
        return await self.publish(topic, command, key=key)
    
    async def send_query(
        self,
        query: Query,
        key: Optional[str] = None,
    ) -> PublishResult:
        """
        Send a query.
        
        Args:
            query: Query to send
            key: Message key
            
        Returns:
            PublishResult: Publish result
        """
        topic = f"queries.{query.query_type}"
        return await self.publish(topic, query, key=key)
    
    async def _process_batch(self) -> None:
        """
        Process batch buffer.
        """
        while self._is_running:
            try:
                await asyncio.sleep(self._batch_timeout)
                
                if self._batch_buffer:
                    messages = self._batch_buffer.copy()
                    self._batch_buffer.clear()
                    
                    # Publish batch
                    await self.publish_batch(messages)
                    
            except Exception as e:
                logger.error(f"Batch processing error: {e}")
    
    async def flush(self) -> None:
        """
        Flush any pending messages.
        """
        if self._producer:
            await self._producer.flush()
    
    def add_to_batch(
        self,
        topic: str,
        message: Message,
        key: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        """
        Add a message to the batch buffer.
        
        Args:
            topic: Topic name
            message: Message to publish
            key: Message key
            headers: Message headers
        """
        self._batch_buffer.append((topic, message, key, headers))
        
        if len(self._batch_buffer) >= self._batch_size:
            # Process batch immediately
            asyncio.create_task(self._process_batch())
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get producer metrics.
        
        Returns:
            Dict[str, Any]: Metrics
        """
        return {
            **self._metrics,
            "is_running": self._is_running,
            "batch_size": len(self._batch_buffer),
            "config": {
                "bootstrap_servers": self.config.bootstrap_servers,
                "client_id": self.config.client_id,
                "compression_type": self.config.compression_type,
                "batch_size": self.config.batch_size,
            },
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check.
        
        Returns:
            Dict[str, Any]: Health status
        """
        try:
            if not self._is_running:
                return {
                    "status": "unhealthy",
                    "error": "Producer not running",
                    "timestamp": datetime.now().isoformat(),
                }
            
            # Test publish
            test_message = {
                "id": str(uuid4()),
                "type": "health_check",
                "timestamp": datetime.now().isoformat(),
            }
            
            result = await self.publish(
                topic="__health_check",
                message=test_message,
            )
            
            return {
                "status": "healthy" if result.success else "degraded",
                "message": "Health check completed",
                "result": result.success,
                "timestamp": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }


# ============================================================================
# Producer Factory
# ============================================================================

class KafkaProducerFactory:
    """
    Factory for creating Kafka producers.
    """
    
    _producers: Dict[str, KafkaProducer] = {}
    
    @classmethod
    def get_or_create(
        cls,
        name: str = "default",
        config: Optional[KafkaProducerConfig] = None,
    ) -> KafkaProducer:
        """
        Get or create a producer instance.
        
        Args:
            name: Producer name
            config: Producer configuration
            
        Returns:
            KafkaProducer: Producer instance
        """
        if name not in cls._producers:
            cls._producers[name] = KafkaProducer(config)
        
        return cls._producers[name]
    
    @classmethod
    async def stop_all(cls) -> None:
        """
        Stop all producers.
        """
        for name, producer in cls._producers.items():
            await producer.stop()
        
        cls._producers.clear()
    
    @classmethod
    def get_metrics(cls) -> Dict[str, Any]:
        """
        Get metrics for all producers.
        
        Returns:
            Dict[str, Any]: Metrics
        """
        return {
            name: producer.get_metrics()
            for name, producer in cls._producers.items()
        }