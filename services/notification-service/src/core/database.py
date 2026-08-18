from __future__ import annotations
from datetime import datetime, timezone
from typing import AsyncGenerator
from uuid import UUID
from sqlalchemy import CHAR, DateTime, MetaData
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import TypeDecorator
from .config import settings

class GUID(TypeDecorator[UUID]):
    impl=CHAR; cache_ok=True
    def load_dialect_impl(self,dialect): return dialect.type_descriptor(PG_UUID(as_uuid=True) if dialect.name=="postgresql" else CHAR(36))
    def process_bind_param(self,value,dialect):
        if value is None:return None
        value=value if isinstance(value,UUID) else UUID(str(value)); return value if dialect.name=="postgresql" else str(value)
    def process_result_value(self,value,dialect): return value if value is None or isinstance(value,UUID) else UUID(str(value))

class Base(DeclarativeBase): metadata=MetaData()
engine=create_async_engine(settings.DATABASE_URL,pool_pre_ping=True)
SessionLocal=async_sessionmaker(engine,class_=AsyncSession,expire_on_commit=False)
async def get_db()->AsyncGenerator[AsyncSession,None]:
    async with SessionLocal() as s: yield s
async def init_db():
    from .models import Notification, NotificationPreference
    async with engine.begin() as c: await c.run_sync(Base.metadata.create_all)
async def close_db(): await engine.dispose()
def utcnow(): return datetime.now(timezone.utc)
