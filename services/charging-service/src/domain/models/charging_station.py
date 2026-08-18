from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship

from src.core.database import Base

class ChargingStationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class ChargingStation(Base):
    __tablename__ = "charging_stations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(ChargingStationStatus), nullable=False, default=ChargingStationStatus.ACTIVE)
    power_level = Column(String(50), nullable=False, default="standard")
    
    address = Column(JSON, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    total_connectors = Column(Integer, nullable=False, default=0)
    available_connectors = Column(Integer, nullable=False, default=0)
    occupied_connectors = Column(Integer, nullable=False, default=0)
    
    price_per_kwh = Column(Float, nullable=False, default=0.50)
    connection_fee = Column(Float, nullable=False, default=1.00)
    
    amenities = Column(JSON, nullable=True)
    operating_hours = Column(JSON, nullable=True)
    
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(36), nullable=True)
    updated_by = Column(String(36), nullable=True)
    
    connectors = relationship("Connector", back_populates="station", cascade="all, delete-orphan")
    sessions = relationship("ChargingSession", back_populates="station")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "status": self.status.value if self.status else None,
            "power_level": self.power_level,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "total_connectors": self.total_connectors,
            "available_connectors": self.available_connectors,
            "occupied_connectors": self.occupied_connectors,
            "price_per_kwh": self.price_per_kwh,
            "connection_fee": self.connection_fee,
            "amenities": self.amenities,
            "operating_hours": self.operating_hours,
            "phone": self.phone,
            "email": self.email,
            "website": self.website,
            "rating": self.rating,
            "review_count": self.review_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }