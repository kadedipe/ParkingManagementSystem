# ============================================================================
# Parking Management System - Get Lot Status Use Case
# ============================================================================

"""
Get Lot Status Use Case.

This use case handles the business logic for retrieving the current status
of a parking lot, including occupancy, availability, and statistics.
"""

from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import logging

from src.application.use_cases.base import BaseUseCase
from src.application.dtos.parking_dto import LotStatusDTO, ParkingLotResponse, ParkingSlotResponse
from src.domain.models import ParkingLot, ParkingSlot
from src.domain.enums import SlotStatus, SlotType
from src.infrastructure.repositories import ParkingRepository
from src.infrastructure.cache import CacheService

logger = logging.getLogger(__name__)


class GetLotStatusUseCase(BaseUseCase):
    """
    Use case for retrieving parking lot status.
    
    This use case:
    1. Validates the lot ID
    2. Retrieves the parking lot from repository or cache
    3. Calculates occupancy statistics
    4. Returns detailed status information
    5. Caches the result for performance
    """
    
    # Cache TTL in seconds
    CACHE_TTL = 60  # 1 minute
    
    def __init__(
        self,
        parking_repository: ParkingRepository,
        cache_service: Optional[CacheService] = None,
    ):
        """
        Initialize the use case.
        
        Args:
            parking_repository: Repository for parking data
            cache_service: Optional cache service for performance
        """
        self.parking_repo = parking_repository
        self.cache_service = cache_service
    
    async def execute(
        self,
        lot_id: UUID,
        include_slots: bool = False,
        force_refresh: bool = False,
    ) -> LotStatusDTO:
        """
        Execute the get lot status use case.
        
        Args:
            lot_id: Parking lot ID
            include_slots: Whether to include slot details
            force_refresh: Whether to bypass cache
            
        Returns:
            LotStatusDTO: Parking lot status
            
        Raises:
            ValueError: If lot not found
        """
        # 1. Validate the request
        self._validate_request(lot_id)
        
        # 2. Try to get from cache (if available and not forcing refresh)
        if not force_refresh and self.cache_service:
            cached_status = await self._get_cached_status(lot_id)
            if cached_status:
                logger.info(f"Returning cached status for lot {lot_id}")
                return cached_status
        
        # 3. Get the parking lot
        lot = await self.parking_repo.get_lot(lot_id)
        if not lot:
            raise ValueError(f"Parking lot {lot_id} not found")
        
        # 4. Calculate status
        status = self._calculate_status(lot, include_slots)
        
        # 5. Cache the result
        if self.cache_service:
            await self._cache_status(lot_id, status)
        
        logger.info(f"Lot status retrieved for {lot_id}: {status.occupancy_rate:.1f}% occupied")
        
        # 6. Return status
        return status
    
    def _validate_request(self, lot_id: UUID) -> None:
        """
        Validate the lot status request.
        
        Args:
            lot_id: Parking lot ID
            
        Raises:
            ValueError: If validation fails
        """
        if not lot_id:
            raise ValueError("Lot ID is required")
    
    async def _get_cached_status(self, lot_id: UUID) -> Optional[LotStatusDTO]:
        """
        Get cached lot status.
        
        Args:
            lot_id: Parking lot ID
            
        Returns:
            Optional[LotStatusDTO]: Cached status or None
        """
        if not self.cache_service:
            return None
        
        cache_key = f"lot_status:{lot_id}"
        cached_data = await self.cache_service.get(cache_key)
        
        if cached_data:
            try:
                return LotStatusDTO.from_dict(cached_data)
            except Exception as e:
                logger.warning(f"Failed to deserialize cached status: {e}")
                return None
        
        return None
    
    async def _cache_status(self, lot_id: UUID, status: LotStatusDTO) -> None:
        """
        Cache lot status.
        
        Args:
            lot_id: Parking lot ID
            status: Lot status
        """
        if not self.cache_service:
            return
        
        try:
            cache_key = f"lot_status:{lot_id}"
            await self.cache_service.set(
                cache_key,
                status.to_dict(),
                ttl=self.CACHE_TTL,
            )
        except Exception as e:
            logger.warning(f"Failed to cache lot status: {e}")
    
    def _calculate_status(
        self,
        lot: ParkingLot,
        include_slots: bool = False,
    ) -> LotStatusDTO:
        """
        Calculate parking lot status.
        
        Args:
            lot: Parking lot
            include_slots: Whether to include slot details
            
        Returns:
            LotStatusDTO: Calculated status
        """
        # Basic statistics
        total_slots = len(lot.slots)
        occupied_slots = sum(1 for s in lot.slots if s.status == SlotStatus.OCCUPIED)
        available_slots = total_slots - occupied_slots
        occupancy_rate = (occupied_slots / total_slots * 100) if total_slots > 0 else 0
        
        # EV statistics
        ev_slots = sum(1 for s in lot.slots if s.slot_type == SlotType.EV)
        ev_occupied = sum(1 for s in lot.slots if s.slot_type == SlotType.EV and s.status == SlotStatus.OCCUPIED)
        ev_available = ev_slots - ev_occupied
        ev_occupancy_rate = (ev_occupied / ev_slots * 100) if ev_slots > 0 else 0
        
        # Disabled statistics
        disabled_slots = sum(1 for s in lot.slots if s.slot_type == SlotType.DISABLED)
        disabled_occupied = sum(1 for s in lot.slots if s.slot_type == SlotType.DISABLED and s.status == SlotStatus.OCCUPIED)
        disabled_available = disabled_slots - disabled_occupied
        
        # Regular statistics
        regular_slots = total_slots - ev_slots - disabled_slots
        regular_occupied = occupied_slots - ev_occupied - disabled_occupied
        regular_available = regular_slots - regular_occupied
        
        # Occupancy by floor
        floor_occupancy = {}
        for slot in lot.slots:
            floor = slot.floor_level
            if floor not in floor_occupancy:
                floor_occupancy[floor] = {'total': 0, 'occupied': 0}
            floor_occupancy[floor]['total'] += 1
            if slot.status == SlotStatus.OCCUPIED:
                floor_occupancy[floor]['occupied'] += 1
        
        # Calculate floor occupancy rates
        for floor, data in floor_occupancy.items():
            data['occupancy_rate'] = (data['occupied'] / data['total'] * 100) if data['total'] > 0 else 0
        
        # Slot details (if requested)
        slot_details = None
        if include_slots:
            slot_details = [
                ParkingSlotResponse.from_entity(slot)
                for slot in lot.slots
            ]
        
        # Create DTO
        return LotStatusDTO(
            lot_id=lot.id,
            name=lot.name,
            location=str(lot.location),
            hourly_rate=lot.hourly_rate,
            is_active=lot.is_active,
            created_at=lot.created_at,
            updated_at=getattr(lot, 'updated_at', None),
            
            # Totals
            total_slots=total_slots,
            occupied_slots=occupied_slots,
            available_slots=available_slots,
            occupancy_rate=round(occupancy_rate, 1),
            
            # EV
            ev_slots=ev_slots,
            ev_occupied=ev_occupied,
            ev_available=ev_available,
            ev_occupancy_rate=round(ev_occupancy_rate, 1),
            
            # Disabled
            disabled_slots=disabled_slots,
            disabled_occupied=disabled_occupied,
            disabled_available=disabled_available,
            
            # Regular
            regular_slots=regular_slots,
            regular_occupied=regular_occupied,
            regular_available=regular_available,
            
            # Floor occupancy
            floor_occupancy=floor_occupancy,
            
            # Slot details
            slots=slot_details,
            
            # Timestamp
            timestamp=datetime.now(),
        )


class GetMultipleLotsStatusUseCase(BaseUseCase):
    """
    Use case for retrieving status of multiple parking lots.
    
    This use case:
    1. Validates the lot IDs
    2. Retrieves status for each lot
    3. Aggregates the results
    4. Returns a summary
    """
    
    def __init__(
        self,
        get_lot_status_use_case: GetLotStatusUseCase,
    ):
        """
        Initialize the use case.
        
        Args:
            get_lot_status_use_case: Use case for individual lot status
        """
        self.get_lot_status_use_case = get_lot_status_use_case
    
    async def execute(
        self,
        lot_ids: Optional[List[UUID]] = None,
        include_slots: bool = False,
    ) -> List[LotStatusDTO]:
        """
        Execute the use case.
        
        Args:
            lot_ids: Optional list of lot IDs (if None, get all)
            include_slots: Whether to include slot details
            
        Returns:
            List[LotStatusDTO]: List of lot statuses
        """
        # Get lot IDs if not provided
        if not lot_ids:
            lots = await self.get_lot_status_use_case.parking_repo.get_all_lots()
            lot_ids = [lot.id for lot in lots]
        
        # Get status for each lot
        statuses = []
        for lot_id in lot_ids:
            try:
                status = await self.get_lot_status_use_case.execute(
                    lot_id=lot_id,
                    include_slots=include_slots,
                )
                statuses.append(status)
            except ValueError as e:
                logger.warning(f"Failed to get status for lot {lot_id}: {e}")
                continue
        
        return statuses


class GetLotAnalyticsUseCase(BaseUseCase):
    """
    Use case for retrieving parking lot analytics.
    
    This use case:
    1. Retrieves lot status
    2. Calculates trends and patterns
    3. Generates analytics insights
    """
    
    def __init__(
        self,
        get_lot_status_use_case: GetLotStatusUseCase,
    ):
        """
        Initialize the use case.
        
        Args:
            get_lot_status_use_case: Use case for lot status
        """
        self.get_lot_status_use_case = get_lot_status_use_case
    
    async def execute(
        self,
        lot_id: UUID,
        days: int = 7,
    ) -> Dict[str, Any]:
        """
        Execute the use case.
        
        Args:
            lot_id: Parking lot ID
            days: Number of days for analytics
            
        Returns:
            Dict[str, Any]: Analytics data
        """
        # Get current status
        status = await self.get_lot_status_use_case.execute(lot_id)
        
        # Get historical data (simplified for now)
        # In production, this would query a time-series database or analytics store
        
        # Calculate trends
        analytics = {
            'lot_id': str(lot_id),
            'name': status.name,
            'current_occupancy': status.occupancy_rate,
            'peak_occupancy': status.occupancy_rate * 1.2,  # Simulated
            'off_peak_occupancy': status.occupancy_rate * 0.6,  # Simulated
            'average_occupancy': status.occupancy_rate * 0.85,  # Simulated
            'trend': self._calculate_trend(status),
            'recommendations': self._generate_recommendations(status),
            'timestamp': datetime.now().isoformat(),
        }
        
        return analytics
    
    def _calculate_trend(self, status: LotStatusDTO) -> str:
        """
        Calculate occupancy trend.
        
        Args:
            status: Lot status
            
        Returns:
            str: Trend direction
        """
        if status.occupancy_rate > 80:
            return "HIGH"
        elif status.occupancy_rate > 60:
            return "MEDIUM"
        elif status.occupancy_rate > 30:
            return "LOW"
        else:
            return "VERY_LOW"
    
    def _generate_recommendations(self, status: LotStatusDTO) -> List[str]:
        """
        Generate recommendations based on status.
        
        Args:
            status: Lot status
            
        Returns:
            List[str]: Recommendations
        """
        recommendations = []
        
        if status.occupancy_rate > 85:
            recommendations.append("Consider expanding parking capacity or implementing dynamic pricing")
        
        if status.ev_occupancy_rate > 85:
            recommendations.append("Consider adding more EV charging stations")
        
        if status.occupancy_rate < 30:
            recommendations.append("Consider promotional offers to increase occupancy")
        
        if status.disabled_available > status.disabled_slots * 0.5:
            recommendations.append("Review disabled parking allocation")
        
        return recommendations