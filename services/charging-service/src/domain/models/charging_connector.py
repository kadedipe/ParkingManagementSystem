from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.domain.enums import ConnectorType

class ConnectorStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    OUT_OF_ORDER = "out_of_order"

class ChargingConnector(Base):
    __tablename__ = "charging_connectors"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    station_id = Column(String(36), ForeignKey("charging_stations.id"), nullable=False)
    connector_number = Column(Integer, nullable=False)
    type = Column(SQLEnum(ConnectorType), nullable=False)
    max_power = Column(Float, nullable=False)
    status = Column(String(20), default="available")
    
    # Current session
    vehicle_id = Column(String(36), nullable=True)
    occupied_since = Column(DateTime, nullable=True)
    reserved_until = Column(DateTime, nullable=True)
    
    # Technical details
    voltage = Column(Integer, nullable=True)
    amperage = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Maintenance
    last_maintenance = Column(DateTime, nullable=True)
    next_maintenance = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    station = relationship("ChargingStation", back_populates="connectors")
    sessions = relationship("ChargingSession", back_populates="connector")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "station_id": str(self.station_id),
            "connector_number": self.connector_number,
            "type": self.type.value if self.type else None,
            "max_power": self.max_power,
            "status": self.status,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "occupied_since": self.occupied_since.isoformat() if self.occupied_since else None,
            "reserved_until": self.reserved_until.isoformat() if self.reserved_until else None,
            "voltage": self.voltage,
            "amperage": self.amperage,
            "is_active": self.is_active,
            "last_maintenance": self.last_maintenance.isoformat() if self.last_maintenance else None,
            "next_maintenance": self.next_maintenance.isoformat() if self.next_maintenance else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }