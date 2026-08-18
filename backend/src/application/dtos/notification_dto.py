# ============================================================================
# Notification DTOs - Data Transfer Objects
# ============================================================================

"""
Data Transfer Objects for notification operations.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID


@dataclass
class NotificationCreateDTO:
    """DTO for creating a notification."""
    user_id: UUID
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None


@dataclass
class NotificationResponseDTO:
    """DTO for notification response."""
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    send_results: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_entity(cls, notification, send_results=None):
        """Create DTO from entity."""
        return cls(
            id=notification.id,
            user_id=notification.user_id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            data=getattr(notification, 'data', None),
            read=notification.read,
            read_at=notification.read_at,
            created_at=notification.created_at,
            send_results=send_results or {},
        )


@dataclass
class SendNotificationDTO:
    """DTO for sending a notification."""
    user_id: UUID
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    channels: Optional[List[str]] = None


@dataclass
class BulkNotificationDTO:
    """DTO for bulk notifications."""
    type: str
    title: str
    message_template: str
    user_ids: Optional[List[UUID]] = None
    role: Optional[str] = None
    is_active: Optional[bool] = True
    data: Optional[Dict[str, Any]] = None
    channels: Optional[List[str]] = None


@dataclass
class NotificationPreferencesDTO:
    """DTO for notification preferences."""
    user_id: UUID
    enabled: bool = True
    channels: Dict[str, bool] = field(default_factory=lambda: {
        "email": True,
        "sms": False,
        "push": True,
    })
    types: Dict[str, bool] = field(default_factory=dict)