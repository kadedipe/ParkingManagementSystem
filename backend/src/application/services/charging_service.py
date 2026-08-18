# ============================================================================
# Parking Management System - Charging Service
# ============================================================================

"""
Charging Service - EV Charging Management Application Logic.

This service handles all EV charging operations including:
- Managing charging stations
- Starting and stopping charging sessions
- Tracking energy consumption
- Monitoring charging status
- Calculating charging costs
- Publishing charging events
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
import logging
import math

from src.application.services.base import BaseService
from src.domain.models import (
    ChargingStation,
    ChargingSession,
    Vehicle,
    ElectricVehicle,
    Location,
)
from src.domain.enums import ChargingStatus, VehicleType, PowerSource
from src.domain.value_objects import Location as LocationVO
from src.domain.events import EventBus, EventFactory
from src.application.dtos.charging_dto import (
    ChargingStationCreateDTO,
    ChargingStationResponseDTO,
    ChargingStationUpdateDTO,
    ChargingSessionDTO,
    StartChargingDTO,
    StopChargingDTO,
    ChargingStatusDTO,
    ChargingReportDTO,
)
from src.application.interfaces import IChargingService, IUnitOfWork
from src.infrastructure.repositories import (
    ChargingStationRepository,
    ChargingSessionRepository,
    VehicleRepository,
)

logger = logging.getLogger(__name__)


class ChargingService(BaseService, IChargingService):
    """
    Charging service implementing EV charging business logic.
    
    This service handles all charging-related operations including
    station management, session lifecycle, energy tracking, and reporting.
    """
    
    # Charging cost constants
    DEFAULT_CHARGE_RATE_PER_KWH = 0.45  # USD per kWh
    DEFAULT_CONNECTION_FEE = 1.00  # USD per session
    MINIMUM_CHARGE_DURATION_MINUTES = 5
    MAXIMUM_CHARGE_DURATION_HOURS = 24
    
    def __init__(
        self,
        station_repository: ChargingStationRepository,
        session_repository: ChargingSessionRepository,
        vehicle_repository: VehicleRepository,
        event_bus: EventBus,
        uow: IUnitOfWork,
    ):
        """
        Initialize the charging service.
        
        Args:
            station_repository: Repository for charging stations
            session_repository: Repository for charging sessions
            vehicle_repository: Repository for vehicles
            event_bus: Event bus for publishing domain events
            uow: Unit of work for transaction management
        """
        super().__init__()
        self.station_repo = station_repository
        self.session_repo = session_repository
        self.vehicle_repo = vehicle_repository
        self.event_bus = event_bus
        self.uow = uow
        
        # Charging rate configuration
        self.rate_per_kwh = self.DEFAULT_CHARGE_RATE_PER_KWH
        self.connection_fee = self.DEFAULT_CONNECTION_FEE

    # ==========================================================================
    # Charging Station Management
    # ==========================================================================

    async def create_charging_station(
        self,
        data: ChargingStationCreateDTO,
    ) -> ChargingStationResponseDTO:
        """
        Create a new charging station.
        
        Args:
            data: Charging station creation data
            
        Returns:
            ChargingStationResponseDTO: Created charging station details
            
        Raises:
            ValueError: If validation fails
        """
        try:
            # Validate input
            self._validate_station_data(data)
            
            # Create location
            location = LocationVO(
                address=data.address,
                city=data.city,
                state=data.state,
                zip_code=data.zip_code,
                latitude=data.latitude,
                longitude=data.longitude,
            )
            
            # Create charging station
            station = ChargingStation(
                name=data.name,
                location=location,
                max_power_kw=data.max_power_kw,
                connector_types=data.connector_types or ["CCS", "CHAdeMO"],
                is_active=True,
            )
            
            # Save using repository
            async with self.uow:
                saved_station = await self.station_repo.save_station(station)
                
                # Publish domain event
                await self._publish_station_created_event(saved_station)
            
            logger.info(f"Charging station created: {saved_station.id}")
            return ChargingStationResponseDTO.from_entity(saved_station)
            
        except Exception as e:
            logger.error(f"Failed to create charging station: {e}")
            raise

    def _validate_station_data(self, data: ChargingStationCreateDTO) -> None:
        """Validate charging station creation data."""
        if not data.name:
            raise ValueError("Station name cannot be empty")
        
        if data.max_power_kw <= 0:
            raise ValueError(f"Invalid max power: {data.max_power_kw}")
        
        if data.max_power_kw > 500:
            raise ValueError("Max power cannot exceed 500kW")
        
        if not data.address:
            raise ValueError("Address cannot be empty")
        if not data.city:
            raise ValueError("City cannot be empty")
        if not data.state:
            raise ValueError("State cannot be empty")
        if not data.zip_code:
            raise ValueError("ZIP code cannot be empty")

    async def _publish_station_created_event(
        self,
        station: ChargingStation,
    ) -> None:
        """Publish charging station created event."""
        event = EventFactory.create_charging_station_created_event(
            station_id=station.id,
            name=station.name,
            address=station.location.address,
            city=station.location.city,
            state=station.location.state,
            zip_code=station.location.zip_code,
            max_power_kw=station.max_power_kw,
            connector_types=station.connector_types,
        )
        await self.event_bus.publish(event)

    async def get_charging_station(
        self,
        station_id: UUID,
    ) -> Optional[ChargingStationResponseDTO]:
        """
        Get a charging station by ID.
        
        Args:
            station_id: Charging station ID
            
        Returns:
            Optional[ChargingStationResponseDTO]: Station details if found
        """
        station = await self.station_repo.get_station(station_id)
        if not station:
            return None
        return ChargingStationResponseDTO.from_entity(station)

    async def get_all_charging_stations(
        self,
        active_only: bool = True,
    ) -> List[ChargingStationResponseDTO]:
        """
        Get all charging stations.
        
        Args:
            active_only: If True, only return active stations
            
        Returns:
            List[ChargingStationResponseDTO]: List of charging stations
        """
        stations = await self.station_repo.get_all_stations(active_only)
        return [ChargingStationResponseDTO.from_entity(station) for station in stations]

    async def update_charging_station(
        self,
        station_id: UUID,
        data: ChargingStationUpdateDTO,
    ) -> Optional[ChargingStationResponseDTO]:
        """
        Update a charging station.
        
        Args:
            station_id: Charging station ID
            data: Update data
            
        Returns:
            Optional[ChargingStationResponseDTO]: Updated station details
        """
        station = await self.station_repo.get_station(station_id)
        if not station:
            return None
        
        # Update fields
        if data.name:
            station.name = data.name
        if data.address:
            station.location.address = data.address
        if data.city:
            station.location.city = data.city
        if data.state:
            station.location.state = data.state
        if data.zip_code:
            station.location.zip_code = data.zip_code
        if data.max_power_kw is not None:
            station.max_power_kw = data.max_power_kw
        if data.connector_types is not None:
            station.connector_types = data.connector_types
        if data.is_active is not None:
            station.is_active = data.is_active
        
        async with self.uow:
            updated_station = await self.station_repo.update_station(station)
        
        logger.info(f"Charging station updated: {station_id}")
        return ChargingStationResponseDTO.from_entity(updated_station)

    async def delete_charging_station(self, station_id: UUID) -> bool:
        """
        Delete a charging station.
        
        Args:
            station_id: Charging station ID
            
        Returns:
            bool: True if deleted successfully
        """
        async with self.uow:
            success = await self.station_repo.delete_station(station_id)
        
        if success:
            logger.info(f"Charging station deleted: {station_id}")
        return success

    # ==========================================================================
    # Charging Session Management
    # ==========================================================================

    async def start_charging(
        self,
        data: StartChargingDTO,
    ) -> ChargingSessionDTO:
        """
        Start a new charging session.
        
        Args:
            data: Start charging request data
            
        Returns:
            ChargingSessionDTO: Created charging session
            
        Raises:
            ValueError: If starting charging fails
        """
        # Get station
        station = await self.station_repo.get_station(data.station_id)
        if not station:
            raise ValueError(f"Charging station {data.station_id} not found")
        
        if not station.is_active:
            raise ValueError(f"Charging station {data.station_id} is inactive")
        
        # Check if station has capacity
        active_sessions = await self.session_repo.get_active_sessions(data.station_id)
        if len(active_sessions) >= 4:  # Assuming max 4 concurrent sessions
            raise ValueError("Charging station is at maximum capacity")
        
        # Get vehicle
        vehicle = await self.vehicle_repo.get_vehicle(data.vehicle_id)
        if not vehicle:
            raise ValueError(f"Vehicle {data.vehicle_id} not found")
        
        if not isinstance(vehicle, ElectricVehicle):
            raise ValueError("Vehicle is not electric")
        
        # Check if vehicle is already charging
        existing_session = await self.session_repo.get_active_session_for_vehicle(vehicle.id)
        if existing_session:
            raise ValueError("Vehicle is already in an active charging session")
        
        # Create charging session
        session = ChargingSession(
            station_id=station.id,
            vehicle_id=vehicle.id,
            start_time=datetime.now(),
            connector_type=data.connector_type or station.connector_types[0],
        )
        
        # Update vehicle charging status
        vehicle.start_charging()
        
        # Save all changes
        async with self.uow:
            saved_session = await self.session_repo.save_session(session)
            await self.vehicle_repo.update_vehicle(vehicle)
        
        # Publish event
        await self._publish_charging_started_event(station, saved_session, vehicle)
        
        logger.info(f"Charging started for vehicle {vehicle.license_plate}")
        return ChargingSessionDTO.from_entity(saved_session)

    async def _publish_charging_started_event(
        self,
        station: ChargingStation,
        session: ChargingSession,
        vehicle: ElectricVehicle,
    ) -> None:
        """Publish charging started event."""
        event = EventFactory.create_charging_started_event(
            station_id=station.id,
            session_id=session.id,
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            charge_rate_kw=vehicle.max_charge_rate_kw,
            battery_percent=vehicle.current_charge_percent,
            connector_type=session.connector_type,
        )
        await self.event_bus.publish(event)

    async def stop_charging(
        self,
        data: StopChargingDTO,
    ) -> ChargingSessionDTO:
        """
        Stop an active charging session.
        
        Args:
            data: Stop charging request data
            
        Returns:
            ChargingSessionDTO: Completed charging session
            
        Raises:
            ValueError: If stopping charging fails
        """
        # Get session
        session = await self.session_repo.get_session(data.session_id)
        if not session:
            raise ValueError(f"Charging session {data.session_id} not found")
        
        if session.status != ChargingStatus.CHARGING:
            raise ValueError(f"Session {data.session_id} is not active")
        
        # Calculate session data
        duration_hours = session.get_duration_hours()
        if duration_hours < self.MINIMUM_CHARGE_DURATION_MINUTES / 60:
            raise ValueError(f"Minimum charging duration is {self.MINIMUM_CHARGE_DURATION_MINUTES} minutes")
        
        # Calculate energy consumption (simulated)
        vehicle = await self.vehicle_repo.get_vehicle(session.vehicle_id)
        if not vehicle:
            raise ValueError(f"Vehicle {session.vehicle_id} not found")
        
        # Simulate energy consumption based on duration and charge rate
        if isinstance(vehicle, ElectricVehicle):
            energy_consumed = self._calculate_energy_consumption(
                duration_hours,
                vehicle.max_charge_rate_kw,
                vehicle.current_charge_percent,
            )
            session.energy_consumed_kwh = energy_consumed
            
            # Update vehicle charge
            charge_added = (energy_consumed / vehicle.battery_capacity_kwh) * 100
            vehicle.add_charge(charge_added)
        
        # Stop session
        session.stop()
        
        # Calculate cost
        cost = self._calculate_charging_cost(session.energy_consumed_kwh, duration_hours)
        session.cost = cost
        
        # Save changes
        async with self.uow:
            saved_session = await self.session_repo.save_session(session)
            if isinstance(vehicle, ElectricVehicle):
                await self.vehicle_repo.update_vehicle(vehicle)
        
        # Publish event
        await self._publish_charging_completed_event(station, saved_session, vehicle)
        
        logger.info(f"Charging stopped for session {session.id}")
        return ChargingSessionDTO.from_entity(saved_session)

    def _calculate_energy_consumption(
        self,
        duration_hours: float,
        max_charge_rate_kw: float,
        current_charge_percent: float,
    ) -> float:
        """
        Calculate energy consumption for a charging session.
        
        Args:
            duration_hours: Duration in hours
            max_charge_rate_kw: Maximum charge rate in kW
            current_charge_percent: Current battery percentage
            
        Returns:
            float: Energy consumed in kWh
        """
        # Simulate charging curve (simplified)
        # Actual charging slows down as battery approaches 80%
        efficiency = 0.95  # 95% efficiency
        
        if current_charge_percent < 80:
            # Fast charging
            rate_multiplier = 1.0
        elif current_charge_percent < 90:
            # Slowing down
            rate_multiplier = 0.7
        else:
            # Trickle charging
            rate_multiplier = 0.3
        
        effective_rate = max_charge_rate_kw * rate_multiplier
        return duration_hours * effective_rate * efficiency

    def _calculate_charging_cost(self, energy_kwh: float, duration_hours: float) -> float:
        """
        Calculate charging session cost.
        
        Args:
            energy_kwh: Energy consumed in kWh
            duration_hours: Duration in hours
            
        Returns:
            float: Total cost
        """
        energy_cost = energy_kwh * self.rate_per_kwh
        time_cost = duration_hours * 0.50  # $0.50 per hour parking fee
        return energy_cost + time_cost + self.connection_fee

    async def _publish_charging_completed_event(
        self,
        station: ChargingStation,
        session: ChargingSession,
        vehicle: ElectricVehicle,
    ) -> None:
        """Publish charging completed event."""
        event = EventFactory.create_charging_completed_event(
            station_id=station.id,
            session_id=session.id,
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            energy_consumed_kwh=session.energy_consumed_kwh,
            duration_hours=session.get_duration_hours(),
            cost=session.cost,
            battery_percent=vehicle.current_charge_percent,
        )
        await self.event_bus.publish(event)

    async def get_charging_session(
        self,
        session_id: UUID,
    ) -> Optional[ChargingSessionDTO]:
        """
        Get a charging session by ID.
        
        Args:
            session_id: Charging session ID
            
        Returns:
            Optional[ChargingSessionDTO]: Session details if found
        """
        session = await self.session_repo.get_session(session_id)
        if not session:
            return None
        return ChargingSessionDTO.from_entity(session)

    async def get_active_sessions(
        self,
        station_id: Optional[UUID] = None,
    ) -> List[ChargingSessionDTO]:
        """
        Get active charging sessions.
        
        Args:
            station_id: Optional station ID to filter
            
        Returns:
            List[ChargingSessionDTO]: List of active sessions
        """
        sessions = await self.session_repo.get_active_sessions(station_id)
        return [ChargingSessionDTO.from_entity(session) for session in sessions]

    async def get_vehicle_sessions(
        self,
        vehicle_id: UUID,
        limit: int = 100,
    ) -> List[ChargingSessionDTO]:
        """
        Get charging sessions for a vehicle.
        
        Args:
            vehicle_id: Vehicle ID
            limit: Maximum number of sessions to return
            
        Returns:
            List[ChargingSessionDTO]: List of charging sessions
        """
        sessions = await self.session_repo.get_vehicle_sessions(vehicle_id, limit)
        return [ChargingSessionDTO.from_entity(session) for session in sessions]

    # ==========================================================================
    # Station Status and Monitoring
    # ==========================================================================

    async def get_station_status(
        self,
        station_id: UUID,
    ) -> ChargingStatusDTO:
        """
        Get charging station status.
        
        Args:
            station_id: Charging station ID
            
        Returns:
            ChargingStatusDTO: Station status
        """
        station = await self.station_repo.get_station(station_id)
        if not station:
            raise ValueError(f"Charging station {station_id} not found")
        
        active_sessions = await self.session_repo.get_active_sessions(station_id)
        
        return ChargingStatusDTO(
            station_id=station.id,
            name=station.name,
            location=str(station.location),
            is_active=station.is_active,
            max_power_kw=station.max_power_kw,
            active_sessions_count=len(active_sessions),
            available_connectors=max(0, 4 - len(active_sessions)),
            connector_types=station.connector_types,
            total_energy_delivered_kwh=await self.session_repo.get_total_energy(station_id),
        )

    async def get_station_analytics(
        self,
        station_id: UUID,
        days: int = 7,
    ) -> Dict[str, Any]:
        """
        Get charging station analytics.
        
        Args:
            station_id: Charging station ID
            days: Number of days to analyze
            
        Returns:
            Dict[str, Any]: Analytics data
        """
        sessions = await self.session_repo.get_recent_sessions(
            station_id,
            days=days,
        )
        
        total_sessions = len(sessions)
        total_energy = sum(s.energy_consumed_kwh for s in sessions)
        total_revenue = sum(s.cost or 0 for s in sessions)
        avg_session_duration = sum(s.get_duration_hours() for s in sessions) / total_sessions if total_sessions > 0 else 0
        
        # Calculate daily averages
        daily_sessions = {}
        for session in sessions:
            date = session.start_time.date()
            if date not in daily_sessions:
                daily_sessions[date] = []
            daily_sessions[date].append(session)
        
        daily_averages = {
            'avg_sessions': sum(len(s) for s in daily_sessions.values()) / len(daily_sessions) if daily_sessions else 0,
            'avg_energy': total_energy / len(daily_sessions) if daily_sessions else 0,
            'avg_revenue': total_revenue / len(daily_sessions) if daily_sessions else 0,
        }
        
        return {
            'station_id': str(station_id),
            'period_days': days,
            'total_sessions': total_sessions,
            'total_energy_kwh': total_energy,
            'total_revenue': total_revenue,
            'avg_session_duration_hours': avg_session_duration,
            'daily_averages': daily_averages,
            'sessions': [ChargingSessionDTO.from_entity(s) for s in sessions[:20]],
        }

    # ==========================================================================
    = Charging Reports ==========================================================================

    async def generate_charging_report(
        self,
        start_date: datetime,
        end_date: datetime,
        station_id: Optional[UUID] = None,
    ) -> ChargingReportDTO:
        """
        Generate a comprehensive charging report.
        
        Args:
            start_date: Start date for report
            end_date: End date for report
            station_id: Optional station ID to filter
            
        Returns:
            ChargingReportDTO: Charging report
        """
        sessions = await self.session_repo.get_sessions_in_date_range(
            start_date,
            end_date,
            station_id,
        )
        
        total_sessions = len(sessions)
        completed_sessions = sum(1 for s in sessions if s.status == ChargingStatus.COMPLETED)
        total_energy = sum(s.energy_consumed_kwh for s in sessions)
        total_revenue = sum(s.cost or 0 for s in sessions)
        
        # Calculate peak usage
        hourly_usage = {}
        for session in sessions:
            hour = session.start_time.hour
            hourly_usage[hour] = hourly_usage.get(hour, 0) + 1
        
        peak_hour = max(hourly_usage.items(), key=lambda x: x[1])[0] if hourly_usage else 0
        peak_hour_count = hourly_usage.get(peak_hour, 0)
        
        return ChargingReportDTO(
            start_date=start_date,
            end_date=end_date,
            station_id=station_id,
            total_sessions=total_sessions,
            completed_sessions=completed_sessions,
            total_energy_kwh=total_energy,
            total_revenue=total_revenue,
            average_energy_per_session=total_energy / total_sessions if total_sessions > 0 else 0,
            average_revenue_per_session=total_revenue / total_sessions if total_sessions > 0 else 0,
            peak_usage_hour=peak_hour,
            peak_usage_count=peak_hour_count,
        )

    # ==========================================================================
    # Configuration
    # ==========================================================================

    def set_charging_rate(self, rate_per_kwh: float) -> None:
        """
        Set the charging rate per kWh.
        
        Args:
            rate_per_kwh: Rate in USD per kWh
        """
        if rate_per_kwh < 0:
            raise ValueError("Rate per kWh cannot be negative")
        self.rate_per_kwh = rate_per_kwh
        logger.info(f"Charging rate updated: ${rate_per_kwh}/kWh")

    def set_connection_fee(self, fee: float) -> None:
        """
        Set the connection fee.
        
        Args:
            fee: Connection fee in USD
        """
        if fee < 0:
            raise ValueError("Connection fee cannot be negative")
        self.connection_fee = fee
        logger.info(f"Connection fee updated: ${fee}")

    # ==========================================================================
    # Health Check
    # ==========================================================================

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check for the charging service.
        
        Returns:
            Dict[str, Any]: Health status
        """
        health = await super().health_check()
        
        # Check database connectivity
        try:
            station_count = await self.station_repo.count_active()
            health['station_count'] = station_count
            health['database_status'] = 'healthy'
        except Exception as e:
            health['database_status'] = 'unhealthy'
            health['database_error'] = str(e)
        
        # Check session counts
        try:
            active_sessions = await self.session_repo.count_active()
            health['active_sessions'] = active_sessions
        except Exception as e:
            health['session_status'] = 'unhealthy'
            health['session_error'] = str(e)
        
        return health