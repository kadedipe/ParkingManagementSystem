from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship

from src.core.database import Base

class ConnectorStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    OUT_OF_ORDER = "out_of_order"

class ConnectorType(str, Enum):
    TYPE_1 = "type_1"
    TYPE_2 = "type_2"
    CCS = "ccs"
    CHADEMO = "chademo"
    TESLA = "tesla"
    GB_T = "gb_t"

class Connector(Base):
    __tablename__ = "connectors"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    station_id = Column(String(36), ForeignKey("charging_stations.id"), nullable=False)
    connector_number = Column(String(20), nullable=False)
    connector_type = Column(SQLEnum(ConnectorType), nullable=False)
    status = Column(SQLEnum(ConnectorStatus), nullable=False, default=ConnectorStatus.AVAILABLE)
    max_power_kw = Column(Float, nullable=False)
    voltage = Column(Integer, nullable=True)
    amperage = Column(Integer, nullable=True)
    price_per_kwh = Column(Float, nullable=True)
    price_per_minute = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    last_maintenance = Column(DateTime, nullable=True)
    next_maintenance = Column(DateTime, nullable=True)
    current_session_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    station = relationship("ChargingStation", back_populates="connectors")
    sessions = relationship("ChargingSession", back_populates="connector")
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self.id),
            "station_id": str(self.station_id),
            "connector_number": self.connector_number,
            "connector_type": self.connector_type.value if self.connector_type else None,
            "status": self.status.value if self.status else None,
            "max_power_kw": self.max_power_kw,
            "voltage": self.voltage,
            "amperage": self.amperage,
            "price_per_kwh": self.price_per_kwh,
            "price_per_minute": self.price_per_minute,
            "is_active": self.is_active,
            "last_maintenance": self.last_maintenance.isoformat() if self.last_maintenance else None,
            "next_maintenance": self.next_maintenance.isoformat() if self.next_maintenance else None,
            "current_session_id": str(self.current_session_id) if self.current_session_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }