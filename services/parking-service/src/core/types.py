from __future__ import annotations

from uuid import UUID

from sqlalchemy import CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import TypeDecorator


class GUID(TypeDecorator[UUID]):
    """Portable UUID type: native UUID on PostgreSQL, CHAR(36) on SQLite/tests."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if not isinstance(value, UUID):
            value = UUID(str(value))
        return value if dialect.name == "postgresql" else str(value)

    def process_result_value(self, value, dialect):
        if value is None or isinstance(value, UUID):
            return value
        return UUID(str(value))
