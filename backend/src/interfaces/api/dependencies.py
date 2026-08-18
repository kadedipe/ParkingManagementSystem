# ============================================================================
# API Dependencies
# ============================================================================

"""
Dependency injection functions for API routes.

This module provides dependency injection functions for all services
used in the API routes, following the FastAPI dependency injection pattern.
"""

from typing import Optional, AsyncGenerator
from fastapi import Request, Depends, HTTPException, status
from functools import lru_cache

# Core services
from src.application.services.webhook_service import WebhookService
from src.application.services.vehicle_service import VehicleService
from src.application.services.charging_service import ChargingService
from src.application.services.notification_service import NotificationService
from src.application.services.user_service import UserService
from src.application.services.parking_service import ParkingService
from src.application.services.payment_service import PaymentService
from src.application.services.report_service import ReportService
from src.application.services.auth_service import AuthService

# Infrastructure services
from src.infrastructure.database import DatabaseSession
from src.infrastructure.redis_client import RedisClient
from src.infrastructure.message_bus import MessageBus
from src.infrastructure.email_service import EmailService
from src.infrastructure.sms_service import SMSService
from src.infrastructure.push_notification_service import PushNotificationService
from src.infrastructure.payment_gateway import PaymentGateway
from src.infrastructure.storage_service import StorageService
from src.infrastructure.cache_service import CacheService

# Repositories
from src.infrastructure.repositories.webhook_repository import WebhookRepository
from src.infrastructure.repositories.vehicle_repository import VehicleRepository
from src.infrastructure.repositories.charging_repository import ChargingRepository
from src.infrastructure.repositories.notification_repository import NotificationRepository
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.repositories.parking_repository import ParkingRepository
from src.infrastructure.repositories.payment_repository import PaymentRepository
from src.infrastructure.repositories.report_repository import ReportRepository

# Configuration
from src.config import settings


# ============================================================================
# Database Dependencies
# ============================================================================

async def get_db_session() -> AsyncGenerator[DatabaseSession, None]:
    """
    Get database session.
    
    Yields:
        DatabaseSession: Database session
    """
    session = DatabaseSession()
    try:
        yield session
    finally:
        await session.close()


async def get_redis_client() -> RedisClient:
    """
    Get Redis client.
    
    Returns:
        RedisClient: Redis client instance
    """
    return RedisClient()


async def get_message_bus() -> MessageBus:
    """
    Get message bus.
    
    Returns:
        MessageBus: Message bus instance
    """
    return MessageBus()


async def get_cache_service() -> CacheService:
    """
    Get cache service.
    
    Returns:
        CacheService: Cache service instance
    """
    return CacheService(redis_client=await get_redis_client())


# ============================================================================
# Repository Dependencies
# ============================================================================

async def get_vehicle_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> VehicleRepository:
    """
    Get vehicle repository.
    
    Args:
        db_session: Database session
        
    Returns:
        VehicleRepository: Vehicle repository instance
    """
    return VehicleRepository(db_session)


async def get_user_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> UserRepository:
    """
    Get user repository.
    
    Args:
        db_session: Database session
        
    Returns:
        UserRepository: User repository instance
    """
    return UserRepository(db_session)


async def get_parking_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> ParkingRepository:
    """
    Get parking repository.
    
    Args:
        db_session: Database session
        
    Returns:
        ParkingRepository: Parking repository instance
    """
    return ParkingRepository(db_session)


async def get_charging_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> ChargingRepository:
    """
    Get charging repository.
    
    Args:
        db_session: Database session
        
    Returns:
        ChargingRepository: Charging repository instance
    """
    return ChargingRepository(db_session)


async def get_notification_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> NotificationRepository:
    """
    Get notification repository.
    
    Args:
        db_session: Database session
        
    Returns:
        NotificationRepository: Notification repository instance
    """
    return NotificationRepository(db_session)


async def get_webhook_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> WebhookRepository:
    """
    Get webhook repository.
    
    Args:
        db_session: Database session
        
    Returns:
        WebhookRepository: Webhook repository instance
    """
    return WebhookRepository(db_session)


async def get_payment_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> PaymentRepository:
    """
    Get payment repository.
    
    Args:
        db_session: Database session
        
    Returns:
        PaymentRepository: Payment repository instance
    """
    return PaymentRepository(db_session)


async def get_report_repository(
    db_session: DatabaseSession = Depends(get_db_session),
) -> ReportRepository:
    """
    Get report repository.
    
    Args:
        db_session: Database session
        
    Returns:
        ReportRepository: Report repository instance
    """
    return ReportRepository(db_session)


# ============================================================================
# Infrastructure Service Dependencies
# ============================================================================

async def get_email_service() -> EmailService:
    """
    Get email service.
    
    Returns:
        EmailService: Email service instance
    """
    return EmailService(settings.EMAIL_CONFIG)


async def get_sms_service() -> SMSService:
    """
    Get SMS service.
    
    Returns:
        SMSService: SMS service instance
    """
    return SMSService(settings.SMS_CONFIG)


async def get_push_notification_service() -> PushNotificationService:
    """
    Get push notification service.
    
    Returns:
        PushNotificationService: Push notification service instance
    """
    return PushNotificationService(settings.PUSH_CONFIG)


async def get_payment_gateway() -> PaymentGateway:
    """
    Get payment gateway.
    
    Returns:
        PaymentGateway: Payment gateway instance
    """
    return PaymentGateway(settings.PAYMENT_CONFIG)


async def get_storage_service() -> StorageService:
    """
    Get storage service.
    
    Returns:
        StorageService: Storage service instance
    """
    return StorageService(settings.STORAGE_CONFIG)


# ============================================================================
# Application Service Dependencies
# ============================================================================

async def get_vehicle_service(
    vehicle_repository: VehicleRepository = Depends(get_vehicle_repository),
    cache_service: CacheService = Depends(get_cache_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> VehicleService:
    """
    Get vehicle service.
    
    Args:
        vehicle_repository: Vehicle repository
        cache_service: Cache service
        message_bus: Message bus
        
    Returns:
        VehicleService: Vehicle service instance
    """
    return VehicleService(
        repository=vehicle_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )


async def get_charging_service(
    charging_repository: ChargingRepository = Depends(get_charging_repository),
    vehicle_repository: VehicleRepository = Depends(get_vehicle_repository),
    parking_repository: ParkingRepository = Depends(get_parking_repository),
    cache_service: CacheService = Depends(get_cache_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> ChargingService:
    """
    Get charging service.
    
    Args:
        charging_repository: Charging repository
        vehicle_repository: Vehicle repository
        parking_repository: Parking repository
        cache_service: Cache service
        message_bus: Message bus
        
    Returns:
        ChargingService: Charging service instance
    """
    return ChargingService(
        charging_repository=charging_repository,
        vehicle_repository=vehicle_repository,
        parking_repository=parking_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )


async def get_notification_service(
    notification_repository: NotificationRepository = Depends(get_notification_repository),
    user_repository: UserRepository = Depends(get_user_repository),
    email_service: EmailService = Depends(get_email_service),
    sms_service: SMSService = Depends(get_sms_service),
    push_notification_service: PushNotificationService = Depends(get_push_notification_service),
    cache_service: CacheService = Depends(get_cache_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> NotificationService:
    """
    Get notification service.
    
    Args:
        notification_repository: Notification repository
        user_repository: User repository
        email_service: Email service
        sms_service: SMS service
        push_notification_service: Push notification service
        cache_service: Cache service
        message_bus: Message bus
        
    Returns:
        NotificationService: Notification service instance
    """
    return NotificationService(
        notification_repository=notification_repository,
        user_repository=user_repository,
        email_service=email_service,
        sms_service=sms_service,
        push_notification_service=push_notification_service,
        cache_service=cache_service,
        message_bus=message_bus
    )


async def get_webhook_service(
    webhook_repository: WebhookRepository = Depends(get_webhook_repository),
    payment_repository: PaymentRepository = Depends(get_payment_repository),
    payment_gateway: PaymentGateway = Depends(get_payment_gateway),
    message_bus: MessageBus = Depends(get_message_bus),
) -> WebhookService:
    """
    Get webhook service.
    
    Args:
        webhook_repository: Webhook repository
        payment_repository: Payment repository
        payment_gateway: Payment gateway
        message_bus: Message bus
        
    Returns:
        WebhookService: Webhook service instance
    """
    return WebhookService(
        webhook_repository=webhook_repository,
        payment_repository=payment_repository,
        payment_gateway=payment_gateway,
        message_bus=message_bus
    )


async def get_user_service(
    user_repository: UserRepository = Depends(get_user_repository),
    cache_service: CacheService = Depends(get_cache_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> UserService:
    """
    Get user service.
    
    Args:
        user_repository: User repository
        cache_service: Cache service
        message_bus: Message bus
        
    Returns:
        UserService: User service instance
    """
    return UserService(
        repository=user_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )


async def get_parking_service(
    parking_repository: ParkingRepository = Depends(get_parking_repository),
    vehicle_repository: VehicleRepository = Depends(get_vehicle_repository),
    user_repository: UserRepository = Depends(get_user_repository),
    cache_service: CacheService = Depends(get_cache_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> ParkingService:
    """
    Get parking service.
    
    Args:
        parking_repository: Parking repository
        vehicle_repository: Vehicle repository
        user_repository: User repository
        cache_service: Cache service
        message_bus: Message bus
        
    Returns:
        ParkingService: Parking service instance
    """
    return ParkingService(
        parking_repository=parking_repository,
        vehicle_repository=vehicle_repository,
        user_repository=user_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )


async def get_payment_service(
    payment_repository: PaymentRepository = Depends(get_payment_repository),
    parking_repository: ParkingRepository = Depends(get_parking_repository),
    payment_gateway: PaymentGateway = Depends(get_payment_gateway),
    notification_service: NotificationService = Depends(get_notification_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> PaymentService:
    """
    Get payment service.
    
    Args:
        payment_repository: Payment repository
        parking_repository: Parking repository
        payment_gateway: Payment gateway
        notification_service: Notification service
        message_bus: Message bus
        
    Returns:
        PaymentService: Payment service instance
    """
    return PaymentService(
        payment_repository=payment_repository,
        parking_repository=parking_repository,
        payment_gateway=payment_gateway,
        notification_service=notification_service,
        message_bus=message_bus
    )


async def get_report_service(
    report_repository: ReportRepository = Depends(get_report_repository),
    parking_repository: ParkingRepository = Depends(get_parking_repository),
    payment_repository: PaymentRepository = Depends(get_payment_repository),
    charging_repository: ChargingRepository = Depends(get_charging_repository),
    cache_service: CacheService = Depends(get_cache_service),
) -> ReportService:
    """
    Get report service.
    
    Args:
        report_repository: Report repository
        parking_repository: Parking repository
        payment_repository: Payment repository
        charging_repository: Charging repository
        cache_service: Cache service
        
    Returns:
        ReportService: Report service instance
    """
    return ReportService(
        report_repository=report_repository,
        parking_repository=parking_repository,
        payment_repository=payment_repository,
        charging_repository=charging_repository,
        cache_service=cache_service
    )


async def get_auth_service(
    user_repository: UserRepository = Depends(get_user_repository),
    cache_service: CacheService = Depends(get_cache_service),
    message_bus: MessageBus = Depends(get_message_bus),
) -> AuthService:
    """
    Get authentication service.
    
    Args:
        user_repository: User repository
        cache_service: Cache service
        message_bus: Message bus
        
    Returns:
        AuthService: Authentication service instance
    """
    return AuthService(
        user_repository=user_repository,
        cache_service=cache_service,
        message_bus=message_bus,
        jwt_secret=settings.JWT_SECRET,
        jwt_algorithm=settings.JWT_ALGORITHM
    )


# ============================================================================
# Authentication Dependencies
# ============================================================================

async def get_current_user(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    """
    Get current authenticated user.
    
    Args:
        request: HTTP request
        auth_service: Authentication service
        
    Returns:
        dict: Current user data
        
    Raises:
        HTTPException: If user is not authenticated
    """
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Extract token
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = parts[1]
        
        # Validate token and get user
        user = await auth_service.validate_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Get current authenticated admin user.
    
    Args:
        current_user: Current user data
        
    Returns:
        dict: Current admin user data
        
    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


async def get_current_super_admin_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Get current authenticated super admin user.
    
    Args:
        current_user: Current user data
        
    Returns:
        dict: Current super admin user data
        
    Raises:
        HTTPException: If user is not a super admin
    """
    if not current_user.get("is_super_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    return current_user


# ============================================================================
# Optional Dependencies
# ============================================================================

async def get_optional_user(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
) -> Optional[dict]:
    """
    Get current user if authenticated, otherwise return None.
    
    Args:
        request: HTTP request
        auth_service: Authentication service
        
    Returns:
        Optional[dict]: Current user data or None
    """
    try:
        return await get_current_user(request, auth_service)
    except HTTPException:
        return None


# ============================================================================
# Service Factory Dependencies
# ============================================================================

@lru_cache()
def get_settings():
    """
    Get application settings.
    
    Returns:
        Settings: Application settings instance
    """
    return settings


async def get_service_factory(
    settings: settings = Depends(get_settings),
    db_session: DatabaseSession = Depends(get_db_session),
    redis_client: RedisClient = Depends(get_redis_client),
    message_bus: MessageBus = Depends(get_message_bus),
) -> dict:
    """
    Get service factory with all services.
    
    Args:
        settings: Application settings
        db_session: Database session
        redis_client: Redis client
        message_bus: Message bus
        
    Returns:
        dict: Service factory with all services
    """
    # Create repositories
    vehicle_repository = VehicleRepository(db_session)
    user_repository = UserRepository(db_session)
    parking_repository = ParkingRepository(db_session)
    charging_repository = ChargingRepository(db_session)
    notification_repository = NotificationRepository(db_session)
    webhook_repository = WebhookRepository(db_session)
    payment_repository = PaymentRepository(db_session)
    report_repository = ReportRepository(db_session)
    
    # Create infrastructure services
    cache_service = CacheService(redis_client)
    email_service = EmailService(settings.EMAIL_CONFIG)
    sms_service = SMSService(settings.SMS_CONFIG)
    push_notification_service = PushNotificationService(settings.PUSH_CONFIG)
    payment_gateway = PaymentGateway(settings.PAYMENT_CONFIG)
    storage_service = StorageService(settings.STORAGE_CONFIG)
    
    # Create application services
    vehicle_service = VehicleService(
        repository=vehicle_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )
    
    user_service = UserService(
        repository=user_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )
    
    parking_service = ParkingService(
        parking_repository=parking_repository,
        vehicle_repository=vehicle_repository,
        user_repository=user_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )
    
    charging_service = ChargingService(
        charging_repository=charging_repository,
        vehicle_repository=vehicle_repository,
        parking_repository=parking_repository,
        cache_service=cache_service,
        message_bus=message_bus
    )
    
    notification_service = NotificationService(
        notification_repository=notification_repository,
        user_repository=user_repository,
        email_service=email_service,
        sms_service=sms_service,
        push_notification_service=push_notification_service,
        cache_service=cache_service,
        message_bus=message_bus
    )
    
    webhook_service = WebhookService(
        webhook_repository=webhook_repository,
        payment_repository=payment_repository,
        payment_gateway=payment_gateway,
        message_bus=message_bus
    )
    
    payment_service = PaymentService(
        payment_repository=payment_repository,
        parking_repository=parking_repository,
        payment_gateway=payment_gateway,
        notification_service=notification_service,
        message_bus=message_bus
    )
    
    report_service = ReportService(
        report_repository=report_repository,
        parking_repository=parking_repository,
        payment_repository=payment_repository,
        charging_repository=charging_repository,
        cache_service=cache_service
    )
    
    auth_service = AuthService(
        user_repository=user_repository,
        cache_service=cache_service,
        message_bus=message_bus,
        jwt_secret=settings.JWT_SECRET,
        jwt_algorithm=settings.JWT_ALGORITHM
    )
    
    return {
        "vehicle_service": vehicle_service,
        "user_service": user_service,
        "parking_service": parking_service,
        "charging_service": charging_service,
        "notification_service": notification_service,
        "webhook_service": webhook_service,
        "payment_service": payment_service,
        "report_service": report_service,
        "auth_service": auth_service,
        "cache_service": cache_service,
        "email_service": email_service,
        "sms_service": sms_service,
        "push_notification_service": push_notification_service,
        "payment_gateway": payment_gateway,
        "storage_service": storage_service,
        "message_bus": message_bus,
        "settings": settings
    }