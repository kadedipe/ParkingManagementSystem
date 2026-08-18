# ============================================================================
# Parking Service - Application Logic
# ============================================================================

"""
Parking Service - Core application logic for parking operations.

This service orchestrates parking-related use cases including:
- Creating and managing parking lots
- Parking and removing vehicles
- Managing parking tickets
- Reporting and analytics
"""

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime
import logging

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


class ParkingService(IParkingService):
    """
    Parking service implementing core parking business logic.
    
    This service handles all parking-related operations including
    lot management, vehicle parking, and ticket management.
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
        """
        try:
            # Validate input
            if data.total_capacity <= 0:
                raise ValueError("Total capacity must be greater than 0")
            
            if data.ev_capacity < 0 or data.disabled_capacity < 0:
                raise ValueError("EV and disabled capacity cannot be negative")
            
            if data.ev_capacity + data.disabled_capacity > data.total_capacity:
                raise ValueError("EV + Disabled capacity exceeds total capacity")
            
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
                event = EventFactory.create_parking_lot_created_event(
                    lot_id=saved_lot.id,
                    name=saved_lot.name,
                    address=saved_lot.location.address,
                    city=saved_lot.location.city,
                    state=saved_lot.location.state,
                    zip_code=saved_lot.location.zip_code,
                    total_capacity=saved_lot.total_capacity,
                    ev_capacity=saved_lot.ev_capacity,
                    disabled_capacity=saved_lot.disabled_capacity,
                    hourly_rate=saved_lot.hourly_rate,
                )
                await self.event_bus.publish(event)
            
            logger.info(f"Parking lot created: {saved_lot.id}")
            return ParkingLotResponseDTO.from_entity(saved_lot)
            
        except Exception as e:
            logger.error(f"Failed to create parking lot: {e}")
            raise
    
    async def get_parking_lot(self, lot_id: UUID) -> Optional[ParkingLotResponseDTO]:
        """
        Get a parking lot by ID.
        
        Args:
            lot_id: Parking lot ID
            
        Returns:
            Optional[ParkingLotResponseDTO]: Parking lot details if found
        """
        lot = await self.parking_repo.get_lot(lot_id)
        if not lot:
            return None
        return ParkingLotResponseDTO.from_entity(lot)
    
    async def get_all_parking_lots(self) -> List[ParkingLotResponseDTO]:
        """
        Get all parking lots.
        
        Returns:
            List[ParkingLotResponseDTO]: List of all parking lots
        """
        lots = await self.parking_repo.get_all_lots()
        return [ParkingLotResponseDTO.from_entity(lot) for lot in lots]
    
    async def update_parking_lot(
        self,
        lot_id: UUID,
        data: ParkingLotUpdateDTO,
    ) -> Optional[ParkingLotResponseDTO]:
        """
        Update a parking lot.
        
        Args:
            lot_id: Parking lot ID
            data: Update data
            
        Returns:
            Optional[ParkingLotResponseDTO]: Updated parking lot details
        """
        lot = await self.parking_repo.get_lot(lot_id)
        if not lot:
            return None
        
        # Update fields
        if data.name:
            lot.name = data.name
        if data.address:
            lot.location.address = data.address
        if data.city:
            lot.location.city = data.city
        if data.state:
            lot.location.state = data.state
        if data.zip_code:
            lot.location.zip_code = data.zip_code
        if data.hourly_rate is not None:
            lot.hourly_rate = data.hourly_rate
        if data.is_active is not None:
            lot.is_active = data.is_active
        
        async with self.uow:
            updated_lot = await self.parking_repo.update_lot(lot)
        
        logger.info(f"Parking lot updated: {lot_id}")
        return ParkingLotResponseDTO.from_entity(updated_lot)
    
    async def delete_parking_lot(self, lot_id: UUID) -> bool:
        """
        Delete a parking lot.
        
        Args:
            lot_id: Parking lot ID
            
        Returns:
            bool: True if deleted successfully
        """
        async with self.uow:
            success = await self.parking_repo.delete_lot(lot_id)
        
        if success:
            logger.info(f"Parking lot deleted: {lot_id}")
        return success
    
    # ===== Parking Operations =====
    
    async def park_vehicle(self, data: ParkVehicleDTO) -> Tuple[ParkingTicketDTO, ParkingSlot]:
        """
        Park a vehicle in the lot.
        
        Args:
            data: Parking request data
            
        Returns:
            Tuple[ParkingTicketDTO, ParkingSlot]: Created ticket and allocated slot
        """
        # Get parking lot
        lot = await self.parking_repo.get_lot(data.lot_id)
        if not lot:
            raise ValueError(f"Parking lot {data.lot_id} not found")
        
        if not lot.is_active:
            raise ValueError(f"Parking lot {data.lot_id} is inactive")
        
        # Find or create vehicle
        vehicle = await self.vehicle_repo.find_by_plate(data.license_plate)
        if not vehicle:
            # Create new vehicle
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
        
        # Find available slot
        slot = lot.find_available_slot(vehicle)
        if not slot:
            raise ValueError("No available slots in this parking lot")
        
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
        
        # Save all changes
        async with self.uow:
            saved_ticket = await self.parking_repo.save_ticket(ticket)
            await self.parking_repo.update_lot(lot)
        
        # Publish event
        event = EventFactory.create_vehicle_parked_event(
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            ticket_number=ticket.ticket_number,
            vehicle_id=vehicle.id,
            license_plate=vehicle.license_plate.value,
            is_electric=vehicle.is_electric,
            duration=data.duration,
        )
        await self.event_bus.publish(event)
        
        logger.info(f"Vehicle {vehicle.license_plate} parked in slot {slot.slot_number}")
        return ParkingTicketDTO.from_entity(saved_ticket), slot
    
    async def remove_vehicle(self, data: RemoveVehicleDTO) -> ParkingTicketDTO:
        """
        Remove a vehicle from the lot.
        
        Args:
            data: Removal request data
            
        Returns:
            ParkingTicketDTO: Completed ticket details
        """
        # Get ticket
        ticket = await self.parking_repo.get_ticket(data.ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {data.ticket_id} not found")
        
        if ticket.status != BookingStatus.ACTIVE:
            raise ValueError(f"Ticket {ticket.ticket_number} is not active")
        
        # Get parking lot
        lot = await self.parking_repo.get_lot(ticket.parking_lot_id)
        if not lot:
            raise ValueError(f"Parking lot {ticket.parking_lot_id} not found")
        
        # Calculate duration and cost
        duration_hours = ticket.get_duration_hours()
        total_amount = duration_hours * lot.hourly_rate
        
        # Complete ticket
        ticket.complete(lot.hourly_rate)
        
        # Vacate slot
        slot = None
        for s in lot.slots:
            if s.slot_number == ticket.slot_number:
                s.vacate()
                slot = s
                break
        
        if not slot:
            raise ValueError(f"Slot {ticket.slot_number} not found in lot")
        
        # Save changes
        async with self.uow:
            completed_ticket = await self.parking_repo.save_ticket(ticket)
            await self.parking_repo.update_lot(lot)
        
        # Publish event
        event = EventFactory.create_vehicle_removed_event(
            parking_lot_id=lot.id,
            slot_number=ticket.slot_number,
            ticket_number=ticket.ticket_number,
            vehicle_id=ticket.vehicle_id,
            license_plate=None,  # Would need to get from vehicle
            duration_hours=duration_hours,
            total_amount=total_amount,
        )
        await self.event_bus.publish(event)
        
        logger.info(f"Vehicle removed from slot {ticket.slot_number}")
        return ParkingTicketDTO.from_entity(completed_ticket)
    
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
    
    async def get_parking_tickets(
        self,
        lot_id: Optional[UUID] = None,
        status: Optional[BookingStatus] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ParkingTicketDTO]:
        """
        Get parking tickets with filters.
        
        Args:
            lot_id: Filter by lot ID
            status: Filter by status
            limit: Number of tickets to return
            offset: Number of tickets to skip
            
        Returns:
            List[ParkingTicketDTO]: List of tickets
        """
        tickets = await self.parking_repo.get_tickets(
            lot_id=lot_id,
            status=status,
            limit=limit,
            offset=offset,
        )
        return [ParkingTicketDTO.from_entity(ticket) for ticket in tickets]
    
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