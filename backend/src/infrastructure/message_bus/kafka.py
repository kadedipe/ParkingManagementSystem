# ============================================================================
# Kafka Message Bus
# ============================================================================

"""
Kafka message bus implementation.
"""

import json
from typing import Optional, List, Dict, Any, Callable
from dataclasses import dataclass, field
import asyncio
import logging

from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.errors import KafkaError

from src.infrastructure.message_bus.bus import MessageBus, MessageBusConfig
from src.infrastructure.message_bus.message import Message

logger = logging.getLogger(__name__)


@dataclass
class KafkaConfig(MessageBusConfig):
    """
    Kafka-specific configuration.
    """
    bootstrap_servers: List[str] = field(default_factory=list)
    security_protocol: str = "PLAINTEXT"
    sasl_mechanism: Optional[str] = None
    sasl_username: Optional[str] = None
    sasl_password: Optional[str] = None
    ssl_cafile: Optional[str] = None
    ssl_certfile: Optional[str] = None
    ssl_keyfile: Optional[str] = None
    partition_count: int = 3
    replication_factor: int = 1


class KafkaMessageBus(MessageBus):
    """
    Kafka message bus implementation.
    """
    
    def __init__(self, config: KafkaConfig):
        """
        Initialize the Kafka message bus.
        
        Args:
            config: Kafka configuration
        """
        super().__init__(config)
        self.config = config
        self._producer: Optional[AIOKafkaProducer] = None
        self._consumers: Dict[str, AIOKafkaConsumer] = {}
        self._consumer_tasks: Dict[str, asyncio.Task] = {}
    
    async def connect(self) -> None:
        """Connect to Kafka."""
        if self._is_connected:
            return
        
        try:
            # Create producer
            self._producer = AIOKafkaProducer(
                bootstrap_servers=self.config.bootstrap_servers,
                security_protocol=self.config.security_protocol,
                sasl_mechanism=self.config.sasl_mechanism,
                sasl_plain_username=self.config.sasl_username,
                sasl_plain_password=self.config.sasl_password,
                ssl_cafile=self.config.ssl_cafile,
                ssl_certfile=self.config.ssl_certfile,
                ssl_keyfile=self.config.ssl_keyfile,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            )
            await self._producer.start()
            
            # Create consumers for each topic
            for topic in self.config.topics:
                consumer = AIOKafkaConsumer(
                    topic,
                    bootstrap_servers=self.config.bootstrap_servers,
                    group_id=self.config.consumer_group or f"group-{topic}",
                    security_protocol=self.config.security_protocol,
                    sasl_mechanism=self.config.sasl_mechanism,
                    sasl_plain_username=self.config.sasl_username,
                    sasl_plain_password=self.config.sasl_password,
                    ssl_cafile=self.config.ssl_cafile,
                    ssl_certfile=self.config.ssl_certfile,
                    ssl_keyfile=self.config.ssl_keyfile,
                    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                    auto_offset_reset='earliest',
                    enable_auto_commit=True,
                )
                await consumer.start()
                self._consumers[topic] = consumer
                
                # Start consumer task
                task = asyncio.create_task(self._consume_messages(topic, consumer))
                self._consumer_tasks[topic] = task
            
            self._is_connected = True
            logger.info("Connected to Kafka")
            
        except KafkaError as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            raise
    
    async def disconnect(self) -> None:
        """Disconnect from Kafka."""
        if not self._is_connected:
            return
        
        try:
            # Stop consumers
            for topic, consumer in self._consumers.items():
                if topic in self._consumer_tasks:
                    self._consumer_tasks[topic].cancel()
                await consumer.stop()
            
            # Stop producer
            if self._producer:
                await self._producer.stop()
            
            self._consumers.clear()
            self._consumer_tasks.clear()
            self._producer = None
            self._is_connected = False
            logger.info("Disconnected from Kafka")
            
        except KafkaError as e:
            logger.error(f"Failed to disconnect from Kafka: {e}")
            raise
    
    async def publish(self, topic: str, message: Message) -> None:
        """
        Publish a message to a topic.
        
        Args:
            topic: Topic name
            message: Message to publish
        """
        if not self._is_connected:
            await self.connect()
        
        try:
            # Serialize message
            data = {
                "id": message.id,
                "type": message.message_type.value,
                "timestamp": message.timestamp.isoformat(),
                "data": message.data,
                "headers": message.headers,
            }
            
            await self._producer.send_and_wait(topic, data)
            logger.debug(f"Message published to {topic}: {message.id}")
            
        except KafkaError as e:
            logger.error(f"Failed to publish message to {topic}: {e}")
            raise
    
    async def subscribe(self, topic: str, handler: Callable) -> None:
        """
        Subscribe to a topic.
        
        Args:
            topic: Topic name
            handler: Message handler function
        """
        self.add_handler(topic, handler)
    
    async def unsubscribe(self, topic: str, handler: Callable) -> None:
        """
        Unsubscribe from a topic.
        
        Args:
            topic: Topic name
            handler: Message handler function
        """
        self.remove_handler(topic, handler)
    
    async def _consume_messages(self, topic: str, consumer: AIOKafkaConsumer) -> None:
        """
        Consume messages from a topic.
        
        Args:
            topic: Topic name
            consumer: Kafka consumer
        """
        try:
            async for msg in consumer:
                try:
                    # Deserialize message
                    data = msg.value
                    message = Message(
                        id=data.get("id"),
                        message_type=data.get("type", "event"),
                        timestamp=data.get("timestamp"),
                        data=data.get("data", {}),
                        headers=data.get("headers", {}),
                        topic=topic,
                    )
                    
                    # Process message
                    await self._process_message(message)
                    
                except Exception as e:
                    logger.error(f"Failed to process message from {topic}: {e}", exc_info=True)
                    
        except asyncio.CancelledError:
            logger.info(f"Consumer task cancelled for {topic}")
            raise
        except Exception as e:
            logger.error(f"Consumer error for {topic}: {e}")
            raise