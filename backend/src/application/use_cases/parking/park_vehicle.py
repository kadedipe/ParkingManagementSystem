# ============================================================================
# Parking Management System - Park Vehicle Use Case
# ============================================================================

"""
Park Vehicle Use Case.

This use case handles the business logic for parking a vehicle in a parking lot.
"""

from typing import Optional, Tuple
from uuid import UUID
from datetime import datetime
import logging

from src.application.use_cases.base import BaseUseCase
from src.application.dtos.parking_dto import ParkVehicleRequest, ParkingTicketResponse, ParkingSlotResponse
from src.domain.models import Vehicle, ParkingLot, ParkingSlot, ParkingTicket
from src.domain.value_objects import LicensePlate
from src.domain.enums import VehicleType
from src.domain.events import EventBus, EventFactory
from src.infrastructure.repositories import ParkingRepository, VehicleRepository
from src.infrastructure.unit_of_work import UnitOfWork

logger = logging.getLogger(__name__)


class ParkVehicleUseCase(BaseUseCase):
    """
    Use case for parking a vehicle.
    
    This use case:
    1. Validates the parking request
    2. Finds or creates a vehicle
    3. Finds an available slot
    4. Parks the vehicle
    5. Creates a parking ticket
    6. Publishes domain events
    7. Returns the ticket and slot information
    """
    
    def __init__(
        self,
        parking_repository: ParkingRepository,
        vehicle_repository: VehicleRepository,
        event_bus: EventBus,
        uow: UnitOfWork,
    ):
        """
        Initialize the use case.
        
        Args:
            parking_repository: Repository for parking data
            vehicle_repository: Repository for vehicle data
            event_bus: Event bus for publishing domain events
            uow: Unit of work for transaction management
        """
        self.parking_repo = parking_repository
        self.vehicle_repo = vehicle_repository
        self.event_bus = event_bus
        self.uow = uow
    
    async def execute(self, request: ParkVehicleRequest) -> Tuple[ParkingTicketResponse, ParkingSlotResponse]:
        """
        Execute the park vehicle use case.
        
        Args:
            request: Park vehicle request
            
        Returns:
            Tuple[ParkingTicketResponse, ParkingSlotResponse]: Created ticket and allocated slot
            
        Raises:
            ValueError: If parking fails
        """
        # 1. Validate the request
        self._validate_request(request)
        
        # 2. Get the parking lot
        lot = await self.parking_repo.get_lot(request.lot_id)
        if not lot:
            raise ValueError(f"Parking lot {request.lot_id} not found")
        
        if not lot.is_active:
            raise ValueError(f"Parking lot {request.lot_id} is inactive")
        
        # 3. Find or create vehicle
        vehicle = await self._get_or_create_vehicle(request)
        
        # 4. Find available slot
        slot = lot.find_available_slot(vehicle)
        if not slot:
            raise ValueError("No available slots in this parking lot")
        
        # 5. Occupy slot and create ticket
        ticket = await self._park_vehicle(lot, slot, vehicle)
        
        # 6. Save changes and publish events
        async with self.uow:
            saved_ticket = await self.parking_repo.save_ticket(ticket)
            await self.parking_repo.update_lot(lot)
        
        await self._publish_events(lot, slot, ticket, vehicle)
        
        logger.info(f"Vehicle {vehicle.license_plate} parked in slot {slot.slot_number}")
        
        # 7. Return response
        return (
            ParkingTicketResponse.from_entity(saved_ticket),
            ParkingSlotResponse.from_entity(slot),
        )
    
    def _validate_request(self, request: ParkVehicleRequest) -> None:
        """
        Validate the park vehicle request.
        
        Args:
            request: Park vehicle request
            
        Raises:
            ValueError: If validation fails
        """
        if not request.lot_id:
            raise ValueError("Lot ID is required")
        
        if not request.license_plate:
            raise ValueError("License plate is required")
        
        if len(request.license_plate) < 3:
            raise ValueError("License plate must be at least 3 characters")
        
        if not request.make:
            raise ValueError("Make is required")
        
        if not request.model:
            raise ValueError("Model is required")
        
        if not request.color:
            raise ValueError("Color is required")
        
        if request.year < 1900 or request.year > datetime.now().year + 1:
            raise ValueError(f"Invalid year: {request.year}")
    
    async def _get_or_create_vehicle(self, request: ParkVehicleRequest) -> Vehicle:
        """
        Get existing vehicle or create a new one.
        
        Args:
            request: Park vehicle request
            
        Returns:
            Vehicle: Vehicle entity
        """
        vehicle = await self.vehicle_repo.find_by_plate(request.license_plate)
        if not vehicle:
            plate = LicensePlate(request.license_plate)
            vehicle = Vehicle(
                license_plate=plate,
                make=request.make,
                model=request.model,
                color=request.color,
                year=request.year,
                vehicle_type=VehicleType(request.vehicle_type) if request.vehicle_type else VehicleType.CAR,
                is_electric=request.is_electric,
            )
            async with self.uow:
                vehicle = await self.vehicle_repo.save_vehicle(vehicle)
        return vehicle
    
    async def _park_vehicle(
        self,
        lot: ParkingLot,
        slot: ParkingSlot,
        vehicle: Vehicle,
    ) -> ParkingTicket:
        """
        Park the vehicle and create a ticket.
        
        Args:
            lot: Parking lot
            slot: Parking slot
            vehicle: Vehicle
            
        Returns:
            ParkingTicket: Created ticket
        """
        # Occupy slot
        slot.occupy(vehicle.id)
        
        # Create ticket
        ticket = ParkingTicket(
            ticket_number=f"TICKET-{datetime.now().strftime('%Y%m%d%H%M%S')}-{slot.slot_number}",
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            vehicle_id=vehicle.id,
            entry_time=datetime.now(),
        )
        
        return ticket
    
    async def _publish_events(
        self,
        lot: ParkingLot,
        slot: ParkingSlot,
        ticket: ParkingTicket,
        vehicle: Vehicle,
    ) -> None:
        """
        Publish domain events.
        
        Args:
            lot: Parking lot
            slot: Parking slot
            ticket: Parking ticket
            vehicle: Vehicle
        """
        # Vehicle parked event
        event = EventFactory.create_vehicle_parked_event(
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            ticket_number=ticket.ticket_number,
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            is_electric=vehicle.is_electric,
        )
        await self.event_bus.publish(event)
        
        # Slot occupied event
        slot_event = EventFactory.create_slot_occupied_event(
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
        )
        await self.event_bus.publish(slot_event)