# ============================================================================
# Get Lot Status Use Case - Unit Tests
# ============================================================================

import pytest
from unittest.mock import Mock, AsyncMock
from uuid import uuid4
from datetime import datetime

from src.application.use_cases.get_lot_status import GetLotStatusUseCase
from src.domain.models import ParkingLot, ParkingSlot
from src.domain.enums import SlotStatus, SlotType
from src.domain.value_objects import Location


@pytest.mark.asyncio
async def test_get_lot_status_success():
    """Test successful lot status retrieval."""
    # Arrange
    parking_repo = Mock()
    lot_id = uuid4()
    
    # Create test parking lot
    lot = ParkingLot(
        id=lot_id,
        name="Test Lot",
        location=Location("123 Main St", "New York", "NY", "10001"),
        total_capacity=10,
        ev_capacity=2,
        disabled_capacity=1,
        hourly_rate=5.0,
    )
    
    # Add some slots
    lot.slots = [
        ParkingSlot(1, 1, SlotType.REGULAR, SlotStatus.OCCUPIED),
        ParkingSlot(2, 1, SlotType.REGULAR, SlotStatus.AVAILABLE),
        ParkingSlot(3, 1, SlotType.REGULAR, SlotStatus.OCCUPIED),
        ParkingSlot(4, 1, SlotType.REGULAR, SlotStatus.AVAILABLE),
        ParkingSlot(5, 1, SlotType.REGULAR, SlotStatus.OCCUPIED),
        ParkingSlot(6, 1, SlotType.REGULAR, SlotStatus.AVAILABLE),
        ParkingSlot(7, 1, SlotType.REGULAR, SlotStatus.OCCUPIED),
        ParkingSlot(8, 1, SlotType.REGULAR, SlotStatus.AVAILABLE),
        ParkingSlot(9, 1, SlotType.EV, SlotStatus.OCCUPIED),
        ParkingSlot(10, 1, SlotType.EV, SlotStatus.AVAILABLE),
        ParkingSlot(11, 1, SlotType.DISABLED, SlotStatus.AVAILABLE),
    ]
    
    parking_repo.get_lot = AsyncMock(return_value=lot)
    
    use_case = GetLotStatusUseCase(parking_repository=parking_repo)
    
    # Act
    status = await use_case.execute(lot_id)
    
    # Assert
    assert status.lot_id == lot_id
    assert status.name == "Test Lot"
    assert status.total_slots == 11
    assert status.occupied_slots == 4  # 3 regular + 1 EV
    assert status.available_slots == 7
    assert status.occupancy_rate == pytest.approx(36.4, 0.1)
    
    # EV stats
    assert status.ev_slots == 2
    assert status.ev_occupied == 1
    assert status.ev_available == 1
    assert status.ev_occupancy_rate == 50.0
    
    # Disabled stats
    assert status.disabled_slots == 1
    assert status.disabled_occupied == 0
    assert status.disabled_available == 1
    
    # Regular stats
    assert status.regular_slots == 8
    assert status.regular_occupied == 3
    assert status.regular_available == 5


@pytest.mark.asyncio
async def test_get_lot_status_not_found():
    """Test lot status for non-existent lot."""
    # Arrange
    parking_repo = Mock()
    parking_repo.get_lot = AsyncMock(return_value=None)
    
    use_case = GetLotStatusUseCase(parking_repository=parking_repo)
    
    # Act & Assert
    with pytest.raises(ValueError, match="Parking lot.*not found"):
        await use_case.execute(uuid4())


@pytest.mark.asyncio
async def test_get_lot_status_with_cache():
    """Test lot status with caching."""
    # Arrange
    parking_repo = Mock()
    cache_service = Mock()
    lot_id = uuid4()
    
    # Create test lot
    lot = ParkingLot(
        id=lot_id,
        name="Test Lot",
        location=Location("123 Main St", "New York", "NY", "10001"),
        total_capacity=10,
        hourly_rate=5.0,
    )
    lot.slots = [ParkingSlot(1, 1, SlotType.REGULAR, SlotStatus.AVAILABLE)]
    
    parking_repo.get_lot = AsyncMock(return_value=lot)
    cache_service.get = AsyncMock(return_value=None)  # Cache miss
    
    use_case = GetLotStatusUseCase(
        parking_repository=parking_repo,
        cache_service=cache_service,
    )
    
    # Act
    status = await use_case.execute(lot_id)
    
    # Assert
    assert status.lot_id == lot_id
    
    # Verify cache was set
    cache_service.set.assert_called_once()