from datetime import datetime, timedelta
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import TokenData
from src.core.database import get_db
from src.domain.models.parking_lot import ParkingLot
from src.domain.models.parking_session import ParkingSession, ParkingSessionStatus
from src.domain.models.parking_spot import ParkingSpot, ParkingSpotStatus
from src.domain.models.reservation import Reservation, ReservationStatus
from src.domain.models.user import User
from src.websocket.manager import manager
from .payments import reconcile_session_payment

router = APIRouter(prefix="/parking-sessions", tags=["parking-sessions"])


class SessionStartRequest(BaseModel):
    reservation_id: UUID
    start_time: Optional[datetime] = None


class SessionEndRequest(BaseModel):
    end_time: Optional[datetime] = None


class SessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    reservation_id: UUID
    parking_spot_id: UUID
    vehicle_id: Optional[UUID]
    status: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[float]
    hourly_rate: float
    total_amount: Optional[float]
    billing: Optional[dict[str, Any]] = None


def _session_payload(session: ParkingSession, billing: Optional[dict[str, Any]] = None) -> dict:
    return {
        "id": session.id,
        "user_id": session.user_id,
        "reservation_id": session.reservation_id,
        "parking_spot_id": session.parking_spot_id,
        "vehicle_id": session.vehicle_id,
        "status": session.status.value if session.status else None,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "duration_minutes": session.duration_minutes,
        "hourly_rate": float(session.hourly_rate or 0),
        "total_amount": float(session.total_amount) if session.total_amount is not None else None,
        "billing": billing,
    }


async def _sync_lot_inventory(db: AsyncSession, lot_id: UUID) -> ParkingLot:
    await db.flush()
    lot = await db.get(ParkingLot, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")

    result = await db.execute(
        select(ParkingSpot.status, func.count(ParkingSpot.id))
        .where(ParkingSpot.parking_lot_id == lot_id)
        .group_by(ParkingSpot.status)
    )
    counts = {status: count for status, count in result.all()}
    lot.total_spots = sum(counts.values())
    lot.available_spots = counts.get(ParkingSpotStatus.AVAILABLE, 0)
    lot.reserved_spots = counts.get(ParkingSpotStatus.RESERVED, 0)
    return lot


async def _broadcast_lot(lot: ParkingLot) -> None:
    await manager.broadcast_availability(
        str(lot.id),
        {
            "available_spots": lot.available_spots,
            "reserved_spots": lot.reserved_spots,
            "total_spots": lot.total_spots,
        },
    )


@router.post("/start", response_model=SessionResponse, status_code=201)
async def start_session(
    request: SessionStartRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user.user_id)
    reservation_result = await db.execute(
        select(Reservation)
        .where(Reservation.id == request.reservation_id)
        .with_for_update()
    )
    reservation = reservation_result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not own this reservation")
    if reservation.status != ReservationStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Only confirmed reservations can be started")

    existing_result = await db.execute(
        select(ParkingSession).where(
            ParkingSession.reservation_id == reservation.id,
            ParkingSession.status == ParkingSessionStatus.ACTIVE,
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Reservation already has an active parking session")

    spot_result = await db.execute(
        select(ParkingSpot)
        .where(ParkingSpot.id == reservation.parking_spot_id)
        .with_for_update()
    )
    spot = spot_result.scalar_one_or_none()
    if not spot:
        raise HTTPException(status_code=404, detail="Parking spot not found")
    if spot.status != ParkingSpotStatus.RESERVED:
        raise HTTPException(status_code=409, detail="Reserved parking spot is not ready for check-in")

    lot = await db.get(ParkingLot, spot.parking_lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")

    started_at = request.start_time or datetime.utcnow()
    if started_at > datetime.utcnow() + timedelta(minutes=1):
        raise HTTPException(status_code=400, detail="Session start time cannot be in the future")

    session = ParkingSession(
        user_id=user_id,
        reservation_id=reservation.id,
        parking_spot_id=spot.id,
        vehicle_id=reservation.vehicle_id,
        status=ParkingSessionStatus.ACTIVE,
        start_time=started_at,
        hourly_rate=float(lot.base_price_per_hour or 0),
    )
    db.add(session)
    reservation.status = ReservationStatus.ACTIVE
    spot.status = ParkingSpotStatus.OCCUPIED
    synced_lot = await _sync_lot_inventory(db, spot.parking_lot_id)
    await db.commit()
    await db.refresh(session)
    await _broadcast_lot(synced_lot)
    return _session_payload(session)


@router.post("/{session_id}/end", response_model=SessionResponse)
async def end_session(
    session_id: UUID,
    request: SessionEndRequest,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = UUID(current_user.user_id)
    result = await db.execute(
        select(ParkingSession)
        .where(ParkingSession.id == session_id)
        .with_for_update()
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Parking session not found")
    if session.user_id != user_id:
        raise HTTPException(status_code=403, detail="You do not own this parking session")
    if session.status != ParkingSessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Only active sessions can be ended")

    ended_at = request.end_time or datetime.utcnow()
    if ended_at < session.start_time:
        raise HTTPException(status_code=400, detail="Session end time cannot precede start time")
    if ended_at > datetime.utcnow() + timedelta(minutes=1):
        raise HTTPException(status_code=400, detail="Session end time cannot be in the future")

    duration_minutes = max(0.0, (ended_at - session.start_time).total_seconds() / 60)
    total_amount = round((duration_minutes / 60) * float(session.hourly_rate or 0), 2)

    reservation = await db.get(Reservation, session.reservation_id)
    spot = await db.get(ParkingSpot, session.parking_spot_id)
    if not spot:
        raise HTTPException(status_code=404, detail="Parking spot not found")

    session.status = ParkingSessionStatus.COMPLETED
    session.end_time = ended_at
    session.duration_minutes = round(duration_minutes, 1)
    session.total_amount = total_amount
    session.updated_at = datetime.utcnow()
    if reservation:
        reservation.status = ReservationStatus.COMPLETED
        reservation.updated_at = datetime.utcnow()
    spot.status = ParkingSpotStatus.AVAILABLE

    synced_lot = await _sync_lot_inventory(db, spot.parking_lot_id)
    billing = await reconcile_session_payment(
        db,
        user_id=user_id,
        reservation_id=session.reservation_id,
        parking_session_id=session.id,
        actual_amount=total_amount,
    )
    await db.commit()
    await db.refresh(session)
    await _broadcast_lot(synced_lot)
    return _session_payload(session, billing=billing)


@router.get("/", response_model=List[SessionResponse])
async def list_sessions(
    active_only: bool = False,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ParkingSession)
        .where(ParkingSession.user_id == UUID(current_user.user_id))
        .order_by(ParkingSession.start_time.desc())
        .limit(min(max(limit, 1), 500))
    )
    if active_only:
        query = query.where(ParkingSession.status == ParkingSessionStatus.ACTIVE)
    result = await db.execute(query)
    return [_session_payload(session) for session in result.scalars().all()]


@router.get("/dashboard")
async def get_dashboard_metrics(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.utcnow()
    today = datetime(now.year, now.month, now.day)
    tomorrow = today + timedelta(days=1)
    week_start = today - timedelta(days=6)
    previous_week_start = week_start - timedelta(days=7)
    history_start = now - timedelta(hours=23)

    spots = (await db.execute(select(ParkingSpot))).scalars().all()
    total_spots = len(spots)
    status_counts = {}
    for spot in spots:
        key = spot.status.value if spot.status else "unknown"
        status_counts[key] = status_counts.get(key, 0) + 1

    sessions = (
        await db.execute(
            select(ParkingSession)
            .where(or_(ParkingSession.start_time >= previous_week_start, ParkingSession.status == ParkingSessionStatus.ACTIVE))
            .order_by(ParkingSession.start_time.desc())
        )
    ).scalars().all()

    active_sessions = [s for s in sessions if s.status == ParkingSessionStatus.ACTIVE]
    today_sessions = [s for s in sessions if today <= s.start_time < tomorrow]
    completed_today = [
        s for s in sessions
        if s.status == ParkingSessionStatus.COMPLETED
        and s.end_time is not None
        and today <= s.end_time < tomorrow
    ]
    completed_week = [
        s for s in sessions
        if s.status == ParkingSessionStatus.COMPLETED
        and s.end_time is not None
        and week_start <= s.end_time < tomorrow
    ]
    completed_previous_week = [
        s for s in sessions
        if s.status == ParkingSessionStatus.COMPLETED
        and s.end_time is not None
        and previous_week_start <= s.end_time < week_start
    ]

    revenue_today = round(sum(float(s.total_amount or 0) for s in completed_today), 2)
    weekly_revenue = round(sum(float(s.total_amount or 0) for s in completed_week), 2)
    previous_week_revenue = round(sum(float(s.total_amount or 0) for s in completed_previous_week), 2)
    if previous_week_revenue > 0:
        revenue_growth = round(((weekly_revenue - previous_week_revenue) / previous_week_revenue) * 100, 1)
    else:
        revenue_growth = 100.0 if weekly_revenue > 0 else 0.0

    durations = [float(s.duration_minutes or 0) for s in completed_today]
    avg_duration = round(sum(durations) / len(durations), 1) if durations else 0

    occupancy_data = []
    for offset in range(24):
        point = history_start + timedelta(hours=offset)
        occupied = sum(
            1 for session in sessions
            if session.start_time <= point and (session.end_time is None or session.end_time > point)
        )
        occupancy = round((occupied / total_spots) * 100, 1) if total_spots else 0
        occupancy_data.append({
            "time": point.strftime("%H:%M"),
            "occupancy": occupancy,
            "available": max(0, total_spots - occupied),
        })

    revenue_data = []
    for offset in range(7):
        day = week_start + timedelta(days=offset)
        next_day = day + timedelta(days=1)
        revenue = sum(
            float(session.total_amount or 0)
            for session in completed_week
            if session.end_time is not None and day <= session.end_time < next_day
        )
        revenue_data.append({
            "date": day.strftime("%a"),
            "revenue": round(revenue, 2),
            "expenses": 0,
        })

    spot_status_data = [
        {"name": name.replace("_", " ").title(), "value": value}
        for name, value in sorted(status_counts.items())
    ]

    activity_data = []
    for session in sessions[:20]:
        spot = next((s for s in spots if s.id == session.parking_spot_id), None)
        spot_number = spot.number if spot else "Unknown spot"
        activity_data.append({
            "type": "parking",
            "title": "Parking session started",
            "description": f"{spot_number} checked in",
            "time": session.start_time.isoformat(),
            "status": "active" if session.status == ParkingSessionStatus.ACTIVE else "completed",
        })
        if session.end_time:
            activity_data.append({
                "type": "payment",
                "title": "Parking session completed",
                "description": f"{spot_number} · ${float(session.total_amount or 0):.2f}",
                "time": session.end_time.isoformat(),
                "status": "completed",
            })
    activity_data = sorted(activity_data, key=lambda item: item["time"], reverse=True)[:20]

    upcoming_rows = await db.execute(
        select(Reservation, ParkingSpot, User)
        .join(ParkingSpot, Reservation.parking_spot_id == ParkingSpot.id)
        .join(User, Reservation.user_id == User.id)
        .where(
            Reservation.start_time >= now,
            Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
        )
        .order_by(Reservation.start_time.asc())
        .limit(10)
    )
    reservations_data = [
        {
            "id": str(reservation.id),
            "spot": spot.number,
            "customer": user.full_name,
            "date": reservation.start_time.isoformat(),
            "status": reservation.status.value,
        }
        for reservation, spot, user in upcoming_rows.all()
    ]

    return {
        "stats": {
            "total_spots": total_spots,
            "available_spots": status_counts.get("available", 0),
            "occupied_spots": status_counts.get("occupied", 0),
            "reserved_spots": status_counts.get("reserved", 0),
            "active_sessions": len(active_sessions),
            "today_sessions": len(today_sessions),
            "avg_duration": avg_duration,
            "total_revenue": revenue_today,
            "weekly_revenue": weekly_revenue,
            "revenue_growth": revenue_growth,
        },
        "occupancy_data": occupancy_data,
        "revenue_data": revenue_data,
        "activity_data": activity_data,
        "spot_status_data": spot_status_data,
        "reservations_data": reservations_data,
    }
