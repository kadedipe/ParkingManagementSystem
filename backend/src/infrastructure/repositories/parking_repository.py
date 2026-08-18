# ============================================================================
# Parking Management System - Parking Repository
# ============================================================================

"""
Parking Repository implementations for data access.

This module provides repository implementations for parking-related entities:
- ParkingLotRepository
- ParkingSlotRepository
- ParkingTicketRepository
- ParkingAnalyticsRepository
"""

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import logging

from src.infrastructure.repositories.base import BaseRepository, FilterSpecification, OrderSpecification, PaginationSpecification
from src.domain.models import (
    ParkingLot,
    ParkingSlot,
    ParkingTicket,
    Location,
    SlotType,
    SlotStatus,
    BookingStatus,
)
from src.domain.value_objects import Location
from src.infrastructure.database import DatabaseClient
from src.infrastructure.cache import CacheClient

logger = logging.getLogger(__name__)


class ParkingLotRepository(BaseRepository):
    """
    Repository for Parking Lot entities.
    
    Provides CRUD operations and specialized queries for parking lots.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        """
        Initialize the parking lot repository.
        
        Args:
            database_client: Database client for data access
            cache_client: Optional cache client for performance
            cache_ttl: Cache TTL in seconds
        """
        super().__init__(database_client, cache_client, cache_ttl)
        self._entity_class = ParkingLot
        self._collection_name = "parking_lots"
    
    def get_entity_class(self):
        return self._entity_class
    
    def get_collection_name(self) -> str:
        return self._collection_name
    
    # ==========================================================================
    # CRUD Operations
    # ==========================================================================
    
    async def _do_create(self, entity: ParkingLot) -> ParkingLot:
        """Create a parking lot in the database."""
        data = {
            "id": str(entity.id),
            "name": entity.name,
            "address": entity.location.address,
            "city": entity.location.city,
            "state": entity.location.state,
            "zip_code": entity.location.zip_code,
            "latitude": entity.location.latitude,
            "longitude": entity.location.longitude,
            "total_capacity": entity.total_capacity,
            "ev_capacity": entity.ev_capacity,
            "disabled_capacity": entity.disabled_capacity,
            "hourly_rate": entity.hourly_rate,
            "is_active": entity.is_active,
            "created_at": entity.created_at.isoformat(),
            "updated_at": entity.updated_at.isoformat() if hasattr(entity, 'updated_at') else None,
        }
        
        await self.db.execute(
            """
            INSERT INTO parking_lots (
                id, name, address, city, state, zip_code,
                latitude, longitude, total_capacity, ev_capacity,
                disabled_capacity, hourly_rate, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """,
            data["id"],
            data["name"],
            data["address"],
            data["city"],
            data["state"],
            data["zip_code"],
            data["latitude"],
            data["longitude"],
            data["total_capacity"],
            data["ev_capacity"],
            data["disabled_capacity"],
            data["hourly_rate"],
            data["is_active"],
            data["created_at"],
            data["updated_at"],
        )
        
        return entity
    
    async def _do_get_by_id(self, entity_id: UUID) -> Optional[ParkingLot]:
        """Get a parking lot by ID."""
        result = await self.db.fetch_one(
            """
            SELECT * FROM parking_lots WHERE id = $1
            """,
            str(entity_id),
        )
        
        if not result:
            return None
        
        return self._map_to_entity(result)
    
    async def _do_update(self, entity: ParkingLot) -> ParkingLot:
        """Update a parking lot."""
        data = {
            "id": str(entity.id),
            "name": entity.name,
            "address": entity.location.address,
            "city": entity.location.city,
            "state": entity.location.state,
            "zip_code": entity.location.zip_code,
            "latitude": entity.location.latitude,
            "longitude": entity.location.longitude,
            "total_capacity": entity.total_capacity,
            "ev_capacity": entity.ev_capacity,
            "disabled_capacity": entity.disabled_capacity,
            "hourly_rate": entity.hourly_rate,
            "is_active": entity.is_active,
            "updated_at": datetime.now().isoformat(),
        }
        
        await self.db.execute(
            """
            UPDATE parking_lots SET
                name = $2,
                address = $3,
                city = $4,
                state = $5,
                zip_code = $6,
                latitude = $7,
                longitude = $8,
                total_capacity = $9,
                ev_capacity = $10,
                disabled_capacity = $11,
                hourly_rate = $12,
                is_active = $13,
                updated_at = $14
            WHERE id = $1
            """,
            data["id"],
            data["name"],
            data["address"],
            data["city"],
            data["state"],
            data["zip_code"],
            data["latitude"],
            data["longitude"],
            data["total_capacity"],
            data["ev_capacity"],
            data["disabled_capacity"],
            data["hourly_rate"],
            data["is_active"],
            data["updated_at"],
        )
        
        return entity
    
    async def _do_delete(self, entity_id: UUID) -> bool:
        """Delete a parking lot."""
        result = await self.db.execute(
            """
            DELETE FROM parking_lots WHERE id = $1
            """,
            str(entity_id),
        )
        return result == "DELETE 1"
    
    async def _do_find(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[ParkingLot]:
        """Find parking lots matching specifications."""
        query = "SELECT * FROM parking_lots"
        params = []
        conditions = []
        
        # Build WHERE clause
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "contains":
                    conditions.append(f"{filter_spec.field} ILIKE ${param_index}")
                    params.append(f"%{filter_spec.value}%")
                elif filter_spec.operator == "gt":
                    conditions.append(f"{filter_spec.field} > ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lt":
                    conditions.append(f"{filter_spec.field} < ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "gte":
                    conditions.append(f"{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        # Build ORDER BY clause
        if order:
            order_clauses = []
            for order_spec in order:
                direction = "ASC" if order_spec.ascending else "DESC"
                order_clauses.append(f"{order_spec.field} {direction}")
            query += " ORDER BY " + ", ".join(order_clauses)
        
        # Build LIMIT/OFFSET clause
        if pagination:
            query += f" LIMIT {pagination.limit} OFFSET {pagination.get_offset()}"
        
        results = await self.db.fetch(query, *params)
        return [self._map_to_entity(result) for result in results]
    
    async def _do_count(
        self,
        filters: Optional[List[FilterSpecification]] = None,
    ) -> int:
        """Count parking lots matching filters."""
        query = "SELECT COUNT(*) FROM parking_lots"
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "contains":
                    conditions.append(f"{filter_spec.field} ILIKE ${param_index}")
                    params.append(f"%{filter_spec.value}%")
                elif filter_spec.operator == "gt":
                    conditions.append(f"{filter_spec.field} > ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lt":
                    conditions.append(f"{filter_spec.field} < ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "gte":
                    conditions.append(f"{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        result = await self.db.fetch_val(query, *params)
        return int(result) if result else 0
    
    # ==========================================================================
    # Specialized Queries
    # ==========================================================================
    
    async def get_all_lots(
        self,
        active_only: bool = True,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ParkingLot]:
        """
        Get all parking lots.
        
        Args:
            active_only: If True, only return active lots
            limit: Maximum number of lots to return
            offset: Number of lots to skip
            
        Returns:
            List[ParkingLot]: List of parking lots
        """
        filters = []
        if active_only:
            filters.append(FilterSpecification("is_active", "eq", True))
        
        pagination = PaginationSpecification(
            page=(offset // limit) + 1,
            limit=limit
        )
        
        return await self.find_all(filters=filters, pagination=pagination)
    
    async def find_by_location(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 5.0,
        limit: int = 20,
    ) -> List[ParkingLot]:
        """
        Find parking lots near a location.
        
        Args:
            latitude: Latitude of the location
            longitude: Longitude of the location
            radius_km: Search radius in kilometers
            limit: Maximum number of lots to return
            
        Returns:
            List[ParkingLot]: List of nearby parking lots
        """
        # Earth's radius in km
        EARTH_RADIUS = 6371
        
        query = """
            SELECT *,
            (6371 * acos(
                cos(radians($1)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians($2)) +
                sin(radians($1)) * sin(radians(latitude))
            )) AS distance
            FROM parking_lots
            WHERE is_active = true
            HAVING distance < $3
            ORDER BY distance
            LIMIT $4
        """
        
        results = await self.db.fetch(
            query,
            latitude,
            longitude,
            radius_km,
            limit,
        )
        
        return [self._map_to_entity(result) for result in results]
    
    async def get_by_city(self, city: str) -> List[ParkingLot]:
        """
        Get parking lots by city.
        
        Args:
            city: City name
            
        Returns:
            List[ParkingLot]: List of parking lots
        """
        filters = [
            FilterSpecification("city", "eq", city),
            FilterSpecification("is_active", "eq", True),
        ]
        return await self.find_all(filters=filters)
    
    async def get_with_available_slots(
        self,
        min_available: int = 1,
        limit: int = 20,
    ) -> List[ParkingLot]:
        """
        Get parking lots with available slots.
        
        Args:
            min_available: Minimum number of available slots
            limit: Maximum number of lots to return
            
        Returns:
            List[ParkingLot]: List of parking lots with available slots
        """
        query = """
            SELECT pl.*,
            (pl.total_capacity - COALESCE(occupied.occupied_count, 0)) AS available_slots
            FROM parking_lots pl
            LEFT JOIN (
                SELECT parking_lot_id, COUNT(*) as occupied_count
                FROM parking_slots
                WHERE status = 'occupied'
                GROUP BY parking_lot_id
            ) occupied ON pl.id = occupied.parking_lot_id
            WHERE pl.is_active = true
            HAVING available_slots >= $1
            ORDER BY available_slots DESC
            LIMIT $2
        """
        
        results = await self.db.fetch(query, min_available, limit)
        return [self._map_to_entity(result) for result in results]
    
    async def get_analytics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Get parking lot analytics.
        
        Args:
            start_date: Start date for analytics
            end_date: End date for analytics
            
        Returns:
            Dict[str, Any]: Analytics data
        """
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
        
        query = """
            SELECT
                COUNT(*) as total_lots,
                SUM(total_capacity) as total_capacity,
                SUM(ev_capacity) as total_ev_capacity,
                SUM(disabled_capacity) as total_disabled_capacity,
                AVG(hourly_rate) as avg_hourly_rate,
                COUNT(CASE WHEN is_active THEN 1 END) as active_lots,
                COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive_lots
            FROM parking_lots
            WHERE created_at BETWEEN $1 AND $2
        """
        
        result = await self.db.fetch_one(query, start_date, end_date)
        
        if not result:
            return {}
        
        return {
            "total_lots": result["total_lots"] or 0,
            "total_capacity": result["total_capacity"] or 0,
            "total_ev_capacity": result["total_ev_capacity"] or 0,
            "total_disabled_capacity": result["total_disabled_capacity"] or 0,
            "avg_hourly_rate": result["avg_hourly_rate"] or 0,
            "active_lots": result["active_lots"] or 0,
            "inactive_lots": result["inactive_lots"] or 0,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        }
    
    # ==========================================================================
    # Mapping Methods
    # ==========================================================================
    
    def _map_to_entity(self, data: Dict[str, Any]) -> ParkingLot:
        """
        Map database record to ParkingLot entity.
        
        Args:
            data: Database record
            
        Returns:
            ParkingLot: Domain entity
        """
        location = Location(
            address=data.get("address", ""),
            city=data.get("city", ""),
            state=data.get("state", ""),
            zip_code=data.get("zip_code", ""),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
        )
        
        return ParkingLot(
            id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
            name=data["name"],
            location=location,
            total_capacity=data["total_capacity"],
            ev_capacity=data.get("ev_capacity", 0),
            disabled_capacity=data.get("disabled_capacity", 0),
            hourly_rate=data.get("hourly_rate", 5.0),
            is_active=data.get("is_active", True),
            created_at=data.get("created_at") or datetime.now(),
            updated_at=data.get("updated_at"),
        )


class ParkingSlotRepository(BaseRepository):
    """
    Repository for Parking Slot entities.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        """
        Initialize the parking slot repository.
        
        Args:
            database_client: Database client for data access
            cache_client: Optional cache client for performance
            cache_ttl: Cache TTL in seconds
        """
        super().__init__(database_client, cache_client, cache_ttl)
        self._entity_class = ParkingSlot
        self._collection_name = "parking_slots"
    
    def get_entity_class(self):
        return self._entity_class
    
    def get_collection_name(self) -> str:
        return self._collection_name
    
    # ==========================================================================
    # CRUD Operations
    # ==========================================================================
    
    async def _do_create(self, entity: ParkingSlot) -> ParkingSlot:
        """Create a parking slot in the database."""
        data = {
            "id": str(entity.id),
            "parking_lot_id": str(entity.parking_lot_id),
            "slot_number": entity.slot_number,
            "floor_level": entity.floor_level,
            "slot_type": entity.slot_type.value,
            "status": entity.status.value,
            "current_vehicle_id": str(entity.current_vehicle_id) if entity.current_vehicle_id else None,
            "occupied_since": entity.occupied_since.isoformat() if entity.occupied_since else None,
            "created_at": entity.created_at.isoformat(),
            "updated_at": entity.updated_at.isoformat() if hasattr(entity, 'updated_at') else None,
        }
        
        await self.db.execute(
            """
            INSERT INTO parking_slots (
                id, parking_lot_id, slot_number, floor_level,
                slot_type, status, current_vehicle_id, occupied_since,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
            data["id"],
            data["parking_lot_id"],
            data["slot_number"],
            data["floor_level"],
            data["slot_type"],
            data["status"],
            data["current_vehicle_id"],
            data["occupied_since"],
            data["created_at"],
            data["updated_at"],
        )
        
        return entity
    
    async def _do_get_by_id(self, entity_id: UUID) -> Optional[ParkingSlot]:
        """Get a parking slot by ID."""
        result = await self.db.fetch_one(
            """
            SELECT * FROM parking_slots WHERE id = $1
            """,
            str(entity_id),
        )
        
        if not result:
            return None
        
        return self._map_to_entity(result)
    
    async def _do_update(self, entity: ParkingSlot) -> ParkingSlot:
        """Update a parking slot."""
        data = {
            "id": str(entity.id),
            "parking_lot_id": str(entity.parking_lot_id),
            "slot_number": entity.slot_number,
            "floor_level": entity.floor_level,
            "slot_type": entity.slot_type.value,
            "status": entity.status.value,
            "current_vehicle_id": str(entity.current_vehicle_id) if entity.current_vehicle_id else None,
            "occupied_since": entity.occupied_since.isoformat() if entity.occupied_since else None,
            "updated_at": datetime.now().isoformat(),
        }
        
        await self.db.execute(
            """
            UPDATE parking_slots SET
                parking_lot_id = $2,
                slot_number = $3,
                floor_level = $4,
                slot_type = $5,
                status = $6,
                current_vehicle_id = $7,
                occupied_since = $8,
                updated_at = $9
            WHERE id = $1
            """,
            data["id"],
            data["parking_lot_id"],
            data["slot_number"],
            data["floor_level"],
            data["slot_type"],
            data["status"],
            data["current_vehicle_id"],
            data["occupied_since"],
            data["updated_at"],
        )
        
        return entity
    
    async def _do_delete(self, entity_id: UUID) -> bool:
        """Delete a parking slot."""
        result = await self.db.execute(
            """
            DELETE FROM parking_slots WHERE id = $1
            """,
            str(entity_id),
        )
        return result == "DELETE 1"
    
    async def _do_find(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[ParkingSlot]:
        """Find parking slots matching specifications."""
        query = "SELECT * FROM parking_slots"
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "in":
                    placeholders = ",".join([f"${param_index + j}" for j in range(len(filter_spec.value))])
                    conditions.append(f"{filter_spec.field} IN ({placeholders})")
                    params.extend(filter_spec.value)
                elif filter_spec.operator == "gt":
                    conditions.append(f"{filter_spec.field} > ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lt":
                    conditions.append(f"{filter_spec.field} < ${param_index}")
                    params.append(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        if order:
            order_clauses = []
            for order_spec in order:
                direction = "ASC" if order_spec.ascending else "DESC"
                order_clauses.append(f"{order_spec.field} {direction}")
            query += " ORDER BY " + ", ".join(order_clauses)
        
        if pagination:
            query += f" LIMIT {pagination.limit} OFFSET {pagination.get_offset()}"
        
        results = await self.db.fetch(query, *params)
        return [self._map_to_entity(result) for result in results]
    
    async def _do_count(
        self,
        filters: Optional[List[FilterSpecification]] = None,
    ) -> int:
        """Count parking slots matching filters."""
        query = "SELECT COUNT(*) FROM parking_slots"
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "in":
                    placeholders = ",".join([f"${param_index + j}" for j in range(len(filter_spec.value))])
                    conditions.append(f"{filter_spec.field} IN ({placeholders})")
                    params.extend(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        result = await self.db.fetch_val(query, *params)
        return int(result) if result else 0
    
    # ==========================================================================
    # Specialized Queries
    # ==========================================================================
    
    async def get_slots_by_lot(
        self,
        lot_id: UUID,
        status: Optional[SlotStatus] = None,
    ) -> List[ParkingSlot]:
        """
        Get slots by parking lot.
        
        Args:
            lot_id: Parking lot ID
            status: Optional status filter
            
        Returns:
            List[ParkingSlot]: List of parking slots
        """
        filters = [
            FilterSpecification("parking_lot_id", "eq", str(lot_id)),
        ]
        if status:
            filters.append(FilterSpecification("status", "eq", status.value))
        
        order = [OrderSpecification("slot_number", ascending=True)]
        return await self.find_all(filters=filters, order=order)
    
    async def get_available_slots(
        self,
        lot_id: UUID,
        limit: int = 10,
    ) -> List[ParkingSlot]:
        """
        Get available slots in a parking lot.
        
        Args:
            lot_id: Parking lot ID
            limit: Maximum number of slots to return
            
        Returns:
            List[ParkingSlot]: List of available slots
        """
        filters = [
            FilterSpecification("parking_lot_id", "eq", str(lot_id)),
            FilterSpecification("status", "eq", SlotStatus.AVAILABLE.value),
        ]
        order = [OrderSpecification("slot_number", ascending=True)]
        pagination = PaginationSpecification(page=1, limit=limit)
        
        return await self.find_all(filters=filters, order=order, pagination=pagination)
    
    async def get_occupied_slots(
        self,
        lot_id: UUID,
    ) -> List[ParkingSlot]:
        """
        Get occupied slots in a parking lot.
        
        Args:
            lot_id: Parking lot ID
            
        Returns:
            List[ParkingSlot]: List of occupied slots
        """
        filters = [
            FilterSpecification("parking_lot_id", "eq", str(lot_id)),
            FilterSpecification("status", "eq", SlotStatus.OCCUPIED.value),
        ]
        return await self.find_all(filters=filters)
    
    async def find_by_vehicle(
        self,
        vehicle_id: UUID,
    ) -> Optional[ParkingSlot]:
        """
        Find slot occupied by a vehicle.
        
        Args:
            vehicle_id: Vehicle ID
            
        Returns:
            Optional[ParkingSlot]: Parking slot or None
        """
        filters = [
            FilterSpecification("current_vehicle_id", "eq", str(vehicle_id)),
            FilterSpecification("status", "eq", SlotStatus.OCCUPIED.value),
        ]
        results = await self.find_all(filters=filters)
        return results[0] if results else None
    
    async def get_stats(
        self,
        lot_id: UUID,
    ) -> Dict[str, Any]:
        """
        Get parking lot statistics.
        
        Args:
            lot_id: Parking lot ID
            
        Returns:
            Dict[str, Any]: Statistics
        """
        query = """
            SELECT
                COUNT(*) as total_slots,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_slots,
                COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_slots,
                COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_slots,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_slots,
                COUNT(CASE WHEN slot_type = 'ev' AND status = 'occupied' THEN 1 END) as ev_occupied,
                COUNT(CASE WHEN slot_type = 'ev' THEN 1 END) as ev_total,
                COUNT(CASE WHEN slot_type = 'disabled' AND status = 'occupied' THEN 1 END) as disabled_occupied,
                COUNT(CASE WHEN slot_type = 'disabled' THEN 1 END) as disabled_total
            FROM parking_slots
            WHERE parking_lot_id = $1
        """
        
        result = await self.db.fetch_one(query, str(lot_id))
        
        if not result:
            return {}
        
        return {
            "total_slots": result["total_slots"] or 0,
            "available_slots": result["available_slots"] or 0,
            "occupied_slots": result["occupied_slots"] or 0,
            "reserved_slots": result["reserved_slots"] or 0,
            "maintenance_slots": result["maintenance_slots"] or 0,
            "ev_occupied": result["ev_occupied"] or 0,
            "ev_total": result["ev_total"] or 0,
            "disabled_occupied": result["disabled_occupied"] or 0,
            "disabled_total": result["disabled_total"] or 0,
        }
    
    # ==========================================================================
    # Mapping Methods
    # ==========================================================================
    
    def _map_to_entity(self, data: Dict[str, Any]) -> ParkingSlot:
        """
        Map database record to ParkingSlot entity.
        
        Args:
            data: Database record
            
        Returns:
            ParkingSlot: Domain entity
        """
        return ParkingSlot(
            id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
            parking_lot_id=UUID(data["parking_lot_id"]) if isinstance(data["parking_lot_id"], str) else data["parking_lot_id"],
            slot_number=data["slot_number"],
            floor_level=data.get("floor_level", 1),
            slot_type=SlotType(data["slot_type"]),
            status=SlotStatus(data["status"]),
            current_vehicle_id=UUID(data["current_vehicle_id"]) if data.get("current_vehicle_id") else None,
            occupied_since=data.get("occupied_since"),
            created_at=data.get("created_at") or datetime.now(),
            updated_at=data.get("updated_at"),
        )


class ParkingTicketRepository(BaseRepository):
    """
    Repository for Parking Ticket entities.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        super().__init__(database_client, cache_client, cache_ttl)
        self._entity_class = ParkingTicket
        self._collection_name = "parking_tickets"
    
    def get_entity_class(self):
        return self._entity_class
    
    def get_collection_name(self) -> str:
        return self._collection_name
    
    # ==========================================================================
    # CRUD Operations
    # ==========================================================================
    
    async def _do_create(self, entity: ParkingTicket) -> ParkingTicket:
        """Create a parking ticket in the database."""
        await self.db.execute(
            """
            INSERT INTO parking_tickets (
                id, ticket_number, parking_lot_id, slot_number,
                vehicle_id, entry_time, exit_time, total_amount,
                status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            """,
            str(entity.id),
            entity.ticket_number,
            str(entity.parking_lot_id),
            entity.slot_number,
            str(entity.vehicle_id),
            entity.entry_time,
            entity.exit_time,
            entity.total_amount,
            entity.status.value,
            entity.created_at,
            entity.updated_at if hasattr(entity, 'updated_at') else None,
        )
        return entity
    
    async def _do_get_by_id(self, entity_id: UUID) -> Optional[ParkingTicket]:
        """Get a parking ticket by ID."""
        result = await self.db.fetch_one(
            """
            SELECT * FROM parking_tickets WHERE id = $1
            """,
            str(entity_id),
        )
        if not result:
            return None
        return self._map_to_entity(result)
    
    async def _do_update(self, entity: ParkingTicket) -> ParkingTicket:
        """Update a parking ticket."""
        await self.db.execute(
            """
            UPDATE parking_tickets SET
                ticket_number = $2,
                parking_lot_id = $3,
                slot_number = $4,
                vehicle_id = $5,
                entry_time = $6,
                exit_time = $7,
                total_amount = $8,
                status = $9,
                updated_at = $10
            WHERE id = $1
            """,
            str(entity.id),
            entity.ticket_number,
            str(entity.parking_lot_id),
            entity.slot_number,
            str(entity.vehicle_id),
            entity.entry_time,
            entity.exit_time,
            entity.total_amount,
            entity.status.value,
            datetime.now(),
        )
        return entity
    
    async def _do_delete(self, entity_id: UUID) -> bool:
        """Delete a parking ticket."""
        result = await self.db.execute(
            """
            DELETE FROM parking_tickets WHERE id = $1
            """,
            str(entity_id),
        )
        return result == "DELETE 1"
    
    async def _do_find(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[ParkingTicket]:
        """Find parking tickets matching specifications."""
        query = "SELECT * FROM parking_tickets"
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "gte":
                    conditions.append(f"{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "contains":
                    conditions.append(f"{filter_spec.field} ILIKE ${param_index}")
                    params.append(f"%{filter_spec.value}%")
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        if order:
            order_clauses = []
            for order_spec in order:
                direction = "ASC" if order_spec.ascending else "DESC"
                order_clauses.append(f"{order_spec.field} {direction}")
            query += " ORDER BY " + ", ".join(order_clauses)
        
        if pagination:
            query += f" LIMIT {pagination.limit} OFFSET {pagination.get_offset()}"
        
        results = await self.db.fetch(query, *params)
        return [self._map_to_entity(result) for result in results]
    
    async def _do_count(
        self,
        filters: Optional[List[FilterSpecification]] = None,
    ) -> int:
        """Count parking tickets matching filters."""
        query = "SELECT COUNT(*) FROM parking_tickets"
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "gte":
                    conditions.append(f"{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        result = await self.db.fetch_val(query, *params)
        return int(result) if result else 0
    
    # ==========================================================================
    # Specialized Queries
    # ==========================================================================
    
    async def get_tickets_by_vehicle(
        self,
        vehicle_id: UUID,
        limit: int = 50,
    ) -> List[ParkingTicket]:
        """
        Get tickets for a vehicle.
        
        Args:
            vehicle_id: Vehicle ID
            limit: Maximum number of tickets to return
            
        Returns:
            List[ParkingTicket]: List of parking tickets
        """
        filters = [
            FilterSpecification("vehicle_id", "eq", str(vehicle_id)),
        ]
        order = [OrderSpecification("entry_time", ascending=False)]
        pagination = PaginationSpecification(page=1, limit=limit)
        
        return await self.find_all(filters=filters, order=order, pagination=pagination)
    
    async def get_tickets_by_lot(
        self,
        lot_id: UUID,
        status: Optional[BookingStatus] = None,
        limit: int = 100,
    ) -> List[ParkingTicket]:
        """
        Get tickets for a parking lot.
        
        Args:
            lot_id: Parking lot ID
            status: Optional status filter
            limit: Maximum number of tickets to return
            
        Returns:
            List[ParkingTicket]: List of parking tickets
        """
        filters = [
            FilterSpecification("parking_lot_id", "eq", str(lot_id)),
        ]
        if status:
            filters.append(FilterSpecification("status", "eq", status.value))
        
        order = [OrderSpecification("entry_time", ascending=False)]
        pagination = PaginationSpecification(page=1, limit=limit)
        
        return await self.find_all(filters=filters, order=order, pagination=pagination)
    
    async def get_active_tickets(
        self,
        lot_id: Optional[UUID] = None,
    ) -> List[ParkingTicket]:
        """
        Get active tickets.
        
        Args:
            lot_id: Optional lot ID filter
            
        Returns:
            List[ParkingTicket]: List of active tickets
        """
        filters = [
            FilterSpecification("status", "eq", BookingStatus.ACTIVE.value),
        ]
        if lot_id:
            filters.append(FilterSpecification("parking_lot_id", "eq", str(lot_id)))
        
        order = [OrderSpecification("entry_time", ascending=True)]
        return await self.find_all(filters=filters, order=order)
    
    async def get_completed_tickets(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        lot_id: Optional[UUID] = None,
    ) -> List[ParkingTicket]:
        """
        Get completed tickets.
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            lot_id: Optional lot ID filter
            
        Returns:
            List[ParkingTicket]: List of completed tickets
        """
        filters = [
            FilterSpecification("status", "eq", BookingStatus.COMPLETED.value),
        ]
        if start_date:
            filters.append(FilterSpecification("exit_time", "gte", start_date))
        if end_date:
            filters.append(FilterSpecification("exit_time", "lte", end_date))
        if lot_id:
            filters.append(FilterSpecification("parking_lot_id", "eq", str(lot_id)))
        
        order = [OrderSpecification("exit_time", ascending=False)]
        return await self.find_all(filters=filters, order=order)
    
    async def get_revenue_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        lot_id: Optional[UUID] = None,
    ) -> Dict[str, Any]:
        """
        Get revenue report.
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            lot_id: Optional lot ID filter
            
        Returns:
            Dict[str, Any]: Revenue report
        """
        query = """
            SELECT
                COUNT(*) as total_tickets,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_revenue,
                MIN(total_amount) as min_revenue,
                MAX(total_amount) as max_revenue,
                DATE_TRUNC('day', exit_time) as date
            FROM parking_tickets
            WHERE status = 'completed'
        """
        params = []
        conditions = []
        
        if start_date:
            conditions.append(f"exit_time >= ${len(params) + 1}")
            params.append(start_date)
        if end_date:
            conditions.append(f"exit_time <= ${len(params) + 1}")
            params.append(end_date)
        if lot_id:
            conditions.append(f"parking_lot_id = ${len(params) + 1}")
            params.append(str(lot_id))
        
        if conditions:
            query += " AND " + " AND ".join(conditions)
        
        query += " GROUP BY DATE_TRUNC('day', exit_time) ORDER BY date DESC"
        
        results = await self.db.fetch(query, *params)
        
        daily_revenue = []
        total_tickets = 0
        total_revenue = 0
        
        for row in results:
            daily_revenue.append({
                "date": row["date"].isoformat(),
                "tickets": row["total_tickets"],
                "revenue": row["total_revenue"] or 0,
                "avg_revenue": row["avg_revenue"] or 0,
                "min_revenue": row["min_revenue"] or 0,
                "max_revenue": row["max_revenue"] or 0,
            })
            total_tickets += row["total_tickets"]
            total_revenue += row["total_revenue"] or 0
        
        return {
            "total_tickets": total_tickets,
            "total_revenue": total_revenue or 0,
            "average_revenue": (total_revenue / total_tickets) if total_tickets > 0 else 0,
            "daily_revenue": daily_revenue,
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
        }
    
    # ==========================================================================
    # Mapping Methods
    # ==========================================================================
    
    def _map_to_entity(self, data: Dict[str, Any]) -> ParkingTicket:
        """
        Map database record to ParkingTicket entity.
        
        Args:
            data: Database record
            
        Returns:
            ParkingTicket: Domain entity
        """
        return ParkingTicket(
            id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
            ticket_number=data["ticket_number"],
            parking_lot_id=UUID(data["parking_lot_id"]) if isinstance(data["parking_lot_id"], str) else data["parking_lot_id"],
            slot_number=data["slot_number"],
            vehicle_id=UUID(data["vehicle_id"]) if isinstance(data["vehicle_id"], str) else data["vehicle_id"],
            entry_time=data["entry_time"],
            exit_time=data.get("exit_time"),
            total_amount=data.get("total_amount"),
            status=BookingStatus(data["status"]),
            created_at=data.get("created_at") or datetime.now(),
            updated_at=data.get("updated_at"),
        )