# ============================================================================
# Parking Management System - Message Bus Package
# ============================================================================

"""
Message Bus Infrastructure Package.

This package provides message bus implementations for event-driven architecture:
- Kafka message bus
- RabbitMQ message bus
- In-memory message bus (for testing)
- Message producers and consumers
- Event handlers and subscribers
"""

# ============================================================================
# Core Message Bus
# ============================================================================

from src.infrastructure.message_bus.bus import (
    MessageBus,
    MessageBusConfig,
    MessageBusFactory,
)

# ============================================================================
# Message Bus Implementations
# ============================================================================

from src.infrastructure.message_bus.kafka import (
    KafkaMessageBus,
    KafkaProducer,
    KafkaConsumer,
    KafkaConfig,
)

from src.infrastructure.message_bus.rabbitmq import (
    RabbitMQMessageBus,
    RabbitMQProducer,
    RabbitMQConsumer,
    RabbitMQConfig,
)

from src.infrastructure.message_bus.in_memory import (
    InMemoryMessageBus,
    InMemoryProducer,
    InMemoryConsumer,
)

# ============================================================================
# Messages
# ============================================================================

from src.infrastructure.message_bus.message import (
    Message,
    Event,
    Command,
    Query,
    MessageType,
    MessageHeaders,
    MessageEnvelope,
)

# ============================================================================
# Producers and Consumers
# ============================================================================

from src.infrastructure.message_bus.producer import (
    Producer,
    EventProducer,
    CommandProducer,
    QueryProducer,
)

from src.infrastructure.message_bus.consumer import (
    Consumer,
    EventConsumer,
    CommandConsumer,
    QueryConsumer,
    ConsumerGroup,
)

# ============================================================================
# Handlers and Subscribers
# ============================================================================

from src.infrastructure.message_bus.handler import (
    MessageHandler,
    EventHandler,
    CommandHandler,
    QueryHandler,
    HandlerRegistry,
    HandlerChain,
)

# ============================================================================
# Middleware
# ============================================================================

from src.infrastructure.message_bus.middleware import (
    Middleware,
    LoggingMiddleware,
    ValidationMiddleware,
    RetryMiddleware,
    CircuitBreakerMiddleware,
    TracingMiddleware,
)

# ============================================================================
# Serialization
# ============================================================================

from src.infrastructure.message_bus.serialization import (
    Serializer,
    JSONSerializer,
    PickleSerializer,
    AvroSerializer,
    ProtobufSerializer,
)

# ============================================================================
# Message Bus Registry
# ============================================================================

class MessageBusRegistry:
    """
    Registry for managing message bus instances.
    
    This provides a central location for message bus registration and discovery.
    """
    
    _buses = {}
    
    @classmethod
    def register(cls, name: str, bus: MessageBus):
        """Register a message bus instance."""
        cls._buses[name] = bus
    
    @classmethod
    def get(cls, name: str) -> Optional[MessageBus]:
        """Get a registered message bus."""
        return cls._buses.get(name)
    
    @classmethod
    def get_all(cls) -> dict:
        """Get all registered message buses."""
        return cls._buses.copy()
    
    @classmethod
    def clear(cls):
        """Clear all registered message buses."""
        cls._buses.clear()
    
    @classmethod
    def get_names(cls) -> list:
        """Get list of registered message bus names."""
        return list(cls._buses.keys())


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Core
    "MessageBus",
    "MessageBusConfig",
    "MessageBusFactory",
    "MessageBusRegistry",
    
    # Implementations
    "KafkaMessageBus",
    "KafkaProducer",
    "KafkaConsumer",
    "KafkaConfig",
    "RabbitMQMessageBus",
    "RabbitMQProducer",
    "RabbitMQConsumer",
    "RabbitMQConfig",
    "InMemoryMessageBus",
    "InMemoryProducer",
    "InMemoryConsumer",
    
    # Messages
    "Message",
    "Event",
    "Command",
    "Query",
    "MessageType",
    "MessageHeaders",
    "MessageEnvelope",
    
    # Producers and Consumers
    "Producer",
    "EventProducer",
    "CommandProducer",
    "QueryProducer",
    "Consumer",
    "EventConsumer",
    "CommandConsumer",
    "QueryConsumer",
    "ConsumerGroup",
    
    # Handlers
    "MessageHandler",
    "EventHandler",
    "CommandHandler",
    "QueryHandler",
    "HandlerRegistry",
    "HandlerChain",
    
    # Middleware
    "Middleware",
    "LoggingMiddleware",
    "ValidationMiddleware",
    "RetryMiddleware",
    "CircuitBreakerMiddleware",
    "TracingMiddleware",
    
    # Serialization
    "Serializer",
    "JSONSerializer",
    "PickleSerializer",
    "AvroSerializer",
    "ProtobufSerializer",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"