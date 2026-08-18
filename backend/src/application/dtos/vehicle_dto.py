# ============================================================================
# Vehicle DTOs - Data Transfer Objects
# ============================================================================

"""
Data Transfer Objects for vehicle operations.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID

from src.domain.models import Vehicle, ElectricVehicle
from src.domain.enums import VehicleType, PowerSource


@dataclass
class VehicleCreateDTO:
    """DTO for creating a vehicle."""
    license_plate: str
    make: str
    model: str
    color: str
    year: int
    vehicle_type: Optional[str] = "car"
    is_electric: bool = False
    power_source: Optional[str] = None
    battery_capacity_kwh: Optional[float] = None
    current_charge_percent: Optional[float] = 50.0
    max_charge_rate_kw: Optional[float] = 7.4


@dataclass
class VehicleResponseDTO:
    """DTO for vehicle response."""
    id: UUID
    license_plate: str
    make: str
    model: str
    color: str
    year: int
    vehicle_type: str
    is_electric: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Electric vehicle specific fields
    battery_capacity_kwh: Optional[float] = None
    current_charge_percent: Optional[float] = None
    max_charge_rate_kw: Optional[float] = None
    
    @classmethod
    def from_entity(cls, vehicle: Vehicle) -> "VehicleResponseDTO":
        """Create DTO from entity."""
        return cls(
            id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            make=vehicle.make,
            model=vehicle.model,
            color=vehicle.color,
            year=vehicle.year,
            vehicle_type=vehicle.vehicle_type.value,
            is_electric=vehicle.is_electric,
            is_active=vehicle.is_active,
            created_at=vehicle.created_at,
            updated_at=getattr(vehicle, 'updated_at', None),
            battery_capacity_kwh=getattr(vehicle, 'battery_capacity_kwh', None),
            current_charge_percent=getattr(vehicle, 'current_charge_percent', None),
            max_charge_rate_kw=getattr(vehicle, 'max_charge_rate_kw', None),
        )


@dataclass
class VehicleUpdateDTO:
    """DTO for updating a vehicle."""
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[str] = None
    power_source: Optional[str] = None
    is_active: Optional[bool] = None
    battery_capacity_kwh: Optional[float] = None
    current_charge_percent: Optional[float] = None
    max_charge_rate_kw: Optional[float] = None


@dataclass
class VehicleSearchDTO:
    """DTO for searching vehicles."""
    license_plate: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    vehicle_type: Optional[str] = None
    is_electric: Optional[bool] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    is_active: Optional[bool] = True
    limit: Optional[int] = 100
    offset: Optional[int] = 0


@dataclass
class VehicleHistoryDTO:
    """DTO for vehicle history."""
    vehicle: VehicleResponseDTO
    total_bookings: int
    total_parking_hours: float
    total_spent: float
    average_parking_hours: float
    recent_bookings: List[Any]
    charging_sessions: List[Any]


@dataclass
class VehicleTypeDTO:
    """DTO for vehicle type."""
    name: str
    label: str
    requires_license: bool
    max_passengers: int
    is_electric_supported: bool
    description: Optional[str] = None