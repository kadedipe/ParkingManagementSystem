# ============================================================================
# Application Services - Parking Service Application Layer
# ============================================================================

# parking-management-system/services/parking-service/src/application/services/parking_service.py

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from decimal import Decimal
from datetime import datetime, timedelta
from dataclasses import dataclass
from fastapi import HTTPException, status

from src.domain.models import ParkingLot, ParkingSpot, ParkingLotStatus, ParkingSpotStatus
from src.domain.value_objects import Address, Location, OperatingHours, Money
from src.domain.repositories import ParkingLotRepository, ParkingSpotRepository
from src.domain.services import (
    ParkingAvailabilityService,
    PricingCalculatorService,
    ParkingSpotAllocationService,
)
from src.application.dtos import (
    ParkingLotCreateDTO,
    ParkingLotUpdateDTO,
    ParkingLotResponseDTO,
    ParkingSpotCreateDTO,
    ParkingSpotUpdateDTO,
    ParkingSpotResponseDTO,
    AvailabilityRequestDTO,
    AvailabilityResponseDTO,
    PricingRequestDTO,
    PricingResponseDTO,
    ParkingSearchDTO,
)
from src.application.mappers import ParkingLotMapper, ParkingSpotMapper
from src.core.events import EventDispatcher, ParkingLotCreatedEvent, ParkingSpotAllocatedEvent
from src.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class ParkingService:
    """Application service for parking management"""
    
    parking_lot_repo: ParkingLotRepository
    parking_spot_repo: ParkingSpotRepository
    availability_service: ParkingAvailabilityService
    pricing_service: PricingCalculatorService
    allocation_service: ParkingSpotAllocationService
    event_dispatcher: EventDispatcher
    
    # ============================================================================
    # Parking Lot Management
    # ============================================================================
    
    async def create_parking_lot(
        self,
        data: ParkingLotCreateDTO,
        user_id: UUID,
    ) -> ParkingLotResponseDTO:
        """Create a new parking lot"""
        logger.info(f"Creating parking lot: {data.name}")
        
        # Create domain entity
        parking_lot = ParkingLot(
            name=data.name,
            description=data.description,
            type=data.type,
            address=data.address.to_dict(),
            location=data.location.to_dict(),
            total_spots=data.total_spots,
            available_spots=data.total_spots,  # Initially all spots available
            base_price_per_hour=data.base_price_per_hour,
            base_price_per_day=data.base_price_per_day,
            base_price_per_month=data.base_price_per_month,
            amenities=data.amenities,
            features=data.features,
            operating_hours=data.operating_hours.to_dict() if data.operating_hours else None,
            phone=data.phone,
            email=data.email,
            website=data.website,
            created_by=user_id,
        )
        
        # Save to repository
        created_lot = await self.parking_lot_repo.create(parking_lot)
        
        # Create parking spots
        spots = []
        for i in range(data.total_spots):
            spot = ParkingSpot(
                parking_lot_id=created_lot.id,
                number=f"A{i+1}",
                level=1,
                type=data.spot_type or "standard",
            )
            spots.append(spot)
        
        await self.parking_spot_repo.bulk_create(spots)
        
        # Dispatch event
        await self.event_dispatcher.dispatch(
            ParkingLotCreatedEvent(
                lot_id=created_lot.id,
                name=created_lot.name,
                total_spots=created_lot.total_spots,
                user_id=user_id,
            )
        )
        
        logger.info(f"Parking lot created: {created_lot.id}")
        return ParkingLotMapper.to_response_dto(created_lot)
    
    async def get_parking_lot(
        self,
        lot_id: UUID,
    ) -> ParkingLotResponseDTO:
        """Get parking lot by ID"""
        lot = await self.parking_lot_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking lot with ID {lot_id} not found",
            )
        return ParkingLotMapper.to_response_dto(lot)
    
    async def get_parking_lots(
        self,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[List[ParkingLotResponseDTO], int]:
        """Get paginated parking lots"""
        lots, total = await self.parking_lot_repo.get_paginated(
            page=page,
            limit=limit,
            search=search,
            filters=filters,
        )
        return [
            ParkingLotMapper.to_response_dto(lot) for lot in lots
        ], total
    
    async def update_parking_lot(
        self,
        lot_id: UUID,
        data: ParkingLotUpdateDTO,
        user_id: UUID,
    ) -> ParkingLotResponseDTO:
        """Update parking lot"""
        lot = await self.parking_lot_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking lot with ID {lot_id} not found",
            )
        
        # Update fields
        if data.name is not None:
            lot.name = data.name
        if data.description is not None:
            lot.description = data.description
        if data.address is not None:
            lot.address = data.address.to_dict()
        if data.location is not None:
            lot.location = data.location.to_dict()
        if data.base_price_per_hour is not None:
            lot.base_price_per_hour = data.base_price_per_hour
        if data.base_price_per_day is not None:
            lot.base_price_per_day = data.base_price_per_day
        if data.base_price_per_month is not None:
            lot.base_price_per_month = data.base_price_per_month
        if data.amenities is not None:
            lot.amenities = data.amenities
        if data.features is not None:
            lot.features = data.features
        if data.operating_hours is not None:
            lot.operating_hours = data.operating_hours.to_dict()
        if data.phone is not None:
            lot.phone = data.phone
        if data.email is not None:
            lot.email = data.email
        if data.website is not None:
            lot.website = data.website
        if data.status is not None:
            lot.status = data.status
        
        lot.updated_by = user_id
        lot.updated_at = datetime.utcnow()
        
        # Save changes
        updated_lot = await self.parking_lot_repo.update(lot)
        
        logger.info(f"Parking lot updated: {lot_id}")
        return ParkingLotMapper.to_response_dto(updated_lot)
    
    async def delete_parking_lot(
        self,
        lot_id: UUID,
    ) -> bool:
        """Delete parking lot"""
        lot = await self.parking_lot_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking lot with ID {lot_id} not found",
            )
        
        # Check if lot has active bookings
        # This would need to check bookings service
        # For now, just delete
        await self.parking_lot_repo.delete(lot_id)
        
        logger.info(f"Parking lot deleted: {lot_id}")
        return True
    
    # ============================================================================
    # Parking Spot Management
    # ============================================================================
    
    async def create_parking_spot(
        self,
        lot_id: UUID,
        data: ParkingSpotCreateDTO,
    ) -> ParkingSpotResponseDTO:
        """Create a new parking spot"""
        lot = await self.parking_lot_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking lot with ID {lot_id} not found",
            )
        
        spot = ParkingSpot(
            parking_lot_id=lot_id,
            number=data.number,
            level=data.level,
            type=data.type,
            width=data.width,
            length=data.length,
            height=data.height,
            is_covered=data.is_covered,
            is_handicap=data.is_handicap,
            is_ev_charging=data.is_ev_charging,
            connector_type=data.connector_type,
            charging_power=data.charging_power,
            charging_price=data.charging_price,
        )
        
        created_spot = await self.parking_spot_repo.create(spot)
        
        # Update lot available spots
        lot.available_spots += 1
        await self.parking_lot_repo.update(lot)
        
        return ParkingSpotMapper.to_response_dto(created_spot)
    
    async def get_parking_spot(
        self,
        spot_id: UUID,
    ) -> ParkingSpotResponseDTO:
        """Get parking spot by ID"""
        spot = await self.parking_spot_repo.get_by_id(spot_id)
        if not spot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking spot with ID {spot_id} not found",
            )
        return ParkingSpotMapper.to_response_dto(spot)
    
    async def get_parking_spots(
        self,
        lot_id: UUID,
        status: Optional[str] = None,
        spot_type: Optional[str] = None,
    ) -> List[ParkingSpotResponseDTO]:
        """Get parking spots for a lot"""
        spots = await self.parking_spot_repo.get_by_parking_lot(
            lot_id,
            status=status,
            spot_type=spot_type,
        )
        return [ParkingSpotMapper.to_response_dto(spot) for spot in spots]
    
    async def update_parking_spot(
        self,
        spot_id: UUID,
        data: ParkingSpotUpdateDTO,
    ) -> ParkingSpotResponseDTO:
        """Update parking spot"""
        spot = await self.parking_spot_repo.get_by_id(spot_id)
        if not spot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking spot with ID {spot_id} not found",
            )
        
        # Update fields
        if data.number is not None:
            spot.number = data.number
        if data.level is not None:
            spot.level = data.level
        if data.type is not None:
            spot.type = data.type
        if data.status is not None:
            spot.status = data.status
        if data.width is not None:
            spot.width = data.width
        if data.length is not None:
            spot.length = data.length
        if data.height is not None:
            spot.height = data.height
        if data.is_covered is not None:
            spot.is_covered = data.is_covered
        if data.is_handicap is not None:
            spot.is_handicap = data.is_handicap
        if data.is_ev_charging is not None:
            spot.is_ev_charging = data.is_ev_charging
        if data.connector_type is not None:
            spot.connector_type = data.connector_type
        if data.charging_power is not None:
            spot.charging_power = data.charging_power
        if data.charging_price is not None:
            spot.charging_price = data.charging_price
        
        spot.updated_at = datetime.utcnow()
        
        updated_spot = await self.parking_spot_repo.update(spot)
        return ParkingSpotMapper.to_response_dto(updated_spot)
    
    async def delete_parking_spot(
        self,
        spot_id: UUID,
    ) -> bool:
        """Delete parking spot"""
        spot = await self.parking_spot_repo.get_by_id(spot_id)
        if not spot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking spot with ID {spot_id} not found",
            )
        
        await self.parking_spot_repo.delete(spot_id)
        
        # Update lot available spots
        lot = await self.parking_lot_repo.get_by_id(spot.parking_lot_id)
        if lot and spot.status == ParkingSpotStatus.AVAILABLE:
            lot.available_spots -= 1
            await self.parking_lot_repo.update(lot)
        
        return True
    
    # ============================================================================
    # Availability Management
    # ============================================================================
    
    async def check_availability(
        self,
        request: AvailabilityRequestDTO,
    ) -> AvailabilityResponseDTO:
        """Check parking availability"""
        # Get available spots
        available_spots = await self.availability_service.get_available_spots(
            request.parking_lot_id,
            request.start_time,
            request.end_time,
        )
        
        # Check if can park
        can_park, reason = await self.availability_service.can_park(
            request.parking_lot_id,
            request.vehicle_id,
            request.start_time,
            request.end_time,
        )
        
        return AvailabilityResponseDTO(
            parking_lot_id=request.parking_lot_id,
            available_spots=len(available_spots),
            can_park=can_park,
            reason=reason,
            spots=[ParkingSpotMapper.to_response_dto(spot) for spot in available_spots],
        )
    
    async def get_lot_availability(
        self,
        lot_id: UUID,
        date: Optional[datetime] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Get detailed parking lot availability"""
        lot = await self.parking_lot_repo.get_by_id(lot_id)
        if not lot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parking lot with ID {lot_id} not found",
            )
        
        # Get spot availability
        if start_time and end_time:
            available = await self.availability_service.get_available_spots(
                lot_id, start_time, end_time
            )
            available_count = len(available)
        else:
            available_count = lot.available_spots
        
        return {
            "parking_lot_id": lot_id,
            "name": lot.name,
            "total_spots": lot.total_spots,
            "available_spots": available_count,
            "reserved_spots": lot.reserved_spots,
            "occupancy_rate": lot.get_occupancy_rate(),
            "is_full": lot.is_full(),
            "status": lot.status,
            "operating_hours": lot.operating_hours,
            "current_time": datetime.utcnow().isoformat(),
        }
    
    # ============================================================================
    # Pricing Management
    # ============================================================================
    
    async def calculate_price(
        self,
        request: PricingRequestDTO,
    ) -> PricingResponseDTO:
        """Calculate parking price"""
        price = await self.pricing_service.calculate_price(
            request.parking_lot_id,
            request.start_time,
            request.end_time,
            request.spot_type,
        )
        
        estimate = await self.pricing_service.get_pricing_estimate(
            request.parking_lot_id,
            request.duration_hours,
            request.spot_type,
        )
        
        return PricingResponseDTO(
            parking_lot_id=request.parking_lot_id,
            total_price=price,
            breakdown=estimate["breakdown"],
            currency="USD",
        )
    
    # ============================================================================
    # Search and Discovery
    # ============================================================================
    
    async def search_parking_lots(
        self,
        search_params: ParkingSearchDTO,
    ) -> Tuple[List[ParkingLotResponseDTO], int]:
        """Search parking lots"""
        # Build filters
        filters = {}
        if search_params.amenities:
            filters["amenities"] = search_params.amenities
        if search_params.min_rating:
            filters["min_rating"] = search_params.min_rating
        if search_params.max_price:
            filters["max_price"] = search_params.max_price
        
        # If location provided, find nearby lots
        if search_params.latitude and search_params.longitude:
            location = Location(
                latitude=search_params.latitude,
                longitude=search_params.longitude,
            )
            lots = await self.parking_lot_repo.get_nearby(
                location,
                search_params.radius or 5.0,
                search_params.limit or 10,
            )
            total = len(lots)
        else:
            lots, total = await self.parking_lot_repo.get_paginated(
                page=search_params.page or 1,
                limit=search_params.limit or 10,
                search=search_params.query,
                filters=filters,
            )
        
        # Apply sorting
        if search_params.sort_by == "price":
            lots.sort(key=lambda l: l.base_price_per_hour)
        elif search_params.sort_by == "rating":
            lots.sort(key=lambda l: l.rating, reverse=True)
        elif search_params.sort_by == "availability":
            lots.sort(key=lambda l: l.available_spots, reverse=True)
        
        return [
            ParkingLotMapper.to_response_dto(lot) for lot in lots
        ], total
    
    # ============================================================================
    # Spot Allocation
    # ============================================================================
    
    async def allocate_spot(
        self,
        parking_lot_id: UUID,
        vehicle_id: UUID,
        vehicle_plate: str,
        spot_type: Optional[str] = None,
    ) -> ParkingSpotResponseDTO:
        """Allocate a parking spot"""
        spot = await self.allocation_service.allocate_spot(
            parking_lot_id,
            vehicle_id,
            vehicle_plate,
            spot_type,
        )
        
        if not spot:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No available spots",
            )
        
        # Dispatch event
        await self.event_dispatcher.dispatch(
            ParkingSpotAllocatedEvent(
                spot_id=spot.id,
                parking_lot_id=parking_lot_id,
                vehicle_id=vehicle_id,
                vehicle_plate=vehicle_plate,
            )
        )
        
        return ParkingSpotMapper.to_response_dto(spot)
    
    async def deallocate_spot(
        self,
        spot_id: UUID,
    ) -> bool:
        """Deallocate a parking spot"""
        await self.allocation_service.deallocate_spot(spot_id)
        return True
    
    async def reserve_spot(
        self,
        spot_id: UUID,
        vehicle_id: UUID,
        reservation_time: datetime,
    ) -> bool:
        """Reserve a parking spot"""
        return await self.allocation_service.reserve_spot(
            spot_id,
            vehicle_id,
            reservation_time,
        )
    
    async def release_reservation(
        self,
        spot_id: UUID,
    ) -> bool:
        """Release a reservation"""
        await self.allocation_service.release_reservation(spot_id)
        return True