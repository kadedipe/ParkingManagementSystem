from datetime import datetime
from typing import Optional
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from src.core.database import Base

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING)
    sent_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    extra_data = Column(JSON, nullable=True)  # Renamed from 'metadata' to avoid reserved name
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "type": self.type.value if self.type else None,
            "title": self.title,
            "content": self.content,
            "status": self.status.value if self.status else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "extra_data": self.extra_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }