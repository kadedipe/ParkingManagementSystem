# ============================================================================
# Parking DTOs - Parking Management DTOs & Remove Vehicle DTO
# ============================================================================

"""
Parking Management Data Transfer Objects.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from src.dtos.common_dto import BaseDTO, BaseRequest, BaseResponse, AddressDTO, LocationDTO, MoneyDTO


@dataclass
class ParkingLotCreateRequest(BaseRequest):
    """
    Request DTO for creating a parking lot.
    """
    name: str
    address: AddressDTO
    total_capacity: int
    ev_capacity: int = 0
    disabled_capacity: int = 0
    hourly_rate: float = 5.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@dataclass
class ParkingLotUpdateRequest(BaseRequest):
    """
    Request DTO for updating a parking lot.
    """
    name: Optional[str] = None
    address: Optional[AddressDTO] = None
    total_capacity: Optional[int] = None
    ev_capacity: Optional[int] = None
    disabled_capacity: Optional[int] = None
    hourly_rate: Optional[float] = None
    is_active: Optional[bool] = None


@dataclass
class ParkVehicleRequest(BaseRequest):
    """
    Request DTO for parking a vehicle.
    """
    lot_id: UUID
    license_plate: str
    make: str
    model: str
    color: str
    year: int
    vehicle_type: str = "car"
    is_electric: bool = False
    duration: Optional[int] = None


@dataclass
class RemoveVehicleRequest(BaseRequest):
    """
    Request DTO for removing a vehicle.
    """
    ticket_id: UUID


@dataclass
class ParkingSearchRequest(BaseRequest):
    """
    Request DTO for searching parking.
    """
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[float] = 5.0
    date: Optional[datetime] = None
    time: Optional[datetime] = None
    duration: Optional[int] = 1
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    features: Optional[List[str]] = None
    sort_by: Optional[str] = None
    page: int = 1
    limit: int = 20


@dataclass
class ParkingFilterRequest(BaseRequest):
    """
    Request DTO for filtering parking.
    """
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    min_rating: Optional[float] = None
    has_ev_charging: Optional[bool] = None
    is_covered: Optional[bool] = None
    has_security: Optional[bool] = None
    is_handicap_accessible: Optional[bool] = None


@dataclass
class ParkingLotResponse(BaseResponse):
    """
    Response DTO for parking lot.
    """
    id: UUID
    name: str
    address: AddressDTO
    total_capacity: int
    ev_capacity: int
    disabled_capacity: int
    hourly_rate: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @classmethod
    def from_entity(cls, lot) -> 'ParkingLotResponse':
        """Create response from domain entity."""
        return cls(
            id=lot.id,
            name=lot.name,
            address=AddressDTO(
                street=lot.location.address,
                city=lot.location.city,
                state=lot.location.state,
                zip_code=lot.location.zip_code,
                latitude=lot.location.latitude,
                longitude=lot.location.longitude,
            ),
            total_capacity=lot.total_capacity,
            ev_capacity=lot.ev_capacity,
            disabled_capacity=lot.disabled_capacity,
            hourly_rate=lot.hourly_rate,
            is_active=lot.is_active,
            created_at=lot.created_at,
            updated_at=getattr(lot, 'updated_at', None),
        )


@dataclass
class ParkingSlotResponse(BaseResponse):
    """
    Response DTO for parking slot.
    """
    id: UUID
    lot_id: UUID
    slot_number: int
    floor_level: int
    type: str
    status: str
    vehicle_id: Optional[UUID] = None
    occupied_since: Optional[datetime] = None
    
    @classmethod
    def from_entity(cls, slot) -> 'ParkingSlotResponse':
        """Create response from domain entity."""
        return cls(
            id=slot.id,
            lot_id=slot.lot_id,
            slot_number=slot.slot_number,
            floor_level=slot.floor_level,
            type=slot.type.value,
            status=slot.status.value,
            vehicle_id=slot.current_vehicle_id,
            occupied_since=slot.occupied_since,
        )


@dataclass
class ParkingTicketResponse(BaseResponse):
    """
    Response DTO for parking ticket.
    """
    id: UUID
    ticket_number: str
    lot_id: UUID
    slot_number: int
    vehicle_id: UUID
    entry_time: datetime
    exit_time: Optional[datetime] = None
    total_amount: Optional[float] = None
    status: str
    
    @classmethod
    def from_entity(cls, ticket) -> 'ParkingTicketResponse':
        """Create response from domain entity."""
        return cls(
            id=ticket.id,
            ticket_number=ticket.ticket_number,
            lot_id=ticket.parking_lot_id,
            slot_number=ticket.slot_number,
            vehicle_id=ticket.vehicle_id,
            entry_time=ticket.entry_time,
            exit_time=ticket.exit_time,
            total_amount=ticket.total_amount,
            status=ticket.status.value,
        )


@dataclass
class ParkingStatusResponse(BaseResponse):
    """
    Response DTO for parking status.
    """
    lot_id: UUID
    name: str
    location: str
    total_slots: int
    occupied_slots: int
    available_slots: int
    occupancy_rate: float
    ev_occupied: int
    ev_total: int
    disabled_occupied: int
    disabled_total: int
    hourly_rate: float
    is_active: bool


@dataclass
class ParkingSearchResponse(BaseResponse):
    """
    Response DTO for parking search.
    """
    results: List[ParkingLotResponse]
    total: int
    page: int
    limit: int
    pages: int
    filters: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ParkingAnalyticsResponse(BaseResponse):
    """
    Response DTO for parking analytics.
    """
    total_lots: int
    total_slots: int
    total_occupied: int
    total_available: int
    overall_occupancy_rate: float
    revenue_today: float
    revenue_this_week: float
    revenue_this_month: float
    peak_hour: int
    average_duration: float
    top_lots: List[Dict[str, Any]]
    timestamp: datetime = field(default_factory=datetime.now)
    
@dataclass
class RemoveVehicleRequest(BaseRequest):
    """
    Request DTO for removing a vehicle.
    """
    ticket_id: UUID


@dataclass
class RemoveVehicleResponse(BaseResponse):
    """
    Response DTO for removing a vehicle.
    """
    ticket_id: UUID
    ticket_number: str
    slot_number: int
    duration_hours: float
    total_amount: float
    entry_time: datetime
    exit_time: datetime
    
    @classmethod
    def from_ticket(cls, ticket) -> 'RemoveVehicleResponse':
        """Create response from ticket entity."""
        return cls(
            ticket_id=ticket.id,
            ticket_number=ticket.ticket_number,
            slot_number=ticket.slot_number,
            duration_hours=ticket.get_duration_hours(),
            total_amount=ticket.total_amount or 0,
            entry_time=ticket.entry_time,
            exit_time=ticket.exit_time,
        )
        

@dataclass
class LotStatusDTO(BaseResponse):
    """
    DTO for parking lot status.
    """
    # Lot Information
    lot_id: UUID
    name: str
    location: str
    hourly_rate: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Totals
    total_slots: int = 0
    occupied_slots: int = 0
    available_slots: int = 0
    occupancy_rate: float = 0.0
    
    # EV
    ev_slots: int = 0
    ev_occupied: int = 0
    ev_available: int = 0
    ev_occupancy_rate: float = 0.0
    
    # Disabled
    disabled_slots: int = 0
    disabled_occupied: int = 0
    disabled_available: int = 0
    
    # Regular
    regular_slots: int = 0
    regular_occupied: int = 0
    regular_available: int = 0
    
    # Floor occupancy
    floor_occupancy: Dict[int, Dict[str, Any]] = field(default_factory=dict)
    
    # Slot details (optional)
    slots: Optional[List[ParkingSlotResponse]] = None
    
    # Timestamp
    timestamp: datetime = field(default_factory=datetime.now)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'LotStatusDTO':
        """Create DTO from dictionary."""
        return cls(**data)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = self.__dict__.copy()
        result['lot_id'] = str(result['lot_id'])
        result['created_at'] = result['created_at'].isoformat() if result['created_at'] else None
        result['updated_at'] = result['updated_at'].isoformat() if result['updated_at'] else None
        result['timestamp'] = result['timestamp'].isoformat() if result['timestamp'] else None
        return result