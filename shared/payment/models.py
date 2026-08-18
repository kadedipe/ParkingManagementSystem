from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    CARD = "card"
    PAYPAL = "paypal"
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"

class PaymentIntent(BaseModel):
    id: str
    amount: float
    currency: str = "usd"
    status: PaymentStatus
    client_secret: str
    payment_method_types: list = ["card"]
    metadata: Optional[Dict[str, Any]] = None

class Refund(BaseModel):
    id: str
    payment_intent: str
    amount: float
    currency: str = "usd"
    status: str