from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.core.types import GUID

class PricingRule(Base):
    __tablename__ = "pricing_rules"
    
    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    parking_lot_id = Column(GUID(), ForeignKey("parking_lots.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price_per_hour = Column(Float, nullable=False)
    price_per_day = Column(Float, nullable=True)
    price_per_month = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parking_lot = relationship("ParkingLot", back_populates="pricing_rules")