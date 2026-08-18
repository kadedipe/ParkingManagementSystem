# ============================================================================
# Parking Schemas
# ============================================================================

"""
Parking schemas for request/response validation and serialization.

This module contains Pydantic models for all parking-related operations
including parking spots, sessions, reservations, and rates.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, time, timedelta
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field, validator, root_validator, ConfigDict
from pydantic.types import condecimal, conint, constr

from .common import PaginationParams, DateRangeParams, BaseResponse


# ============================================================================
# Enums
# ============================================================================

class ParkingSpotStatus(str, Enum):
    """Parking spot status enum."""
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"


class ParkingSpotType(str, Enum):
    """Parking spot type enum."""
    STANDARD = "standard"
    COMPACT = "compact"
    HANDICAPPED = "handicapped"
    EV_CHARGING = "ev_charging"
    PREMIUM = "premium"
    VALET = "valet"
    RESERVED = "reserved"


class ParkingSessionStatus(str, Enum):
    """Parking session status enum."""
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    EXTENDED = "extended"


class ParkingReservationStatus(str, Enum):
    """Parking reservation status enum."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    NO_SHOW = "no_show"


class ParkingRateType(str, Enum):
    """Parking rate type enum."""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    FLAT = "flat"
    DYNAMIC = "dynamic"


class ParkingAccessLevel(str, Enum):
    """Parking access level enum."""
    PUBLIC = "public"
    RESTRICTED = "restricted"
    PRIVATE = "private"
    EMPLOYEE = "employee"
    VIP = "vip"


# ============================================================================
# Parking Spot Schemas
# ============================================================================

class ParkingSpotBase(BaseModel):
    """Base parking spot schema."""
    
    spot_number: constr(min_length=1, max_length=20) = Field(
        ..., 
        description="Parking spot number or identifier"
    )
    floor: Optional[int] = Field(None, description="Floor number")
    section: Optional[str] = Field(None, max_length=50, description="Section or zone")
    spot_type: ParkingSpotType = Field(
        ..., 
        description="Type of parking spot"
    )
    status: ParkingSpotStatus = Field(
        default=ParkingSpotStatus.AVAILABLE,
        description="Current status of the parking spot"
    )
    access_level: ParkingAccessLevel = Field(
        default=ParkingAccessLevel.PUBLIC,
        description="Access level of the parking spot"
    )
    latitude: Optional[Decimal] = Field(
        None,
        ge=-90, 
        le=90,
        decimal_places=6,
        description="Latitude coordinate"
    )
    longitude: Optional[Decimal] = Field(
        None,
        ge=-180, 
        le=180,
        decimal_places=6,
        description="Longitude coordinate"
    )
    is_covered: bool = Field(False, description="Whether the spot is covered")
    is_handicap_accessible: bool = Field(False, description="Whether the spot is handicap accessible")
    is_ev_charging: bool = Field(False, description="Whether the spot has EV charging")
    has_cctv: bool = Field(False, description="Whether the spot has CCTV coverage")
    dimensions: Optional[Dict[str, float]] = Field(
        None,
        description="Spot dimensions in meters (width, length, height)"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "spot_number": "A-101",
                "floor": 1,
                "section": "North",
                "spot_type": "standard",
                "status": "available",
                "access_level": "public",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "is_covered": True,
                "is_handicap_accessible": False,
                "is_ev_charging": False,
                "has_cctv": True,
                "dimensions": {"width": 2.5, "length": 5.0, "height": 2.5}
            }
        }
    )


class ParkingSpotCreateRequest(ParkingSpotBase):
    """Request schema for creating a parking spot."""
    
    location_id: int = Field(..., description="ID of the parking location")
    created_by: Optional[int] = Field(None, description="ID of the user creating the spot")


class ParkingSpotUpdateRequest(BaseModel):
    """Request schema for updating a parking spot."""
    
    spot_number: Optional[constr(min_length=1, max_length=20)] = Field(
        None, 
        description="Parking spot number or identifier"
    )
    floor: Optional[int] = Field(None, description="Floor number")
    section: Optional[str] = Field(None, max_length=50, description="Section or zone")
    spot_type: Optional[ParkingSpotType] = Field(None, description="Type of parking spot")
    status: Optional[ParkingSpotStatus] = Field(None, description="Current status of the parking spot")
    access_level: Optional[ParkingAccessLevel] = Field(None, description="Access level of the parking spot")
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90, decimal_places=6)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180, decimal_places=6)
    is_covered: Optional[bool] = Field(None, description="Whether the spot is covered")
    is_handicap_accessible: Optional[bool] = Field(None, description="Whether the spot is handicap accessible")
    is_ev_charging: Optional[bool] = Field(None, description="Whether the spot has EV charging")
    has_cctv: Optional[bool] = Field(None, description="Whether the spot has CCTV coverage")
    dimensions: Optional[Dict[str, float]] = Field(None, description="Spot dimensions in meters")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    @validator('dimensions', pre=True)
    def validate_dimensions(cls, v):
        """Validate dimensions."""
        if v is None:
            return v
        required_keys = {'width', 'length'}
        if not all(key in v for key in required_keys):
            raise ValueError('Dimensions must include width and length')
        return v


class ParkingSpotResponse(ParkingSpotBase):
    """Response schema for parking spot data."""
    
    id: int = Field(..., description="Parking spot ID")
    location_id: int = Field(..., description="ID of the parking location")
    location_name: Optional[str] = Field(None, description="Name of the parking location")
    current_session_id: Optional[int] = Field(None, description="ID of the current parking session")
    current_vehicle_id: Optional[int] = Field(None, description="ID of the current vehicle")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[int] = Field(None, description="ID of the user who created the spot")
    
    model_config = ConfigDict(from_attributes=True)


class ParkingSpotListResponse(BaseResponse):
    """Response schema for parking spot list."""
    
    items: List[ParkingSpotResponse] = Field(..., description="List of parking spots")
    total: int = Field(..., description="Total number of items")
    skip: int = Field(0, description="Number of items skipped")
    limit: int = Field(100, description="Number of items returned")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "success",
            "items": [],
            "total": 0,
            "skip": 0,
            "limit": 100
        }
    })


class ParkingSpotSearchRequest(BaseModel):
    """Request schema for searching parking spots."""
    
    location_id: Optional[int] = Field(None, description="Filter by location ID")
    spot_number: Optional[str] = Field(None, description="Search by spot number")
    spot_type: Optional[ParkingSpotType] = Field(None, description="Filter by spot type")
    status: Optional[ParkingSpotStatus] = Field(None, description="Filter by status")
    access_level: Optional[ParkingAccessLevel] = Field(None, description="Filter by access level")
    floor: Optional[int] = Field(None, description="Filter by floor")
    section: Optional[str] = Field(None, description="Filter by section")
    is_covered: Optional[bool] = Field(None, description="Filter by covered status")
    is_handicap_accessible: Optional[bool] = Field(None, description="Filter by handicap accessible")
    is_ev_charging: Optional[bool] = Field(None, description="Filter by EV charging")
    has_cctv: Optional[bool] = Field(None, description="Filter by CCTV coverage")
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90, description="Latitude for proximity search")
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180, description="Longitude for proximity search")
    radius: Optional[float] = Field(None, ge=0, le=100, description="Radius in kilometers for proximity search")
    
    @root_validator
    def validate_proximity(cls, values):
        """Validate proximity search parameters."""
        lat = values.get('latitude')
        lng = values.get('longitude')
        radius = values.get('radius')
        
        if lat is not None and lng is not None and radius is None:
            raise ValueError('radius is required when using latitude and longitude')
        
        if radius is not None and (lat is None or lng is None):
            raise ValueError('latitude and longitude are required when using radius')
        
        return values


class ParkingSpotAvailabilityRequest(BaseModel):
    """Request schema for checking parking spot availability."""
    
    location_id: int = Field(..., description="ID of the parking location")
    spot_type: Optional[ParkingSpotType] = Field(None, description="Filter by spot type")
    access_level: Optional[ParkingAccessLevel] = Field(None, description="Filter by access level")
    start_time: datetime = Field(..., description="Start time of the availability check")
    end_time: datetime = Field(..., description="End time of the availability check")
    
    @validator('end_time')
    def validate_time_range(cls, v, values):
        """Validate time range."""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class ParkingSpotAvailabilityResponse(BaseModel):
    """Response schema for parking spot availability."""
    
    total_spots: int = Field(..., description="Total number of spots")
    available_spots: int = Field(..., description="Number of available spots")
    occupied_spots: int = Field(..., description="Number of occupied spots")
    reserved_spots: int = Field(..., description="Number of reserved spots")
    maintenance_spots: int = Field(..., description="Number of spots in maintenance")
    occupancy_percentage: float = Field(..., description="Occupancy percentage")
    available_spots_list: List[ParkingSpotResponse] = Field(
        default_factory=list,
        description="List of available spots"
    )
    breakdown_by_type: Dict[str, Dict[str, int]] = Field(
        default_factory=dict,
        description="Breakdown of availability by spot type"
    )


# ============================================================================
# Parking Session Schemas
# ============================================================================

class ParkingSessionBase(BaseModel):
    """Base parking session schema."""
    
    vehicle_id: int = Field(..., description="ID of the vehicle")
    spot_id: int = Field(..., description="ID of the parking spot")
    start_time: datetime = Field(..., description="Session start time")
    end_time: Optional[datetime] = Field(None, description="Session end time")
    expected_end_time: Optional[datetime] = Field(None, description="Expected end time")
    status: ParkingSessionStatus = Field(
        default=ParkingSessionStatus.ACTIVE,
        description="Session status"
    )
    rate_id: Optional[int] = Field(None, description="ID of the parking rate")
    total_amount: Optional[Decimal] = Field(
        None,
        max_digits=10,
        decimal_places=2,
        description="Total amount charged"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "vehicle_id": 1,
                "spot_id": 1,
                "start_time": "2024-01-01T10:00:00",
                "expected_end_time": "2024-01-01T12:00:00",
                "rate_id": 1
            }
        }
    )


class ParkingSessionCreateRequest(ParkingSessionBase):
    """Request schema for creating a parking session."""
    
    created_by: Optional[int] = Field(None, description="ID of the user creating the session")


class ParkingSessionStartRequest(BaseModel):
    """Request schema for starting a parking session."""
    
    vehicle_id: int = Field(..., description="ID of the vehicle")
    spot_id: int = Field(..., description="ID of the parking spot")
    start_time: Optional[datetime] = Field(
        None,
        description="Session start time (defaults to now)"
    )
    expected_end_time: Optional[datetime] = Field(
        None,
        description="Expected end time"
    )
    rate_id: Optional[int] = Field(None, description="ID of the parking rate to use")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    @validator('start_time', pre=True)
    def validate_start_time(cls, v):
        """Validate start time."""
        if v is None:
            return datetime.utcnow()
        if v > datetime.utcnow():
            raise ValueError('start_time cannot be in the future')
        return v


class ParkingSessionEndRequest(BaseModel):
    """Request schema for ending a parking session."""
    
    end_time: Optional[datetime] = Field(
        None,
        description="Session end time (defaults to now)"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    @validator('end_time', pre=True)
    def validate_end_time(cls, v):
        """Validate end time."""
        if v is None:
            return datetime.utcnow()
        if v > datetime.utcnow():
            raise ValueError('end_time cannot be in the future')
        return v


class ParkingSessionUpdateRequest(BaseModel):
    """Request schema for updating a parking session."""
    
    vehicle_id: Optional[int] = Field(None, description="ID of the vehicle")
    spot_id: Optional[int] = Field(None, description="ID of the parking spot")
    start_time: Optional[datetime] = Field(None, description="Session start time")
    end_time: Optional[datetime] = Field(None, description="Session end time")
    expected_end_time: Optional[datetime] = Field(None, description="Expected end time")
    status: Optional[ParkingSessionStatus] = Field(None, description="Session status")
    rate_id: Optional[int] = Field(None, description="ID of the parking rate")
    total_amount: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2)
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ParkingSessionResponse(ParkingSessionBase):
    """Response schema for parking session data."""
    
    id: int = Field(..., description="Parking session ID")
    spot_number: Optional[str] = Field(None, description="Parking spot number")
    vehicle_license_plate: Optional[str] = Field(None, description="Vehicle license plate")
    vehicle_make: Optional[str] = Field(None, description="Vehicle make")
    vehicle_model: Optional[str] = Field(None, description="Vehicle model")
    rate_name: Optional[str] = Field(None, description="Rate name")
    duration_minutes: Optional[int] = Field(None, description="Session duration in minutes")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[int] = Field(None, description="ID of the user who created the session")
    
    model_config = ConfigDict(from_attributes=True)


class ParkingSessionListResponse(BaseResponse):
    """Response schema for parking session list."""
    
    items: List[ParkingSessionResponse] = Field(..., description="List of parking sessions")
    total: int = Field(..., description="Total number of items")
    skip: int = Field(0, description="Number of items skipped")
    limit: int = Field(100, description="Number of items returned")


# ============================================================================
# Parking Reservation Schemas
# ============================================================================

class ParkingReservationBase(BaseModel):
    """Base parking reservation schema."""
    
    vehicle_id: int = Field(..., description="ID of the vehicle")
    spot_id: int = Field(..., description="ID of the parking spot")
    user_id: int = Field(..., description="ID of the user making the reservation")
    start_time: datetime = Field(..., description="Reservation start time")
    end_time: datetime = Field(..., description="Reservation end time")
    status: ParkingReservationStatus = Field(
        default=ParkingReservationStatus.PENDING,
        description="Reservation status"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "vehicle_id": 1,
                "spot_id": 1,
                "user_id": 1,
                "start_time": "2024-01-01T10:00:00",
                "end_time": "2024-01-01T12:00:00"
            }
        }
    )


class ParkingReservationCreateRequest(ParkingReservationBase):
    """Request schema for creating a parking reservation."""
    
    created_by: Optional[int] = Field(None, description="ID of the user creating the reservation")
    
    @validator('end_time')
    def validate_end_time(cls, v, values):
        """Validate end time is after start time."""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        
        # Check minimum reservation time (15 minutes)
        if 'start_time' in values:
            min_duration = timedelta(minutes=15)
            if v - values['start_time'] < min_duration:
                raise ValueError('Reservation must be at least 15 minutes')
        
        # Check maximum reservation time (24 hours)
        max_duration = timedelta(hours=24)
        if 'start_time' in values and v - values['start_time'] > max_duration:
            raise ValueError('Reservation cannot exceed 24 hours')
        
        return v


class ParkingReservationUpdateRequest(BaseModel):
    """Request schema for updating a parking reservation."""
    
    vehicle_id: Optional[int] = Field(None, description="ID of the vehicle")
    spot_id: Optional[int] = Field(None, description="ID of the parking spot")
    start_time: Optional[datetime] = Field(None, description="Reservation start time")
    end_time: Optional[datetime] = Field(None, description="Reservation end time")
    status: Optional[ParkingReservationStatus] = Field(None, description="Reservation status")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ParkingReservationResponse(ParkingReservationBase):
    """Response schema for parking reservation data."""
    
    id: int = Field(..., description="Parking reservation ID")
    spot_number: Optional[str] = Field(None, description="Parking spot number")
    vehicle_license_plate: Optional[str] = Field(None, description="Vehicle license plate")
    user_name: Optional[str] = Field(None, description="User name")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[int] = Field(None, description="ID of the user who created the reservation")
    
    model_config = ConfigDict(from_attributes=True)


class ParkingReservationListResponse(BaseResponse):
    """Response schema for parking reservation list."""
    
    items: List[ParkingReservationResponse] = Field(..., description="List of parking reservations")
    total: int = Field(..., description="Total number of items")
    skip: int = Field(0, description="Number of items skipped")
    limit: int = Field(100, description="Number of items returned")


# ============================================================================
# Parking Rate Schemas
# ============================================================================

class ParkingRateBase(BaseModel):
    """Base parking rate schema."""
    
    name: constr(min_length=1, max_length=100) = Field(..., description="Rate name")
    rate_type: ParkingRateType = Field(..., description="Type of rate")
    amount: condecimal(max_digits=10, decimal_places=2) = Field(
        ..., 
        description="Rate amount"
    )
    currency: constr(min_length=3, max_length=3) = Field(
        default="USD",
        description="Currency code (ISO 4217)"
    )
    description: Optional[str] = Field(None, max_length=500, description="Rate description")
    is_active: bool = Field(True, description="Whether the rate is active")
    applies_to_vehicle_types: Optional[List[str]] = Field(
        None,
        description="Vehicle types this rate applies to"
    )
    applies_to_spot_types: Optional[List[ParkingSpotType]] = Field(
        None,
        description="Spot types this rate applies to"
    )
    min_duration: Optional[int] = Field(
        None,
        ge=0,
        description="Minimum duration in minutes"
    )
    max_duration: Optional[int] = Field(
        None,
        ge=0,
        description="Maximum duration in minutes"
    )
    grace_period: int = Field(
        15,
        ge=0,
        description="Grace period in minutes before charges apply"
    )
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Standard Hourly Rate",
                "rate_type": "hourly",
                "amount": 5.00,
                "currency": "USD",
                "description": "Standard hourly parking rate",
                "is_active": True,
                "grace_period": 15
            }
        }
    )


class ParkingRateCreateRequest(ParkingRateBase):
    """Request schema for creating a parking rate."""
    
    created_by: Optional[int] = Field(None, description="ID of the user creating the rate")


class ParkingRateUpdateRequest(BaseModel):
    """Request schema for updating a parking rate."""
    
    name: Optional[constr(min_length=1, max_length=100)] = Field(None, description="Rate name")
    rate_type: Optional[ParkingRateType] = Field(None, description="Type of rate")
    amount: Optional[condecimal(max_digits=10, decimal_places=2)] = Field(None, description="Rate amount")
    currency: Optional[constr(min_length=3, max_length=3)] = Field(None, description="Currency code")
    description: Optional[str] = Field(None, max_length=500, description="Rate description")
    is_active: Optional[bool] = Field(None, description="Whether the rate is active")
    applies_to_vehicle_types: Optional[List[str]] = Field(None, description="Vehicle types this rate applies to")
    applies_to_spot_types: Optional[List[ParkingSpotType]] = Field(None, description="Spot types this rate applies to")
    min_duration: Optional[int] = Field(None, ge=0, description="Minimum duration in minutes")
    max_duration: Optional[int] = Field(None, ge=0, description="Maximum duration in minutes")
    grace_period: Optional[int] = Field(None, ge=0, description="Grace period in minutes")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ParkingRateResponse(ParkingRateBase):
    """Response schema for parking rate data."""
    
    id: int = Field(..., description="Parking rate ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[int] = Field(None, description="ID of the user who created the rate")
    
    model_config = ConfigDict(from_attributes=True)


class ParkingRateListResponse(BaseResponse):
    """Response schema for parking rate list."""
    
    items: List[ParkingRateResponse] = Field(..., description="List of parking rates")
    total: int = Field(..., description="Total number of items")
    skip: int = Field(0, description="Number of items skipped")
    limit: int = Field(100, description="Number of items returned")


# ============================================================================
# Parking Analytics Schemas
# ============================================================================

class ParkingOccupancyAnalytics(BaseModel):
    """Schema for parking occupancy analytics."""
    
    timestamp: datetime = Field(..., description="Analytics timestamp")
    location_id: int = Field(..., description="Location ID")
    total_spots: int = Field(..., description="Total number of spots")
    occupied_spots: int = Field(..., description="Number of occupied spots")
    available_spots: int = Field(..., description="Number of available spots")
    occupancy_rate: float = Field(..., description="Occupancy rate percentage")
    average_duration: Optional[float] = Field(None, description="Average parking duration in minutes")
    peak_hours: Optional[List[int]] = Field(None, description="Peak hours (0-23)")
    busiest_day: Optional[str] = Field(None, description="Busiest day of the week")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "timestamp": "2024-01-01T10:00:00",
            "location_id": 1,
            "total_spots": 100,
            "occupied_spots": 75,
            "available_spots": 25,
            "occupancy_rate": 75.0,
            "average_duration": 120.0,
            "peak_hours": [8, 9, 10, 17, 18],
            "busiest_day": "Monday"
        }
    })


class ParkingRevenueAnalytics(BaseModel):
    """Schema for parking revenue analytics."""
    
    period_start: datetime = Field(..., description="Period start")
    period_end: datetime = Field(..., description="Period end")
    total_revenue: Decimal = Field(..., description="Total revenue")
    total_sessions: int = Field(..., description="Total number of sessions")
    average_revenue_per_session: Decimal = Field(..., description="Average revenue per session")
    revenue_by_day: Dict[str, Decimal] = Field(..., description="Revenue breakdown by day")
    revenue_by_hour: Dict[int, Decimal] = Field(..., description="Revenue breakdown by hour")
    revenue_by_rate_type: Dict[str, Decimal] = Field(..., description="Revenue breakdown by rate type")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "period_start": "2024-01-01T00:00:00",
            "period_end": "2024-01-31T23:59:59",
            "total_revenue": 15000.00,
            "total_sessions": 500,
            "average_revenue_per_session": 30.00,
            "revenue_by_day": {"Monday": 2000.00, "Tuesday": 1800.00},
            "revenue_by_hour": {9: 500.00, 10: 600.00},
            "revenue_by_rate_type": {"hourly": 8000.00, "daily": 7000.00}
        }
    })


class ParkingUtilizationAnalytics(BaseModel):
    """Schema for parking utilization analytics."""
    
    location_id: int = Field(..., description="Location ID")
    period: str = Field(..., description="Analysis period")
    utilization_rate: float = Field(..., description="Overall utilization rate")
    peak_utilization: float = Field(..., description="Peak utilization rate")
    off_peak_utilization: float = Field(..., description="Off-peak utilization rate")
    utilization_by_spot_type: Dict[str, float] = Field(..., description="Utilization by spot type")
    utilization_by_day: Dict[str, float] = Field(..., description="Utilization by day")
    utilization_by_hour: Dict[int, float] = Field(..., description="Utilization by hour")
    recommendations: List[str] = Field(..., description="Optimization recommendations")


# ============================================================================
# Parking Export Schemas
# ============================================================================

class ParkingExportRequest(BaseModel):
    """Request schema for exporting parking data."""
    
    export_type: str = Field(
        ...,
        description="Type of export (sessions, reservations, revenue, etc.)"
    )
    format: str = Field(
        default="csv",
        description="Export format (csv, json, excel, pdf)"
    )
    date_range: DateRangeParams = Field(..., description="Date range for export")
    location_ids: Optional[List[int]] = Field(None, description="Filter by location IDs")
    spot_types: Optional[List[ParkingSpotType]] = Field(None, description="Filter by spot types")
    status: Optional[List[str]] = Field(None, description="Filter by status")
    include_details: bool = Field(False, description="Include detailed information")
    columns: Optional[List[str]] = Field(None, description="Specific columns to include")


class ParkingExportResponse(BaseModel):
    """Response schema for parking export."""
    
    export_id: str = Field(..., description="Export ID")
    status: str = Field(..., description="Export status")
    download_url: Optional[str] = Field(None, description="URL to download the exported file")
    expires_at: Optional[datetime] = Field(None, description="Expiration time of the download URL")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    record_count: Optional[int] = Field(None, description="Number of records exported")
    created_at: datetime = Field(..., description="Creation timestamp")


# ============================================================================
# Parking Dashboard Schemas
# ============================================================================

class ParkingDashboardSummary(BaseModel):
    """Schema for parking dashboard summary."""
    
    total_spots: int = Field(..., description="Total parking spots")
    available_spots: int = Field(..., description="Available spots")
    occupied_spots: int = Field(..., description="Occupied spots")
    reserved_spots: int = Field(..., description="Reserved spots")
    occupancy_rate: float = Field(..., description="Occupancy rate percentage")
    active_sessions: int = Field(..., description="Number of active sessions")
    today_revenue: Decimal = Field(..., description="Today's revenue")
    week_revenue: Decimal = Field(..., description="This week's revenue")
    month_revenue: Decimal = Field(..., description="This month's revenue")
    upcoming_reservations: int = Field(..., description="Number of upcoming reservations")
    spots_by_type: Dict[str, int] = Field(..., description="Spots breakdown by type")
    recent_sessions: List[ParkingSessionResponse] = Field(
        default_factory=list,
        description="Recent parking sessions"
    )
    alerts: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="System alerts"
    )
    timestamp: datetime = Field(..., description="Dashboard timestamp")


# ============================================================================
# Parking Settings Schemas
# ============================================================================

class ParkingSettingsBase(BaseModel):
    """Base parking settings schema."""
    
    location_id: int = Field(..., description="Location ID")
    max_reservation_days: int = Field(30, ge=1, description="Maximum days in advance for reservations")
    min_reservation_minutes: int = Field(15, ge=5, description="Minimum reservation duration in minutes")
    max_reservation_minutes: int = Field(1440, ge=60, description="Maximum reservation duration in minutes")
    default_grace_period: int = Field(15, ge=0, description="Default grace period in minutes")
    allow_overnight_parking: bool = Field(True, description="Allow overnight parking")
    require_license_plate: bool = Field(True, description="Require license plate for parking")
    enable_dynamic_pricing: bool = Field(False, description="Enable dynamic pricing")
    pricing_update_interval: Optional[int] = Field(None, description="Pricing update interval in minutes")
    max_occupancy_threshold: int = Field(90, ge=0, le=100, description="Max occupancy threshold percentage")
    notifications_enabled: bool = Field(True, description="Enable notifications")
    notification_preferences: Dict[str, bool] = Field(default_factory=dict, description="Notification preferences")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "location_id": 1,
            "max_reservation_days": 30,
            "min_reservation_minutes": 15,
            "max_reservation_minutes": 1440,
            "default_grace_period": 15,
            "allow_overnight_parking": True,
            "require_license_plate": True,
            "enable_dynamic_pricing": False,
            "max_occupancy_threshold": 90,
            "notifications_enabled": True
        }
    })


class ParkingSettingsCreateRequest(ParkingSettingsBase):
    """Request schema for creating parking settings."""
    
    created_by: Optional[int] = Field(None, description="ID of the user creating the settings")


class ParkingSettingsUpdateRequest(BaseModel):
    """Request schema for updating parking settings."""
    
    max_reservation_days: Optional[int] = Field(None, ge=1, description="Maximum days in advance for reservations")
    min_reservation_minutes: Optional[int] = Field(None, ge=5, description="Minimum reservation duration in minutes")
    max_reservation_minutes: Optional[int] = Field(None, ge=60, description="Maximum reservation duration in minutes")
    default_grace_period: Optional[int] = Field(None, ge=0, description="Default grace period in minutes")
    allow_overnight_parking: Optional[bool] = Field(None, description="Allow overnight parking")
    require_license_plate: Optional[bool] = Field(None, description="Require license plate for parking")
    enable_dynamic_pricing: Optional[bool] = Field(None, description="Enable dynamic pricing")
    pricing_update_interval: Optional[int] = Field(None, description="Pricing update interval in minutes")
    max_occupancy_threshold: Optional[int] = Field(None, ge=0, le=100, description="Max occupancy threshold percentage")
    notifications_enabled: Optional[bool] = Field(None, description="Enable notifications")
    notification_preferences: Optional[Dict[str, bool]] = Field(None, description="Notification preferences")


class ParkingSettingsResponse(ParkingSettingsBase):
    """Response schema for parking settings."""
    
    id: int = Field(..., description="Settings ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[int] = Field(None, description="ID of the user who created the settings")
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Webhook Schemas for Parking
# ============================================================================

class ParkingWebhookPayload(BaseModel):
    """Schema for parking webhook payload."""
    
    event_type: str = Field(..., description="Type of webhook event")
    event_id: str = Field(..., description="Unique event ID")
    timestamp: datetime = Field(..., description="Event timestamp")
    location_id: int = Field(..., description="Location ID")
    data: Dict[str, Any] = Field(..., description="Event data")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


# ============================================================================
# Parking Search and Filter Schemas
# ============================================================================

class ParkingFilterParams(BaseModel):
    """Schema for parking filter parameters."""
    
    status: Optional[List[ParkingSessionStatus]] = Field(None, description="Filter by session status")
    spot_type: Optional[List[ParkingSpotType]] = Field(None, description="Filter by spot type")
    date_range: Optional[DateRangeParams] = Field(None, description="Date range filter")
    location_ids: Optional[List[int]] = Field(None, description="Filter by location IDs")
    vehicle_ids: Optional[List[int]] = Field(None, description="Filter by vehicle IDs")
    user_ids: Optional[List[int]] = Field(None, description="Filter by user IDs")
    min_amount: Optional[Decimal] = Field(None, ge=0, description="Minimum amount")
    max_amount: Optional[Decimal] = Field(None, ge=0, description="Maximum amount")
    search_term: Optional[str] = Field(None, description="Search term for license plate or spot number")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": ["active", "completed"],
            "date_range": {
                "start_date": "2024-01-01T00:00:00",
                "end_date": "2024-01-31T23:59:59"
            },
            "location_ids": [1, 2],
            "min_amount": 10.00,
            "max_amount": 100.00
        }
    })


# ============================================================================
# Utility Functions
# ============================================================================

def calculate_parking_duration(start_time: datetime, end_time: datetime) -> int:
    """
    Calculate parking duration in minutes.
    
    Args:
        start_time: Session start time
        end_time: Session end time
        
    Returns:
        int: Duration in minutes
    """
    delta = end_time - start_time
    return int(delta.total_seconds() / 60)


def calculate_parking_cost(
    duration_minutes: int,
    rate_amount: Decimal,
    rate_type: ParkingRateType
) -> Decimal:
    """
    Calculate parking cost based on duration and rate.
    
    Args:
        duration_minutes: Duration in minutes
        rate_amount: Rate amount
        rate_type: Type of rate
        
    Returns:
        Decimal: Calculated cost
    """
    if rate_type == ParkingRateType.HOURLY:
        hours = max(1, (duration_minutes + 59) // 60)  # Ceiling to nearest hour
        return rate_amount * hours
    elif rate_type == ParkingRateType.DAILY:
        days = max(1, (duration_minutes + 1439) // 1440)  # Ceiling to nearest day
        return rate_amount * days
    elif rate_type == ParkingRateType.FLAT:
        return rate_amount
    else:
        # Default: hourly
        hours = max(1, (duration_minutes + 59) // 60)
        return rate_amount * hours


def validate_parking_spot_availability(
    spot: ParkingSpotResponse,
    start_time: datetime,
    end_time: datetime,
    existing_sessions: List[ParkingSessionResponse]
) -> bool:
    """
    Validate if a parking spot is available for the given time range.
    
    Args:
        spot: Parking spot to check
        start_time: Requested start time
        end_time: Requested end time
        existing_sessions: Existing sessions for the spot
        
    Returns:
        bool: True if available, False otherwise
    """
    # Check spot status
    if spot.status != ParkingSpotStatus.AVAILABLE:
        return False
    
    # Check for conflicting sessions
    for session in existing_sessions:
        if session.status == ParkingSessionStatus.ACTIVE:
            # Check if time ranges overlap
            if start_time < session.end_time and end_time > session.start_time:
                return False
    
    return True