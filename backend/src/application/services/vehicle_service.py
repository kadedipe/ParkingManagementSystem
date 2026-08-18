# ============================================================================
# Parking Management System - Vehicle Service
# ============================================================================

"""
Vehicle Service - Vehicle Management Application Logic.

This service handles all vehicle-related operations including:
- Vehicle registration and management
- Vehicle type management
- Vehicle search and filtering
- Vehicle history tracking
- Electric vehicle management
- Vehicle validation
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
import logging
import re

from src.application.services.base import BaseService
from src.domain.models import Vehicle, ElectricVehicle
from src.domain.enums import VehicleType, PowerSource
from src.domain.value_objects import LicensePlate
from src.domain.events import EventBus, EventFactory
from src.application.dtos.vehicle_dto import (
    VehicleCreateDTO,
    VehicleResponseDTO,
    VehicleUpdateDTO,
    VehicleSearchDTO,
    VehicleHistoryDTO,
    VehicleTypeDTO,
)
from src.application.interfaces import IVehicleService, IUnitOfWork
from src.infrastructure.repositories import VehicleRepository, ParkingRepository

logger = logging.getLogger(__name__)


class VehicleService(BaseService, IVehicleService):
    """
    Vehicle service implementing vehicle management business logic.
    
    This service handles:
    - Registering and managing vehicles
    - Vehicle type management
    - Vehicle search and filtering
    - Vehicle history tracking
    - Electric vehicle management
    - Vehicle validation and verification
    """
    
    # Vehicle validation constants
    LICENSE_PLATE_PATTERN = r'^[A-Z0-9\-]{3,10}$'
    MIN_YEAR = 1900
    MAX_YEAR = datetime.now().year + 1
    SUPPORTED_VEHICLE_TYPES = [vt.value for vt in VehicleType]
    SUPPORTED_POWER_SOURCES = [ps.value for ps in PowerSource]
    
    def __init__(
        self,
        vehicle_repository: VehicleRepository,
        parking_repository: ParkingRepository,
        event_bus: EventBus,
        uow: IUnitOfWork,
    ):
        """
        Initialize the vehicle service.
        
        Args:
            vehicle_repository: Repository for vehicle data
            parking_repository: Repository for parking data
            event_bus: Event bus for publishing domain events
            uow: Unit of work for transaction management
        """
        super().__init__()
        self.vehicle_repo = vehicle_repository
        self.parking_repo = parking_repository
        self.event_bus = event_bus
        self.uow = uow

    # ==========================================================================
    # Vehicle Registration and Management
    # ==========================================================================

    async def register_vehicle(
        self,
        data: VehicleCreateDTO,
    ) -> VehicleResponseDTO:
        """
        Register a new vehicle.
        
        Args:
            data: Vehicle registration data
            
        Returns:
            VehicleResponseDTO: Registered vehicle details
            
        Raises:
            ValueError: If validation fails or vehicle already exists
        """
        try:
            # Validate input
            self._validate_vehicle_data(data)
            
            # Check if vehicle already exists
            existing = await self.vehicle_repo.find_by_plate(data.license_plate)
            if existing:
                raise ValueError(f"Vehicle with license plate {data.license_plate} already exists")
            
            # Create vehicle
            plate = LicensePlate(data.license_plate)
            vehicle = self._create_vehicle_from_dto(data, plate)
            
            # Save using repository
            async with self.uow:
                saved_vehicle = await self.vehicle_repo.save_vehicle(vehicle)
                
                # Publish domain event
                await self._publish_vehicle_registered_event(saved_vehicle)
            
            logger.info(f"Vehicle registered: {saved_vehicle.license_plate}")
            return VehicleResponseDTO.from_entity(saved_vehicle)
            
        except Exception as e:
            logger.error(f"Failed to register vehicle: {e}")
            raise

    def _validate_vehicle_data(self, data: VehicleCreateDTO) -> None:
        """Validate vehicle registration data."""
        # License plate validation
        if not data.license_plate:
            raise ValueError("License plate cannot be empty")
        
        plate = data.license_plate.upper().strip()
        if not re.match(self.LICENSE_PLATE_PATTERN, plate):
            raise ValueError(f"Invalid license plate format: {data.license_plate}")
        
        # Make and model validation
        if not data.make:
            raise ValueError("Make cannot be empty")
        if len(data.make) < 2:
            raise ValueError("Make must be at least 2 characters")
        
        if not data.model:
            raise ValueError("Model cannot be empty")
        if len(data.model) < 2:
            raise ValueError("Model must be at least 2 characters")
        
        # Color validation
        if not data.color:
            raise ValueError("Color cannot be empty")
        
        # Year validation
        if data.year < self.MIN_YEAR or data.year > self.MAX_YEAR:
            raise ValueError(f"Year must be between {self.MIN_YEAR} and {self.MAX_YEAR}")
        
        # Vehicle type validation
        if data.vehicle_type and data.vehicle_type not in self.SUPPORTED_VEHICLE_TYPES:
            raise ValueError(f"Unsupported vehicle type: {data.vehicle_type}")
        
        # Power source validation (for electric vehicles)
        if data.is_electric:
            if data.power_source and data.power_source not in self.SUPPORTED_POWER_SOURCES:
                raise ValueError(f"Unsupported power source: {data.power_source}")
            if data.battery_capacity_kwh is not None and data.battery_capacity_kwh <= 0:
                raise ValueError("Battery capacity must be greater than 0")
            if data.current_charge_percent is not None and not (0 <= data.current_charge_percent <= 100):
                raise ValueError("Current charge must be between 0 and 100")

    def _create_vehicle_from_dto(
        self,
        data: VehicleCreateDTO,
        plate: LicensePlate,
    ) -> Vehicle:
        """Create a vehicle entity from DTO."""
        if data.is_electric:
            return ElectricVehicle(
                license_plate=plate,
                make=data.make,
                model=data.model,
                color=data.color,
                year=data.year,
                vehicle_type=VehicleType(data.vehicle_type) if data.vehicle_type else VehicleType.CAR,
                power_source=PowerSource(data.power_source) if data.power_source else PowerSource.ELECTRIC,
                battery_capacity_kwh=data.battery_capacity_kwh or 60.0,
                current_charge_percent=data.current_charge_percent or 50.0,
                max_charge_rate_kw=data.max_charge_rate_kw or 7.4,
            )
        
        return Vehicle(
            license_plate=plate,
            make=data.make,
            model=data.model,
            color=data.color,
            year=data.year,
            vehicle_type=VehicleType(data.vehicle_type) if data.vehicle_type else VehicleType.CAR,
            power_source=PowerSource(data.power_source) if data.power_source else PowerSource.GASOLINE,
        )

    async def _publish_vehicle_registered_event(self, vehicle: Vehicle) -> None:
        """Publish vehicle registered event."""
        event = EventFactory.create_vehicle_registered_event(
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            make=vehicle.make,
            model=vehicle.model,
            color=vehicle.color,
            year=vehicle.year,
            vehicle_type=vehicle.vehicle_type.value,
            is_electric=vehicle.is_electric,
        )
        await self.event_bus.publish(event)

    async def get_vehicle(
        self,
        vehicle_id: UUID,
    ) -> Optional[VehicleResponseDTO]:
        """
        Get a vehicle by ID.
        
        Args:
            vehicle_id: Vehicle ID
            
        Returns:
            Optional[VehicleResponseDTO]: Vehicle details if found
        """
        vehicle = await self.vehicle_repo.get_vehicle(vehicle_id)
        if not vehicle:
            return None
        return VehicleResponseDTO.from_entity(vehicle)

    async def get_vehicle_by_plate(
        self,
        license_plate: str,
    ) -> Optional[VehicleResponseDTO]:
        """
        Get a vehicle by license plate.
        
        Args:
            license_plate: License plate number
            
        Returns:
            Optional[VehicleResponseDTO]: Vehicle details if found
        """
        vehicle = await self.vehicle_repo.find_by_plate(license_plate)
        if not vehicle:
            return None
        return VehicleResponseDTO.from_entity(vehicle)

    async def get_all_vehicles(
        self,
        active_only: bool = True,
        limit: int = 100,
        offset: int = 0,
    ) -> List[VehicleResponseDTO]:
        """
        Get all vehicles.
        
        Args:
            active_only: If True, only return active vehicles
            limit: Maximum number of vehicles to return
            offset: Number of vehicles to skip
            
        Returns:
            List[VehicleResponseDTO]: List of vehicles
        """
        vehicles = await self.vehicle_repo.get_all_vehicles(
            active_only=active_only,
            limit=limit,
            offset=offset,
        )
        return [VehicleResponseDTO.from_entity(vehicle) for vehicle in vehicles]

    async def update_vehicle(
        self,
        vehicle_id: UUID,
        data: VehicleUpdateDTO,
    ) -> Optional[VehicleResponseDTO]:
        """
        Update a vehicle.
        
        Args:
            vehicle_id: Vehicle ID
            data: Update data
            
        Returns:
            Optional[VehicleResponseDTO]: Updated vehicle details
        """
        vehicle = await self.vehicle_repo.get_vehicle(vehicle_id)
        if not vehicle:
            return None
        
        # Update fields
        if data.make:
            vehicle.make = data.make
        if data.model:
            vehicle.model = data.model
        if data.color:
            vehicle.color = data.color
        if data.year is not None:
            if data.year < self.MIN_YEAR or data.year > self.MAX_YEAR:
                raise ValueError(f"Year must be between {self.MIN_YEAR} and {self.MAX_YEAR}")
            vehicle.year = data.year
        if data.vehicle_type:
            vehicle.vehicle_type = VehicleType(data.vehicle_type)
        if data.power_source:
            vehicle.power_source = PowerSource(data.power_source)
        if data.is_active is not None:
            vehicle.is_active = data.is_active
        
        # Update electric vehicle fields
        if isinstance(vehicle, ElectricVehicle):
            if data.battery_capacity_kwh is not None:
                vehicle.battery_capacity_kwh = data.battery_capacity_kwh
            if data.current_charge_percent is not None:
                vehicle.current_charge_percent = data.current_charge_percent
            if data.max_charge_rate_kw is not None:
                vehicle.max_charge_rate_kw = data.max_charge_rate_kw
        
        async with self.uow:
            updated_vehicle = await self.vehicle_repo.update_vehicle(vehicle)
        
        logger.info(f"Vehicle updated: {updated_vehicle.license_plate}")
        return VehicleResponseDTO.from_entity(updated_vehicle)

    async def delete_vehicle(self, vehicle_id: UUID) -> bool:
        """
        Delete a vehicle.
        
        Args:
            vehicle_id: Vehicle ID
            
        Returns:
            bool: True if deleted successfully
        """
        # Check if vehicle has active bookings
        active_bookings = await self.parking_repo.get_active_bookings_for_vehicle(vehicle_id)
        if active_bookings:
            raise ValueError(f"Vehicle {vehicle_id} has active bookings and cannot be deleted")
        
        async with self.uow:
            success = await self.vehicle_repo.delete_vehicle(vehicle_id)
        
        if success:
            logger.info(f"Vehicle deleted: {vehicle_id}")
        return success

    # ==========================================================================
    # Vehicle Search and Filtering
    # ==========================================================================

    async def search_vehicles(
        self,
        criteria: VehicleSearchDTO,
    ) -> List[VehicleResponseDTO]:
        """
        Search vehicles by criteria.
        
        Args:
            criteria: Search criteria
            
        Returns:
            List[VehicleResponseDTO]: List of matching vehicles
        """
        vehicles = await self.vehicle_repo.search_vehicles(
            license_plate=criteria.license_plate,
            make=criteria.make,
            model=criteria.model,
            color=criteria.color,
            vehicle_type=criteria.vehicle_type,
            is_electric=criteria.is_electric,
            min_year=criteria.min_year,
            max_year=criteria.max_year,
            is_active=criteria.is_active,
            limit=criteria.limit or 100,
            offset=criteria.offset or 0,
        )
        return [VehicleResponseDTO.from_entity(vehicle) for vehicle in vehicles]

    async def find_vehicles_by_color(
        self,
        color: str,
    ) -> List[VehicleResponseDTO]:
        """
        Find vehicles by color.
        
        Args:
            color: Vehicle color
            
        Returns:
            List[VehicleResponseDTO]: List of vehicles with matching color
        """
        vehicles = await self.vehicle_repo.find_by_color(color)
        return [VehicleResponseDTO.from_entity(vehicle) for vehicle in vehicles]

    async def get_electric_vehicles(
        self,
        min_charge: Optional[float] = None,
    ) -> List[VehicleResponseDTO]:
        """
        Get all electric vehicles.
        
        Args:
            min_charge: Optional minimum charge percentage
            
        Returns:
            List[VehicleResponseDTO]: List of electric vehicles
        """
        vehicles = await self.vehicle_repo.get_electric_vehicles(min_charge)
        return [VehicleResponseDTO.from_entity(vehicle) for vehicle in vehicles]

    # ==========================================================================
    # Vehicle History
    # ==========================================================================

    async def get_vehicle_history(
        self,
        vehicle_id: UUID,
        days: int = 30,
    ) -> VehicleHistoryDTO:
        """
        Get vehicle parking history.
        
        Args:
            vehicle_id: Vehicle ID
            days: Number of days to look back
            
        Returns:
            VehicleHistoryDTO: Vehicle history
        """
        vehicle = await self.vehicle_repo.get_vehicle(vehicle_id)
        if not vehicle:
            raise ValueError(f"Vehicle {vehicle_id} not found")
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Get parking history
        bookings = await self.parking_repo.get_bookings_for_vehicle(
            vehicle_id,
            start_date=start_date,
        )
        
        # Calculate statistics
        total_parking_time = sum(
            b.get_duration_hours() for b in bookings if b.exit_time
        )
        total_spent = sum(
            b.total_amount or 0 for b in bookings if b.exit_time
        )
        
        # Get charging history if electric vehicle
        charging_sessions = []
        if isinstance(vehicle, ElectricVehicle):
            charging_sessions = await self.session_repo.get_vehicle_sessions(
                vehicle_id,
                days=days,
            )
        
        return VehicleHistoryDTO(
            vehicle=VehicleResponseDTO.from_entity(vehicle),
            total_bookings=len(bookings),
            total_parking_hours=total_parking_time,
            total_spent=total_spent,
            average_parking_hours=total_parking_time / len(bookings) if bookings else 0,
            recent_bookings=bookings[:10],
            charging_sessions=charging_sessions[:10] if charging_sessions else [],
        )

    # ==========================================================================
    # Vehicle Statistics
    # ==========================================================================

    async def get_vehicle_statistics(self) -> Dict[str, Any]:
        """
        Get vehicle statistics.
        
        Returns:
            Dict[str, Any]: Vehicle statistics
        """
        total_vehicles = await self.vehicle_repo.count_all()
        active_vehicles = await self.vehicle_repo.count_active()
        electric_vehicles = await self.vehicle_repo.count_electric()
        
        # Get vehicle type distribution
        type_distribution = await self.vehicle_repo.get_type_distribution()
        
        # Get most common makes
        top_makes = await self.vehicle_repo.get_top_makes(limit=10)
        
        return {
            'total_vehicles': total_vehicles,
            'active_vehicles': active_vehicles,
            'electric_vehicles': electric_vehicles,
            'vehicle_type_distribution': type_distribution,
            'top_makes': top_makes,
            'timestamp': datetime.now().isoformat(),
        }

    # ==========================================================================
    # Vehicle Validation
    # ==========================================================================

    async def validate_vehicle(
        self,
        license_plate: str,
    ) -> Dict[str, Any]:
        """
        Validate a vehicle.
        
        Args:
            license_plate: License plate to validate
            
        Returns:
            Dict[str, Any]: Validation results
        """
        validation_result = {
            'is_valid': False,
            'errors': [],
            'warnings': [],
            'vehicle': None,
        }
        
        # Check format
        plate = license_plate.upper().strip()
        if not re.match(self.LICENSE_PLATE_PATTERN, plate):
            validation_result['errors'].append(f"Invalid license plate format: {plate}")
            return validation_result
        
        # Check if exists
        vehicle = await self.vehicle_repo.find_by_plate(plate)
        if vehicle:
            validation_result['vehicle'] = VehicleResponseDTO.from_entity(vehicle)
            validation_result['is_valid'] = True
            
            # Check for warnings
            if not vehicle.is_active:
                validation_result['warnings'].append("Vehicle is marked as inactive")
            
            if isinstance(vehicle, ElectricVehicle):
                if vehicle.current_charge_percent < 20:
                    validation_result['warnings'].append(f"Low battery charge: {vehicle.current_charge_percent}%")
        else:
            validation_result['errors'].append("Vehicle not found in the system")
        
        return validation_result

    # ==========================================================================
    # Bulk Operations
    # ==========================================================================

    async def bulk_register_vehicles(
        self,
        vehicles_data: List[VehicleCreateDTO],
    ) -> Dict[str, Any]:
        """
        Register multiple vehicles in bulk.
        
        Args:
            vehicles_data: List of vehicle registration data
            
        Returns:
            Dict[str, Any]: Bulk operation results
        """
        results = {
            'success': [],
            'failed': [],
            'total': len(vehicles_data),
        }
        
        for data in vehicles_data:
            try:
                vehicle = await self.register_vehicle(data)
                results['success'].append({
                    'license_plate': data.license_plate,
                    'vehicle_id': str(vehicle.id),
                })
            except Exception as e:
                results['failed'].append({
                    'license_plate': data.license_plate,
                    'error': str(e),
                })
        
        results['success_count'] = len(results['success'])
        results['failed_count'] = len(results['failed'])
        
        logger.info(f"Bulk registration complete: {results['success_count']} success, {results['failed_count']} failed")
        return results

    # ==========================================================================
    # Health Check
    # ==========================================================================

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check for the vehicle service.
        
        Returns:
            Dict[str, Any]: Health status
        """
        health = await super().health_check()
        
        # Check database connectivity
        try:
            vehicle_count = await self.vehicle_repo.count_all()
            health['vehicle_count'] = vehicle_count
            health['database_status'] = 'healthy'
        except Exception as e:
            health['database_status'] = 'unhealthy'
            health['database_error'] = str(e)
        
        return health