# ============================================================================
# Parking Management System - Infrastructure Package
# ============================================================================

"""
Infrastructure Layer Package.

This package contains all infrastructure implementations including:
- Database connections and repositories
- External service integrations
- Message bus and event handling
- Cache implementations
- File storage
- Email and notification services
- Logging and monitoring
- Configuration management
"""

# ============================================================================
# Database Infrastructure
# ============================================================================

from src.infrastructure.database import (
    # Database clients
    DatabaseClient,
    PostgresClient,
    MongoDBClient,
    RedisClient,
    
    # Connection management
    get_db,
    get_mongodb,
    get_redis,
    close_db_connections,
    
    # Database utilities
    Base,
    SessionLocal,
    engine,
)

# ============================================================================
# Repository Infrastructure
# ============================================================================

from src.infrastructure.repositories import (
    # Base repository
    BaseRepository,
    
    # Domain repositories
    ParkingLotRepository,
    ParkingSlotRepository,
    ParkingTicketRepository,
    VehicleRepository,
    UserRepository,
    ChargingStationRepository,
    ChargingSessionRepository,
    NotificationRepository,
    PaymentRepository,
    
    # Repository factory
    RepositoryFactory,
)

# ============================================================================
# Message Bus Infrastructure
# ============================================================================

from src.infrastructure.message_bus import (
    # Message bus
    MessageBus,
    KafkaMessageBus,
    RabbitMQMessageBus,
    InMemoryMessageBus,
    
    # Producers and consumers
    EventProducer,
    EventConsumer,
    
    # Message types
    Message,
    Event,
    Command,
    Query,
    
    # Handlers
    MessageHandler,
    EventHandler,
    CommandHandler,
    QueryHandler,
)

# ============================================================================
# Cache Infrastructure
# ============================================================================

from src.infrastructure.cache import (
    # Cache client
    CacheClient,
    RedisCache,
    InMemoryCache,
    
    # Cache utilities
    CacheManager,
    CacheDecorator,
    CacheKeyGenerator,
)

# ============================================================================
# Storage Infrastructure
# ============================================================================

from src.infrastructure.storage import (
    # Storage clients
    StorageClient,
    S3Storage,
    LocalStorage,
    
    # File handling
    FileUpload,
    FileDownload,
    FileMetadata,
)

# ============================================================================
# Email Infrastructure
# ============================================================================

from src.infrastructure.email import (
    # Email clients
    EmailClient,
    SMTPEmailClient,
    SendGridEmailClient,
    
    # Email templates
    EmailTemplate,
    EmailRenderer,
    
    # Email utilities
    EmailAttachment,
    EmailRecipient,
)

# ============================================================================
# SMS Infrastructure
# ============================================================================

from src.infrastructure.sms import (
    # SMS clients
    SMSClient,
    TwilioSMSClient,
    
    # SMS utilities
    SMSMessage,
    SMSResponse,
)

# ============================================================================
# Payment Infrastructure
# ============================================================================

from src.infrastructure.payment import (
    # Payment clients
    PaymentClient,
    StripePaymentClient,
    
    # Payment utilities
    PaymentIntent,
    PaymentMethod,
    PaymentWebhook,
)

# ============================================================================
# Logging Infrastructure
# ============================================================================

from src.infrastructure.logging import (
    # Logging setup
    setup_logging,
    get_logger,
    
    # Logging utilities
    Logger,
    LogLevel,
    LogFormatter,
)

# ============================================================================
# Monitoring Infrastructure
# ============================================================================

from src.infrastructure.monitoring import (
    # Monitoring clients
    MonitoringClient,
    SentryClient,
    PrometheusClient,
    
    # Metrics
    Metrics,
    Counter,
    Gauge,
    Histogram,
    Timer,
)

# ============================================================================
# Configuration Infrastructure
# ============================================================================

from src.infrastructure.config import (
    # Configuration
    Config,
    Settings,
    Environment,
    
    # Configuration sources
    EnvConfigSource,
    FileConfigSource,
    DictConfigSource,
)

# ============================================================================
# Unit of Work Infrastructure
# ============================================================================

from src.infrastructure.unit_of_work import (
    # Unit of Work
    UnitOfWork,
    SQLAlchemyUnitOfWork,
    MongoDBUnitOfWork,
    
    # Transaction management
    Transaction,
    TransactionManager,
)

# ============================================================================
# Infrastructure Factory
# ============================================================================

class InfrastructureFactory:
    """
    Factory for creating infrastructure components.
    
    This factory centralizes the creation of infrastructure components
    with proper dependency injection and configuration.
    """
    
    def __init__(self, config: Config):
        """
        Initialize the infrastructure factory.
        
        Args:
            config: Application configuration
        """
        self.config = config
        self._cache = {}
    
    def get_database_client(self) -> DatabaseClient:
        """Get database client."""
        if 'database' not in self._cache:
            self._cache['database'] = PostgresClient(self.config.database)
        return self._cache['database']
    
    def get_redis_client(self) -> RedisClient:
        """Get Redis client."""
        if 'redis' not in self._cache:
            self._cache['redis'] = RedisClient(self.config.redis)
        return self._cache['redis']
    
    def get_message_bus(self) -> MessageBus:
        """Get message bus."""
        if 'message_bus' not in self._cache:
            if self.config.message_bus.type == 'kafka':
                self._cache['message_bus'] = KafkaMessageBus(self.config.message_bus)
            elif self.config.message_bus.type == 'rabbitmq':
                self._cache['message_bus'] = RabbitMQMessageBus(self.config.message_bus)
            else:
                self._cache['message_bus'] = InMemoryMessageBus()
        return self._cache['message_bus']
    
    def get_cache_client(self) -> CacheClient:
        """Get cache client."""
        if 'cache' not in self._cache:
            self._cache['cache'] = RedisCache(self.config.redis)
        return self._cache['cache']
    
    def get_storage_client(self) -> StorageClient:
        """Get storage client."""
        if 'storage' not in self._cache:
            if self.config.storage.type == 's3':
                self._cache['storage'] = S3Storage(self.config.storage)
            else:
                self._cache['storage'] = LocalStorage(self.config.storage)
        return self._cache['storage']
    
    def get_email_client(self) -> EmailClient:
        """Get email client."""
        if 'email' not in self._cache:
            if self.config.email.type == 'sendgrid':
                self._cache['email'] = SendGridEmailClient(self.config.email)
            else:
                self._cache['email'] = SMTPEmailClient(self.config.email)
        return self._cache['email']
    
    def get_payment_client(self) -> PaymentClient:
        """Get payment client."""
        if 'payment' not in self._cache:
            self._cache['payment'] = StripePaymentClient(self.config.payment)
        return self._cache['payment']
    
    def get_monitoring_client(self) -> MonitoringClient:
        """Get monitoring client."""
        if 'monitoring' not in self._cache:
            self._cache['monitoring'] = SentryClient(self.config.monitoring)
        return self._cache['monitoring']
    
    def create_repository_factory(self) -> RepositoryFactory:
        """Create repository factory."""
        return RepositoryFactory(
            database_client=self.get_database_client(),
            cache_client=self.get_cache_client(),
        )
    
    def create_unit_of_work(self) -> UnitOfWork:
        """Create unit of work."""
        return SQLAlchemyUnitOfWork(
            database_client=self.get_database_client(),
        )


# ============================================================================
# Package Exports
# ============================================================================

__all__ = [
    # Database
    "DatabaseClient",
    "PostgresClient",
    "MongoDBClient",
    "RedisClient",
    "get_db",
    "get_mongodb",
    "get_redis",
    "close_db_connections",
    "Base",
    "SessionLocal",
    "engine",
    
    # Repositories
    "BaseRepository",
    "ParkingLotRepository",
    "ParkingSlotRepository",
    "ParkingTicketRepository",
    "VehicleRepository",
    "UserRepository",
    "ChargingStationRepository",
    "ChargingSessionRepository",
    "NotificationRepository",
    "PaymentRepository",
    "RepositoryFactory",
    
    # Message Bus
    "MessageBus",
    "KafkaMessageBus",
    "RabbitMQMessageBus",
    "InMemoryMessageBus",
    "EventProducer",
    "EventConsumer",
    "Message",
    "Event",
    "Command",
    "Query",
    "MessageHandler",
    "EventHandler",
    "CommandHandler",
    "QueryHandler",
    
    # Cache
    "CacheClient",
    "RedisCache",
    "InMemoryCache",
    "CacheManager",
    "CacheDecorator",
    "CacheKeyGenerator",
    
    # Storage
    "StorageClient",
    "S3Storage",
    "LocalStorage",
    "FileUpload",
    "FileDownload",
    "FileMetadata",
    
    # Email
    "EmailClient",
    "SMTPEmailClient",
    "SendGridEmailClient",
    "EmailTemplate",
    "EmailRenderer",
    "EmailAttachment",
    "EmailRecipient",
    
    # SMS
    "SMSClient",
    "TwilioSMSClient",
    "SMSMessage",
    "SMSResponse",
    
    # Payment
    "PaymentClient",
    "StripePaymentClient",
    "PaymentIntent",
    "PaymentMethod",
    "PaymentWebhook",
    
    # Logging
    "setup_logging",
    "get_logger",
    "Logger",
    "LogLevel",
    "LogFormatter",
    
    # Monitoring
    "MonitoringClient",
    "SentryClient",
    "PrometheusClient",
    "Metrics",
    "Counter",
    "Gauge",
    "Histogram",
    "Timer",
    
    # Configuration
    "Config",
    "Settings",
    "Environment",
    "EnvConfigSource",
    "FileConfigSource",
    "DictConfigSource",
    
    # Unit of Work
    "UnitOfWork",
    "SQLAlchemyUnitOfWork",
    "MongoDBUnitOfWork",
    "Transaction",
    "TransactionManager",
    
    # Factory
    "InfrastructureFactory",
]

# ============================================================================
# Version Information
# ============================================================================

__version__ = "1.0.0"
__author__ = "Parking Management Team"