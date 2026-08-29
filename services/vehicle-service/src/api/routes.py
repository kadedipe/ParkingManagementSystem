from __future__ import annotations

import csv
import io
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.auth import current_user_id
from src.core.database import get_db
from src.core.models import Vehicle

router = APIRouter(prefix="/v1/vehicles", tags=["vehicles"])


class VehicleIn(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    plate_number: str = Field(min_length=1, max_length=32)
    vin: str | None = Field(default=None, min_length=17, max_length=17)
    color: str | None = None
    year: int | None = Field(default=None, ge=1886, le=2100)
    make: str | None = None
    model: str | None = None
    is_ev: bool = False
    battery_capacity: float | None = Field(default=None, ge=0)
    connector_type: str | None = None
    max_charging_power: int | None = Field(default=None, ge=0)
    mileage: int | None = Field(default=None, ge=0)
    is_default: bool = False


class VehicleOut(BaseModel):
    """Response schema intentionally tolerates legacy persisted values.

    Input validation remains strict in VehicleIn, but old production rows may
    contain values (for example an empty VIN) created before that validation
    existed. A single legacy row must not turn GET /vehicles into HTTP 500.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    plate_number: str
    vin: str | None = None
    color: str | None = None
    year: int | None = None
    make: str | None = None
    model: str | None = None
    is_ev: bool = False
    battery_capacity: float | None = None
    connector_type: str | None = None
    max_charging_power: int | None = None
    mileage: int | None = None
    is_default: bool = False
    status: str


async def _get(db: AsyncSession, user_id: UUID, vehicle_id: UUID) -> Vehicle:
    result = await db.execute(
        select(Vehicle).where(
            Vehicle.id == vehicle_id,
            Vehicle.user_id == user_id,
            Vehicle.status != "deleted",
        )
    )
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return vehicle


def _clean_vehicle_input(data: VehicleIn) -> dict:
    payload = data.model_dump()
    payload["plate_number"] = payload["plate_number"].strip().upper()
    payload["name"] = payload["name"].strip()
    if payload.get("vin"):
        payload["vin"] = payload["vin"].strip().upper()
    return payload


@router.get("", response_model=list[VehicleOut])
@router.get("/", response_model=list[VehicleOut])
async def list_vehicles(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    try:
        result = await db.execute(
            select(Vehicle)
            .where(Vehicle.user_id == user_id, Vehicle.status != "deleted")
            .order_by(Vehicle.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars())
    except SQLAlchemyError as exc:
        await db.rollback()
        raise HTTPException(503, "Vehicle storage is temporarily unavailable") from exc


@router.post("", response_model=VehicleOut, status_code=201)
@router.post("/", response_model=VehicleOut, status_code=201)
async def create_vehicle(
    data: VehicleIn,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(current_user_id),
):
    payload = _clean_vehicle_input(data)
    if data.is_default:
        await db.execute(
            update(Vehicle).where(Vehicle.user_id == user_id).values(is_default=False)
        )
    vehicle = Vehicle(user_id=user_id, **payload)
    db.add(vehicle)
    try:
        await db.commit()
        await db.refresh(vehicle)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(409, "A vehicle with this license plate or VIN already exists") from exc
    except SQLAlchemyError as exc:
        await db.rollback()
        raise HTTPException(503, "Vehicle storage is temporarily unavailable") from exc
    return vehicle


@router.get("/export")
async def export_vehicles(
    format: str = Query("csv", pattern="^csv$"),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(current_user_id),
):
    result = await db.execute(
        select(Vehicle)
        .where(Vehicle.user_id == user_id, Vehicle.status != "deleted")
        .order_by(Vehicle.created_at.desc())
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        ["id", "name", "plate_number", "vin", "make", "model", "is_ev", "is_default", "status"]
    )
    for vehicle in result.scalars():
        writer.writerow(
            [
                vehicle.id,
                vehicle.name,
                vehicle.plate_number,
                vehicle.vin,
                vehicle.make,
                vehicle.model,
                vehicle.is_ev,
                vehicle.is_default,
                vehicle.status,
            ]
        )
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vehicles.csv"},
    )


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(
    vehicle_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(current_user_id),
):
    return await _get(db, user_id, vehicle_id)


@router.put("/{vehicle_id}", response_model=VehicleOut)
async def update_vehicle(
    vehicle_id: UUID,
    data: VehicleIn,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(current_user_id),
):
    vehicle = await _get(db, user_id, vehicle_id)
    if data.is_default:
        await db.execute(
            update(Vehicle).where(Vehicle.user_id == user_id).values(is_default=False)
        )
    for key, value in _clean_vehicle_input(data).items():
        setattr(vehicle, key, value)
    try:
        await db.commit()
        await db.refresh(vehicle)
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(409, "A vehicle with this license plate or VIN already exists") from exc
    except SQLAlchemyError as exc:
        await db.rollback()
        raise HTTPException(503, "Vehicle storage is temporarily unavailable") from exc
    return vehicle


@router.delete("/{vehicle_id}", status_code=204)
async def delete_vehicle(
    vehicle_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(current_user_id),
):
    vehicle = await _get(db, user_id, vehicle_id)
    vehicle.status = "deleted"
    vehicle.is_default = False
    await db.commit()
