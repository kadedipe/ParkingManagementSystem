# ============================================================================
# Value Objects - Immutable Domain Objects
# ============================================================================

"""
Value objects for the domain layer.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class LicensePlate:
    """Value Object for vehicle license plates."""
    value: str

    def __post_init__(self):
        """Validate license plate format."""
        cleaned = self.value.strip().upper()
        if not cleaned:
            raise ValueError("License plate cannot be empty")
        if len(cleaned) < 3:
            raise ValueError(f"License plate too short: {cleaned}")
        object.__setattr__(self, 'value', cleaned)

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class Location:
    """Value Object for physical locations."""
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    def __post_init__(self):
        """Validate location data."""
        if not self.address:
            raise ValueError("Address cannot be empty")
        if not self.city:
            raise ValueError("City cannot be empty")

    def __str__(self) -> str:
        return f"{self.address}, {self.city}, {self.state} {self.zip_code}"


@dataclass(frozen=True)
class Money:
    """Value Object for money values."""
    amount: float
    currency: str = "USD"

    def __post_init__(self):
        """Validate money."""
        if self.amount < 0:
            raise ValueError(f"Amount cannot be negative: {self.amount}")

    def __add__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError(f"Currency mismatch: {self.currency} vs {other.currency}")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError(f"Currency mismatch: {self.currency} vs {other.currency}")
        if self.amount < other.amount:
            raise ValueError("Insufficient funds")
        return Money(self.amount - other.amount, self.currency)

    def __str__(self) -> str:
        return f"{self.currency} {self.amount:.2f}"


@dataclass(frozen=True)
class Capacity:
    """Value Object for parking capacity."""
    total: int
    ev: int = 0
    disabled: int = 0

    def __post_init__(self):
        """Validate capacity."""
        if self.total < 0:
            raise ValueError(f"Invalid total capacity: {self.total}")
        if self.ev < 0:
            raise ValueError(f"Invalid EV capacity: {self.ev}")
        if self.disabled < 0:
            raise ValueError(f"Invalid disabled capacity: {self.disabled}")
        if self.ev + self.disabled > self.total:
            raise ValueError("EV + Disabled capacity exceeds total")

    @property
    def regular(self) -> int:
        """Get regular (non-EV, non-disabled) capacity."""
        return self.total - self.ev - self.disabled