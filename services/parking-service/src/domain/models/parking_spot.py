from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.core.types import GUID

class ParkingSpotStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"

class ParkingSpotType(str, Enum):
    STANDARD = "standard"
    COMPACT = "compact"
    HANDICAP = "handicap"
    EV_CHARGING = "ev_charging"
    PREMIUM = "premium"
    VALET = "valet"
    MOTORCYCLE = "motorcycle"
    LARGE = "large"

class ParkingSpot(Base):
    __tablename__ = "parking_spots"
    
    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    parking_lot_id = Column(GUID(), ForeignKey("parking_lots.id"), nullable=False)
    number = Column(String(20), nullable=False)
    level = Column(Integer, nullable=False, default=1)
    type = Column(SQLEnum(ParkingSpotType), nullable=False, default=ParkingSpotType.STANDARD)
    status = Column(SQLEnum(ParkingSpotStatus), nullable=False, default=ParkingSpotStatus.AVAILABLE)
    width = Column(Float, nullable=True)
    length = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    is_covered = Column(Boolean, default=False)
    is_handicap = Column(Boolean, default=False)
    is_ev_charging = Column(Boolean, default=False)
    connector_type = Column(String(50), nullable=True)
    charging_power = Column(Integer, nullable=True)
    charging_price = Column(Float, nullable=True)
    vehicle_id = Column(GUID(), nullable=True)
    vehicle_plate = Column(String(20), nullable=True)
    reserved_until = Column(DateTime, nullable=True)
    occupied_since = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parking_lot = relationship("ParkingLot", back_populates="spots")
    reservations = relationship("Reservation", back_populates="parking_spot")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "parking_lot_id": str(self.parking_lot_id),
            "number": self.number,
            "level": self.level,
            "type": self.type.value if self.type else None,
            "status": self.status.value if self.status else None,
            "width": self.width,
            "length": self.length,
            "height": self.height,
            "is_covered": self.is_covered,
            "is_handicap": self.is_handicap,
            "is_ev_charging": self.is_ev_charging,
            "connector_type": self.connector_type,
            "charging_power": self.charging_power,
            "charging_price": self.charging_price,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "vehicle_plate": self.vehicle_plate,
            "reserved_until": self.reserved_until.isoformat() if self.reserved_until else None,
            "occupied_since": self.occupied_since.isoformat() if self.occupied_since else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }