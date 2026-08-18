from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import Column, DateTime, Float, ForeignKey, JSON, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from src.core.database import Base
from src.core.types import GUID


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"
    CASH = "cash"


class Payment(Base):
    __tablename__ = "payments"

    # SQLAlchemy's generic Uuid is portable across PostgreSQL and SQLite.
    id = Column(GUID(), primary_key=True, nullable=False, default=uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    reservation_id = Column(
        GUID(),
        ForeignKey("reservations.id"),
        nullable=False,
        unique=True,
    )
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(
        SQLEnum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.PENDING,
    )
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    additional_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="payments")
    reservation = relationship("Reservation", back_populates="payment")
