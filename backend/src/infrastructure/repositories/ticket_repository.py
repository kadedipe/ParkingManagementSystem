# ============================================================================
# Parking Management System - Ticket Repository
# ============================================================================

"""
Ticket Repository implementations for data access.

This module provides repository implementations for ticket-related entities:
- ParkingTicketRepository
- PaymentTicketRepository
- ReservationTicketRepository
- TicketAnalyticsRepository
"""

from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime, timedelta
import logging

from src.infrastructure.repositories.base import BaseRepository, FilterSpecification, OrderSpecification, PaginationSpecification
from src.domain.models import ParkingTicket
from src.domain.enums import BookingStatus
from src.infrastructure.database import DatabaseClient
from src.infrastructure.cache import CacheClient

logger = logging.getLogger(__name__)


class ParkingTicketRepository(BaseRepository):
    """
    Repository for Parking Ticket entities.
    
    Provides CRUD operations and specialized queries for parking tickets.
    """
    
    def __init__(
        self,
        database_client: DatabaseClient,
        cache_client: Optional[CacheClient] = None,
        cache_ttl: int = 300,
    ):
        """
        Initialize the parking ticket repository.
        
        Args:
            database_client: Database client for data access
            cache_client: Optional cache client for performance
            cache_ttl: Cache TTL in seconds
        """
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
        data = {
            "id": str(entity.id),
            "ticket_number": entity.ticket_number,
            "parking_lot_id": str(entity.parking_lot_id),
            "slot_number": entity.slot_number,
            "vehicle_id": str(entity.vehicle_id),
            "entry_time": entity.entry_time,
            "exit_time": entity.exit_time,
            "total_amount": entity.total_amount,
            "status": entity.status.value,
            "created_at": entity.created_at,
            "updated_at": entity.updated_at if hasattr(entity, 'updated_at') else None,
        }
        
        await self.db.execute(
            """
            INSERT INTO parking_tickets (
                id, ticket_number, parking_lot_id, slot_number,
                vehicle_id, entry_time, exit_time, total_amount,
                status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            """,
            data["id"],
            data["ticket_number"],
            data["parking_lot_id"],
            data["slot_number"],
            data["vehicle_id"],
            data["entry_time"],
            data["exit_time"],
            data["total_amount"],
            data["status"],
            data["created_at"],
            data["updated_at"],
        )
        
        return entity
    
    async def _do_get_by_id(self, entity_id: UUID) -> Optional[ParkingTicket]:
        """Get a parking ticket by ID."""
        result = await self.db.fetch_one(
            """
            SELECT 
                t.*,
                v.license_plate,
                v.make,
                v.model,
                v.color,
                pl.name as lot_name
            FROM parking_tickets t
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN parking_lots pl ON t.parking_lot_id = pl.id
            WHERE t.id = $1
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
        query = """
            SELECT 
                t.*,
                v.license_plate,
                v.make,
                v.model,
                v.color,
                pl.name as lot_name
            FROM parking_tickets t
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN parking_lots pl ON t.parking_lot_id = pl.id
        """
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"t.{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "contains":
                    conditions.append(f"t.{filter_spec.field} ILIKE ${param_index}")
                    params.append(f"%{filter_spec.value}%")
                elif filter_spec.operator == "gte":
                    conditions.append(f"t.{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"t.{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "gt":
                    conditions.append(f"t.{filter_spec.field} > ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lt":
                    conditions.append(f"t.{filter_spec.field} < ${param_index}")
                    params.append(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        if order:
            order_clauses = []
            for order_spec in order:
                direction = "ASC" if order_spec.ascending else "DESC"
                order_clauses.append(f"t.{order_spec.field} {direction}")
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
        query = "SELECT COUNT(*) FROM parking_tickets t"
        params = []
        conditions = []
        
        if filters:
            for i, filter_spec in enumerate(filters):
                param_index = i + 1
                if filter_spec.operator == "eq":
                    conditions.append(f"t.{filter_spec.field} = ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "gte":
                    conditions.append(f"t.{filter_spec.field} >= ${param_index}")
                    params.append(filter_spec.value)
                elif filter_spec.operator == "lte":
                    conditions.append(f"t.{filter_spec.field} <= ${param_index}")
                    params.append(filter_spec.value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        result = await self.db.fetch_val(query, *params)
        return int(result) if result else 0
    
    # ==========================================================================
    # Specialized Queries
    # ==========================================================================
    
    async def get_ticket_by_number(self, ticket_number: str) -> Optional[ParkingTicket]:
        """
        Get a ticket by ticket number.
        
        Args:
            ticket_number: Ticket number
            
        Returns:
            Optional[ParkingTicket]: Ticket or None
        """
        filters = [
            FilterSpecification("ticket_number", "eq", ticket_number),
        ]
        results = await self.find_all(filters=filters)
        return results[0] if results else None
    
    async def get_tickets_by_vehicle(
        self,
        vehicle_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ParkingTicket]:
        """
        Get tickets for a vehicle.
        
        Args:
            vehicle_id: Vehicle ID
            limit: Maximum number of tickets to return
            offset: Number of tickets to skip
            
        Returns:
            List[ParkingTicket]: List of parking tickets
        """
        filters = [
            FilterSpecification("vehicle_id", "eq", str(vehicle_id)),
        ]
        order = [OrderSpecification("entry_time", ascending=False)]
        pagination = PaginationSpecification(
            page=(offset // limit) + 1,
            limit=limit
        )
        
        return await self.find_all(filters=filters, order=order, pagination=pagination)
    
    async def get_tickets_by_lot(
        self,
        lot_id: UUID,
        status: Optional[BookingStatus] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ParkingTicket]:
        """
        Get tickets for a parking lot.
        
        Args:
            lot_id: Parking lot ID
            status: Optional status filter
            limit: Maximum number of tickets to return
            offset: Number of tickets to skip
            
        Returns:
            List[ParkingTicket]: List of parking tickets
        """
        filters = [
            FilterSpecification("parking_lot_id", "eq", str(lot_id)),
        ]
        if status:
            filters.append(FilterSpecification("status", "eq", status.value))
        
        order = [OrderSpecification("entry_time", ascending=False)]
        pagination = PaginationSpecification(
            page=(offset // limit) + 1,
            limit=limit
        )
        
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
        limit: int = 1000,
    ) -> List[ParkingTicket]:
        """
        Get completed tickets.
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            lot_id: Optional lot ID filter
            limit: Maximum number of tickets to return
            
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
        pagination = PaginationSpecification(
            page=1,
            limit=limit
        )
        
        return await self.find_all(filters=filters, order=order, pagination=pagination)
    
    async def get_cancelled_tickets(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[ParkingTicket]:
        """
        Get cancelled tickets.
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            
        Returns:
            List[ParkingTicket]: List of cancelled tickets
        """
        filters = [
            FilterSpecification("status", "eq", BookingStatus.CANCELLED.value),
        ]
        if start_date:
            filters.append(FilterSpecification("created_at", "gte", start_date))
        if end_date:
            filters.append(FilterSpecification("created_at", "lte", end_date))
        
        order = [OrderSpecification("created_at", ascending=False)]
        return await self.find_all(filters=filters, order=order)
    
    async def get_expired_tickets(
        self,
        threshold_minutes: int = 30,
    ) -> List[ParkingTicket]:
        """
        Get expired tickets.
        
        Args:
            threshold_minutes: Minutes after which ticket is considered expired
            
        Returns:
            List[ParkingTicket]: List of expired tickets
        """
        cutoff_time = datetime.now() - timedelta(minutes=threshold_minutes)
        
        filters = [
            FilterSpecification("status", "eq", BookingStatus.ACTIVE.value),
            FilterSpecification("entry_time", "lt", cutoff_time),
        ]
        
        return await self.find_all(filters=filters)
    
    async def get_tickets_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        status: Optional[BookingStatus] = None,
    ) -> List[ParkingTicket]:
        """
        Get tickets by date range.
        
        Args:
            start_date: Start date
            end_date: End date
            status: Optional status filter
            
        Returns:
            List[ParkingTicket]: List of tickets
        """
        filters = [
            FilterSpecification("entry_time", "gte", start_date),
            FilterSpecification("entry_time", "lte", end_date),
        ]
        if status:
            filters.append(FilterSpecification("status", "eq", status.value))
        
        order = [OrderSpecification("entry_time", ascending=True)]
        return await self.find_all(filters=filters, order=order)
    
    async def get_ticket_stats(
        self,
        lot_id: Optional[UUID] = None,
    ) -> Dict[str, Any]:
        """
        Get ticket statistics.
        
        Args:
            lot_id: Optional lot ID filter
            
        Returns:
            Dict[str, Any]: Ticket statistics
        """
        query = """
            SELECT
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tickets,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tickets,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tickets,
                COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_tickets,
                AVG(EXTRACT(EPOCH FROM (exit_time - entry_time))/3600) as avg_duration_hours,
                SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
            FROM parking_tickets
        """
        params = []
        conditions = []
        
        if lot_id:
            conditions.append(f"parking_lot_id = ${len(params) + 1}")
            params.append(str(lot_id))
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        result = await self.db.fetch_one(query, *params)
        
        if not result:
            return {}
        
        return {
            "total_tickets": result["total_tickets"] or 0,
            "active_tickets": result["active_tickets"] or 0,
            "completed_tickets": result["completed_tickets"] or 0,
            "cancelled_tickets": result["cancelled_tickets"] or 0,
            "expired_tickets": result["expired_tickets"] or 0,
            "avg_duration_hours": result["avg_duration_hours"] or 0,
            "total_revenue": result["total_revenue"] or 0,
        }
    
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
                DATE_TRUNC('day', exit_time) as date,
                COUNT(*) as ticket_count,
                SUM(total_amount) as daily_revenue,
                AVG(total_amount) as avg_ticket_amount,
                MIN(total_amount) as min_ticket_amount,
                MAX(total_amount) as max_ticket_amount
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
                "tickets": row["ticket_count"],
                "revenue": row["daily_revenue"] or 0,
                "avg_ticket": row["avg_ticket_amount"] or 0,
                "min_ticket": row["min_ticket_amount"] or 0,
                "max_ticket": row["max_ticket_amount"] or 0,
            })
            total_tickets += row["ticket_count"]
            total_revenue += row["daily_revenue"] or 0
        
        return {
            "total_tickets": total_tickets,
            "total_revenue": total_revenue or 0,
            "average_revenue": (total_revenue / total_tickets) if total_tickets > 0 else 0,
            "daily_revenue": daily_revenue,
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None,
        }
    
    async def get_ticket_analytics(
        self,
        lot_id: Optional[UUID] = None,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Get ticket analytics.
        
        Args:
            lot_id: Optional lot ID filter
            days: Number of days to analyze
            
        Returns:
            Dict[str, Any]: Ticket analytics
        """
        start_date = datetime.now() - timedelta(days=days)
        
        query = """
            SELECT
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                AVG(EXTRACT(EPOCH FROM (exit_time - entry_time))/3600) as avg_duration,
                AVG(total_amount) as avg_amount,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_amount) as median_amount,
                MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM entry_time)) as peak_hour
            FROM parking_tickets
            WHERE created_at >= $1
        """
        params = [start_date]
        
        if lot_id:
            query += " AND parking_lot_id = $2"
            params.append(str(lot_id))
        
        result = await self.db.fetch_one(query, *params)
        
        if not result:
            return {}
        
        # Get hourly distribution
        hourly_query = """
            SELECT
                EXTRACT(HOUR FROM entry_time) as hour,
                COUNT(*) as count
            FROM parking_tickets
            WHERE created_at >= $1
        """
        hourly_params = [start_date]
        
        if lot_id:
            hourly_query += " AND parking_lot_id = $2"
            hourly_params.append(str(lot_id))
        
        hourly_query += " GROUP BY hour ORDER BY hour"
        
        hourly_results = await self.db.fetch(hourly_query, *hourly_params)
        
        return {
            "period_days": days,
            "total_tickets": result["total_tickets"] or 0,
            "active_count": result["active"] or 0,
            "completed_count": result["completed"] or 0,
            "cancelled_count": result["cancelled"] or 0,
            "avg_duration_hours": result["avg_duration"] or 0,
            "avg_amount": result["avg_amount"] or 0,
            "median_amount": result["median_amount"] or 0,
            "peak_hour": int(result["peak_hour"]) if result["peak_hour"] else 0,
            "hourly_distribution": [
                {"hour": int(row["hour"]), "count": row["count"]}
                for row in hourly_results
            ],
            "timestamp": datetime.now().isoformat(),
        }
    
    async def get_ticket_by_ticket_number(self, ticket_number: str) -> Optional[ParkingTicket]:
        """
        Get a ticket by ticket number.
        
        Args:
            ticket_number: Ticket number
            
        Returns:
            Optional[ParkingTicket]: Ticket or None
        """
        filters = [
            FilterSpecification("ticket_number", "eq", ticket_number),
        ]
        results = await self.find_all(filters=filters)
        return results[0] if results else None
    
    async def get_active_tickets_count(self, lot_id: Optional[UUID] = None) -> int:
        """
        Get count of active tickets.
        
        Args:
            lot_id: Optional lot ID filter
            
        Returns:
            int: Count of active tickets
        """
        filters = [
            FilterSpecification("status", "eq", BookingStatus.ACTIVE.value),
        ]
        if lot_id:
            filters.append(FilterSpecification("parking_lot_id", "eq", str(lot_id)))
        
        return await self._do_count(filters)
    
    async def get_total_revenue(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        lot_id: Optional[UUID] = None,
    ) -> float:
        """
        Get total revenue.
        
        Args:
            start_date: Optional start date
            end_date: Optional end date
            lot_id: Optional lot ID filter
            
        Returns:
            float: Total revenue
        """
        query = "SELECT COALESCE(SUM(total_amount), 0) FROM parking_tickets WHERE status = 'completed'"
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
        
        result = await self.db.fetch_val(query, *params)
        return float(result) if result else 0.0
    
    async def get_average_ticket_duration(
        self,
        lot_id: Optional[UUID] = None,
    ) -> float:
        """
        Get average ticket duration.
        
        Args:
            lot_id: Optional lot ID filter
            
        Returns:
            float: Average duration in hours
        """
        query = """
            SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (exit_time - entry_time))/3600), 0)
            FROM parking_tickets
            WHERE status = 'completed'
        """
        params = []
        conditions = []
        
        if lot_id:
            conditions.append(f"parking_lot_id = ${len(params) + 1}")
            params.append(str(lot_id))
        
        if conditions:
            query += " AND " + " AND ".join(conditions)
        
        result = await self.db.fetch_val(query, *params)
        return float(result) if result else 0.0
    
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


class PaymentTicketRepository:
    """
    Repository for Payment Tickets.
    
    Provides operations for managing payment tickets.
    """
    
    def __init__(self, database_client: DatabaseClient):
        """
        Initialize the payment ticket repository.
        
        Args:
            database_client: Database client for data access
        """
        self.db = database_client
    
    async def create_payment_ticket(
        self,
        ticket_id: UUID,
        payment_id: UUID,
        amount: float,
        payment_method: str,
        transaction_id: str,
    ) -> Dict[str, Any]:
        """
        Create a payment ticket.
        
        Args:
            ticket_id: Ticket ID
            payment_id: Payment ID
            amount: Payment amount
            payment_method: Payment method
            transaction_id: Transaction ID
            
        Returns:
            Dict[str, Any]: Created payment ticket
        """
        await self.db.execute(
            """
            INSERT INTO payment_tickets (
                id, ticket_id, payment_id, amount,
                payment_method, transaction_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
            str(UUID(int=0)),  # Placeholder
            str(ticket_id),
            str(payment_id),
            amount,
            payment_method,
            transaction_id,
            datetime.now(),
        )
        
        return {
            "ticket_id": ticket_id,
            "payment_id": payment_id,
            "amount": amount,
            "payment_method": payment_method,
            "transaction_id": transaction_id,
            "created_at": datetime.now().isoformat(),
        }
    
    async def get_payment_by_ticket(self, ticket_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get payment by ticket ID.
        
        Args:
            ticket_id: Ticket ID
            
        Returns:
            Optional[Dict[str, Any]]: Payment or None
        """
        result = await self.db.fetch_one(
            """
            SELECT * FROM payment_tickets WHERE ticket_id = $1
            """,
            str(ticket_id),
        )
        
        if not result:
            return None
        
        return {
            "id": result["id"],
            "ticket_id": result["ticket_id"],
            "payment_id": result["payment_id"],
            "amount": result["amount"],
            "payment_method": result["payment_method"],
            "transaction_id": result["transaction_id"],
            "created_at": result["created_at"],
        }