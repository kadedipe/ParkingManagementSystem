from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Float, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base, GUID


def utcnow(): return datetime.now(timezone.utc)

class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (Index("ix_vehicles_user_id", "user_id"), Index("uq_vehicles_user_plate", "user_id", "plate_number", unique=True))

    id: Mapped[UUID] = mapped_column(GUID(), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(GUID(), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    plate_number: Mapped[str] = mapped_column(String(32), nullable=False)
    vin: Mapped[str | None] = mapped_column(String(17), nullable=True, unique=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    make: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_ev: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    battery_capacity: Mapped[float | None] = mapped_column(Float, nullable=True)
    connector_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    max_charging_power: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mileage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
