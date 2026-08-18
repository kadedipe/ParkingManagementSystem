# ============================================================================
# DTOs - Data Transfer Objects
# ============================================================================

# parking-management-system/services/parking-service/src/application/dtos.py

from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, validator
from enum import Enum

from src.domain.value_objects import Address, Location, OperatingHours, Money

# ============================================================================
# Enums
# ============================================================================

class ParkingLotType(str, Enum):
    STANDARD = "standard"
    PREMIUM = "premium"
    VALET = "valet"
    EV_CHARGING = "ev_charging"
    MULTI_LEVEL = "multi_level"

class ParkingLotStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    CLOSED = "closed"

class ParkingSpotType(str, Enum):
    STANDARD = "standard"
    COMPACT = "compact"
    HANDICAP = "handicap"
    EV_CHARGING = "ev_charging"
    PREMIUM = "premium"
    VALET = "valet"
    MOTORCYCLE = "motorcycle"
    LARGE = "large"

class ParkingSpotStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"

# ============================================================================
# Parking Lot DTOs
# ============================================================================

class ParkingLotCreateDTO(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    type: ParkingLotType = ParkingLotType.STANDARD
    address: Address
    location: Location
    total_spots: int = Field(..., gt=0)
    base_price_per_hour: Decimal = Field(..., gt=0)
    base_price_per_day: Optional[Decimal] = None
    base_price_per_month: Optional[Decimal] = None
    amenities: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    operating_hours: Optional[OperatingHours] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    spot_type: Optional[ParkingSpotType] = ParkingSpotType.STANDARD
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v),
            Address: lambda v: v.to_dict(),
            Location: lambda v: v.to_dict(),
            OperatingHours: lambda v: v.to_dict(),
        }

class ParkingLotUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    type: Optional[ParkingLotType] = None
    address: Optional[Address] = None
    location: Optional[Location] = None
    base_price_per_hour: Optional[Decimal] = None
    base_price_per_day: Optional[Decimal] = None
    base_price_per_month: Optional[Decimal] = None
    amenities: Optional[List[str]] = None
    features: Optional[List[str]] = None
    operating_hours: Optional[OperatingHours] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    status: Optional[ParkingLotStatus] = None
    
    class Config:
        json_encoders = {
            Decimal: lambda v: float(v),
            Address: lambda v: v.to_dict(),
            Location: lambda v: v.to_dict(),
            OperatingHours: lambda v: v.to_dict(),
        }

class ParkingLotResponseDTO(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    type: ParkingLotType
    status: ParkingLotStatus
    address: Dict[str, Any]
    location: Dict[str, Any]
    total_spots: int
    available_spots: int
    reserved_spots: int
    base_price_per_hour: float
    base_price_per_day: Optional[float]
    base_price_per_month: Optional[float]
    amenities: List[str]
    features: List[str]
    operating_hours: Optional[Dict[str, Any]]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    rating: float
    review_count: int
    images: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }

# ============================================================================
# Parking Spot DTOs
# ============================================================================

class ParkingSpotCreateDTO(BaseModel):
    number: str = Field(..., min_length=1, max_length=20)
    level: int = Field(1, ge=0)
    type: ParkingSpotType = ParkingSpotType.STANDARD
    width: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    is_covered: bool = False
    is_handicap: bool = False
    is_ev_charging: bool = False
    connector_type: Optional[str] = None
    charging_power: Optional[int] = None
    charging_price: Optional[float] = None

class ParkingSpotUpdateDTO(BaseModel):
    number: Optional[str] = Field(None, min_length=1, max_length=20)
    level: Optional[int] = Field(None, ge=0)
    type: Optional[ParkingSpotType] = None
    status: Optional[ParkingSpotStatus] = None
    width: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    is_covered: Optional[bool] = None
    is_handicap: Optional[bool] = None
    is_ev_charging: Optional[bool] = None
    connector_type: Optional[str] = None
    charging_power: Optional[int] = None
    charging_price: Optional[float] = None

class ParkingSpotResponseDTO(BaseModel):
    id: UUID
    parking_lot_id: UUID
    number: str
    level: int
    type: ParkingSpotType
    status: ParkingSpotStatus
    width: Optional[float]
    length: Optional[float]
    height: Optional[float]
    is_covered: bool
    is_handicap: bool
    is_ev_charging: bool
    connector_type: Optional[str]
    charging_power: Optional[int]
    charging_price: Optional[float]
    vehicle_id: Optional[UUID]
    vehicle_plate: Optional[str]
    reserved_until: Optional[datetime]
    occupied_since: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }

# ============================================================================
# Availability DTOs
# ============================================================================

class AvailabilityRequestDTO(BaseModel):
    parking_lot_id: UUID
    vehicle_id: UUID
    start_time: datetime
    end_time: datetime
    spot_type: Optional[ParkingSpotType] = None
    
    @validator('end_time')
    def validate_time_range(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

class AvailabilityResponseDTO(BaseModel):
    parking_lot_id: UUID
    available_spots: int
    can_park: bool
    reason: Optional[str] = None
    spots: List[ParkingSpotResponseDTO] = Field(default_factory=list)

# ============================================================================
# Pricing DTOs
# ============================================================================

class PricingRequestDTO(BaseModel):
    parking_lot_id: UUID
    start_time: datetime
    end_time: datetime
    duration_hours: int = Field(..., gt=0)
    spot_type: Optional[ParkingSpotType] = None
    
    @validator('duration_hours')
    def validate_duration(cls, v):
        if v <= 0:
            raise ValueError('Duration must be positive')
        return v

class PricingResponseDTO(BaseModel):
    parking_lot_id: UUID
    total_price: Money
    breakdown: List[Dict[str, Any]]
    currency: str = "USD"
    
    class Config:
        json_encoders = {
            Money: lambda v: v.to_dict(),
        }

# ============================================================================
# Search DTOs
# ============================================================================

class ParkingSearchDTO(BaseModel):
    query: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[float] = Field(None, ge=0, le=50)
    amenities: Optional[List[str]] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_price: Optional[float] = Field(None, ge=0)
    sort_by: Optional[str] = Field(None, regex="^(distance|price|rating|availability)$")
    page: Optional[int] = Field(1, ge=1)
    limit: Optional[int] = Field(10, ge=1, le=100)
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        if v and v not in ['distance', 'price', 'rating', 'availability']:
            raise ValueError(f'Invalid sort_by value: {v}')
        return v