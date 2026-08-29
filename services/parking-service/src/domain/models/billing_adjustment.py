from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Float, ForeignKey, String

from src.core.database import Base
from src.core.types import GUID


class BillingAdjustmentType(str, Enum):
    OVERAGE = "overage"
    CREDIT = "credit"
    NONE = "none"


class BillingAdjustmentStatus(str, Enum):
    SETTLED = "settled"
    PENDING = "pending"
    FAILED = "failed"


class BillingAdjustment(Base):
    __tablename__ = "billing_adjustments"

    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    reservation_id = Column(GUID(), ForeignKey("reservations.id"), nullable=False, index=True)
    parking_session_id = Column(GUID(), ForeignKey("parking_sessions.id"), nullable=False, unique=True, index=True)
    payment_id = Column(GUID(), ForeignKey("payments.id"), nullable=True, index=True)
    adjustment_type = Column(SQLEnum(BillingAdjustmentType), nullable=False)
    status = Column(SQLEnum(BillingAdjustmentStatus), nullable=False)
    reserved_amount = Column(Float, nullable=False)
    actual_amount = Column(Float, nullable=False)
    adjustment_amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    provider_reference = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    settled_at = Column(DateTime, nullable=True)
