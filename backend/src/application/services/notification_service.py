# ============================================================================
# Parking Management System - Notification Service
# ============================================================================

"""
Notification Service - Notification Management Application Logic.

This service handles all notification-related operations including:
- Sending notifications via email, SMS, and push
- Managing notification templates
- User notification preferences
- Notification history and tracking
- Real-time notifications via WebSockets
- Bulk notifications
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
import logging
import json
from pathlib import Path
from string import Template

from src.application.services.base import BaseService
from src.domain.models import Notification, User
from src.domain.enums import NotificationType
from src.domain.events import EventBus
from src.application.dtos.notification_dto import (
    NotificationCreateDTO,
    NotificationResponseDTO,
    NotificationPreferencesDTO,
    SendNotificationDTO,
    BulkNotificationDTO,
)
from src.application.interfaces import INotificationService, IUnitOfWork
from src.infrastructure.repositories import NotificationRepository, UserRepository
from src.infrastructure.message_bus import MessageBus
from src.infrastructure.email import EmailService
from src.infrastructure.sms import SMSService
from src.infrastructure.push import PushNotificationService

logger = logging.getLogger(__name__)


class NotificationService(BaseService, INotificationService):
    """
    Notification service implementing notification management business logic.
    
    This service handles:
    - Sending notifications via multiple channels
    - Managing notification templates
    - User notification preferences
    - Notification history and tracking
    - Real-time notifications via WebSockets
    - Bulk notifications
    """

    # Notification templates directory
    TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates" / "notifications"
    
    # Default notification channels
    DEFAULT_CHANNELS = ["email", "push"]
    
    # Supported notification types
    SUPPORTED_TYPES = [
        "booking_confirmed",
        "booking_reminder",
        "parking_alert",
        "charging_started",
        "charging_completed",
        "payment_success",
        "payment_failed",
        "system",
    ]

    def __init__(
        self,
        notification_repository: NotificationRepository,
        user_repository: UserRepository,
        email_service: EmailService,
        sms_service: SMSService,
        push_service: PushNotificationService,
        message_bus: MessageBus,
        event_bus: EventBus,
        uow: IUnitOfWork,
    ):
        """
        Initialize the notification service.
        
        Args:
            notification_repository: Repository for notifications
            user_repository: Repository for users
            email_service: Email service for sending emails
            sms_service: SMS service for sending text messages
            push_service: Push notification service
            message_bus: Message bus for async communication
            event_bus: Event bus for publishing domain events
            uow: Unit of work for transaction management
        """
        super().__init__()
        self.notification_repo = notification_repository
        self.user_repo = user_repository
        self.email_service = email_service
        self.sms_service = sms_service
        self.push_service = push_service
        self.message_bus = message_bus
        self.event_bus = event_bus
        self.uow = uow

    # ==========================================================================
    # Send Notifications
    # ==========================================================================

    async def send_notification(
        self,
        data: SendNotificationDTO,
    ) -> NotificationResponseDTO:
        """
        Send a notification to a user.
        
        Args:
            data: Send notification data
            
        Returns:
            NotificationResponseDTO: Created notification
            
        Raises:
            ValueError: If validation fails
        """
        try:
            # Validate input
            self._validate_notification_data(data)
            
            # Get user
            user = await self.user_repo.get_user(data.user_id)
            if not user:
                raise ValueError(f"User {data.user_id} not found")
            
            # Check user preferences
            preferences = await self._get_user_preferences(user.id)
            if not self._should_send_notification(data.type, preferences):
                logger.info(f"Notification {data.type} skipped for user {user.id} due to preferences")
                return None
            
            # Create notification record
            notification = Notification(
                user_id=user.id,
                type=data.type,
                title=data.title,
                message=data.message,
                data=data.data or {},
            )
            
            # Save notification
            async with self.uow:
                saved_notification = await self.notification_repo.save_notification(notification)
            
            # Send via channels
            channels = data.channels or self.DEFAULT_CHANNELS
            send_results = await self._send_via_channels(
                user,
                notification,
                channels,
            )
            
            # Publish event
            await self._publish_notification_sent_event(saved_notification)
            
            logger.info(f"Notification sent to user {user.id}: {data.type}")
            return NotificationResponseDTO.from_entity(saved_notification, send_results)
            
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            raise

    def _validate_notification_data(self, data: SendNotificationDTO) -> None:
        """Validate notification data."""
        if not data.user_id:
            raise ValueError("User ID cannot be empty")
        
        if not data.type:
            raise ValueError("Notification type cannot be empty")
        
        if data.type not in self.SUPPORTED_TYPES:
            raise ValueError(f"Unsupported notification type: {data.type}")
        
        if not data.title:
            raise ValueError("Notification title cannot be empty")
        
        if not data.message:
            raise ValueError("Notification message cannot be empty")

    async def _get_user_preferences(self, user_id: UUID) -> Dict[str, Any]:
        """Get user notification preferences."""
        preferences = await self.notification_repo.get_user_preferences(user_id)
        if not preferences:
            # Default preferences
            return {
                "enabled": True,
                "channels": {
                    "email": True,
                    "sms": False,
                    "push": True,
                },
                "types": {t: True for t in self.SUPPORTED_TYPES},
            }
        return preferences

    def _should_send_notification(
        self,
        notification_type: str,
        preferences: Dict[str, Any],
    ) -> bool:
        """Check if notification should be sent based on preferences."""
        if not preferences.get("enabled", True):
            return False
        
        type_prefs = preferences.get("types", {})
        if not type_prefs.get(notification_type, True):
            return False
        
        return True

    async def _send_via_channels(
        self,
        user: User,
        notification: Notification,
        channels: List[str],
    ) -> Dict[str, Any]:
        """Send notification via specified channels."""
        results = {}
        
        for channel in channels:
            try:
                if channel == "email" and user.email:
                    results["email"] = await self._send_email(user, notification)
                elif channel == "sms" and user.phone:
                    results["sms"] = await self._send_sms(user, notification)
                elif channel == "push":
                    results["push"] = await self._send_push(user, notification)
                else:
                    logger.warning(f"Unknown channel: {channel}")
            except Exception as e:
                logger.error(f"Failed to send via {channel}: {e}")
                results[channel] = {"success": False, "error": str(e)}
        
        return results

    async def _send_email(self, user: User, notification: Notification) -> Dict[str, Any]:
        """Send email notification."""
        try:
            # Get email template
            template = await self._get_template(notification.type, "email")
            if template:
                content = self._render_template(template, {
                    "user": user,
                    "notification": notification,
                })
            else:
                content = notification.message
            
            # Send email
            result = await self.email_service.send(
                to=user.email,
                subject=notification.title,
                body=content,
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return {"success": False, "error": str(e)}

    async def _send_sms(self, user: User, notification: Notification) -> Dict[str, Any]:
        """Send SMS notification."""
        try:
            # Get SMS template
            template = await self._get_template(notification.type, "sms")
            if template:
                content = self._render_template(template, {
                    "user": user,
                    "notification": notification,
                })
            else:
                # Truncate long messages
                content = notification.message[:160]
            
            # Send SMS
            result = await self.sms_service.send(
                to=user.phone,
                message=content,
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"SMS sending failed: {e}")
            return {"success": False, "error": str(e)}

    async def _send_push(self, user: User, notification: Notification) -> Dict[str, Any]:
        """Send push notification."""
        try:
            # Get push token
            push_token = await self.notification_repo.get_push_token(user.id)
            if not push_token:
                return {"success": False, "error": "No push token found"}
            
            # Send push notification
            result = await self.push_service.send(
                token=push_token,
                title=notification.title,
                body=notification.message,
                data=notification.data,
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Push notification sending failed: {e}")
            return {"success": False, "error": str(e)}

    async def _get_template(self, notification_type: str, channel: str) -> Optional[str]:
        """Get notification template."""
        template_path = self.TEMPLATES_DIR / f"{notification_type}.{channel}.txt"
        if template_path.exists():
            with open(template_path, "r") as f:
                return f.read()
        
        # Try default template
        default_path = self.TEMPLATES_DIR / f"default.{channel}.txt"
        if default_path.exists():
            with open(default_path, "r") as f:
                return f.read()
        
        return None

    def _render_template(self, template: str, context: Dict[str, Any]) -> str:
        """Render template with context."""
        try:
            return Template(template).safe_substitute(**context)
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            return template

    async def _publish_notification_sent_event(self, notification: Notification) -> None:
        """Publish notification sent event."""
        event = {
            "type": "notification.sent",
            "data": {
                "notification_id": str(notification.id),
                "user_id": str(notification.user_id),
                "type": notification.type,
                "title": notification.title,
                "timestamp": datetime.now().isoformat(),
            },
        }
        await self.message_bus.publish("notification.events", event)

    # ==========================================================================
    # Bulk Notifications
    # ==========================================================================

    async def send_bulk_notification(
        self,
        data: BulkNotificationDTO,
    ) -> Dict[str, Any]:
        """
        Send bulk notifications to multiple users.
        
        Args:
            data: Bulk notification data
            
        Returns:
            Dict[str, Any]: Bulk operation results
        """
        results = {
            "total": 0,
            "success": 0,
            "failed": 0,
            "details": [],
        }
        
        # Get users based on criteria
        users = await self._get_users_for_bulk(data)
        
        for user in users:
            try:
                notification_data = SendNotificationDTO(
                    user_id=user.id,
                    type=data.type,
                    title=data.title,
                    message=self._render_template(data.message_template, {"user": user}),
                    data=data.data,
                    channels=data.channels,
                )
                notification = await self.send_notification(notification_data)
                results["success"] += 1
                results["details"].append({
                    "user_id": str(user.id),
                    "email": user.email,
                    "success": True,
                })
            except Exception as e:
                logger.error(f"Bulk notification failed for user {user.id}: {e}")
                results["failed"] += 1
                results["details"].append({
                    "user_id": str(user.id),
                    "email": user.email,
                    "success": False,
                    "error": str(e),
                })
            
            results["total"] += 1
        
        logger.info(f"Bulk notification complete: {results['success']} success, {results['failed']} failed")
        return results

    async def _get_users_for_bulk(self, data: BulkNotificationDTO) -> List[User]:
        """Get users for bulk notification based on criteria."""
        if data.user_ids:
            return await self.user_repo.get_users_by_ids(data.user_ids)
        
        if data.role:
            return await self.user_repo.get_users_by_role(data.role)
        
        if data.is_active is not None:
            return await self.user_repo.get_active_users(data.is_active)
        
        # Default: all active users
        return await self.user_repo.get_active_users(True)

    # ==========================================================================
    # Notification Management
    # ==========================================================================

    async def get_notification(
        self,
        notification_id: UUID,
    ) -> Optional[NotificationResponseDTO]:
        """
        Get a notification by ID.
        
        Args:
            notification_id: Notification ID
            
        Returns:
            Optional[NotificationResponseDTO]: Notification details if found
        """
        notification = await self.notification_repo.get_notification(notification_id)
        if not notification:
            return None
        return NotificationResponseDTO.from_entity(notification)

    async def get_user_notifications(
        self,
        user_id: UUID,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[NotificationResponseDTO]:
        """
        Get notifications for a user.
        
        Args:
            user_id: User ID
            unread_only: If True, only return unread notifications
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip
            
        Returns:
            List[NotificationResponseDTO]: List of notifications
        """
        notifications = await self.notification_repo.get_user_notifications(
            user_id,
            unread_only=unread_only,
            limit=limit,
            offset=offset,
        )
        return [NotificationResponseDTO.from_entity(n) for n in notifications]

    async def mark_notification_read(
        self,
        notification_id: UUID,
    ) -> bool:
        """
        Mark a notification as read.
        
        Args:
            notification_id: Notification ID
            
        Returns:
            bool: True if marked as read successfully
        """
        async with self.uow:
            success = await self.notification_repo.mark_as_read(notification_id)
        
        if success:
            logger.info(f"Notification marked as read: {notification_id}")
        return success

    async def mark_all_notifications_read(
        self,
        user_id: UUID,
    ) -> int:
        """
        Mark all notifications as read for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            int: Number of notifications marked as read
        """
        async with self.uow:
            count = await self.notification_repo.mark_all_as_read(user_id)
        
        logger.info(f"Marked {count} notifications as read for user {user_id}")
        return count

    async def delete_notification(
        self,
        notification_id: UUID,
    ) -> bool:
        """
        Delete a notification.
        
        Args:
            notification_id: Notification ID
            
        Returns:
            bool: True if deleted successfully
        """
        async with self.uow:
            success = await self.notification_repo.delete_notification(notification_id)
        
        if success:
            logger.info(f"Notification deleted: {notification_id}")
        return success

    async def delete_all_notifications(
        self,
        user_id: UUID,
    ) -> int:
        """
        Delete all notifications for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            int: Number of notifications deleted
        """
        async with self.uow:
            count = await self.notification_repo.delete_all_notifications(user_id)
        
        logger.info(f"Deleted {count} notifications for user {user_id}")
        return count

    # ==========================================================================
    # Notification Preferences
    # ==========================================================================

    async def get_notification_preferences(
        self,
        user_id: UUID,
    ) -> NotificationPreferencesDTO:
        """
        Get user notification preferences.
        
        Args:
            user_id: User ID
            
        Returns:
            NotificationPreferencesDTO: User notification preferences
        """
        preferences = await self.notification_repo.get_user_preferences(user_id)
        if not preferences:
            # Default preferences
            return NotificationPreferencesDTO(
                user_id=user_id,
                enabled=True,
                channels={"email": True, "sms": False, "push": True},
                types={t: True for t in self.SUPPORTED_TYPES},
            )
        
        return NotificationPreferencesDTO(
            user_id=user_id,
            enabled=preferences.get("enabled", True),
            channels=preferences.get("channels", {}),
            types=preferences.get("types", {}),
        )

    async def update_notification_preferences(
        self,
        user_id: UUID,
        preferences: NotificationPreferencesDTO,
    ) -> NotificationPreferencesDTO:
        """
        Update user notification preferences.
        
        Args:
            user_id: User ID
            preferences: Updated preferences
            
        Returns:
            NotificationPreferencesDTO: Updated preferences
        """
        async with self.uow:
            updated = await self.notification_repo.update_user_preferences(
                user_id,
                preferences.dict(),
            )
        
        logger.info(f"Notification preferences updated for user {user_id}")
        return NotificationPreferencesDTO(
            user_id=user_id,
            enabled=updated.get("enabled", True),
            channels=updated.get("channels", {}),
            types=updated.get("types", {}),
        )

    async def get_unread_count(
        self,
        user_id: UUID,
    ) -> int:
        """
        Get unread notification count for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            int: Number of unread notifications
        """
        return await self.notification_repo.get_unread_count(user_id)

    # ==========================================================================
    # Push Notification Registration
    # ==========================================================================

    async def register_push_token(
        self,
        user_id: UUID,
        token: str,
        device_id: Optional[str] = None,
        platform: Optional[str] = None,
    ) -> bool:
        """
        Register a push notification token for a user.
        
        Args:
            user_id: User ID
            token: Push notification token
            device_id: Optional device ID
            platform: Optional platform (iOS, Android, Web)
            
        Returns:
            bool: True if registered successfully
        """
        try:
            async with self.uow:
                await self.notification_repo.register_push_token(
                    user_id=user_id,
                    token=token,
                    device_id=device_id,
                    platform=platform,
                )
            
            logger.info(f"Push token registered for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register push token: {e}")
            return False

    async def unregister_push_token(
        self,
        user_id: UUID,
        token: str,
    ) -> bool:
        """
        Unregister a push notification token.
        
        Args:
            user_id: User ID
            token: Push notification token to remove
            
        Returns:
            bool: True if unregistered successfully
        """
        try:
            async with self.uow:
                await self.notification_repo.unregister_push_token(user_id, token)
            
            logger.info(f"Push token unregistered for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to unregister push token: {e}")
            return False

    # ==========================================================================
    # Health Check
    # ==========================================================================

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check for the notification service.
        
        Returns:
            Dict[str, Any]: Health status
        """
        health = await super().health_check()
        
        # Check database connectivity
        try:
            notification_count = await self.notification_repo.count_all()
            health['notification_count'] = notification_count
            health['database_status'] = 'healthy'
        except Exception as e:
            health['database_status'] = 'unhealthy'
            health['database_error'] = str(e)
        
        # Check email service
        try:
            email_health = await self.email_service.health_check()
            health['email_service'] = email_health
        except Exception as e:
            health['email_service'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Check SMS service
        try:
            sms_health = await self.sms_service.health_check()
            health['sms_service'] = sms_health
        except Exception as e:
            health['sms_service'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Check push service
        try:
            push_health = await self.push_service.health_check()
            health['push_service'] = push_health
        except Exception as e:
            health['push_service'] = {'status': 'unhealthy', 'error': str(e)}
        
        return health