# ============================================================================
# Parking Management System - Vehicle Repository
# ============================================================================

"""
Vehicle Repository implementations for data access.

This module provides repository implementations for vehicle-related entities:
- VehicleRepository
- ElectricVehicleRepository
- VehicleTypeRepository
"""

from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime
import logging

from src.infrastructure.repositories.base import BaseRepository, FilterSpecification, OrderSpecification, PaginationSpecification
from src.domain.models import Vehicle, ElectricVehicle
from src.domain.enums import VehicleType, PowerSource
from src.domain.value_objects import LicensePlate
from src.infrastructure.database import DatabaseClient
from src.infrastructure.cache import CacheClient

logger = logging.getLogger(__name__)


class VehicleRepository(BaseRepository):
    """
    Repository for Vehicle entities.
    
    Provides CRUD operations and specialized queries for vehicles.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        """
        Initialize the vehicle repository.
        
        Args:
            database_client: Database client for data access
            cache_client: Optional cache client for performance
            cache_ttl: Cache TTL in seconds
        """
        super().__init__(database_client, cache_client, cache_ttl)
        self._entity_class = Vehicle
        self._collection_name = "vehicles"
    
    def get_entity_class(self):
        return self._entity_class
    
    def get_collection_name(self) -> str:
        return self._collection_name
    
    # ==========================================================================
    # CRUD Operations
    # ==========================================================================
    
    async def _do_create(self, entity: Vehicle) -> Vehicle:
        """Create a vehicle in the database."""
        data = {
            "id": str(entity.id),
            "license_plate": entity.license_plate.value,
            "make": entity.make,
            "model": entity.model,
            "color": entity.color,
            "year": entity.year,
            "vehicle_type": entity.vehicle_type.value,
            "power_source": entity.power_source.value,
            "is_electric": entity.is_electric,
            "is_active": entity.is_active,
            "created_at": entity.created_at.isoformat(),
            "updated_at": entity.updated_at.isoformat() if hasattr(entity, 'updated_at') else None,
        }
        
        # Add electric vehicle specific fields
        if isinstance(entity, ElectricVehicle):
            data.update({
                "battery_capacity_kwh": entity.battery_capacity_kwh,
                "current_charge_percent": entity.current_charge_percent,
                "max_charge_rate_kw": entity.max_charge_rate_kw,
            })
        
        await self.db.execute(
            """
            INSERT INTO vehicles (
                id, license_plate, make, model, color, year,
                vehicle_type, power_source, is_electric, is_active,
                battery_capacity_kwh, current_charge_percent, max_charge_rate_kw,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            """,
            data["id"],
            data["license_plate"],
            data["make"],
            data["model"],
            data["color"],
            data["year"],
            data["vehicle_type"],
            data["power_source"],
            data["is_electric"],
            data["is_active"],
            data.get("battery_capacity_kwh"),
            data.get("current_charge_percent"),
            data.get("max_charge_rate_kw"),
            data["created_at"],
            data["updated_at"],
        )
        
        return entity
    
    async def _do_get_by_id(self, entity_id: UUID) -> Optional[Vehicle]:
        """Get a vehicle by ID."""
        result = await self.db.fetch_one(
            """
            SELECT * FROM vehicles WHERE id = $1
            """,
            str(entity_id),
        )
        
        if not result:
            return None
        
        return self._map_to_entity(result)
    
    async def _do_update(self, entity: Vehicle) -> Vehicle:
        """Update a vehicle."""
        data = {
            "id": str(entity.id),
            "license_plate": entity.license_plate.value,
            "make": entity.make,
            "model": entity.model,
            "color": entity.color,
            "year": entity.year,
            "vehicle_type": entity.vehicle_type.value,
            "power_source": entity.power_source.value,
            "is_electric": entity.is_electric,
            "is_active": entity.is_active,
            "updated_at": datetime.now().isoformat(),
        }
        
        # Add electric vehicle specific fields
        if isinstance(entity, ElectricVehicle):
            data.update({
                "battery_capacity_kwh": entity.battery_capacity_kwh,
                "current_charge_percent": entity.current_charge_percent,
                "max_charge_rate_kw": entity.max_charge_rate_kw,
            })
        
        await self.db.execute(
            """
            UPDATE vehicles SET
                license_plate = $2,
                make = $3,
                model = $4,
                color = $5,
                year = $6,
                vehicle_type = $7,
                power_source = $8,
                is_electric = $9,
                is_active = $10,
                battery_capacity_kwh = $11,
                current_charge_percent = $12,
                max_charge_rate_kw = $13,
                updated_at = $14
            WHERE id = $1
            """,
            data["id"],
            data["license_plate"],
            data["make"],
            data["model"],
            data["color"],
            data["year"],
            data["vehicle_type"],
            data["power_source"],
            data["is_electric"],
            data["is_active"],
            data.get("battery_capacity_kwh"),
            data.get("current_charge_percent"),
            data.get("max_charge_rate_kw"),
            data["updated_at"],
        )
        
        return entity
    
    async def _do_delete(self, entity_id: UUID) -> bool:
        """Delete a vehicle."""
        result = await self.db.execute(
            """
            DELETE FROM vehicles WHERE id = $1
            """,
            str(entity_id),
        )
        return result == "DELETE 1"
    
    async def _do_find(
        self,
        filters: Optional[List[FilterSpecification]] = None,
        order: Optional[List[OrderSpecification]] = None,
        pagination: Optional[PaginationSpecification] = None,
    ) -> List[Vehicle]:
        """Find vehicles matching specifications."""
        query = "SELECT * FROM vehicles"
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
                elif filter_spec.operator == "gte":
                    conditions.append(f"{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
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
        """Count vehicles matching filters."""
        query = "SELECT COUNT(*) FROM vehicles"
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
    
    async def find_by_plate(self, license_plate: str) -> Optional[Vehicle]:
        """
        Find a vehicle by license plate.
        
        Args:
            license_plate: License plate number
            
        Returns:
            Optional[Vehicle]: Vehicle or None
        """
        plate = license_plate.upper().strip()
        filters = [
            FilterSpecification("license_plate", "eq", plate),
        ]
        results = await self.find_all(filters=filters)
        return results[0] if results else None
    
    async def get_all_vehicles(
        self,
        active_only: bool = True,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Vehicle]:
        """
        Get all vehicles.
        
        Args:
            active_only: If True, only return active vehicles
            limit: Maximum number of vehicles to return
            offset: Number of vehicles to skip
            
        Returns:
            List[Vehicle]: List of vehicles
        """
        filters = []
        if active_only:
            filters.append(FilterSpecification("is_active", "eq", True))
        
        order = [OrderSpecification("created_at", ascending=False)]
        pagination = PaginationSpecification(
            page=(offset // limit) + 1,
            limit=limit
        )
        
        return await self.find_all(filters=filters, order=order, pagination=pagination)
    
    async def get_electric_vehicles(
        self,
        min_charge: Optional[float] = None,
        limit: int = 100,
    ) -> List[ElectricVehicle]:
        """
        Get electric vehicles.
        
        Args:
            min_charge: Optional minimum charge percentage
            limit: Maximum number of vehicles to return
            
        Returns:
            List[ElectricVehicle]: List of electric vehicles
        """
        filters = [
            FilterSpecification("is_electric", "eq", True),
            FilterSpecification("is_active", "eq", True),
        ]
        if min_charge is not None:
            filters.append(FilterSpecification("current_charge_percent", "gte", min_charge))
        
        order = [OrderSpecification("created_at", ascending=False)]
        pagination = PaginationSpecification(page=1, limit=limit)
        
        results = await self.find_all(filters=filters, order=order, pagination=pagination)
        return [v for v in results if isinstance(v, ElectricVehicle)]
    
    async def find_by_color(self, color: str) -> List[Vehicle]:
        """
        Find vehicles by color.
        
        Args:
            color: Vehicle color
            
        Returns:
            List[Vehicle]: List of vehicles
        """
        filters = [
            FilterSpecification("color", "eq", color),
            FilterSpecification("is_active", "eq", True),
        ]
        return await self.find_all(filters=filters)
    
    async def find_by_make(self, make: str) -> List[Vehicle]:
        """
        Find vehicles by make.
        
        Args:
            make: Vehicle make
            
        Returns:
            List[Vehicle]: List of vehicles
        """
        filters = [
            FilterSpecification("make", "eq", make),
            FilterSpecification("is_active", "eq", True),
        ]
        return await self.find_all(filters=filters)
    
    async def find_by_model(self, model: str) -> List[Vehicle]:
        """
        Find vehicles by model.
        
        Args:
            model: Vehicle model
            
        Returns:
            List[Vehicle]: List of vehicles
        """
        filters = [
            FilterSpecification("model", "eq", model),
            FilterSpecification("is_active", "eq", True),
        ]
        return await self.find_all(filters=filters)
    
    async def find_by_year_range(
        self,
        min_year: int,
        max_year: int,
    ) -> List[Vehicle]:
        """
        Find vehicles by year range.
        
        Args:
            min_year: Minimum year
            max_year: Maximum year
            
        Returns:
            List[Vehicle]: List of vehicles
        """
        filters = [
            FilterSpecification("year", "gte", min_year),
            FilterSpecification("year", "lte", max_year),
            FilterSpecification("is_active", "eq", True),
        ]
        order = [OrderSpecification("year", ascending=False)]
        return await self.find_all(filters=filters, order=order)
    
    async def search_vehicles(
        self,
        license_plate: Optional[str] = None,
        make: Optional[str] = None,
        model: Optional[str] = None,
        color: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        is_electric: Optional[bool] = None,
        min_year: Optional[int] = None,
        max_year: Optional[int] = None,
        is_active: bool = True,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Vehicle]:
        """
        Search vehicles with multiple criteria.
        
        Args:
            license_plate: License plate filter
            make: Make filter
            model: Model filter
            color: Color filter
            vehicle_type: Vehicle type filter
            is_electric: Electric vehicle filter
            min_year: Minimum year filter
            max_year: Maximum year filter
            is_active: Active status filter
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            List[Vehicle]: List of matching vehicles
        """
        filters = []
        
        if license_plate:
            filters.append(FilterSpecification("license_plate", "contains", license_plate))
        if make:
            filters.append(FilterSpecification("make", "contains", make))
        if model:
            filters.append(FilterSpecification("model", "contains", model))
        if color:
            filters.append(FilterSpecification("color", "eq", color))
        if vehicle_type:
            filters.append(FilterSpecification("vehicle_type", "eq", vehicle_type))
        if is_electric is not None:
            filters.append(FilterSpecification("is_electric", "eq", is_electric))
        if min_year:
            filters.append(FilterSpecification("year", "gte", min_year))
        if max_year:
            filters.append(FilterSpecification("year", "lte", max_year))
        if is_active is not None:
            filters.append(FilterSpecification("is_active", "eq", is_active))
        
        pagination = PaginationSpecification(
            page=(offset // limit) + 1,
            limit=limit
        )
        
        return await self.find_all(filters=filters, pagination=pagination)
    
    async def get_vehicle_statistics(self) -> Dict[str, Any]:
        """
        Get vehicle statistics.
        
        Returns:
            Dict[str, Any]: Vehicle statistics
        """
        query = """
            SELECT
                COUNT(*) as total_vehicles,
                COUNT(CASE WHEN is_active THEN 1 END) as active_vehicles,
                COUNT(CASE WHEN is_electric THEN 1 END) as electric_vehicles,
                COUNT(CASE WHEN NOT is_electric THEN 1 END) as gas_vehicles,
                COUNT(CASE WHEN vehicle_type = 'car' THEN 1 END) as cars,
                COUNT(CASE WHEN vehicle_type = 'truck' THEN 1 END) as trucks,
                COUNT(CASE WHEN vehicle_type = 'motorcycle' THEN 1 END) as motorcycles,
                COUNT(CASE WHEN vehicle_type = 'bus' THEN 1 END) as buses,
                AVG(year) as avg_year,
                MIN(year) as min_year,
                MAX(year) as max_year,
                AVG(current_charge_percent) as avg_charge_percent
            FROM vehicles
        """
        
        result = await self.db.fetch_one(query)
        
        if not result:
            return {}
        
        return {
            "total_vehicles": result["total_vehicles"] or 0,
            "active_vehicles": result["active_vehicles"] or 0,
            "electric_vehicles": result["electric_vehicles"] or 0,
            "gas_vehicles": result["gas_vehicles"] or 0,
            "vehicles_by_type": {
                "car": result["cars"] or 0,
                "truck": result["trucks"] or 0,
                "motorcycle": result["motorcycles"] or 0,
                "bus": result["buses"] or 0,
            },
            "year_stats": {
                "avg": result["avg_year"] or 0,
                "min": result["min_year"] or 0,
                "max": result["max_year"] or 0,
            },
            "avg_charge_percent": result["avg_charge_percent"] or 0,
            "timestamp": datetime.now().isoformat(),
        }
    
    async def get_top_makes(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top vehicle makes.
        
        Args:
            limit: Maximum number of makes to return
            
        Returns:
            List[Dict[str, Any]]: List of makes with counts
        """
        query = """
            SELECT
                make,
                COUNT(*) as count,
                AVG(year) as avg_year
            FROM vehicles
            WHERE is_active = true
            GROUP BY make
            ORDER BY count DESC
            LIMIT $1
        """
        
        results = await self.db.fetch(query, limit)
        
        return [
            {
                "make": row["make"],
                "count": row["count"],
                "avg_year": row["avg_year"] or 0,
            }
            for row in results
        ]
    
    async def get_type_distribution(self) -> Dict[str, int]:
        """
        Get vehicle type distribution.
        
        Returns:
            Dict[str, int]: Vehicle type distribution
        """
        query = """
            SELECT
                vehicle_type,
                COUNT(*) as count
            FROM vehicles
            WHERE is_active = true
            GROUP BY vehicle_type
        """
        
        results = await self.db.fetch(query)
        
        return {row["vehicle_type"]: row["count"] for row in results}
    
    async def count_active(self) -> int:
        """Count active vehicles."""
        return await self._do_count([FilterSpecification("is_active", "eq", True)])
    
    async def count_electric(self) -> int:
        """Count electric vehicles."""
        return await self._do_count([
            FilterSpecification("is_electric", "eq", True),
            FilterSpecification("is_active", "eq", True),
        ])
    
    async def count_all(self) -> int:
        """Count all vehicles."""
        return await self._do_count()
    
    # ==========================================================================
    # Mapping Methods
    # ==========================================================================
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Vehicle:
        """
        Map database record to Vehicle entity.
        
        Args:
            data: Database record
            
        Returns:
            Vehicle: Domain entity
        """
        license_plate = LicensePlate(data["license_plate"])
        vehicle_type = VehicleType(data["vehicle_type"])
        power_source = PowerSource(data["power_source"])
        
        # Create appropriate vehicle type
        if data.get("is_electric", False):
            return ElectricVehicle(
                id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
                license_plate=license_plate,
                make=data["make"],
                model=data["model"],
                color=data["color"],
                year=data["year"],
                vehicle_type=vehicle_type,
                power_source=power_source,
                is_electric=True,
                is_active=data.get("is_active", True),
                battery_capacity_kwh=data.get("battery_capacity_kwh", 60.0),
                current_charge_percent=data.get("current_charge_percent", 50.0),
                max_charge_rate_kw=data.get("max_charge_rate_kw", 7.4),
                created_at=data.get("created_at") or datetime.now(),
                updated_at=data.get("updated_at"),
            )
        else:
            return Vehicle(
                id=UUID(data["id"]) if isinstance(data["id"], str) else data["id"],
                license_plate=license_plate,
                make=data["make"],
                model=data["model"],
                color=data["color"],
                year=data["year"],
                vehicle_type=vehicle_type,
                power_source=power_source,
                is_electric=False,
                is_active=data.get("is_active", True),
                created_at=data.get("created_at") or datetime.now(),
                updated_at=data.get("updated_at"),
            )


class ElectricVehicleRepository(VehicleRepository):
    """
    Repository for Electric Vehicle entities.
    
    Provides specialized queries for electric vehicles.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        super().__init__(database_client, cache_client, cache_ttl)
        self._entity_class = ElectricVehicle
    
    async def get_low_battery_vehicles(
        self,
        threshold: float = 20.0,
        limit: int = 50,
    ) -> List[ElectricVehicle]:
        """
        Get vehicles with low battery.
        
        Args:
            threshold: Battery threshold percentage
            limit: Maximum number of vehicles to return
            
        Returns:
            List[ElectricVehicle]: List of low battery vehicles
        """
        filters = [
            FilterSpecification("is_electric", "eq", True),
            FilterSpecification("current_charge_percent", "lt", threshold),
            FilterSpecification("is_active", "eq", True),
        ]
        order = [OrderSpecification("current_charge_percent", ascending=True)]
        pagination = PaginationSpecification(page=1, limit=limit)
        
        results = await self.find_all(filters=filters, order=order, pagination=pagination)
        return [v for v in results if isinstance(v, ElectricVehicle)]
    
    async def get_charging_vehicles(self) -> List[ElectricVehicle]:
        """
        Get vehicles currently charging.
        
        Returns:
            List[ElectricVehicle]: List of charging vehicles
        """
        # Note: This would require joining with charging sessions table
        # For now, return all EVs with charge < 100%
        filters = [
            FilterSpecification("is_electric", "eq", True),
            FilterSpecification("current_charge_percent", "lt", 100),
            FilterSpecification("is_active", "eq", True),
        ]
        results = await self.find_all(filters=filters)
        return [v for v in results if isinstance(v, ElectricVehicle)]
    
    async def get_charging_statistics(self) -> Dict[str, Any]:
        """
        Get electric vehicle statistics.
        
        Returns:
            Dict[str, Any]: EV statistics
        """
        query = """
            SELECT
                COUNT(*) as total_evs,
                AVG(current_charge_percent) as avg_charge,
                MIN(current_charge_percent) as min_charge,
                MAX(current_charge_percent) as max_charge,
                AVG(battery_capacity_kwh) as avg_battery_capacity,
                AVG(max_charge_rate_kw) as avg_charge_rate,
                COUNT(CASE WHEN current_charge_percent < 20 THEN 1 END) as low_battery,
                COUNT(CASE WHEN current_charge_percent > 80 THEN 1 END) as high_charge
            FROM vehicles
            WHERE is_electric = true AND is_active = true
        """
        
        result = await self.db.fetch_one(query)
        
        if not result:
            return {}
        
        return {
            "total_evs": result["total_evs"] or 0,
            "avg_charge": result["avg_charge"] or 0,
            "min_charge": result["min_charge"] or 0,
            "max_charge": result["max_charge"] or 0,
            "avg_battery_capacity_kwh": result["avg_battery_capacity"] or 0,
            "avg_charge_rate_kw": result["avg_charge_rate"] or 0,
            "low_battery_count": result["low_battery"] or 0,
            "high_charge_count": result["high_charge"] or 0,
            "timestamp": datetime.now().isoformat(),
        }


class VehicleTypeRepository:
    """
    Repository for Vehicle Types.
    
    Provides operations for managing vehicle types.
    """
    
    def __init__(self, database_client: DatabaseClient):
        """
        Initialize the vehicle type repository.
        
        Args:
            database_client: Database client for data access
        """
        self.db = database_client
    
    async def get_all_types(self) -> List[Dict[str, Any]]:
        """
        Get all vehicle types.
        
        Returns:
            List[Dict[str, Any]]: List of vehicle types
        """
        return [
            {
                "name": vt.value,
                "label": vt.value.capitalize(),
                "requires_license": vt in [VehicleType.CAR, VehicleType.TRUCK, VehicleType.BUS],
                "max_passengers": {
                    VehicleType.CAR: 5,
                    VehicleType.TRUCK: 2,
                    VehicleType.MOTORCYCLE: 1,
                    VehicleType.BUS: 40,
                }.get(vt, 0),
                "is_electric_supported": True,
            }
            for vt in VehicleType
        ]
    
    async def get_type(self, type_name: str) -> Optional[Dict[str, Any]]:
        """
        Get a vehicle type by name.
        
        Args:
            type_name: Vehicle type name
            
        Returns:
            Optional[Dict[str, Any]]: Vehicle type or None
        """
        try:
            vt = VehicleType(type_name)
            return {
                "name": vt.value,
                "label": vt.value.capitalize(),
                "requires_license": vt in [VehicleType.CAR, VehicleType.TRUCK, VehicleType.BUS],
                "max_passengers": {
                    VehicleType.CAR: 5,
                    VehicleType.TRUCK: 2,
                    VehicleType.MOTORCYCLE: 1,
                    VehicleType.BUS: 40,
                }.get(vt, 0),
                "is_electric_supported": True,
            }
        except ValueError:
            return None