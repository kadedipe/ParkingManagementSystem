# ============================================================================
# Charging Service - Core Charging Business Logic
# ============================================================================

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from decimal import Decimal

from src.core.logging import get_logger
from src.core.config import settings
from src.domain.models import ChargingStation, Connector, ChargingSession
from src.domain.enums import ChargingStatus, ConnectorType, ChargingProfile

logger = get_logger(__name__)

class ChargingService:
    """Core charging service implementation"""
    
    def __init__(self):
        # In-memory storage for demo
        self.stations = {}
        self.sessions = {}
    
    async def create_station(
        self,
        name: str,
        address: str,
        latitude: float,
        longitude: float,
        connectors: List[Dict[str, Any]],
        power_level: str = "standard",
        price_per_kwh: float = None,
    ) -> ChargingStation:
        """Create a new charging station"""
        station_id = str(uuid4())
        station = ChargingStation(
            id=station_id,
            name=name,
            address=address,
            latitude=latitude,
            longitude=longitude,
            power_level=power_level,
            price_per_kwh=price_per_kwh or settings.PRICE_PER_KWH,
            status="available",
            created_at=datetime.utcnow(),
        )
        
        # Create connectors
        station_connectors = []
        for i, connector_data in enumerate(connectors):
            connector = Connector(
                id=str(uuid4()),
                station_id=station_id,
                connector_number=str(i + 1),
                connector_type=connector_data.get("type", "type2"),
                max_power_kw=connector_data.get("max_power_kw", 22),
                status="available",
                created_at=datetime.utcnow(),
            )
            station_connectors.append(connector)
        
        station.connectors = station_connectors
        station.total_connectors = len(connectors)
        station.available_connectors = len(connectors)
        
        self.stations[station_id] = station
        logger.info(f"Charging station created: {station_id}")
        return station
    
    async def get_station(self, station_id: str) -> Optional[ChargingStation]:
        """Get charging station by ID"""
        return self.stations.get(station_id)
    
    async def get_stations(
        self,
        page: int = 1,
        limit: int = 10,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius: Optional[float] = None,
        status: Optional[str] = None,
        power_level: Optional[str] = None,
    ) -> tuple[List[ChargingStation], int]:
        """Get list of charging stations"""
        stations = list(self.stations.values())
        return stations, len(stations)
    
    async def update_station(
        self,
        station_id: str,
        data: Dict[str, Any],
    ) -> Optional[ChargingStation]:
        """Update charging station"""
        station = await self.get_station(station_id)
        if not station:
            return None
        
        for key, value in data.items():
            if hasattr(station, key):
                setattr(station, key, value)
        
        station.updated_at = datetime.utcnow()
        logger.info(f"Charging station updated: {station_id}")
        return station
    
    async def start_charging(
        self,
        station_id: str,
        connector_id: str,
        vehicle_id: str,
        user_id: str,
    ) -> Optional[ChargingSession]:
        """Start a charging session"""
        station = await self.get_station(station_id)
        if not station:
            logger.error(f"Station not found: {station_id}")
            return None
        
        # Find connector
        connector = None
        for c in station.connectors:
            if c.id == connector_id:
                connector = c
                break
        
        if not connector or connector.status != "available":
            logger.error(f"Connector not available: {connector_id}")
            return None
        
        # Create session
        session_id = str(uuid4())
        session = ChargingSession(
            id=session_id,
            station_id=station_id,
            connector_id=connector_id,
            vehicle_id=vehicle_id,
            user_id=user_id,
            start_time=datetime.utcnow(),
            status=ChargingStatus.STARTED,
            meter_start=0,
            price_per_kwh=station.price_per_kwh,
            connection_fee=settings.CONNECTION_FEE,
        )
        
        # Update connector status
        connector.status = "occupied"
        connector.current_session_id = session_id
        
        self.sessions[session_id] = session
        logger.info(f"Charging session started: {session_id}")
        return session
    
    async def stop_charging(self, session_id: str) -> Optional[ChargingSession]:
        """Stop a charging session"""
        session = self.sessions.get(session_id)
        if not session:
            logger.error(f"Session not found: {session_id}")
            return None
        
        if session.status in [ChargingStatus.COMPLETED, ChargingStatus.CANCELLED]:
            logger.warning(f"Session already stopped: {session_id}")
            return session
        
        # Update session
        session.stop_time = datetime.utcnow()
        session.duration = (session.stop_time - session.start_time).total_seconds()
        session.status = ChargingStatus.COMPLETED
        session.energy_consumed = 15.0  # Mock value
        session.total_cost = session.energy_consumed * session.price_per_kwh + session.connection_fee
        
        # Update connector
        station = await self.get_station(session.station_id)
        if station:
            for c in station.connectors:
                if c.id == session.connector_id:
                    c.status = "available"
                    c.current_session_id = None
                    break
        
        logger.info(f"Charging session stopped: {session_id}")
        return session
    
    async def get_session(self, session_id: str) -> Optional[ChargingSession]:
        """Get charging session by ID"""
        return self.sessions.get(session_id)
    
    async def get_user_sessions(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10,
    ) -> tuple[List[ChargingSession], int]:
        """Get user's charging sessions"""
        user_sessions = [s for s in self.sessions.values() if s.user_id == user_id]
        return user_sessions, len(user_sessions)
    
    async def get_active_sessions(
        self,
        station_id: Optional[str] = None,
    ) -> List[ChargingSession]:
        """Get active charging sessions"""
        active = [s for s in self.sessions.values() if s.status == ChargingStatus.STARTED]
        if station_id:
            active = [s for s in active if s.station_id == station_id]
        return active