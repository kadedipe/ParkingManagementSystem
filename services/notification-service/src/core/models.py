from __future__ import annotations
from uuid import UUID,uuid4
from datetime import datetime
from sqlalchemy import Boolean,DateTime,JSON,String,Text,Index
from sqlalchemy.orm import Mapped,mapped_column
from .database import Base,GUID,utcnow

class Notification(Base):
    __tablename__="notifications"
    __table_args__=(Index("ix_notifications_user_created","user_id","created_at"),)
    id:Mapped[UUID]=mapped_column(GUID(),primary_key=True,default=uuid4)
    user_id:Mapped[UUID]=mapped_column(GUID(),nullable=False,index=True)
    type:Mapped[str]=mapped_column(String(50),default="general",nullable=False)
    title:Mapped[str]=mapped_column(String(255),nullable=False)
    message:Mapped[str]=mapped_column(Text,nullable=False)
    data:Mapped[dict|None]=mapped_column(JSON,nullable=True)
    channels:Mapped[list|None]=mapped_column(JSON,nullable=True)
    priority:Mapped[str]=mapped_column(String(20),default="normal",nullable=False)
    status:Mapped[str]=mapped_column(String(20),default="pending",nullable=False)
    is_read:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
    read_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    sent_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=utcnow,nullable=False)

class NotificationPreference(Base):
    __tablename__="notification_preferences"
    user_id:Mapped[UUID]=mapped_column(GUID(),primary_key=True)
    email_enabled:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    push_enabled:Mapped[bool]=mapped_column(Boolean,default=True,nullable=False)
    sms_enabled:Mapped[bool]=mapped_column(Boolean,default=False,nullable=False)
