from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Enum as SQLEnum, Text, DECIMAL
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.core.types import GUID

class ParkingLotStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    CLOSED = "closed"

class ParkingLotType(str, Enum):
    STANDARD = "standard"
    PREMIUM = "premium"
    VALET = "valet"
    EV_CHARGING = "ev_charging"
    MULTI_LEVEL = "multi_level"

class ParkingLot(Base):
    __tablename__ = "parking_lots"
    
    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(ParkingLotType), nullable=False, default=ParkingLotType.STANDARD)
    status = Column(SQLEnum(ParkingLotStatus), nullable=False, default=ParkingLotStatus.ACTIVE)
    
    address = Column(JSON, nullable=False)
    location = Column(JSON, nullable=True)
    
    total_spots = Column(Integer, nullable=False, default=0)
    available_spots = Column(Integer, nullable=False, default=0)
    reserved_spots = Column(Integer, nullable=False, default=0)
    
    base_price_per_hour = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    base_price_per_day = Column(DECIMAL(10, 2), nullable=True)
    base_price_per_month = Column(DECIMAL(10, 2), nullable=True)
    
    amenities = Column(JSON, nullable=True)
    features = Column(JSON, nullable=True)
    operating_hours = Column(JSON, nullable=True)
    
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    
    rating = Column(Float, nullable=True)
    review_count = Column(Integer, nullable=True)
    images = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(GUID(), nullable=True)
    updated_by = Column(GUID(), nullable=True)
    
    # Relationships
    spots = relationship("ParkingSpot", back_populates="parking_lot", cascade="all, delete-orphan")
    reviews = relationship("ParkingReview", back_populates="parking_lot", cascade="all, delete-orphan")
    pricing_rules = relationship("PricingRule", back_populates="parking_lot", cascade="all, delete-orphan")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "type": self.type.value if self.type else None,
            "status": self.status.value if self.status else None,
            "address": self.address,
            "location": self.location,
            "total_spots": self.total_spots,
            "available_spots": self.available_spots,
            "reserved_spots": self.reserved_spots,
            "base_price_per_hour": float(self.base_price_per_hour) if self.base_price_per_hour else 0,
            "base_price_per_day": float(self.base_price_per_day) if self.base_price_per_day else None,
            "base_price_per_month": float(self.base_price_per_month) if self.base_price_per_month else None,
            "amenities": self.amenities,
            "features": self.features,
            "operating_hours": self.operating_hours,
            "phone": self.phone,
            "email": self.email,
            "website": self.website,
            "rating": self.rating,
            "review_count": self.review_count,
            "images": self.images,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }