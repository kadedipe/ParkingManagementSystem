# ============================================================================
# Parking Management System - Remove Vehicle Use Case
# ============================================================================

"""
Remove Vehicle Use Case.

This use case handles the business logic for removing a vehicle from a parking lot.
"""

from typing import Optional, Tuple
from uuid import UUID
from datetime import datetime
import logging

from src.application.use_cases.base import BaseUseCase
from src.application.dtos.parking_dto import RemoveVehicleRequest, ParkingTicketResponse
from src.domain.models import ParkingTicket
from src.domain.enums import BookingStatus
from src.domain.events import EventBus, EventFactory
from src.infrastructure.repositories import ParkingRepository, VehicleRepository
from src.infrastructure.unit_of_work import UnitOfWork

logger = logging.getLogger(__name__)


class RemoveVehicleUseCase(BaseUseCase):
    """
    Use case for removing a vehicle from a parking lot.
    
    This use case:
    1. Validates the removal request
    2. Finds the ticket
    3. Calculates the parking duration and cost
    4. Completes the ticket
    5. Vacates the parking slot
    6. Publishes domain events
    7. Returns the completed ticket
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
    
    async def execute(self, request: RemoveVehicleRequest) -> ParkingTicketResponse:
        """
        Execute the remove vehicle use case.
        
        Args:
            request: Remove vehicle request
            
        Returns:
            ParkingTicketResponse: Completed ticket details
            
        Raises:
            ValueError: If removal fails
        """
        # 1. Validate the request
        self._validate_request(request)
        
        # 2. Get the ticket
        ticket = await self.parking_repo.get_ticket(request.ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {request.ticket_id} not found")
        
        if ticket.status != BookingStatus.ACTIVE:
            raise ValueError(f"Ticket {ticket.ticket_number} is not active")
        
        # 3. Get the parking lot
        lot = await self.parking_repo.get_lot(ticket.parking_lot_id)
        if not lot:
            raise ValueError(f"Parking lot {ticket.parking_lot_id} not found")
        
        # 4. Calculate duration and cost
        duration_hours = ticket.get_duration_hours()
        
        # Apply any discounts or promotions
        total_amount = self._calculate_total_amount(
            lot.hourly_rate,
            duration_hours,
            ticket.vehicle_id
        )
        
        # 5. Complete the ticket
        ticket.complete(lot.hourly_rate)
        ticket.total_amount = total_amount
        
        # 6. Vacate the slot
        slot = await self._vacate_slot(lot, ticket.slot_number)
        if not slot:
            raise ValueError(f"Slot {ticket.slot_number} not found or already empty")
        
        # 7. Save changes
        async with self.uow:
            completed_ticket = await self.parking_repo.save_ticket(ticket)
            await self.parking_repo.update_lot(lot)
        
        # 8. Get vehicle details for events
        vehicle = await self.vehicle_repo.get_vehicle(ticket.vehicle_id)
        
        # 9. Publish events
        await self._publish_events(lot, slot, completed_ticket, vehicle)
        
        logger.info(
            f"Vehicle removed from slot {ticket.slot_number}, "
            f"duration: {duration_hours:.2f}h, amount: ${total_amount:.2f}"
        )
        
        # 10. Return response
        return ParkingTicketResponse.from_entity(completed_ticket)
    
    def _validate_request(self, request: RemoveVehicleRequest) -> None:
        """
        Validate the remove vehicle request.
        
        Args:
            request: Remove vehicle request
            
        Raises:
            ValueError: If validation fails
        """
        if not request.ticket_id:
            raise ValueError("Ticket ID is required")
    
    def _calculate_total_amount(
        self,
        hourly_rate: float,
        duration_hours: float,
        vehicle_id: UUID,
    ) -> float:
        """
        Calculate the total parking amount.
        
        Args:
            hourly_rate: Hourly parking rate
            duration_hours: Parking duration in hours
            vehicle_id: Vehicle ID (for potential discounts)
            
        Returns:
            float: Total amount
        """
        # Base calculation
        base_amount = hourly_rate * duration_hours
        
        # Round to 2 decimal places
        base_amount = round(base_amount, 2)
        
        # Apply discounts if any
        # TODO: Add discount logic based on:
        # - Loyalty program
        # - Time of day
        # - Vehicle type
        # - Promotional codes
        
        # For now, return base amount
        return base_amount
    
    async def _vacate_slot(
        self,
        lot: ParkingLot,
        slot_number: int,
    ) -> Optional[ParkingSlot]:
        """
        Vacate a parking slot.
        
        Args:
            lot: Parking lot
            slot_number: Slot number
            
        Returns:
            Optional[ParkingSlot]: Vacated slot or None
        """
        for slot in lot.slots:
            if slot.slot_number == slot_number and slot.status == SlotStatus.OCCUPIED:
                slot.vacate()
                return slot
        return None
    
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
        # Vehicle removed event
        event = EventFactory.create_vehicle_removed_event(
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            ticket_number=ticket.ticket_number,
            vehicle_id=ticket.vehicle_id,
            license_plate=vehicle.license_plate.value if vehicle else None,
            duration_hours=ticket.get_duration_hours(),
            total_amount=ticket.total_amount,
            exit_time=ticket.exit_time,
        )
        await self.event_bus.publish(event)
        
        # Slot vacated event
        slot_event = EventFactory.create_slot_vacated_event(
            parking_lot_id=lot.id,
            slot_number=slot.slot_number,
            vehicle_id=ticket.vehicle_id,
            license_plate=vehicle.license_plate.value if vehicle else None,
            vacated_at=datetime.now(),
        )
        await self.event_bus.publish(slot_event)
        
        # Payment completed event (if amount > 0)
        if ticket.total_amount and ticket.total_amount > 0:
            payment_event = EventFactory.create_payment_completed_event(
                payment_id=UUID(int=0),  # Placeholder
                booking_id=ticket.id,
                user_id=vehicle.user_id if vehicle and hasattr(vehicle, 'user_id') else None,
                amount=ticket.total_amount,
                payment_method="parking",
                transaction_id=ticket.ticket_number,
                completed_at=ticket.exit_time,
            )
            await self.event_bus.publish(payment_event)