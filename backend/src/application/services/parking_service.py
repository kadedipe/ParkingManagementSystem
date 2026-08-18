# ============================================================================
# Parking Service - Core Application Service
# ============================================================================

"""
Parking Service - Core application logic for parking operations.

This service handles all parking-related operations including lot management,
vehicle parking, removal, and ticket management.
"""

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import logging

from src.application.services.base import BaseService
from src.domain.models import (
    ParkingLot,
    ParkingSlot,
    Vehicle,
    ParkingTicket,
    Location,
    LicensePlate,
    VehicleType,
    BookingStatus,
    SlotStatus,
)
from src.domain.value_objects import Money
from src.domain.events import EventBus, EventFactory
from src.application.dtos.parking_dto import (
    ParkingLotCreateDTO,
    ParkingLotResponseDTO,
    ParkingLotUpdateDTO,
    ParkVehicleDTO,
    RemoveVehicleDTO,
    ParkingTicketDTO,
    LotStatusDTO,
)
from src.application.interfaces import IParkingService, IUnitOfWork
from src.infrastructure.repositories import ParkingRepository, VehicleRepository

logger = logging.getLogger(__name__)


class ParkingService(BaseService, IParkingService):
    """
    Parking service implementing core parking business logic.
    
    This service handles:
    - Creating and managing parking lots
    - Parking and removing vehicles
    - Managing parking tickets
    - Reporting and analytics
    - Event publishing
    """
    
    def __init__(
        self,
        parking_repository: ParkingRepository,
        vehicle_repository: VehicleRepository,
        event_bus: EventBus,
        uow: IUnitOfWork,
    ):
        """
        Initialize the parking service.
        
        Args:
            parking_repository: Repository for parking data
            vehicle_repository: Repository for vehicle data
            event_bus: Event bus for publishing domain events
            uow: Unit of work for transaction management
        """
        super().__init__()
        self.parking_repo = parking_repository
        self.vehicle_repo = vehicle_repository
        self.event_bus = event_bus
        self.uow = uow
    
    # ===== Parking Lot Management =====
    
    async def create_parking_lot(
        self,
        data: ParkingLotCreateDTO,
    ) -> ParkingLotResponseDTO:
        """
        Create a new parking lot.
        
        Args:
            data: Parking lot creation data
            
        Returns:
            ParkingLotResponseDTO: Created parking lot details
            
        Raises:
            ValueError: If validation fails
        """
        try:
            # Validate input
            self._validate_parking_lot_data(data)
            
            # Create location and capacity objects
            location = Location(
                address=data.address,
                city=data.city,
                state=data.state,
                zip_code=data.zip_code,
                latitude=data.latitude,
                longitude=data.longitude,
            )
            
            # Create parking lot
            lot = ParkingLot(
                name=data.name,
                location=location,
                total_capacity=data.total_capacity,
                ev_capacity=data.ev_capacity,
                disabled_capacity=data.disabled_capacity,
                hourly_rate=data.hourly_rate,
            )
            
            # Save using repository
            async with self.uow:
                saved_lot = await self.parking_repo.save_lot(lot)
                
                # Publish domain event
                await self._publish_lot_created_event(saved_lot)
            
            logger.info(f"Parking lot created: {saved_lot.id}")
            return ParkingLotResponseDTO.from_entity(saved_lot)
            
        except Exception as e:
            logger.error(f"Failed to create parking lot: {e}")
            raise
    
    def _validate_parking_lot_data(self, data: ParkingLotCreateDTO) -> None:
        """Validate parking lot creation data."""
        if data.total_capacity <= 0:
            raise ValueError("Total capacity must be greater than 0")
        
        if data.ev_capacity < 0 or data.disabled_capacity < 0:
            raise ValueError("EV and disabled capacity cannot be negative")
        
        if data.ev_capacity + data.disabled_capacity > data.total_capacity:
            raise ValueError("EV + Disabled capacity exceeds total capacity")
        
        if data.hourly_rate < 0:
            raise ValueError("Hourly rate cannot be negative")
    
    async def _publish_lot_created_event(self, lot: ParkingLot) -> None:
        """Publish parking lot created event."""
        event = EventFactory.create_parking_lot_created_event(
            lot_id=lot.id,
            name=lot.name,
            address=lot.location.address,
            city=lot.location.city,
            state=lot.location.state,
            zip_code=lot.location.zip_code,
            total_capacity=lot.total_capacity,
            ev_capacity=lot.ev_capacity,
            disabled_capacity=lot.disabled_capacity,
            hourly_rate=lot.hourly_rate,
        )
        await self.event_bus.publish(event)
    
    # ===== Parking Operations =====
    
    async def park_vehicle(
        self,
        data: ParkVehicleDTO,
    ) -> Tuple[ParkingTicketDTO, ParkingSlot]:
        """
        Park a vehicle in the lot.
        
        Args:
            data: Parking request data
            
        Returns:
            Tuple[ParkingTicketDTO, ParkingSlot]: Created ticket and allocated slot
            
        Raises:
            ValueError: If parking fails
        """
        # Get parking lot
        lot = await self.parking_repo.get_lot(data.lot_id)
        if not lot:
            raise ValueError(f"Parking lot {data.lot_id} not found")
        
        if not lot.is_active:
            raise ValueError(f"Parking lot {data.lot_id} is inactive")
        
        # Get or create vehicle
        vehicle = await self._get_or_create_vehicle(data)
        
        # Find available slot
        slot = lot.find_available_slot(vehicle)
        if not slot:
            raise ValueError("No available slots in this parking lot")
        
        # Occupy slot and create ticket
        ticket = await self._occupy_slot_and_create_ticket(lot, slot, vehicle)
        
        # Save changes and publish event
        async with self.uow:
            saved_ticket = await self.parking_repo.save_ticket(ticket)
            await self.parking_repo.update_lot(lot)
        
        await self._publish_vehicle_parked_event(lot, slot, ticket, vehicle)
        
        logger.info(f"Vehicle {vehicle.license_plate} parked in slot {slot.slot_number}")
        return ParkingTicketDTO.from_entity(saved_ticket), slot
    
    async def _get_or_create_vehicle(self, data: ParkVehicleDTO) -> Vehicle:
        """Get existing vehicle or create a new one."""
        vehicle = await self.vehicle_repo.find_by_plate(data.license_plate)
        if not vehicle:
            plate = LicensePlate(data.license_plate)
            vehicle = Vehicle(
                license_plate=plate,
                make=data.make,
                model=data.model,
                color=data.color,
                year=data.year,
                vehicle_type=VehicleType(data.vehicle_type) if data.vehicle_type else VehicleType.CAR,
                is_electric=data.is_electric,
            )
            async with self.uow:
                vehicle = await self.vehicle_repo.save_vehicle(vehicle)
        return vehicle
    
    async def _occupy_slot_and_create_ticket(
        self,
        lot: ParkingLot,
        slot: ParkingSlot,
        vehicle: Vehicle,
    ) -> ParkingTicket:
        """Occupy slot and create parking ticket."""
        slot.occupy(vehicle.id)
        
        return ParkingTicket(
            ticket_number=f"TICKET-{datetime.now().strftime('%Y%m%d%H%M%S')}-{slot.slot_number}",
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            vehicle_id=vehicle.id,
            entry_time=datetime.now(),
        )
    
    async def _publish_vehicle_parked_event(
        self,
        lot: ParkingLot,
        slot: ParkingSlot,
        ticket: ParkingTicket,
        vehicle: Vehicle,
    ) -> None:
        """Publish vehicle parked event."""
        event = EventFactory.create_vehicle_parked_event(
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            ticket_number=ticket.ticket_number,
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            is_electric=vehicle.is_electric,
        )
        await self.event_bus.publish(event)
    
    # ===== Status and Reporting =====
    
    async def get_lot_status(self, lot_id: UUID) -> LotStatusDTO:
        """
        Get parking lot status.
        
        Args:
            lot_id: Parking lot ID
            
        Returns:
            LotStatusDTO: Parking lot status
        """
        lot = await self.parking_repo.get_lot(lot_id)
        if not lot:
            raise ValueError(f"Parking lot {lot_id} not found")
        
        stats = lot.get_occupancy_stats()
        return LotStatusDTO(
            lot_id=lot.id,
            name=lot.name,
            location=str(lot.location),
            hourly_rate=lot.hourly_rate,
            total_slots=stats['total_slots'],
            occupied_slots=stats['occupied_slots'],
            available_slots=stats['available_slots'],
            occupancy_rate=stats['occupancy_rate'],
            ev_occupied=stats['ev_occupied'],
            ev_total=stats['ev_total'],
        )
    
    async def get_revenue_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Get revenue report.
        
        Args:
            start_date: Start date for report
            end_date: End date for report
            
        Returns:
            Dict[str, Any]: Revenue report data
        """
        tickets = await self.parking_repo.get_completed_tickets(
            start_date=start_date,
            end_date=end_date,
        )
        
        total_revenue = sum(t.total_amount or 0 for t in tickets)
        total_tickets = len(tickets)
        
        return {
            'total_revenue': total_revenue,
            'total_tickets': total_tickets,
            'average_revenue': total_revenue / total_tickets if total_tickets > 0 else 0,
            'tickets': [ParkingTicketDTO.from_entity(t) for t in tickets],
        }