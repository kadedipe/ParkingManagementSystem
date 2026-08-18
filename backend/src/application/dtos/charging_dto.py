# ============================================================================
# Charging DTOs - Data Transfer Objects
# ============================================================================

"""
Data Transfer Objects for charging operations.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID

from src.domain.models import ChargingStation, ChargingSession
from src.domain.enums import ChargingStatus


@dataclass
class ChargingStationCreateDTO:
    """DTO for creating a charging station."""
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    max_power_kw: float = 50.0
    connector_types: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@dataclass
class ChargingStationResponseDTO:
    """DTO for charging station response."""
    id: UUID
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    max_power_kw: float
    connector_types: List[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @classmethod
    def from_entity(cls, station: ChargingStation) -> "ChargingStationResponseDTO":
        """Create DTO from entity."""
        return cls(
            id=station.id,
            name=station.name,
            address=station.location.address,
            city=station.location.city,
            state=station.location.state,
            zip_code=station.location.zip_code,
            max_power_kw=station.max_power_kw,
            connector_types=station.connector_types,
            is_active=station.is_active,
            created_at=station.created_at,
        )


@dataclass
class ChargingStationUpdateDTO:
    """DTO for updating a charging station."""
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    max_power_kw: Optional[float] = None
    connector_types: Optional[List[str]] = None
    is_active: Optional[bool] = None


@dataclass
class StartChargingDTO:
    """DTO for starting a charging session."""
    station_id: UUID
    vehicle_id: UUID
    connector_type: Optional[str] = None


@dataclass
class StopChargingDTO:
    """DTO for stopping a charging session."""
    session_id: UUID


@dataclass
class ChargingSessionDTO:
    """DTO for charging session response."""
    id: UUID
    station_id: UUID
    vehicle_id: UUID
    start_time: datetime
    end_time: Optional[datetime]
    energy_consumed_kwh: float
    status: ChargingStatus
    cost: Optional[float]
    connector_type: Optional[str]
    duration_hours: Optional[float] = None
    charge_rate_kw: Optional[float] = None
    
    @classmethod
    def from_entity(cls, session: ChargingSession) -> "ChargingSessionDTO":
        """Create DTO from entity."""
        return cls(
            id=session.id,
            station_id=session.station_id,
            vehicle_id=session.vehicle_id,
            start_time=session.start_time,
            end_time=session.end_time,
            energy_consumed_kwh=session.energy_consumed_kwh,
            status=session.status,
            cost=session.cost,
            connector_type=session.connector_type,
            duration_hours=session.get_duration_hours() if session.end_time else None,
        )


@dataclass
class ChargingStatusDTO:
    """DTO for charging station status."""
    station_id: UUID
    name: str
    location: str
    is_active: bool
    max_power_kw: float
    active_sessions_count: int
    available_connectors: int
    connector_types: List[str]
    total_energy_delivered_kwh: float


@dataclass
class ChargingReportDTO:
    """DTO for charging report."""
    start_date: datetime
    end_date: datetime
    station_id: Optional[UUID]
    total_sessions: int
    completed_sessions: int
    total_energy_kwh: float
    total_revenue: float
    average_energy_per_session: float
    average_revenue_per_session: float
    peak_usage_hour: int
    peak_usage_count: int