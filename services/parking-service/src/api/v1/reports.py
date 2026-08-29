from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import TokenData
from src.core.database import get_db
from src.domain.models.parking_session import ParkingSession
from src.domain.models.parking_spot import ParkingSpot
from src.domain.models.payment import Payment, PaymentStatus
from src.domain.models.reservation import Reservation

router = APIRouter(prefix="/reports", tags=["reports"])

ReportType = Literal["operations", "occupancy", "revenue", "activity"]


def _bounds(start_date: date, end_date: date) -> tuple[datetime, datetime]:
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date")
    if (end_date - start_date).days > 366:
        raise HTTPException(status_code=400, detail="Report date range cannot exceed 367 days")
    start = datetime.combine(start_date, time.min)
    end_exclusive = datetime.combine(end_date + timedelta(days=1), time.min)
    return start, end_exclusive


def _days(start_date: date, end_date: date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)


@router.get("/analytics")
async def analytics_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    report_type: ReportType = Query(default="operations"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Authentication is intentionally required. The operational dashboard already
    # exposes aggregate parking metrics to authenticated users, and this endpoint
    # applies the same visibility model while adding historical date filtering.
    UUID(current_user.user_id)
    start, end_exclusive = _bounds(start_date, end_date)

    total_spots_result = await db.execute(select(func.count(ParkingSpot.id)))
    total_spots = int(total_spots_result.scalar() or 0)

    sessions_result = await db.execute(
        select(ParkingSession).where(
            ParkingSession.start_time < end_exclusive,
            or_(ParkingSession.end_time.is_(None), ParkingSession.end_time >= start),
        )
    )
    sessions = list(sessions_result.scalars().all())

    payments_result = await db.execute(
        select(Payment).where(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.updated_at >= start,
            Payment.updated_at < end_exclusive,
        )
    )
    payments = list(payments_result.scalars().all())

    reservations_result = await db.execute(
        select(Reservation).where(
            Reservation.created_at >= start,
            Reservation.created_at < end_exclusive,
        )
    )
    reservations = list(reservations_result.scalars().all())

    range_minutes = max((end_exclusive - start).total_seconds() / 60.0, 1.0)
    occupied_minutes = 0.0
    completed_sessions = 0
    total_duration_minutes = 0.0

    for session in sessions:
        overlap_start = max(session.start_time, start)
        overlap_end = min(session.end_time or end_exclusive, end_exclusive)
        if overlap_end > overlap_start:
            occupied_minutes += (overlap_end - overlap_start).total_seconds() / 60.0
        if session.end_time is not None:
            completed_sessions += 1
            total_duration_minutes += float(session.duration_minutes or 0)

    occupancy = (
        round((occupied_minutes / (total_spots * range_minutes)) * 100, 2)
        if total_spots > 0
        else 0.0
    )
    revenue = round(sum(float(payment.amount or 0) for payment in payments), 2)
    activity_count = len(reservations) + len(sessions) + len(payments)
    avg_duration = round(total_duration_minutes / completed_sessions, 1) if completed_sessions else 0.0

    daily = []
    for day in _days(start_date, end_date):
        day_start = datetime.combine(day, time.min)
        day_end = day_start + timedelta(days=1)
        day_range_minutes = 1440.0

        day_occupied = 0.0
        day_session_starts = 0
        for session in sessions:
            if day_start <= session.start_time < day_end:
                day_session_starts += 1
            overlap_start = max(session.start_time, day_start)
            overlap_end = min(session.end_time or day_end, day_end)
            if overlap_end > overlap_start:
                day_occupied += (overlap_end - overlap_start).total_seconds() / 60.0

        day_payments = [p for p in payments if day_start <= p.updated_at < day_end]
        day_reservations = [r for r in reservations if day_start <= r.created_at < day_end]
        day_occupancy = (
            round((day_occupied / (total_spots * day_range_minutes)) * 100, 2)
            if total_spots > 0
            else 0.0
        )
        daily.append(
            {
                "date": day.isoformat(),
                "occupancy_percent": day_occupancy,
                "revenue": round(sum(float(p.amount or 0) for p in day_payments), 2),
                "session_starts": day_session_starts,
                "reservations_created": len(day_reservations),
                "payments_completed": len(day_payments),
                "activity": day_session_starts + len(day_reservations) + len(day_payments),
            }
        )

    return {
        "report_type": report_type,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "occupancy_percent": occupancy,
            "revenue": revenue,
            "activity": activity_count,
            "total_spots": total_spots,
            "sessions": len(sessions),
            "completed_sessions": completed_sessions,
            "average_session_minutes": avg_duration,
            "reservations": len(reservations),
            "completed_payments": len(payments),
        },
        "daily": daily,
    }
