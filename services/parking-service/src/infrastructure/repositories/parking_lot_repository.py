# ============================================================================
# Infrastructure - Database Repositories
# ============================================================================

# parking-management-system/services/parking-service/src/infrastructure/repositories/parking_lot_repository.py

from typing import Optional, List, Tuple, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.domain.models import ParkingLot, ParkingSpot
from src.domain.value_objects import Location
from src.domain.repositories import ParkingLotRepository
from src.core.database import get_session
from src.core.logging import get_logger

logger = get_logger(__name__)

class SQLAlchemyParkingLotRepository(ParkingLotRepository):
    """SQLAlchemy implementation of ParkingLotRepository"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, parking_lot: ParkingLot) -> ParkingLot:
        """Create a new parking lot"""
        self.session.add(parking_lot)
        await self.session.commit()
        await self.session.refresh(parking_lot)
        return parking_lot
    
    async def update(self, parking_lot: ParkingLot) -> ParkingLot:
        """Update an existing parking lot"""
        await self.session.merge(parking_lot)
        await self.session.commit()
        await self.session.refresh(parking_lot)
        return parking_lot
    
    async def delete(self, lot_id: UUID) -> None:
        """Delete a parking lot"""
        lot = await self.get_by_id(lot_id)
        if lot:
            await self.session.delete(lot)
            await self.session.commit()
    
    async def get_by_id(self, lot_id: UUID) -> Optional[ParkingLot]:
        """Get parking lot by ID"""
        query = select(ParkingLot).where(ParkingLot.id == lot_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_id_with_spots(self, lot_id: UUID) -> Optional[ParkingLot]:
        """Get parking lot with spots loaded"""
        query = select(ParkingLot).where(ParkingLot.id == lot_id).options(
            selectinload(ParkingLot.spots)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_name(self, name: str) -> Optional[ParkingLot]:
        """Get parking lot by name"""
        query = select(ParkingLot).where(ParkingLot.name == name)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def get_paginated(
        self,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
    ) -> Tuple[List[ParkingLot], int]:
        """Get paginated parking lots with optional search and filters"""
        query = select(ParkingLot)
        count_query = select(func.count()).select_from(ParkingLot)
        
        # Apply search
        if search:
            search_filter = or_(
                ParkingLot.name.ilike(f"%{search}%"),
                ParkingLot.description.ilike(f"%{search}%"),
                ParkingLot.address["street"].astext.ilike(f"%{search}%"),
                ParkingLot.address["city"].astext.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        # Apply filters
        if filters:
            if 'status' in filters and filters['status']:
                query = query.where(ParkingLot.status == filters['status'])
                count_query = count_query.where(ParkingLot.status == filters['status'])
            
            if 'type' in filters and filters['type']:
                query = query.where(ParkingLot.type == filters['type'])
                count_query = count_query.where(ParkingLot.type == filters['type'])
            
            if 'min_rating' in filters and filters['min_rating']:
                query = query.where(ParkingLot.rating >= filters['min_rating'])
                count_query = count_query.where(ParkingLot.rating >= filters['min_rating'])
            
            if 'max_price' in filters and filters['max_price']:
                query = query.where(ParkingLot.base_price_per_hour <= filters['max_price'])
                count_query = count_query.where(ParkingLot.base_price_per_hour <= filters['max_price'])
            
            if 'amenities' in filters and filters['amenities']:
                amenities_filter = ParkingLot.amenities.has_all(filters['amenities'])
                query = query.where(amenities_filter)
                count_query = count_query.where(amenities_filter)
        
        # Apply sorting
        sort_by = filters.get('sort_by', 'name') if filters else 'name'
        sort_order = filters.get('sort_order', 'asc') if filters else 'asc'
        
        if sort_order == 'desc':
            query = query.order_by(desc(getattr(ParkingLot, sort_by, ParkingLot.name)))
        else:
            query = query.order_by(asc(getattr(ParkingLot, sort_by, ParkingLot.name)))
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        # Execute queries
        result = await self.session.execute(query)
        total_result = await self.session.execute(count_query)
        
        lots = result.scalars().all()
        total = total_result.scalar()
        
        return lots, total
    
    async def get_nearby(
        self,
        location: Location,
        radius: float = 5.0,
        limit: int = 10,
    ) -> List[ParkingLot]:
        """Get parking lots near a location"""
        # This would use PostGIS for proper geospatial queries
        # For simplicity, we'll use a basic implementation
        # In production, use ST_Distance with PostGIS
        
        # Get all lots and filter in memory (not recommended for large datasets)
        query = select(ParkingLot).where(ParkingLot.status == 'active')
        result = await self.session.execute(query)
        lots = result.scalars().all()
        
        # Calculate distance and filter
        nearby = []
        for lot in lots:
            lot_location = Location(
                latitude=lot.location['latitude'],
                longitude=lot.location['longitude'],
            )
            distance = location.distance_to(lot_location)
            if distance <= radius:
                nearby.append((lot, distance))
        
        # Sort by distance and limit
        nearby.sort(key=lambda x: x[1])
        return [lot for lot, _ in nearby[:limit]]
    
    async def get_statistics(self, lot_id: UUID) -> Dict[str, Any]:
        """Get parking lot statistics"""
        # Get lot with spots
        lot = await self.get_by_id_with_spots(lot_id)
        if not lot:
            return {}
        
        # Get spot status counts
        status_counts = {}
        for spot in lot.spots:
            status_counts[spot.status] = status_counts.get(spot.status, 0) + 1
        
        return {
            "total_spots": lot.total_spots,
            "available_spots": lot.available_spots,
            "reserved_spots": lot.reserved_spots,
            "occupancy_rate": lot.get_occupancy_rate(),
            "status_counts": status_counts,
            "rating": lot.rating,
            "review_count": lot.review_count,
        }
    
    async def update_availability(self, lot_id: UUID) -> None:
        """Update parking lot availability"""
        lot = await self.get_by_id(lot_id)
        if not lot:
            return
        
        # Count available spots
        query = select(func.count()).select_from(ParkingSpot).where(
            and_(
                ParkingSpot.parking_lot_id == lot_id,
                ParkingSpot.status == 'available'
            )
        )
        result = await self.session.execute(query)
        available_count = result.scalar() or 0
        
        # Update lot
        lot.available_spots = available_count
        await self.session.commit()