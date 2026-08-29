from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Float, ForeignKey

from src.core.database import Base
from src.core.types import GUID


class ParkingSessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ParkingSession(Base):
    __tablename__ = "parking_sessions"

    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    reservation_id = Column(GUID(), ForeignKey("reservations.id"), nullable=False, index=True)
    parking_spot_id = Column(GUID(), ForeignKey("parking_spots.id"), nullable=False, index=True)
    vehicle_id = Column(GUID(), nullable=True)
    status = Column(
        SQLEnum(ParkingSessionStatus),
        nullable=False,
        default=ParkingSessionStatus.ACTIVE,
        index=True,
    )
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    end_time = Column(DateTime, nullable=True, index=True)
    duration_minutes = Column(Float, nullable=True)
    hourly_rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
