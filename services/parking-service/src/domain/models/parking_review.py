from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.core.types import GUID

class ParkingReview(Base):
    __tablename__ = "parking_reviews"
    
    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    parking_lot_id = Column(GUID(), ForeignKey("parking_lots.id"), nullable=False)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parking_lot = relationship("ParkingLot", back_populates="reviews")
    user = relationship("User", back_populates="reviews")