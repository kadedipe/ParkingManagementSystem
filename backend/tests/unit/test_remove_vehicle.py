# ============================================================================
# Remove Vehicle Use Case - Unit Tests
# ============================================================================

import pytest
from unittest.mock import Mock, AsyncMock
from uuid import uuid4
from datetime import datetime, timedelta

from src.application.use_cases.remove_vehicle import RemoveVehicleUseCase
from src.application.dtos.parking_dto import RemoveVehicleRequest
from src.domain.models import ParkingTicket, ParkingLot, ParkingSlot
from src.domain.enums import BookingStatus, SlotStatus


@pytest.mark.asyncio
async def test_remove_vehicle_success():
    """Test successful vehicle removal."""
    # Arrange
    parking_repo = Mock()
    vehicle_repo = Mock()
    event_bus = Mock()
    uow = Mock()
    
    use_case = RemoveVehicleUseCase(
        parking_repository=parking_repo,
        vehicle_repository=vehicle_repo,
        event_bus=event_bus,
        uow=uow,
    )
    
    # Create test data
    ticket_id = uuid4()
    lot_id = uuid4()
    vehicle_id = uuid4()
    ticket_number = "TICKET-20240101-001"
    
    ticket = ParkingTicket(
        id=ticket_id,
        ticket_number=ticket_number,
        parking_lot_id=lot_id,
        slot_number=1,
        vehicle_id=vehicle_id,
        entry_time=datetime.now() - timedelta(hours=2),
        status=BookingStatus.ACTIVE,
    )
    
    lot = ParkingLot(
        id=lot_id,
        name="Test Lot",
        total_capacity=10,
        hourly_rate=5.0,
    )
    
    # Setup mocks
    parking_repo.get_ticket = AsyncMock(return_value=ticket)
    parking_repo.get_lot = AsyncMock(return_value=lot)
    parking_repo.save_ticket = AsyncMock(return_value=ticket)
    parking_repo.update_lot = AsyncMock()
    
    request = RemoveVehicleRequest(ticket_id=ticket_id)
    
    # Act
    result = await use_case.execute(request)
    
    # Assert
    assert result.ticket_id == ticket_id
    assert result.ticket_number == ticket_number
    assert result.total_amount > 0
    assert result.duration_hours == 2.0
    
    # Verify mocks were called
    parking_repo.get_ticket.assert_called_once_with(ticket_id)
    parking_repo.get_lot.assert_called_once_with(lot_id)
    parking_repo.save_ticket.assert_called_once()
    
    # Verify ticket was completed
    assert ticket.status == BookingStatus.COMPLETED
    assert ticket.exit_time is not None
    assert ticket.total_amount is not None


@pytest.mark.asyncio
async def test_remove_vehicle_ticket_not_found():
    """Test removal with non-existent ticket."""
    # Arrange
    parking_repo = Mock()
    parking_repo.get_ticket = AsyncMock(return_value=None)
    
    use_case = RemoveVehicleUseCase(
        parking_repository=parking_repo,
        vehicle_repository=Mock(),
        event_bus=Mock(),
        uow=Mock(),
    )
    
    request = RemoveVehicleRequest(ticket_id=uuid4())
    
    # Act & Assert
    with pytest.raises(ValueError, match="Ticket.*not found"):
        await use_case.execute(request)


@pytest.mark.asyncio
async def test_remove_vehicle_ticket_not_active():
    """Test removal of non-active ticket."""
    # Arrange
    ticket = ParkingTicket(
        id=uuid4(),
        ticket_number="TICKET-20240101-001",
        parking_lot_id=uuid4(),
        slot_number=1,
        vehicle_id=uuid4(),
        entry_time=datetime.now(),
        status=BookingStatus.COMPLETED,
    )
    
    parking_repo = Mock()
    parking_repo.get_ticket = AsyncMock(return_value=ticket)
    
    use_case = RemoveVehicleUseCase(
        parking_repository=parking_repo,
        vehicle_repository=Mock(),
        event_bus=Mock(),
        uow=Mock(),
    )
    
    request = RemoveVehicleRequest(ticket_id=ticket.id)
    
    # Act & Assert
    with pytest.raises(ValueError, match="not active"):
        await use_case.execute(request)