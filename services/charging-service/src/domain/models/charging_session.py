from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.orm import relationship

from src.core.database import Base

class SessionStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    INTERRUPTED = "interrupted"

class ChargingSession(Base):
    __tablename__ = "charging_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    station_id = Column(String(36), ForeignKey("charging_stations.id"), nullable=False)
    connector_id = Column(String(36), ForeignKey("connectors.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    vehicle_id = Column(String(36), nullable=True)
    
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    status = Column(SQLEnum(SessionStatus), nullable=False, default=SessionStatus.PENDING)
    
    energy_consumed_kwh = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    price_per_kwh = Column(Float, nullable=False)
    connection_fee = Column(Float, nullable=False)
    max_power_delivered = Column(Float, nullable=True)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    station = relationship("ChargingStation", back_populates="sessions")
    connector = relationship("Connector", back_populates="sessions")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "station_id": str(self.station_id),
            "connector_id": str(self.connector_id),
            "user_id": str(self.user_id),
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_minutes": self.duration_minutes,
            "status": self.status.value if self.status else None,
            "energy_consumed_kwh": self.energy_consumed_kwh,
            "total_cost": self.total_cost,
            "price_per_kwh": self.price_per_kwh,
            "connection_fee": self.connection_fee,
            "max_power_delivered": self.max_power_delivered,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }