# ============================================================================
# Parking Management System - Kafka Consumer
# ============================================================================

"""
Kafka Consumer implementation for message bus.

This module provides a robust Kafka consumer with:
- Async message consumption
- Message deserialization
- Auto-commit and manual commit support
- Consumer group management
- Error handling and retry logic
- Dead letter queue support
- Metrics tracking
"""

import asyncio
import json
import logging
import time
from typing import Optional, List, Dict, Any, Union, Callable, Awaitable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import signal

from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError, KafkaTimeoutError
from aiokafka.structs import ConsumerRecord, TopicPartition

from src.infrastructure.message_bus.message import Message, Event, Command, Query, MessageType
from src.infrastructure.message_bus.serialization import Serializer, JSONSerializer
from src.core.config import settings

logger = logging.getLogger(__name__)


class OffsetResetStrategy(str, Enum):
    """Offset reset strategies."""
    EARLIEST = "earliest"
    LATEST = "latest"
    NONE = "none"


@dataclass
class KafkaConsumerConfig:
    """
    Configuration for Kafka consumer.
    """
    bootstrap_servers: List[str] = field(default_factory=lambda: ["localhost:9092"])
    group_id: str = "parking-consumer"
    client_id: str = "parking-consumer"
    topics: List[str] = field(default_factory=list)
    auto_offset_reset: OffsetResetStrategy = OffsetResetStrategy.EARLIEST
    enable_auto_commit: bool = True
    auto_commit_interval_ms: int = 5000
    max_poll_records: int = 500
    max_poll_interval_ms: int = 300000
    session_timeout_ms: int = 30000
    heartbeat_interval_ms: int = 3000
    fetch_max_wait_ms: int = 500
    fetch_min_bytes: int = 1
    fetch_max_bytes: int = 52428800
    max_partition_fetch_bytes: int = 1048576
    security_protocol: str = "PLAINTEXT"
    sasl_mechanism: Optional[str] = None
    sasl_username: Optional[str] = None
    sasl_password: Optional[str] = None
    ssl_cafile: Optional[str] = None
    ssl_certfile: Optional[str] = None
    ssl_keyfile: Optional[str] = None
    enable_auto_commit_on_error: bool = False
    retry_attempts: int = 3
    retry_backoff_ms: int = 1000
    dead_letter_topic: Optional[str] = None
    max_retry_attempts: int = 5
    
    @classmethod
    def from_env(cls) -> "KafkaConsumerConfig":
        """Create configuration from environment variables."""
        return cls(
            bootstrap_servers=settings.KAFKA_BROKERS,
            group_id=f"parking-consumer-{settings.ENVIRONMENT}",
            client_id=f"parking-consumer-{settings.ENVIRONMENT}",
            auto_offset_reset=OffsetResetStrategy(settings.KAFKA_AUTO_OFFSET_RESET),
            security_protocol=settings.KAFKA_SECURITY_PROTOCOL,
            sasl_mechanism=settings.KAFKA_SASL_MECHANISM,
            sasl_username=settings.KAFKA_SASL_USERNAME,
            sasl_password=settings.KAFKA_SASL_PASSWORD,
        )


@dataclass
class ConsumerMessage:
    """
    Wrapper for consumed messages with metadata.
    """
    message: Message
    topic: str
    partition: int
    offset: int
    timestamp: datetime
    key: Optional[str] = None
    headers: Dict[str, str] = field(default_factory=dict)
    retry_count: int = 0
    
    @classmethod
    def from_record(cls, record: ConsumerRecord, retry_count: int = 0) -> "ConsumerMessage":
        """Create from Kafka ConsumerRecord."""
        # Extract headers
        headers = {}
        for key, value in record.headers:
            headers[key] = value.decode('utf-8') if value else None
        
        # Deserialize message
        try:
            if record.value:
                data = json.loads(record.value.decode('utf-8'))
            else:
                data = {}
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            logger.error(f"Failed to deserialize message: {e}")
            data = {"raw": record.value}
        
        # Create message
        message = Message(
            id=data.get("id"),
            message_type=MessageType(data.get("type", "event")),
            timestamp=datetime.fromisoformat(data.get("timestamp")) if data.get("timestamp") else datetime.now(),
            data=data.get("data", {}),
            topic=record.topic,
        )
        
        return cls(
            message=message,
            topic=record.topic,
            partition=record.partition,
            offset=record.offset,
            timestamp=datetime.fromtimestamp(record.timestamp / 1000),
            key=record.key.decode('utf-8') if record.key else None,
            headers=headers,
            retry_count=retry_count,
        )


class KafkaConsumer:
    """
    Kafka consumer with advanced features.
    
    Features:
    - Async message consumption
    - Message deserialization
    - Auto-commit and manual commit support
    - Consumer group management
    - Error handling and retry logic
    - Dead letter queue support
    - Metrics tracking
    """
    
    def __init__(
        self,
        config: Optional[KafkaConsumerConfig] = None,
        serializer: Optional[Serializer] = None,
        handler: Optional[Callable] = None,
    ):
        """
        Initialize the Kafka consumer.
        
        Args:
            config: Consumer configuration
            serializer: Message serializer
            handler: Message handler function
        """
        self.config = config or KafkaConsumerConfig.from_env()
        self.serializer = serializer or JSONSerializer()
        self.handler = handler
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._is_running = False
        self._is_consuming = False
        self._consumer_task: Optional[asyncio.Task] = None
        self._metrics = {
            "messages_received": 0,
            "messages_processed": 0,
            "messages_failed": 0,
            "messages_retried": 0,
            "messages_dead_letter": 0,
            "last_error": None,
            "last_message_timestamp": None,
        }
        self._retry_counters: Dict[str, int] = {}
        self._shutdown_event = asyncio.Event()
    
    async def start(self) -> None:
        """
        Start the Kafka consumer.
        
        Raises:
            KafkaError: If connection fails
        """
        if self._is_running:
            return
        
        try:
            # Create consumer
            self._consumer = AIOKafkaConsumer(
                *self.config.topics,
                bootstrap_servers=self.config.bootstrap_servers,
                group_id=self.config.group_id,
                client_id=self.config.client_id,
                auto_offset_reset=self.config.auto_offset_reset.value,
                enable_auto_commit=self.config.enable_auto_commit,
                auto_commit_interval_ms=self.config.auto_commit_interval_ms,
                max_poll_records=self.config.max_poll_records,
                max_poll_interval_ms=self.config.max_poll_interval_ms,
                session_timeout_ms=self.config.session_timeout_ms,
                heartbeat_interval_ms=self.config.heartbeat_interval_ms,
                fetch_max_wait_ms=self.config.fetch_max_wait_ms,
                fetch_min_bytes=self.config.fetch_min_bytes,
                fetch_max_bytes=self.config.fetch_max_bytes,
                max_partition_fetch_bytes=self.config.max_partition_fetch_bytes,
                security_protocol=self.config.security_protocol,
                sasl_mechanism=self.config.sasl_mechanism,
                sasl_plain_username=self.config.sasl_username,
                sasl_plain_password=self.config.sasl_password,
                ssl_cafile=self.config.ssl_cafile,
                ssl_certfile=self.config.ssl_certfile,
                ssl_keyfile=self.config.ssl_keyfile,
            )
            
            await self._consumer.start()
            self._is_running = True
            logger.info(f"Kafka consumer started: {self.config.group_id}")
            
            # Register signal handlers
            asyncio.get_event_loop().add_signal_handler(
                signal.SIGINT, self._handle_shutdown_signal
            )
            asyncio.get_event_loop().add_signal_handler(
                signal.SIGTERM, self._handle_shutdown_signal
            )
            
        except KafkaError as e:
            logger.error(f"Failed to start Kafka consumer: {e}")
            raise
    
    async def stop(self) -> None:
        """
        Stop the Kafka consumer.
        """
        if not self._is_running:
            return
        
        self._is_running = False
        self._shutdown_event.set()
        
        if self._consumer_task:
            self._consumer_task.cancel()
            try:
                await self._consumer_task
            except asyncio.CancelledError:
                pass
        
        if self._consumer:
            await self._consumer.stop()
            self._consumer = None
        
        logger.info(f"Kafka consumer stopped: {self.config.group_id}")
    
    async def consume(self, handler: Optional[Callable] = None) -> None:
        """
        Start consuming messages.
        
        Args:
            handler: Optional message handler function
        """
        if self._is_consuming:
            logger.warning("Consumer already running")
            return
        
        self._is_consuming = True
        self._consumer_task = asyncio.create_task(self._consume_loop(handler))
        
        try:
            await self._consumer_task
        except asyncio.CancelledError:
            logger.info("Consumer task cancelled")
        finally:
            self._is_consuming = False
    
    async def _consume_loop(self, handler: Optional[Callable] = None) -> None:
        """
        Main consumption loop.
        
        Args:
            handler: Message handler function
        """
        if not self._consumer:
            await self.start()
        
        message_handler = handler or self.handler
        
        if not message_handler:
            raise ValueError("No message handler provided")
        
        while self._is_running and not self._shutdown_event.is_set():
            try:
                # Wait for messages
                records = await self._consumer.getmany(
                    timeout_ms=1000,
                    max_records=self.config.max_poll_records,
                )
                
                for topic_partition, messages in records.items():
                    for record in messages:
                        await self._process_message(record, message_handler)
                        
            except asyncio.CancelledError:
                logger.info("Consumer loop cancelled")
                break
            except KafkaTimeoutError:
                # Continue loop on timeout
                continue
            except KafkaError as e:
                logger.error(f"Kafka error in consumer loop: {e}")
                await asyncio.sleep(5)  # Backoff on error
            except Exception as e:
                logger.error(f"Unexpected error in consumer loop: {e}", exc_info=True)
                await asyncio.sleep(1)
    
    async def _process_message(
        self,
        record: ConsumerRecord,
        handler: Callable,
    ) -> None:
        """
        Process a single message.
        
        Args:
            record: Kafka record
            handler: Message handler function
        """
        self._metrics["messages_received"] += 1
        self._metrics["last_message_timestamp"] = datetime.now()
        
        try:
            # Get retry count
            message_key = f"{record.topic}:{record.partition}:{record.offset}"
            retry_count = self._retry_counters.get(message_key, 0)
            
            # Create wrapper
            consumer_message = ConsumerMessage.from_record(record, retry_count)
            
            # Process message
            await handler(consumer_message)
            
            # Commit offset if manual commit
            if not self.config.enable_auto_commit:
                await self._consumer.commit()
            
            self._metrics["messages_processed"] += 1
            
            # Clean up retry counter
            if message_key in self._retry_counters:
                del self._retry_counters[message_key]
            
        except Exception as e:
            logger.error(f"Failed to process message: {e}", exc_info=True)
            
            # Handle retry logic
            await self._handle_processing_error(record, handler, e)
    
    async def _handle_processing_error(
        self,
        record: ConsumerRecord,
        handler: Callable,
        error: Exception,
    ) -> None:
        """
        Handle message processing errors with retry logic.
        
        Args:
            record: Kafka record
            handler: Message handler function
            error: Exception that occurred
        """
        message_key = f"{record.topic}:{record.partition}:{record.offset}"
        retry_count = self._retry_counters.get(message_key, 0) + 1
        
        self._retry_counters[message_key] = retry_count
        self._metrics["messages_failed"] += 1
        
        if retry_count <= self.config.max_retry_attempts:
            # Retry the message
            logger.warning(
                f"Retrying message {message_key} (attempt {retry_count}/{self.config.max_retry_attempts})"
            )
            self._metrics["messages_retried"] += 1
            
            # Wait before retry
            await asyncio.sleep(
                self.config.retry_backoff_ms / 1000 * (2 ** (retry_count - 1))
            )
            
            # Process again
            await self._process_message(record, handler)
        else:
            # Send to dead letter topic
            if self.config.dead_letter_topic:
                await self._send_to_dead_letter(record, error)
                self._metrics["messages_dead_letter"] += 1
            
            # Commit offset to avoid infinite loop
            if not self.config.enable_auto_commit:
                await self._consumer.commit()
            
            # Clean up retry counter
            if message_key in self._retry_counters:
                del self._retry_counters[message_key]
            
            logger.error(f"Message {message_key} moved to dead letter topic after {retry_count} attempts")
    
    async def _send_to_dead_letter(self, record: ConsumerRecord, error: Exception) -> None:
        """
        Send message to dead letter topic.
        
        Args:
            record: Original Kafka record
            error: Exception that occurred
        """
        if not self.config.dead_letter_topic:
            return
        
        try:
            # Create dead letter message
            dead_letter_message = {
                "original_topic": record.topic,
                "original_partition": record.partition,
                "original_offset": record.offset,
                "original_value": record.value.decode('utf-8') if record.value else None,
                "error": str(error),
                "error_type": type(error).__name__,
                "timestamp": datetime.now().isoformat(),
                "retry_count": self._retry_counters.get(
                    f"{record.topic}:{record.partition}:{record.offset}", 0
                ),
            }
            
            # Publish to dead letter topic
            # This could use KafkaProducer or any other publisher
            from src.infrastructure.message_bus.kafka_producer import KafkaProducer
            
            producer = KafkaProducer()
            await producer.start()
            await producer.publish(
                topic=self.config.dead_letter_topic,
                message=dead_letter_message,
                key=record.key.decode('utf-8') if record.key else None,
                headers={
                    "original_topic": record.topic,
                    "error_type": type(error).__name__,
                }
            )
            await producer.stop()
            
            logger.info(f"Message sent to dead letter topic: {self.config.dead_letter_topic}")
            
        except Exception as e:
            logger.error(f"Failed to send message to dead letter topic: {e}")
    
    def _handle_shutdown_signal(self) -> None:
        """
        Handle shutdown signal.
        """
        logger.info("Shutdown signal received, stopping consumer...")
        self._shutdown_event.set()
        self._is_running = False
    
    def pause(self, topics: Optional[List[str]] = None) -> None:
        """
        Pause consumption from topics.
        
        Args:
            topics: List of topics to pause (None for all)
        """
        if not self._consumer:
            return
        
        if topics:
            for topic in topics:
                partitions = self._consumer.assignment()
                paused_partitions = [
                    p for p in partitions
                    if p.topic == topic
                ]
                if paused_partitions:
                    self._consumer.pause(*paused_partitions)
        else:
            self._consumer.pause(*self._consumer.assignment())
    
    def resume(self, topics: Optional[List[str]] = None) -> None:
        """
        Resume consumption from topics.
        
        Args:
            topics: List of topics to resume (None for all)
        """
        if not self._consumer:
            return
        
        if topics:
            for topic in topics:
                partitions = self._consumer.assignment()
                paused_partitions = [
                    p for p in partitions
                    if p.topic == topic
                ]
                if paused_partitions:
                    self._consumer.resume(*paused_partitions)
        else:
            self._consumer.resume(*self._consumer.assignment())
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get consumer metrics.
        
        Returns:
            Dict[str, Any]: Metrics
        """
        return {
            **self._metrics,
            "is_running": self._is_running,
            "is_consuming": self._is_consuming,
            "config": {
                "group_id": self.config.group_id,
                "topics": self.config.topics,
                "auto_offset_reset": self.config.auto_offset_reset.value,
                "enable_auto_commit": self.config.enable_auto_commit,
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
                    "error": "Consumer not running",
                    "timestamp": datetime.now().isoformat(),
                }
            
            # Check consumer status
            if self._consumer:
                assignment = self._consumer.assignment()
                position = {}
                for partition in assignment:
                    try:
                        pos = await self._consumer.position(partition)
                        position[f"{partition.topic}:{partition.partition}"] = pos
                    except Exception as e:
                        position[f"{partition.topic}:{partition.partition}"] = str(e)
                
                return {
                    "status": "healthy",
                    "assignment": len(assignment) > 0,
                    "partitions": len(assignment),
                    "positions": position,
                    "timestamp": datetime.now().isoformat(),
                }
            
            return {
                "status": "unhealthy",
                "error": "Consumer not initialized",
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
# Consumer Factory
# ============================================================================

class KafkaConsumerFactory:
    """
    Factory for creating Kafka consumers.
    """
    
    _consumers: Dict[str, KafkaConsumer] = {}
    
    @classmethod
    def get_or_create(
        cls,
        name: str = "default",
        config: Optional[KafkaConsumerConfig] = None,
        handler: Optional[Callable] = None,
    ) -> KafkaConsumer:
        """
        Get or create a consumer instance.
        
        Args:
            name: Consumer name
            config: Consumer configuration
            handler: Message handler function
            
        Returns:
            KafkaConsumer: Consumer instance
        """
        if name not in cls._consumers:
            cls._consumers[name] = KafkaConsumer(config, handler=handler)
        
        return cls._consumers[name]
    
    @classmethod
    async def stop_all(cls) -> None:
        """
        Stop all consumers.
        """
        for name, consumer in cls._consumers.items():
            await consumer.stop()
        
        cls._consumers.clear()
    
    @classmethod
    def get_metrics(cls) -> Dict[str, Any]:
        """
        Get metrics for all consumers.
        
        Returns:
            Dict[str, Any]: Metrics
        """
        return {
            name: consumer.get_metrics()
            for name, consumer in cls._consumers.items()
        }