# ============================================================================
# Parking Management System - Domain Events
# ============================================================================

"""
Domain events for the Parking Management System.

This module defines all domain events that are used to communicate
state changes across the system using event-driven architecture.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from enum import Enum
import json

from src.domain.events import DomainEvent, EventType


# ============================================================================
# Event Types
# ============================================================================

class EventType(str, Enum):
    """Types of domain events."""
    
    # Parking Events
    VEHICLE_PARKED = "vehicle.parked"
    VEHICLE_REMOVED = "vehicle.removed"
    PARKING_LOT_CREATED = "parking.lot.created"
    PARKING_LOT_UPDATED = "parking.lot.updated"
    PARKING_LOT_DELETED = "parking.lot.deleted"
    SLOT_OCCUPIED = "slot.occupied"
    SLOT_VACATED = "slot.vacated"
    SLOT_RESERVED = "slot.reserved"
    SLOT_RELEASED = "slot.released"
    
    # Charging Events
    CHARGING_STARTED = "charging.started"
    CHARGING_COMPLETED = "charging.completed"
    CHARGING_STOPPED = "charging.stopped"
    CHARGING_ERROR = "charging.error"
    CHARGING_PAUSED = "charging.paused"
    CHARGING_RESUMED = "charging.resumed"
    CHARGING_STATION_CREATED = "charging.station.created"
    CHARGING_STATION_UPDATED = "charging.station.updated"
    CHARGING_STATION_DELETED = "charging.station.deleted"
    
    # Booking Events
    BOOKING_CREATED = "booking.created"
    BOOKING_CONFIRMED = "booking.confirmed"
    BOOKING_COMPLETED = "booking.completed"
    BOOKING_CANCELLED = "booking.cancelled"
    BOOKING_EXPIRED = "booking.expired"
    BOOKING_EXTENDED = "booking.extended"
    
    # Payment Events
    PAYMENT_INITIATED = "payment.initiated"
    PAYMENT_COMPLETED = "payment.completed"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_REFUNDED = "payment.refunded"
    PAYMENT_PENDING = "payment.pending"
    
    # Vehicle Events
    VEHICLE_REGISTERED = "vehicle.registered"
    VEHICLE_UPDATED = "vehicle.updated"
    VEHICLE_DELETED = "vehicle.deleted"
    VEHICLE_ELECTRIC = "vehicle.electric"
    
    # User Events
    USER_REGISTERED = "user.registered"
    USER_LOGGED_IN = "user.logged_in"
    USER_LOGGED_OUT = "user.logged_out"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    USER_PASSWORD_CHANGED = "user.password.changed"
    USER_EMAIL_VERIFIED = "user.email.verified"
    
    # Notification Events
    NOTIFICATION_SENT = "notification.sent"
    NOTIFICATION_READ = "notification.read"
    NOTIFICATION_DELETED = "notification.deleted"
    
    # System Events
    SYSTEM_STARTUP = "system.startup"
    SYSTEM_SHUTDOWN = "system.shutdown"
    SYSTEM_ERROR = "system.error"
    SYSTEM_WARNING = "system.warning"
    SYSTEM_INFO = "system.info"


# ============================================================================
# Base Event Class
# ============================================================================

@dataclass
class DomainEvent:
    """
    Base class for all domain events.
    
    Attributes:
        event_id: Unique identifier for the event
        event_type: Type of the event
        aggregate_id: ID of the aggregate that generated the event
        aggregate_type: Type of the aggregate
        timestamp: When the event occurred
        version: Version of the event schema
        metadata: Additional metadata about the event
    """
    
    event_id: UUID = field(default_factory=uuid4)
    event_type: EventType = None
    aggregate_id: Optional[UUID] = None
    aggregate_type: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    version: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert event to dictionary.
        
        Returns:
            Dict[str, Any]: Dictionary representation of the event
        """
        return {
            "event_id": str(self.event_id),
            "event_type": self.event_type.value if self.event_type else None,
            "aggregate_id": str(self.aggregate_id) if self.aggregate_id else None,
            "aggregate_type": self.aggregate_type,
            "timestamp": self.timestamp.isoformat(),
            "version": self.version,
            "metadata": self.metadata,
        }
    
    def to_json(self) -> str:
        """
        Convert event to JSON string.
        
        Returns:
            str: JSON representation of the event
        """
        return json.dumps(self.to_dict(), default=str)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DomainEvent":
        """
        Create event from dictionary.
        
        Args:
            data: Dictionary representation of the event
            
        Returns:
            DomainEvent: Event instance
        """
        return cls(
            event_id=UUID(data["event_id"]) if data.get("event_id") else uuid4(),
            event_type=EventType(data["event_type"]) if data.get("event_type") else None,
            aggregate_id=UUID(data["aggregate_id"]) if data.get("aggregate_id") else None,
            aggregate_type=data.get("aggregate_type"),
            timestamp=datetime.fromisoformat(data["timestamp"]) if data.get("timestamp") else datetime.now(),
            version=data.get("version", 1),
            metadata=data.get("metadata", {}),
        )


# ============================================================================
# Parking Events
# ============================================================================

@dataclass
class VehicleParkedEvent(DomainEvent):
    """Event emitted when a vehicle is parked."""
    
    event_type: EventType = EventType.VEHICLE_PARKED
    parking_lot_id: Optional[UUID] = None
    slot_number: Optional[int] = None
    ticket_number: Optional[str] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    is_electric: bool = False
    entry_time: Optional[datetime] = None
    duration: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "parking_lot_id": str(self.parking_lot_id) if self.parking_lot_id else None,
            "slot_number": self.slot_number,
            "ticket_number": self.ticket_number,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "is_electric": self.is_electric,
            "entry_time": self.entry_time.isoformat() if self.entry_time else None,
            "duration": self.duration,
        })
        return data


@dataclass
class VehicleRemovedEvent(DomainEvent):
    """Event emitted when a vehicle is removed."""
    
    event_type: EventType = EventType.VEHICLE_REMOVED
    parking_lot_id: Optional[UUID] = None
    slot_number: Optional[int] = None
    ticket_number: Optional[str] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    exit_time: Optional[datetime] = None
    duration_hours: Optional[float] = None
    total_amount: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "parking_lot_id": str(self.parking_lot_id) if self.parking_lot_id else None,
            "slot_number": self.slot_number,
            "ticket_number": self.ticket_number,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "exit_time": self.exit_time.isoformat() if self.exit_time else None,
            "duration_hours": self.duration_hours,
            "total_amount": self.total_amount,
        })
        return data


@dataclass
class ParkingLotCreatedEvent(DomainEvent):
    """Event emitted when a parking lot is created."""
    
    event_type: EventType = EventType.PARKING_LOT_CREATED
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    total_capacity: Optional[int] = None
    ev_capacity: Optional[int] = None
    disabled_capacity: Optional[int] = None
    hourly_rate: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zip_code": self.zip_code,
            "total_capacity": self.total_capacity,
            "ev_capacity": self.ev_capacity,
            "disabled_capacity": self.disabled_capacity,
            "hourly_rate": self.hourly_rate,
        })
        return data


@dataclass
class SlotOccupiedEvent(DomainEvent):
    """Event emitted when a parking slot is occupied."""
    
    event_type: EventType = EventType.SLOT_OCCUPIED
    parking_lot_id: Optional[UUID] = None
    slot_number: Optional[int] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    occupied_since: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "parking_lot_id": str(self.parking_lot_id) if self.parking_lot_id else None,
            "slot_number": self.slot_number,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "occupied_since": self.occupied_since.isoformat() if self.occupied_since else None,
        })
        return data


@dataclass
class SlotVacatedEvent(DomainEvent):
    """Event emitted when a parking slot is vacated."""
    
    event_type: EventType = EventType.SLOT_VACATED
    parking_lot_id: Optional[UUID] = None
    slot_number: Optional[int] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    vacated_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "parking_lot_id": str(self.parking_lot_id) if self.parking_lot_id else None,
            "slot_number": self.slot_number,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "vacated_at": self.vacated_at.isoformat() if self.vacated_at else None,
        })
        return data


# ============================================================================
# Charging Events
# ============================================================================

@dataclass
class ChargingStartedEvent(DomainEvent):
    """Event emitted when EV charging starts."""
    
    event_type: EventType = EventType.CHARGING_STARTED
    station_id: Optional[UUID] = None
    session_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    start_time: Optional[datetime] = None
    charge_rate_kw: Optional[float] = None
    battery_percent: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "station_id": str(self.station_id) if self.station_id else None,
            "session_id": str(self.session_id) if self.session_id else None,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "charge_rate_kw": self.charge_rate_kw,
            "battery_percent": self.battery_percent,
        })
        return data


@dataclass
class ChargingCompletedEvent(DomainEvent):
    """Event emitted when EV charging completes."""
    
    event_type: EventType = EventType.CHARGING_COMPLETED
    station_id: Optional[UUID] = None
    session_id: Optional[UUID] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    end_time: Optional[datetime] = None
    energy_consumed_kwh: Optional[float] = None
    duration_hours: Optional[float] = None
    cost: Optional[float] = None
    battery_percent: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "station_id": str(self.station_id) if self.station_id else None,
            "session_id": str(self.session_id) if self.session_id else None,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "energy_consumed_kwh": self.energy_consumed_kwh,
            "duration_hours": self.duration_hours,
            "cost": self.cost,
            "battery_percent": self.battery_percent,
        })
        return data


# ============================================================================
# Booking Events
# ============================================================================

@dataclass
class BookingCreatedEvent(DomainEvent):
    """Event emitted when a booking is created."""
    
    event_type: EventType = EventType.BOOKING_CREATED
    booking_id: Optional[UUID] = None
    ticket_number: Optional[str] = None
    parking_lot_id: Optional[UUID] = None
    slot_number: Optional[int] = None
    vehicle_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    total_price: Optional[float] = None
    is_electric: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "ticket_number": self.ticket_number,
            "parking_lot_id": str(self.parking_lot_id) if self.parking_lot_id else None,
            "slot_number": self.slot_number,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration": self.duration,
            "total_price": self.total_price,
            "is_electric": self.is_electric,
        })
        return data


@dataclass
class BookingConfirmedEvent(DomainEvent):
    """Event emitted when a booking is confirmed."""
    
    event_type: EventType = EventType.BOOKING_CONFIRMED
    booking_id: Optional[UUID] = None
    ticket_number: Optional[str] = None
    user_id: Optional[UUID] = None
    confirmed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "ticket_number": self.ticket_number,
            "user_id": str(self.user_id) if self.user_id else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
        })
        return data


@dataclass
class BookingCancelledEvent(DomainEvent):
    """Event emitted when a booking is cancelled."""
    
    event_type: EventType = EventType.BOOKING_CANCELLED
    booking_id: Optional[UUID] = None
    ticket_number: Optional[str] = None
    user_id: Optional[UUID] = None
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    refund_amount: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "ticket_number": self.ticket_number,
            "user_id": str(self.user_id) if self.user_id else None,
            "cancellation_reason": self.cancellation_reason,
            "cancelled_at": self.cancelled_at.isoformat() if self.cancelled_at else None,
            "refund_amount": self.refund_amount,
        })
        return data


# ============================================================================
# Payment Events
# ============================================================================

@dataclass
class PaymentCompletedEvent(DomainEvent):
    """Event emitted when a payment is completed."""
    
    event_type: EventType = EventType.PAYMENT_COMPLETED
    payment_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    amount: Optional[float] = None
    currency: str = "USD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "payment_id": str(self.payment_id) if self.payment_id else None,
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "amount": self.amount,
            "currency": self.currency,
            "payment_method": self.payment_method,
            "transaction_id": self.transaction_id,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        })
        return data


@dataclass
class PaymentFailedEvent(DomainEvent):
    """Event emitted when a payment fails."""
    
    event_type: EventType = EventType.PAYMENT_FAILED
    payment_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    amount: Optional[float] = None
    currency: str = "USD"
    payment_method: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    failed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "payment_id": str(self.payment_id) if self.payment_id else None,
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "amount": self.amount,
            "currency": self.currency,
            "payment_method": self.payment_method,
            "error_code": self.error_code,
            "error_message": self.error_message,
            "failed_at": self.failed_at.isoformat() if self.failed_at else None,
        })
        return data


# ============================================================================
# Vehicle Events
# ============================================================================

@dataclass
class VehicleRegisteredEvent(DomainEvent):
    """Event emitted when a vehicle is registered."""
    
    event_type: EventType = EventType.VEHICLE_REGISTERED
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[str] = None
    is_electric: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "make": self.make,
            "model": self.model,
            "color": self.color,
            "year": self.year,
            "vehicle_type": self.vehicle_type,
            "is_electric": self.is_electric,
        })
        return data


# ============================================================================
# Event Factory
# ============================================================================

class EventFactory:
    """Factory for creating domain events."""
    
    @staticmethod
    def create_vehicle_parked_event(
        parking_lot_id: UUID,
        slot_number: int,
        ticket_number: str,
        vehicle_id: UUID,
        license_plate: str,
        is_electric: bool = False,
        duration: int = 0,
        **kwargs
    ) -> VehicleParkedEvent:
        """Create a vehicle parked event."""
        return VehicleParkedEvent(
            aggregate_id=parking_lot_id,
            aggregate_type="parking_lot",
            parking_lot_id=parking_lot_id,
            slot_number=slot_number,
            ticket_number=ticket_number,
            vehicle_id=vehicle_id,
            license_plate=license_plate,
            is_electric=is_electric,
            entry_time=datetime.now(),
            duration=duration,
            metadata=kwargs,
        )
    
    @staticmethod
    def create_vehicle_removed_event(
        parking_lot_id: UUID,
        slot_number: int,
        ticket_number: str,
        vehicle_id: UUID,
        license_plate: str,
        duration_hours: float,
        total_amount: float,
        **kwargs
    ) -> VehicleRemovedEvent:
        """Create a vehicle removed event."""
        return VehicleRemovedEvent(
            aggregate_id=parking_lot_id,
            aggregate_type="parking_lot",
            parking_lot_id=parking_lot_id,
            slot_number=slot_number,
            ticket_number=ticket_number,
            vehicle_id=vehicle_id,
            license_plate=license_plate,
            exit_time=datetime.now(),
            duration_hours=duration_hours,
            total_amount=total_amount,
            metadata=kwargs,
        )
    
    @staticmethod
    def create_charging_started_event(
        station_id: UUID,
        session_id: UUID,
        vehicle_id: UUID,
        license_plate: str,
        charge_rate_kw: float,
        battery_percent: float,
        **kwargs
    ) -> ChargingStartedEvent:
        """Create a charging started event."""
        return ChargingStartedEvent(
            aggregate_id=station_id,
            aggregate_type="charging_station",
            station_id=station_id,
            session_id=session_id,
            vehicle_id=vehicle_id,
            license_plate=license_plate,
            start_time=datetime.now(),
            charge_rate_kw=charge_rate_kw,
            battery_percent=battery_percent,
            metadata=kwargs,
        )
    
    @staticmethod
    def create_charging_completed_event(
        station_id: UUID,
        session_id: UUID,
        vehicle_id: UUID,
        license_plate: str,
        energy_consumed_kwh: float,
        duration_hours: float,
        cost: float,
        battery_percent: float,
        **kwargs
    ) -> ChargingCompletedEvent:
        """Create a charging completed event."""
        return ChargingCompletedEvent(
            aggregate_id=station_id,
            aggregate_type="charging_station",
            station_id=station_id,
            session_id=session_id,
            vehicle_id=vehicle_id,
            license_plate=license_plate,
            end_time=datetime.now(),
            energy_consumed_kwh=energy_consumed_kwh,
            duration_hours=duration_hours,
            cost=cost,
            battery_percent=battery_percent,
            metadata=kwargs,
        )


# ============================================================================
# Event Bus Interface
# ============================================================================

class EventBus:
    """Interface for event bus implementation."""
    
    async def publish(self, event: DomainEvent) -> None:
        """
        Publish an event to the event bus.
        
        Args:
            event: Domain event to publish
        """
        raise NotImplementedError
    
    async def subscribe(self, event_type: EventType, handler) -> None:
        """
        Subscribe to events of a specific type.
        
        Args:
            event_type: Type of events to subscribe to
            handler: Handler function to call
        """
        raise NotImplementedError


# ============================================================================
# Event Handler Base
# ============================================================================

class EventHandler:
    """Base class for event handlers."""
    
    async def handle(self, event: DomainEvent) -> None:
        """Handle the event."""
        raise NotImplementedError
    

# ============================================================================
# Domain Events - Additional Events
# ============================================================================

@dataclass
class SlotVacatedEvent(DomainEvent):
    """Event emitted when a parking slot is vacated."""
    
    event_type: EventType = EventType.SLOT_VACATED
    parking_lot_id: Optional[UUID] = None
    slot_number: Optional[int] = None
    vehicle_id: Optional[UUID] = None
    license_plate: Optional[str] = None
    vacated_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({
            "parking_lot_id": str(self.parking_lot_id) if self.parking_lot_id else None,
            "slot_number": self.slot_number,
            "vehicle_id": str(self.vehicle_id) if self.vehicle_id else None,
            "license_plate": self.license_plate,
            "vacated_at": self.vacated_at.isoformat() if self.vacated_at else None,
        })
        return data


@dataclass
class PaymentCompletedEvent(DomainEvent):
    """Event emitted when a payment is completed."""
    
    event_type: EventType = EventType.PAYMENT_COMPLETED
    payment_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    amount: Optional[float] = None
    currency: str = "USD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({
            "payment_id": str(self.payment_id) if self.payment_id else None,
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "amount": self.amount,
            "currency": self.currency,
            "payment_method": self.payment_method,
            "transaction_id": self.transaction_id,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        })
        return data