# ============================================================================
# Value Objects - Domain Value Objects
# ============================================================================

# parking-management-system/services/parking-service/src/domain/value_objects.py

from dataclasses import dataclass
from typing import Optional, List
from decimal import Decimal
from datetime import time, datetime

@dataclass
class Address:
    """Address value object"""
    street: str
    city: str
    state: str
    country: str
    postal_code: str
    formatted: Optional[str] = None
    
    def __post_init__(self):
        if not self.formatted:
            self.formatted = f"{self.street}, {self.city}, {self.state} {self.postal_code}, {self.country}"
    
    def to_dict(self) -> dict:
        return {
            "street": self.street,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "postal_code": self.postal_code,
            "formatted": self.formatted,
        }

@dataclass
class Location:
    """Location value object (coordinates)"""
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    
    def to_dict(self) -> dict:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "altitude": self.altitude,
        }
    
    def distance_to(self, other: 'Location') -> float:
        """Calculate distance to another location in kilometers"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in kilometers
        
        lat1, lon1 = radians(self.latitude), radians(self.longitude)
        lat2, lon2 = radians(other.latitude), radians(other.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c

@dataclass
class OperatingHours:
    """Operating hours value object"""
    monday: Optional[tuple] = None
    tuesday: Optional[tuple] = None
    wednesday: Optional[tuple] = None
    thursday: Optional[tuple] = None
    friday: Optional[tuple] = None
    saturday: Optional[tuple] = None
    sunday: Optional[tuple] = None
    
    def to_dict(self) -> dict:
        return {
            "monday": self._format_day(self.monday),
            "tuesday": self._format_day(self.tuesday),
            "wednesday": self._format_day(self.wednesday),
            "thursday": self._format_day(self.thursday),
            "friday": self._format_day(self.friday),
            "saturday": self._format_day(self.saturday),
            "sunday": self._format_day(self.sunday),
        }
    
    def _format_day(self, hours: Optional[tuple]) -> Optional[dict]:
        if not hours:
            return None
        return {
            "open": hours[0].strftime("%H:%M"),
            "close": hours[1].strftime("%H:%M"),
        }
    
    def is_open(self, dt: datetime = None) -> bool:
        """Check if open at given datetime"""
        if dt is None:
            dt = datetime.now()
        
        day_name = dt.strftime("%A").lower()
        day_hours = getattr(self, day_name)
        
        if not day_hours:
            return False
        
        open_time, close_time = day_hours
        current_time = dt.time()
        
        if open_time <= close_time:
            return open_time <= current_time <= close_time
        else:
            # Overnight hours (e.g., 22:00 - 06:00)
            return current_time >= open_time or current_time <= close_time

@dataclass
class Amenities:
    """Amenities value object"""
    ev_charging: bool = False
    security: bool = False
    lighting: bool = False
    covered: bool = False
    valet: bool = False
    handicap_access: bool = False
    restrooms: bool = False
    wifi: bool = False
    cafe: bool = False
    shop: bool = False
    
    def to_list(self) -> List[str]:
        """Convert to list of amenities"""
        amenities = []
        for key, value in self.__dict__.items():
            if value:
                amenities.append(key.replace("_", " "))
        return amenities
    
    def to_dict(self) -> dict:
        return self.__dict__

@dataclass
class PricingRule:
    """Pricing rule value object"""
    id: str
    name: str
    description: Optional[str] = None
    min_hours: int = 0
    max_hours: Optional[int] = None
    price_per_hour: Decimal = Decimal('0.00')
    price_per_day: Optional[Decimal] = None
    price_per_week: Optional[Decimal] = None
    price_per_month: Optional[Decimal] = None
    is_active: bool = True
    priority: int = 0
    
    def calculate_price(self, hours: int) -> Decimal:
        """Calculate price based on hours"""
        if self.price_per_day and hours >= 24:
            days = hours // 24
            remaining_hours = hours % 24
            if self.price_per_week and days >= 7:
                weeks = days // 7
                remaining_days = days % 7
                price = (weeks * self.price_per_week) + (remaining_days * self.price_per_day)
            else:
                price = days * self.price_per_day
            price += remaining_hours * self.price_per_hour
            return price
        return hours * self.price_per_hour
    
    def is_applicable(self, hours: int) -> bool:
        """Check if rule is applicable for given hours"""
        if not self.is_active:
            return False
        if hours < self.min_hours:
            return False
        if self.max_hours and hours > self.max_hours:
            return False
        return True

@dataclass
class Money:
    """Money value object"""
    amount: Decimal
    currency: str = "USD"
    
    def __add__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Cannot add money with different currencies")
        return Money(self.amount + other.amount, self.currency)
    
    def __sub__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Cannot subtract money with different currencies")
        return Money(self.amount - other.amount, self.currency)
    
    def __mul__(self, multiplier: float) -> 'Money':
        return Money(self.amount * Decimal(str(multiplier)), self.currency)
    
    def to_dict(self) -> dict:
        return {
            "amount": float(self.amount),
            "currency": self.currency,
        }

@dataclass
class Rating:
    """Rating value object"""
    average: float = 0.0
    total: int = 0
    distribution: dict = None
    
    def __post_init__(self):
        if self.distribution is None:
            self.distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    def add_rating(self, rating: int) -> None:
        """Add a new rating"""
        if 1 <= rating <= 5:
            self.distribution[rating] = self.distribution.get(rating, 0) + 1
            self.total += 1
            total_sum = sum(stars * count for stars, count in self.distribution.items())
            self.average = total_sum / self.total
    
    def to_dict(self) -> dict:
        return {
            "average": self.average,
            "total": self.total,
            "distribution": self.distribution,
        }