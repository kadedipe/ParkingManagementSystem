from datetime import datetime
from uuid import uuid4
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.core.types import GUID

class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    parking_spot_id = Column(GUID(), ForeignKey("parking_spots.id"), nullable=False)
    vehicle_id = Column(GUID(), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(SQLEnum(ReservationStatus), default=ReservationStatus.PENDING)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reservations")
    parking_spot = relationship("ParkingSpot", back_populates="reservations")
    payment = relationship("Payment", back_populates="reservation", uselist=False)