# ============================================================================
# Domain Services - Business Logic Services
# ============================================================================

# parking-management-system/services/parking-service/src/domain/services.py

from typing import List, Optional, Tuple
from decimal import Decimal
from datetime import datetime, timedelta
from uuid import UUID
from math import radians, sin, cos, sqrt, atan2

from src.domain.models import ParkingLot, ParkingSpot, ParkingLotStatus, ParkingSpotStatus
from src.domain.value_objects import Location, Money, PricingRule, OperatingHours
from src.domain.repositories import ParkingLotRepository, ParkingSpotRepository

class ParkingAvailabilityService:
    """Domain service for parking availability"""
    
    def __init__(
        self,
        parking_lot_repo: ParkingLotRepository,
        parking_spot_repo: ParkingSpotRepository,
    ):
        self.parking_lot_repo = parking_lot_repo
        self.parking_spot_repo = parking_spot_repo
    
    async def get_available_spots(
        self,
        parking_lot_id: UUID,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[ParkingSpot]:
        """Get available spots for a parking lot"""
        spots = await self.parking_spot_repo.get_by_parking_lot(parking_lot_id)
        
        if start_time and end_time:
            # Check for reservations during the time period
            reserved_spot_ids = await self._get_reserved_spot_ids(
                parking_lot_id, start_time, end_time
            )
            available = [
                spot for spot in spots
                if spot.status == ParkingSpotStatus.AVAILABLE
                and spot.id not in reserved_spot_ids
            ]
        else:
            available = [
                spot for spot in spots
                if spot.status == ParkingSpotStatus.AVAILABLE
            ]
        
        return available
    
    async def _get_reserved_spot_ids(
        self,
        parking_lot_id: UUID,
        start_time: datetime,
        end_time: datetime,
    ) -> List[UUID]:
        """Get spot IDs that are reserved during the time period"""
        # Implementation would check reservation service
        return []
    
    async def can_park(
        self,
        parking_lot_id: UUID,
        vehicle_id: UUID,
        start_time: datetime,
        end_time: datetime,
    ) -> Tuple[bool, Optional[str]]:
        """Check if a vehicle can park in the lot"""
        lot = await self.parking_lot_repo.get_by_id(parking_lot_id)
        if not lot:
            return False, "Parking lot not found"
        
        if lot.status != ParkingLotStatus.ACTIVE:
            return False, f"Parking lot is {lot.status}"
        
        if not lot.has_available_spots():
            return False, "Parking lot is full"
        
        # Check operating hours
        if lot.operating_hours:
            if not OperatingHours.from_dict(lot.operating_hours).is_open(start_time):
                return False, "Parking lot is closed at this time"
        
        # Check for available spots
        available = await self.get_available_spots(
            parking_lot_id, start_time, end_time
        )
        if not available:
            return False, "No available spots"
        
        return True, None
    
    async def find_nearest_lot(
        self,
        location: Location,
        radius: float = 5.0,
        limit: int = 10,
    ) -> List[ParkingLot]:
        """Find nearest parking lots with availability"""
        lots = await self.parking_lot_repo.get_nearby(location, radius, limit)
        return [
            lot for lot in lots
            if lot.has_available_spots()
            and lot.status == ParkingLotStatus.ACTIVE
        ]

class PricingCalculatorService:
    """Domain service for pricing calculation"""
    
    def __init__(self, parking_lot_repo: ParkingLotRepository):
        self.parking_lot_repo = parking_lot_repo
    
    async def calculate_price(
        self,
        parking_lot_id: UUID,
        start_time: datetime,
        end_time: datetime,
        spot_type: Optional[str] = None,
    ) -> Money:
        """Calculate parking price"""
        lot = await self.parking_lot_repo.get_by_id(parking_lot_id)
        if not lot:
            raise ValueError("Parking lot not found")
        
        hours = (end_time - start_time).total_seconds() / 3600
        
        # Get applicable pricing rules
        rules = await self.parking_lot_repo.get_pricing_rules(parking_lot_id)
        
        # Filter applicable rules
        applicable_rules = [
            rule for rule in rules
            if rule.is_applicable(hours)
        ]
        
        # Sort by priority (higher priority first)
        applicable_rules.sort(key=lambda r: r.priority, reverse=True)
        
        # Calculate price
        if applicable_rules:
            rule = applicable_rules[0]
            amount = rule.calculate_price(hours)
        else:
            # Use base price
            amount = lot.base_price_per_hour * Decimal(str(hours))
        
        # Apply spot type premium
        if spot_type and lot.spot_type_prices:
            premium = lot.spot_type_prices.get(spot_type, 0)
            amount += amount * Decimal(str(premium))
        
        return Money(amount, "USD")
    
    async def get_pricing_estimate(
        self,
        parking_lot_id: UUID,
        duration_hours: int,
        spot_type: Optional[str] = None,
    ) -> dict:
        """Get pricing estimate for a duration"""
        lot = await self.parking_lot_repo.get_by_id(parking_lot_id)
        if not lot:
            raise ValueError("Parking lot not found")
        
        now = datetime.now()
        end_time = now + timedelta(hours=duration_hours)
        
        price = await self.calculate_price(
            parking_lot_id,
            now,
            end_time,
            spot_type,
        )
        
        return {
            "duration_hours": duration_hours,
            "total_price": price.to_dict(),
            "breakdown": await self._get_price_breakdown(lot, duration_hours),
            "currency": "USD",
        }
    
    async def _get_price_breakdown(
        self,
        lot: ParkingLot,
        hours: int,
    ) -> List[dict]:
        """Get detailed price breakdown"""
        breakdown = []
        
        # Hourly rate
        breakdown.append({
            "type": "hourly",
            "rate": float(lot.base_price_per_hour),
            "hours": hours,
            "subtotal": float(lot.base_price_per_hour * Decimal(str(hours))),
        })
        
        # Daily rate if applicable
        if hours >= 24:
            days = hours // 24
            remaining_hours = hours % 24
            if lot.base_price_per_day:
                breakdown.append({
                    "type": "daily",
                    "rate": float(lot.base_price_per_day),
                    "days": days,
                    "subtotal": float(lot.base_price_per_day * Decimal(str(days))),
                })
        
        # Monthly rate if applicable
        if hours >= 720:  # 30 days
            months = hours // 720
            if lot.base_price_per_month:
                breakdown.append({
                    "type": "monthly",
                    "rate": float(lot.base_price_per_month),
                    "months": months,
                    "subtotal": float(lot.base_price_per_month * Decimal(str(months))),
                })
        
        return breakdown

class ParkingSpotAllocationService:
    """Domain service for parking spot allocation"""
    
    def __init__(
        self,
        parking_spot_repo: ParkingSpotRepository,
    ):
        self.parking_spot_repo = parking_spot_repo
    
    async def allocate_spot(
        self,
        parking_lot_id: UUID,
        vehicle_id: UUID,
        vehicle_plate: str,
        spot_type: Optional[str] = None,
    ) -> Optional[ParkingSpot]:
        """Allocate a parking spot"""
        # Find available spot
        spots = await self.parking_spot_repo.get_available_spots(
            parking_lot_id, spot_type
        )
        
        if not spots:
            return None
        
        # Allocate first available spot
        spot = spots[0]
        spot.occupy(vehicle_id, vehicle_plate)
        await self.parking_spot_repo.update(spot)
        
        return spot
    
    async def deallocate_spot(self, spot_id: UUID) -> None:
        """Deallocate a parking spot"""
        spot = await self.parking_spot_repo.get_by_id(spot_id)
        if spot:
            spot.release()
            await self.parking_spot_repo.update(spot)
    
    async def reserve_spot(
        self,
        spot_id: UUID,
        vehicle_id: UUID,
        reservation_time: datetime,
    ) -> bool:
        """Reserve a parking spot"""
        spot = await self.parking_spot_repo.get_by_id(spot_id)
        if not spot or not spot.is_available():
            return False
        
        spot.reserve(vehicle_id, reservation_time)
        await self.parking_spot_repo.update(spot)
        return True
    
    async def release_reservation(self, spot_id: UUID) -> None:
        """Release a reservation"""
        spot = await self.parking_spot_repo.get_by_id(spot_id)
        if spot and spot.is_reserved():
            spot.release()
            await self.parking_spot_repo.update(spot)