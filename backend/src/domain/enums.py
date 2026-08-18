# ============================================================================
# Enums - Domain Enumerations
# ============================================================================

"""
Domain enumerations for the Parking Management System.
"""

from enum import Enum, auto


class VehicleType(str, Enum):
    """Types of vehicles."""
    CAR = "car"
    TRUCK = "truck"
    MOTORCYCLE = "motorcycle"
    BUS = "bus"
    BICYCLE = "bicycle"


class PowerSource(str, Enum):
    """Power source for vehicles."""
    GASOLINE = "gasoline"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    HYBRID = "hybrid"


class SlotType(str, Enum):
    """Types of parking slots."""
    REGULAR = "regular"
    EV = "ev"
    DISABLED = "disabled"
    COMPACT = "compact"
    LARGE = "large"


class SlotStatus(str, Enum):
    """Status of a parking slot."""
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"


class BookingStatus(str, Enum):
    """Status of a parking booking."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class ChargingStatus(str, Enum):
    """Status of EV charging."""
    IDLE = "idle"
    CHARGING = "charging"
    COMPLETED = "completed"
    ERROR = "error"
    PAUSED = "paused"


class PaymentStatus(str, Enum):
    """Status of payment."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class NotificationType(str, Enum):
    """Types of notifications."""
    BOOKING_CONFIRMED = "booking_confirmed"
    BOOKING_REMINDER = "booking_reminder"
    PARKING_ALERT = "parking_alert"
    CHARGING_STARTED = "charging_started"
    CHARGING_COMPLETED = "charging_completed"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    SYSTEM = "system"