# ============================================================================
# Vehicle Schemas
# ============================================================================

"""
Vehicle schemas for request/response validation and serialization.

This module contains Pydantic models for all vehicle-related operations
including vehicle management, registration, and status tracking.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from enum import Enum
from pydantic import BaseModel, Field, validator, root_validator, ConfigDict
from pydantic.types import conint, constr, condecimal

from .common import PaginationParams, DateRangeParams, BaseResponse


# ============================================================================
# Enums
# ============================================================================

class VehicleType(str, Enum):
    """Vehicle type enum."""
    SEDAN = "sedan"
    SUV = "suv"
    TRUCK = "truck"
    VAN = "van"
    COUPE = "coupe"
    CONVERTIBLE = "convertible"
    HATCHBACK = "hatchback"
    WAGON = "wagon"
    MINIVAN = "minivan"
    PICKUP = "pickup"
    MOTORCYCLE = "motorcycle"
    EV = "ev"
    HYBRID = "hybrid"
    OTHER = "other"


class VehicleFuelType(str, Enum):
    """Vehicle fuel type enum."""
    GASOLINE = "gasoline"
    DIESEL = "diesel"
    ELECTRIC = "electric"
    HYBRID = "hybrid"
    PLUGIN_HYBRID = "plugin_hybrid"
    HYDROGEN = "hydrogen"
    OTHER = "other"


class VehicleStatus(str, Enum):
    """Vehicle status enum."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"
    MAINTENANCE = "maintenance"
    STOLEN = "stolen"
    IMPOUNDED = "impounded"


class VehicleOwnershipType(str, Enum):
    """Vehicle ownership type enum."""
    OWNED = "owned"
    LEASED = "leased"
    FINANCED = "financed"
    COMPANY = "company"
    RENTAL = "rental"
    OTHER = "other"


class VehicleSize(str, Enum):
    """Vehicle size enum for parking purposes."""
    COMPACT = "compact"
    STANDARD = "standard"
    LARGE = "large"
    EXTRA_LARGE = "extra_large"


class VehicleColor(str, Enum):
    """Vehicle color enum."""
    WHITE = "white"
    BLACK = "black"
    SILVER = "silver"
    GRAY = "gray"
    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    YELLOW = "yellow"
    ORANGE = "orange"
    BROWN = "brown"
    BEIGE = "beige"
    GOLD = "gold"
    PURPLE = "purple"
    PINK = "pink"
    OTHER = "other"


class VehicleTransmissionType(str, Enum):
    """Vehicle transmission type enum."""
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    CVT = "cvt"
    DUAL_CLUTCH = "dual_clutch"
    OTHER = "other"


class VehicleDriveType(str, Enum):
    """Vehicle drive type enum."""
    FWD = "fwd"
    RWD = "rwd"
    AWD = "awd"
    FOUR_WHEEL = "four_wheel"
    OTHER = "other"


# ============================================================================
# Vehicle Schemas
# ============================================================================

class VehicleBase(BaseModel):
    """Base vehicle schema."""
    
    license_plate: constr(min_length=1, max_length=20) = Field(
        ..., 
        description="Vehicle license plate number"
    )
    state: constr(min_length=2, max_length=2) = Field(
        ...,
        description="State or region of registration (ISO code)"
    )
    country: constr(min_length=2, max_length=2) = Field(
        default="US",
        description="Country code (ISO 3166-1 alpha-2)"
    )
    make: constr(min_length=1, max_length=50) = Field(
        ..., 
        description="Vehicle make (manufacturer)"
    )
    model: constr(min_length=1, max_length=50) = Field(
        ..., 
        description="Vehicle model"
    )
    year: conint(ge=1900, le=datetime.now().year + 1) = Field(
        ...,
        description="Vehicle manufacturing year"
    )
    color: VehicleColor = Field(..., description="Vehicle color")
    vehicle_type: VehicleType = Field(..., description="Type of vehicle")
    fuel_type: VehicleFuelType = Field(..., description="Fuel type")
    vehicle_size: VehicleSize = Field(
        default=VehicleSize.STANDARD,
        description="Vehicle size for parking purposes"
    )
    transmission_type: Optional[VehicleTransmissionType] = Field(
        None,
        description="Transmission type"
    )
    drive_type: Optional[VehicleDriveType] = Field(
        None,
        description="Drive type"
    )
    vin: Optional[constr(min_length=17, max_length=17)] = Field(
        None,
        description="Vehicle Identification Number (17 characters)"
    )
    engine_size: Optional[condecimal(max_digits=5, decimal_places=1)] = Field(
        None,
        description="Engine size in liters"
    )
    horsepower: Optional[conint(ge=0)] = Field(None, description="Horsepower")
    weight_kg: Optional[conint(ge=0)] = Field(None, description="Vehicle weight in kilograms")
    height_cm: Optional[conint(ge=0)] = Field(None, description="Vehicle height in centimeters")
    width_cm: Optional[conint(ge=0)] = Field(None, description="Vehicle width in centimeters")
    length_cm: Optional[conint(ge=0)] = Field(None, description="Vehicle length in centimeters")
    number_of_doors: Optional[conint(ge=1, le=5)] = Field(None, description="Number of doors")
    number_of_seats: Optional[conint(ge=1, le=20)] = Field(None, description="Number of seats")
    registration_expiry: Optional[date] = Field(None, description="Registration expiry date")
    insurance_expiry: Optional[date] = Field(None, description="Insurance expiry date")
    inspection_expiry: Optional[date] = Field(None, description="Inspection expiry date")
    ownership_type: VehicleOwnershipType = Field(
        default=VehicleOwnershipType.OWNED,
        description="Type of ownership"
    )
    owner_id: Optional[int] = Field(None, description="ID of the owner")
    additional_owners: Optional[List[int]] = Field(
        None,
        description="Additional owner IDs"
    )
    is_ev_charging_compatible: bool = Field(
        False,
        description="Whether vehicle supports EV charging"
    )
    charging_port_type: Optional[str] = Field(
        None,
        description="Type of charging port (if EV)"
    )
    battery_capacity_kwh: Optional[condecimal(max_digits=6, decimal_places=1)] = Field(
        None,
        description="Battery capacity in kWh (if EV)"
    )
    max_charging_power_kw: Optional[conint(ge=0)] = Field(
        None,
        description="Maximum charging power in kW (if EV)"
    )
    has_permit: bool = Field(False, description="Whether vehicle has a parking permit")
    permit_number: Optional[str] = Field(None, max_length=50, description="Parking permit number")
    permit_expiry: Optional[date] = Field(None, description="Parking permit expiry date")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")
    tags: Optional[List[str]] = Field(None, description="Tags for categorization")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "license_plate": "ABC123",
                "state": "CA",
                "country": "US",
                "make": "Tesla",
                "model": "Model 3",
                "year": 2023,
                "color": "white",
                "vehicle_type": "ev",
                "fuel_type": "electric",
                "vehicle_size": "standard",
                "transmission_type": "automatic",
                "vin": "5YJ3E1EA7PF123456",
                "engine_size": None,
                "horsepower": 283,
                "weight_kg": 1847,
                "height_cm": 144,
                "width_cm": 185,
                "length_cm": 469,
                "number_of_doors": 4,
                "number_of_seats": 5,
                "registration_expiry": "2024-12-31",
                "insurance_expiry": "2024-12-31",
                "ownership_type": "owned",
                "owner_id": 1,
                "is_ev_charging_compatible": True,
                "charging_port_type": "CCS",
                "battery_capacity_kwh": 82.0,
                "max_charging_power_kw": 250,
                "has_permit": True,
                "permit_number": "P12345",
                "permit_expiry": "2025-01-01",
                "notes": "Owner's primary vehicle"
            }
        }
    )
    
    @validator('vin')
    def validate_vin(cls, v):
        """Validate VIN format."""
        if v is None:
            return v
        # Basic VIN validation (17 characters, no I, O, Q)
        invalid_chars = {'I', 'O', 'Q'}
        if any(c in v.upper() for c in invalid_chars):
            raise ValueError('VIN cannot contain I, O, or Q')
        return v.upper()
    
    @validator('license_plate')
    def validate_license_plate(cls, v):
        """Validate license plate format."""
        # Remove spaces and convert to uppercase
        return v.replace(' ', '').upper()
    
    @validator('registration_expiry', 'insurance_expiry', 'inspection_expiry', 'permit_expiry', pre=True)
    def validate_expiry_date(cls, v):
        """Validate expiry dates are in the future."""
        if v is None:
            return v
        if isinstance(v, date) and v < date.today():
            raise ValueError('Expiry date cannot be in the past')
        return v


class VehicleCreateRequest(VehicleBase):
    """Request schema for creating a vehicle."""
    
    owner_id: int = Field(..., description="ID of the owner")
    created_by: Optional[int] = Field(None, description="ID of the user creating the vehicle")


class VehicleUpdateRequest(BaseModel):
    """Request schema for updating a vehicle."""
    
    license_plate: Optional[constr(min_length=1, max_length=20)] = Field(
        None, 
        description="Vehicle license plate number"
    )
    state: Optional[constr(min_length=2, max_length=2)] = Field(
        None,
        description="State or region of registration"
    )
    country: Optional[constr(min_length=2, max_length=2)] = Field(
        None,
        description="Country code"
    )
    make: Optional[constr(min_length=1, max_length=50)] = Field(
        None, 
        description="Vehicle make"
    )
    model: Optional[constr(min_length=1, max_length=50)] = Field(
        None, 
        description="Vehicle model"
    )
    year: Optional[conint(ge=1900, le=datetime.now().year + 1)] = Field(
        None,
        description="Vehicle manufacturing year"
    )
    color: Optional[VehicleColor] = Field(None, description="Vehicle color")
    vehicle_type: Optional[VehicleType] = Field(None, description="Type of vehicle")
    fuel_type: Optional[VehicleFuelType] = Field(None, description="Fuel type")
    vehicle_size: Optional[VehicleSize] = Field(None, description="Vehicle size for parking")
    transmission_type: Optional[VehicleTransmissionType] = Field(
        None,
        description="Transmission type"
    )
    drive_type: Optional[VehicleDriveType] = Field(
        None,
        description="Drive type"
    )
    vin: Optional[constr(min_length=17, max_length=17)] = Field(
        None,
        description="Vehicle Identification Number"
    )
    engine_size: Optional[condecimal(max_digits=5, decimal_places=1)] = Field(
        None,
        description="Engine size in liters"
    )
    horsepower: Optional[conint(ge=0)] = Field(None, description="Horsepower")
    weight_kg: Optional[conint(ge=0)] = Field(None, description="Vehicle weight in kilograms")
    height_cm: Optional[conint(ge=0)] = Field(None, description="Vehicle height in centimeters")
    width_cm: Optional[conint(ge=0)] = Field(None, description="Vehicle width in centimeters")
    length_cm: Optional[conint(ge=0)] = Field(None, description="Vehicle length in centimeters")
    number_of_doors: Optional[conint(ge=1, le=5)] = Field(None, description="Number of doors")
    number_of_seats: Optional[conint(ge=1, le=20)] = Field(None, description="Number of seats")
    registration_expiry: Optional[date] = Field(None, description="Registration expiry date")
    insurance_expiry: Optional[date] = Field(None, description="Insurance expiry date")
    inspection_expiry: Optional[date] = Field(None, description="Inspection expiry date")
    ownership_type: Optional[VehicleOwnershipType] = Field(
        None,
        description="Type of ownership"
    )
    owner_id: Optional[int] = Field(None, description="ID of the owner")
    additional_owners: Optional[List[int]] = Field(
        None,
        description="Additional owner IDs"
    )
    is_ev_charging_compatible: Optional[bool] = Field(
        None,
        description="Whether vehicle supports EV charging"
    )
    charging_port_type: Optional[str] = Field(
        None,
        description="Type of charging port"
    )
    battery_capacity_kwh: Optional[condecimal(max_digits=6, decimal_places=1)] = Field(
        None,
        description="Battery capacity in kWh"
    )
    max_charging_power_kw: Optional[conint(ge=0)] = Field(
        None,
        description="Maximum charging power in kW"
    )
    has_permit: Optional[bool] = Field(None, description="Whether vehicle has a parking permit")
    permit_number: Optional[str] = Field(None, max_length=50, description="Parking permit number")
    permit_expiry: Optional[date] = Field(None, description="Parking permit expiry date")
    status: Optional[VehicleStatus] = Field(None, description="Vehicle status")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")
    tags: Optional[List[str]] = Field(None, description="Tags for categorization")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    @validator('license_plate', pre=True)
    def validate_license_plate(cls, v):
        """Validate license plate format."""
        if v is None:
            return v
        return v.replace(' ', '').upper()


class VehicleStatusUpdateRequest(BaseModel):
    """Request schema for updating vehicle status."""
    
    status: VehicleStatus = Field(..., description="New vehicle status")
    reason: Optional[str] = Field(None, max_length=500, description="Reason for status change")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "suspended",
            "reason": "Registration expired",
            "notes": "Vehicle registration expired on 2024-01-01"
        }
    })


class VehicleResponse(VehicleBase):
    """Response schema for vehicle data."""
    
    id: int = Field(..., description="Vehicle ID")
    status: VehicleStatus = Field(..., description="Vehicle status")
    owner_name: Optional[str] = Field(None, description="Name of the primary owner")
    owner_email: Optional[str] = Field(None, description="Email of the primary owner")
    owner_phone: Optional[str] = Field(None, description="Phone of the primary owner")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    created_by: Optional[int] = Field(None, description="ID of the user who created the vehicle")
    last_parking_session_id: Optional[int] = Field(None, description="ID of the last parking session")
    total_parking_sessions: Optional[int] = Field(0, description="Total number of parking sessions")
    total_parking_time_minutes: Optional[int] = Field(0, description="Total parking time in minutes")
    total_charging_sessions: Optional[int] = Field(0, description="Total number of charging sessions")
    total_energy_consumed_kwh: Optional[float] = Field(0.0, description="Total energy consumed in kWh")
    
    model_config = ConfigDict(from_attributes=True)


class VehicleListResponse(BaseResponse):
    """Response schema for vehicle list."""
    
    items: List[VehicleResponse] = Field(..., description="List of vehicles")
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


# ============================================================================
# Vehicle Search Schemas
# ============================================================================

class VehicleSearchRequest(BaseModel):
    """Request schema for searching vehicles."""
    
    query: Optional[str] = Field(
        None,
        description="Search query for license plate, make, model, or VIN"
    )
    license_plate: Optional[str] = Field(None, description="Filter by license plate")
    make: Optional[str] = Field(None, description="Filter by make")
    model: Optional[str] = Field(None, description="Filter by model")
    year: Optional[conint(ge=1900)] = Field(None, description="Filter by year")
    color: Optional[VehicleColor] = Field(None, description="Filter by color")
    vehicle_type: Optional[VehicleType] = Field(None, description="Filter by vehicle type")
    fuel_type: Optional[VehicleFuelType] = Field(None, description="Filter by fuel type")
    vehicle_size: Optional[VehicleSize] = Field(None, description="Filter by vehicle size")
    status: Optional[VehicleStatus] = Field(None, description="Filter by status")
    owner_id: Optional[int] = Field(None, description="Filter by owner ID")
    ownership_type: Optional[VehicleOwnershipType] = Field(None, description="Filter by ownership type")
    is_ev_charging_compatible: Optional[bool] = Field(None, description="Filter by EV compatibility")
    has_permit: Optional[bool] = Field(None, description="Filter by permit status")
    registration_expiry_start: Optional[date] = Field(None, description="Filter by registration expiry start")
    registration_expiry_end: Optional[date] = Field(None, description="Filter by registration expiry end")
    created_after: Optional[datetime] = Field(None, description="Filter by creation date (after)")
    created_before: Optional[datetime] = Field(None, description="Filter by creation date (before)")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    sort_by: Optional[str] = Field(
        "created_at",
        description="Sort field"
    )
    sort_order: Optional[str] = Field(
        "desc",
        description="Sort order (asc or desc)"
    )
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "query": "Tesla",
            "vehicle_type": "ev",
            "is_ev_charging_compatible": True,
            "status": "active",
            "sort_by": "created_at",
            "sort_order": "desc"
        }
    })
    
    @root_validator
    def validate_search_params(cls, values):
        """Validate search parameters."""
        # If query is provided, it should be at least 2 characters
        query = values.get('query')
        if query is not None and len(query) < 2:
            raise ValueError('Search query must be at least 2 characters')
        
        # Validate date ranges
        start = values.get('registration_expiry_start')
        end = values.get('registration_expiry_end')
        if start and end and start > end:
            raise ValueError('Registration expiry start must be before end')
        
        created_after = values.get('created_after')
        created_before = values.get('created_before')
        if created_after and created_before and created_after > created_before:
            raise ValueError('Created after must be before created before')
        
        return values


class VehicleOwnerResponse(BaseModel):
    """Response schema for vehicle owner information."""
    
    id: int = Field(..., description="Owner ID")
    name: str = Field(..., description="Owner name")
    email: Optional[str] = Field(None, description="Owner email")
    phone: Optional[str] = Field(None, description="Owner phone")
    vehicles_count: int = Field(0, description="Number of vehicles owned")
    primary_vehicle_id: Optional[int] = Field(None, description="Primary vehicle ID")
    
    model_config = ConfigDict(from_attributes=True)


class VehicleTypeResponse(BaseModel):
    """Response schema for vehicle type information."""
    
    vehicle_type: VehicleType = Field(..., description="Vehicle type")
    count: int = Field(..., description="Number of vehicles of this type")
    average_parking_duration: Optional[float] = Field(None, description="Average parking duration in minutes")
    total_parking_sessions: int = Field(0, description="Total parking sessions")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "vehicle_type": "ev",
            "count": 25,
            "average_parking_duration": 120.5,
            "total_parking_sessions": 500
        }
    })


class VehicleStatusResponse(BaseModel):
    """Response schema for vehicle status information."""
    
    status: VehicleStatus = Field(..., description="Vehicle status")
    count: int = Field(..., description="Number of vehicles with this status")
    percentage: float = Field(..., description="Percentage of total vehicles")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "status": "active",
            "count": 100,
            "percentage": 80.0
        }
    })


class VehicleDetailsResponse(VehicleResponse):
    """Extended response schema for vehicle details."""
    
    parking_history: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Recent parking history"
    )
    charging_history: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Recent charging history"
    )
    current_parking_session: Optional[Dict[str, Any]] = Field(
        None,
        description="Current active parking session"
    )
    current_charging_session: Optional[Dict[str, Any]] = Field(
        None,
        description="Current active charging session"
    )
    documents: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Vehicle documents"
    )
    images: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Vehicle images"
    )
    statistics: Optional[Dict[str, Any]] = Field(
        None,
        description="Vehicle statistics"
    )
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": 1,
            "license_plate": "ABC123",
            "make": "Tesla",
            "model": "Model 3",
            "statistics": {
                "total_parking_sessions": 150,
                "total_parking_time_minutes": 12000,
                "total_charging_sessions": 50,
                "total_energy_consumed_kwh": 1200.5,
                "average_parking_duration": 80.0,
                "most_common_parking_location": "Main Garage"
            }
        }
    })


# ============================================================================
# Vehicle Analytics Schemas
# ============================================================================

class VehicleAnalytics(BaseModel):
    """Schema for vehicle analytics."""
    
    total_vehicles: int = Field(..., description="Total number of vehicles")
    active_vehicles: int = Field(..., description="Number of active vehicles")
    vehicles_by_type: Dict[str, int] = Field(..., description="Vehicles breakdown by type")
    vehicles_by_status: Dict[str, int] = Field(..., description="Vehicles breakdown by status")
    vehicles_by_fuel_type: Dict[str, int] = Field(..., description="Vehicles breakdown by fuel type")
    ev_vehicles_count: int = Field(0, description="Number of EV vehicles")
    ev_percentage: float = Field(0.0, description="Percentage of EV vehicles")
    vehicles_with_permit: int = Field(0, description="Number of vehicles with permits")
    average_vehicle_age_years: float = Field(0.0, description="Average vehicle age in years")
    most_common_make: str = Field(..., description="Most common vehicle make")
    most_common_model: str = Field(..., description="Most common vehicle model")
    new_vehicles_this_month: int = Field(0, description="New vehicles registered this month")
    top_owners: List[Dict[str, Any]] = Field(default_factory=list, description="Top vehicle owners")
    timestamp: datetime = Field(..., description="Analytics timestamp")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "total_vehicles": 1000,
            "active_vehicles": 850,
            "vehicles_by_type": {
                "sedan": 400,
                "suv": 300,
                "ev": 200,
                "truck": 100
            },
            "vehicles_by_status": {
                "active": 850,
                "inactive": 100,
                "suspended": 50
            },
            "vehicles_by_fuel_type": {
                "gasoline": 500,
                "electric": 200,
                "hybrid": 200,
                "diesel": 100
            },
            "ev_vehicles_count": 200,
            "ev_percentage": 20.0,
            "vehicles_with_permit": 750,
            "average_vehicle_age_years": 4.5,
            "most_common_make": "Toyota",
            "most_common_model": "Camry",
            "new_vehicles_this_month": 25,
            "timestamp": "2024-01-01T10:00:00"
        }
    })


class VehicleExportRequest(BaseModel):
    """Request schema for exporting vehicle data."""
    
    format: str = Field(
        default="csv",
        description="Export format (csv, json, excel)"
    )
    include_owner_details: bool = Field(
        True,
        description="Include owner details in export"
    )
    include_parking_history: bool = Field(
        False,
        description="Include parking history in export"
    )
    include_charging_history: bool = Field(
        False,
        description="Include charging history in export"
    )
    date_range: Optional[DateRangeParams] = Field(
        None,
        description="Date range filter"
    )
    vehicle_type: Optional[List[VehicleType]] = Field(
        None,
        description="Filter by vehicle types"
    )
    status: Optional[List[VehicleStatus]] = Field(
        None,
        description="Filter by status"
    )
    fields: Optional[List[str]] = Field(
        None,
        description="Specific fields to include"
    )
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "format": "csv",
            "include_owner_details": True,
            "include_parking_history": False,
            "date_range": {
                "start_date": "2024-01-01T00:00:00",
                "end_date": "2024-01-31T23:59:59"
            },
            "vehicle_type": ["ev", "hybrid"],
            "status": ["active"]
        }
    })


# ============================================================================
# Vehicle Import Schemas
# ============================================================================

class VehicleImportRequest(BaseModel):
    """Request schema for importing vehicles."""
    
    source: str = Field(
        ...,
        description="Import source (csv, json, api)"
    )
    data: Union[str, List[Dict[str, Any]]] = Field(
        ...,
        description="Data to import"
    )
    format: str = Field(
        default="json",
        description="Data format (csv, json)"
    )
    skip_duplicates: bool = Field(
        True,
        description="Skip duplicate license plates"
    )
    update_existing: bool = Field(
        False,
        description="Update existing vehicles"
    )
    default_owner_id: Optional[int] = Field(
        None,
        description="Default owner ID for vehicles without owner"
    )
    mapping: Optional[Dict[str, str]] = Field(
        None,
        description="Field mapping for CSV import"
    )
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "source": "csv",
            "format": "csv",
            "skip_duplicates": True,
            "update_existing": False,
            "default_owner_id": 1,
            "mapping": {
                "license": "license_plate",
                "state": "state",
                "make": "make",
                "model": "model",
                "year": "year"
            }
        }
    })


class VehicleImportResponse(BaseModel):
    """Response schema for vehicle import."""
    
    total_processed: int = Field(..., description="Total records processed")
    created: int = Field(0, description="Records created")
    updated: int = Field(0, description="Records updated")
    skipped: int = Field(0, description="Records skipped")
    errors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Import errors"
    )
    import_id: str = Field(..., description="Import batch ID")
    timestamp: datetime = Field(..., description="Import timestamp")
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "total_processed": 100,
            "created": 80,
            "updated": 15,
            "skipped": 5,
            "import_id": "imp_12345",
            "timestamp": "2024-01-01T10:00:00"
        }
    })


# ============================================================================
# Vehicle Webhook Schemas
# ============================================================================

class VehicleWebhookPayload(BaseModel):
    """Schema for vehicle webhook payload."""
    
    event_type: str = Field(..., description="Type of webhook event")
    event_id: str = Field(..., description="Unique event ID")
    timestamp: datetime = Field(..., description="Event timestamp")
    vehicle_id: int = Field(..., description="Vehicle ID")
    data: Dict[str, Any] = Field(..., description="Event data")
    previous_data: Optional[Dict[str, Any]] = Field(None, description="Previous data (for updates)")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


# ============================================================================
# Utility Functions
# ============================================================================

def calculate_vehicle_age(year: int) -> float:
    """
    Calculate vehicle age in years.
    
    Args:
        year: Vehicle manufacturing year
        
    Returns:
        float: Vehicle age in years
    """
    current_year = datetime.now().year
    return float(current_year - year)


def normalize_license_plate(license_plate: str) -> str:
    """
    Normalize license plate format.
    
    Args:
        license_plate: License plate string
        
    Returns:
        str: Normalized license plate
    """
    return license_plate.replace(' ', '').upper()


def get_vehicle_type_from_fuel_type(fuel_type: VehicleFuelType) -> VehicleType:
    """
    Get vehicle type based on fuel type.
    
    Args:
        fuel_type: Vehicle fuel type
        
    Returns:
        VehicleType: Recommended vehicle type
    """
    if fuel_type == VehicleFuelType.ELECTRIC:
        return VehicleType.EV
    elif fuel_type == VehicleFuelType.HYBRID or fuel_type == VehicleFuelType.PLUGIN_HYBRID:
        return VehicleType.HYBRID
    else:
        return VehicleType.STANDARD  # Will be overridden by user


def validate_vehicle_dimensions(
    length_cm: Optional[int],
    width_cm: Optional[int],
    height_cm: Optional[int]
) -> bool:
    """
    Validate vehicle dimensions are within reasonable ranges.
    
    Args:
        length_cm: Length in centimeters
        width_cm: Width in centimeters
        height_cm: Height in centimeters
        
    Returns:
        bool: True if dimensions are valid
    """
    if length_cm is not None and (length_cm < 100 or length_cm > 800):
        return False
    if width_cm is not None and (width_cm < 50 or width_cm > 300):
        return False
    if height_cm is not None and (height_cm < 50 or height_cm > 400):
        return False
    return True


def get_vehicle_size_from_dimensions(length_cm: int, width_cm: int) -> VehicleSize:
    """
    Determine vehicle size based on dimensions.
    
    Args:
        length_cm: Vehicle length in centimeters
        width_cm: Vehicle width in centimeters
        
    Returns:
        VehicleSize: Determined vehicle size
    """
    if length_cm <= 400 and width_cm <= 170:
        return VehicleSize.COMPACT
    elif length_cm <= 450 and width_cm <= 190:
        return VehicleSize.STANDARD
    elif length_cm <= 520 and width_cm <= 200:
        return VehicleSize.LARGE
    else:
        return VehicleSize.EXTRA_LARGE