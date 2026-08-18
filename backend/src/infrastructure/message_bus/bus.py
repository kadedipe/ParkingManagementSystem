# ============================================================================
# Core Message Bus
# ============================================================================

"""
Core Message Bus implementation.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List, Callable, Awaitable
from dataclasses import dataclass, field
from datetime import datetime
import logging

from src.infrastructure.message_bus.message import Message, Event, Command, Query
from src.infrastructure.message_bus.serialization import Serializer, JSONSerializer

logger = logging.getLogger(__name__)


@dataclass
class MessageBusConfig:
    """
    Configuration for message bus.
    """
    type: str = "in_memory"
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    virtual_host: Optional[str] = None
    topics: List[str] = field(default_factory=list)
    consumer_group: Optional[str] = None
    serializer: str = "json"
    retry_attempts: int = 3
    retry_delay: int = 5
    max_concurrent_messages: int = 10
    prefetch_count: int = 1
    heartbeat_interval: int = 30
    reconnect_interval: int = 5
    max_reconnect_attempts: int = 5


class MessageBus(ABC):
    """
    Abstract base class for message bus implementations.
    """
    
    def __init__(self, config: MessageBusConfig):
        """
        Initialize the message bus.
        
        Args:
            config: Message bus configuration
        """
        self.config = config
        self._is_connected = False
        self._serializer = self._create_serializer(config.serializer)
        self._handlers: Dict[str, List[Callable]] = {}
        self._middleware: List[Callable] = []
    
    def _create_serializer(self, serializer_type: str) -> Serializer:
        """Create serializer based on type."""
        if serializer_type == "json":
            return JSONSerializer()
        # Add other serializers as needed
        return JSONSerializer()
    
    @abstractmethod
    async def connect(self) -> None:
        """Connect to the message bus."""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the message bus."""
        pass
    
    @abstractmethod
    async def publish(self, topic: str, message: Message) -> None:
        """
        Publish a message to a topic.
        
        Args:
            topic: Topic name
            message: Message to publish
        """
        pass
    
    @abstractmethod
    async def subscribe(self, topic: str, handler: Callable) -> None:
        """
        Subscribe to a topic.
        
        Args:
            topic: Topic name
            handler: Message handler function
        """
        pass
    
    @abstractmethod
    async def unsubscribe(self, topic: str, handler: Callable) -> None:
        """
        Unsubscribe from a topic.
        
        Args:
            topic: Topic name
            handler: Message handler function
        """
        pass
    
    async def publish_event(self, event: Event) -> None:
        """
        Publish an event.
        
        Args:
            event: Event to publish
        """
        await self.publish(f"events.{event.event_type}", event)
    
    async def send_command(self, command: Command) -> None:
        """
        Send a command.
        
        Args:
            command: Command to send
        """
        await self.publish(f"commands.{command.command_type}", command)
    
    async def send_query(self, query: Query) -> None:
        """
        Send a query.
        
        Args:
            query: Query to send
        """
        await self.publish(f"queries.{query.query_type}", query)
    
    def add_middleware(self, middleware: Callable) -> None:
        """
        Add middleware to the message bus.
        
        Args:
            middleware: Middleware function
        """
        self._middleware.append(middleware)
    
    async def _process_message(self, message: Message) -> None:
        """
        Process a message through middleware and handlers.
        
        Args:
            message: Message to process
        """
        try:
            # Apply middleware
            context = {"message": message}
            for middleware in self._middleware:
                await middleware(context)
            
            # Get handlers for message type
            topic = message.topic or ""
            handlers = self._handlers.get(topic, [])
            
            # Execute handlers
            for handler in handlers:
                await handler(message)
                
        except Exception as e:
            logger.error(f"Failed to process message: {e}", exc_info=True)
            raise
    
    def add_handler(self, topic: str, handler: Callable) -> None:
        """
        Add a handler for a topic.
        
        Args:
            topic: Topic name
            handler: Handler function
        """
        if topic not in self._handlers:
            self._handlers[topic] = []
        self._handlers[topic].append(handler)
    
    def remove_handler(self, topic: str, handler: Callable) -> None:
        """
        Remove a handler for a topic.
        
        Args:
            topic: Topic name
            handler: Handler function
        """
        if topic in self._handlers:
            self._handlers[topic].remove(handler)
    
    @property
    def is_connected(self) -> bool:
        """Check if connected to the message bus."""
        return self._is_connected


class MessageBusFactory:
    """
    Factory for creating message bus instances.
    """
    
    @staticmethod
    def create(config: MessageBusConfig) -> MessageBus:
        """
        Create a message bus instance.
        
        Args:
            config: Message bus configuration
            
        Returns:
            MessageBus: Message bus instance
            
        Raises:
            ValueError: If bus type is not supported
        """
        if config.type == "kafka":
            from src.infrastructure.message_bus.kafka import KafkaMessageBus
            return KafkaMessageBus(config)
        elif config.type == "rabbitmq":
            from src.infrastructure.message_bus.rabbitmq import RabbitMQMessageBus
            return RabbitMQMessageBus(config)
        elif config.type == "in_memory":
            from src.infrastructure.message_bus.in_memory import InMemoryMessageBus
            return InMemoryMessageBus(config)
        else:
            raise ValueError(f"Unsupported message bus type: {config.type}")