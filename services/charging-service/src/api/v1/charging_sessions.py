from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.domain.models import (
    ChargingSession,
    ChargingStation,
    Connector,
    ConnectorStatus,
    SessionStatus,
)

router = APIRouter(prefix="/charging-sessions", tags=["charging-sessions"])


class ChargingSessionCreate(BaseModel):
    station_id: str
    connector_id: str
    user_id: str
    vehicle_id: Optional[str] = None


class ChargingSessionResponse(BaseModel):
    id: str
    station_id: str
    connector_id: str
    user_id: str
    vehicle_id: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]
    status: str
    energy_consumed_kwh: float
    total_cost: float
    price_per_kwh: float
    connection_fee: float
    duration_minutes: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]


def _serialize_session(session: ChargingSession) -> dict:
    return session.to_dict()


async def _get_session(db: AsyncSession, session_id: str) -> Optional[ChargingSession]:
    result = await db.execute(
        select(ChargingSession).where(ChargingSession.id == session_id)
    )
    return result.scalar_one_or_none()


async def _release_connector(db: AsyncSession, session: ChargingSession) -> None:
    connector_result = await db.execute(
        select(Connector).where(Connector.id == session.connector_id).with_for_update()
    )
    connector = connector_result.scalar_one_or_none()
    if connector:
        connector.status = ConnectorStatus.AVAILABLE
        connector.current_session_id = None

    station_result = await db.execute(
        select(ChargingStation).where(ChargingStation.id == session.station_id).with_for_update()
    )
    station = station_result.scalar_one_or_none()
    if station and connector:
        station.available_connectors = min(
            station.total_connectors,
            station.available_connectors + 1,
        )
        station.occupied_connectors = max(0, station.occupied_connectors - 1)
        station.updated_at = datetime.utcnow()


@router.post("/", response_model=ChargingSessionResponse, status_code=201)
async def create_charging_session(
    session: ChargingSessionCreate,
    db: AsyncSession = Depends(get_db),
):
    station_result = await db.execute(
        select(ChargingStation).where(ChargingStation.id == session.station_id).with_for_update()
    )
    station = station_result.scalar_one_or_none()
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")

    connector_result = await db.execute(
        select(Connector)
        .where(
            Connector.id == session.connector_id,
            Connector.station_id == session.station_id,
        )
        .with_for_update()
    )
    connector = connector_result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Charging connector not found")
    if connector.status != ConnectorStatus.AVAILABLE:
        raise HTTPException(status_code=409, detail="Charging connector is not available")

    new_session = ChargingSession(
        station_id=session.station_id,
        connector_id=session.connector_id,
        user_id=session.user_id,
        vehicle_id=session.vehicle_id,
        start_time=datetime.utcnow(),
        status=SessionStatus.ACTIVE,
        energy_consumed_kwh=0.0,
        total_cost=0.0,
        price_per_kwh=connector.price_per_kwh or station.price_per_kwh,
        connection_fee=station.connection_fee,
    )
    db.add(new_session)
    await db.flush()

    connector.status = ConnectorStatus.OCCUPIED
    connector.current_session_id = new_session.id
    station.available_connectors = max(0, station.available_connectors - 1)
    station.occupied_connectors = min(
        station.total_connectors,
        station.occupied_connectors + 1,
    )
    station.updated_at = datetime.utcnow()

    await db.commit()
    persisted = await _get_session(db, new_session.id)
    return _serialize_session(persisted)


@router.get("/", response_model=List[ChargingSessionResponse])
async def get_charging_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChargingSession).order_by(ChargingSession.created_at.desc())
    )
    return [_serialize_session(session) for session in result.scalars().all()]


@router.get("/{session_id}", response_model=ChargingSessionResponse)
async def get_charging_session(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await _get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Charging session not found")
    return _serialize_session(session)


@router.post("/{session_id}/complete")
async def complete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChargingSession).where(ChargingSession.id == session_id).with_for_update()
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Charging session not found")
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Charging session is not active")

    now = datetime.utcnow()
    session.end_time = now
    session.status = SessionStatus.COMPLETED
    session.energy_consumed_kwh = 15.0
    session.total_cost = (
        session.energy_consumed_kwh * session.price_per_kwh + session.connection_fee
    )
    session.duration_minutes = max(
        0,
        int((now - session.start_time).total_seconds() // 60),
    )
    session.updated_at = now

    await _release_connector(db, session)
    await db.commit()

    return {
        "message": "Session completed successfully",
        "session_id": session_id,
        "total_cost": session.total_cost,
        "energy_consumed": session.energy_consumed_kwh,
    }


@router.post("/{session_id}/cancel")
async def cancel_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChargingSession).where(ChargingSession.id == session_id).with_for_update()
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Charging session not found")
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Charging session is not active")

    session.status = SessionStatus.CANCELLED
    session.end_time = datetime.utcnow()
    session.duration_minutes = max(
        0,
        int((session.end_time - session.start_time).total_seconds() // 60),
    )
    session.updated_at = datetime.utcnow()

    await _release_connector(db, session)
    await db.commit()

    return {
        "message": "Session cancelled successfully",
        "session_id": session_id,
    }
