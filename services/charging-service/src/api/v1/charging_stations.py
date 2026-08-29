from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.domain.models import ChargingStation, Connector, ConnectorType

router = APIRouter(prefix="/charging-stations", tags=["charging-stations"])


class ConnectorCreate(BaseModel):
    type: str
    max_power_kw: float


class ConnectorResponse(BaseModel):
    id: str
    connector_number: str
    connector_type: str
    status: str
    max_power_kw: float


class ChargingStationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: dict
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    connectors: List[ConnectorCreate]
    power_level: str = "standard"
    price_per_kwh: Optional[float] = None
    amenities: Optional[List[str]] = None
    operating_hours: Optional[dict] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None


class ChargingStationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    address: dict
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    power_level: str
    total_connectors: int
    available_connectors: int
    occupied_connectors: int
    price_per_kwh: float
    connection_fee: float
    amenities: Optional[List[str]]
    operating_hours: Optional[dict]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    rating: Optional[float]
    review_count: Optional[int]
    connectors: List[ConnectorResponse] = []
    created_at: datetime
    updated_at: Optional[datetime]


def _connector_type(value: str) -> ConnectorType:
    normalized = value.strip().lower().replace("-", "_")
    aliases = {
        "type1": ConnectorType.TYPE_1,
        "type_1": ConnectorType.TYPE_1,
        "type2": ConnectorType.TYPE_2,
        "type_2": ConnectorType.TYPE_2,
        "ccs": ConnectorType.CCS,
        "chademo": ConnectorType.CHADEMO,
        "tesla": ConnectorType.TESLA,
        "gb_t": ConnectorType.GB_T,
        "gbt": ConnectorType.GB_T,
    }
    if normalized not in aliases:
        raise HTTPException(status_code=422, detail=f"Unsupported connector type: {value}")
    return aliases[normalized]


def _serialize_station(station: ChargingStation) -> dict:
    data = station.to_dict()
    data["connectors"] = [connector.to_dict() for connector in station.connectors]
    return data


async def _load_station(db: AsyncSession, station_id: str) -> Optional[ChargingStation]:
    result = await db.execute(
        select(ChargingStation)
        .options(selectinload(ChargingStation.connectors))
        .where(ChargingStation.id == station_id)
    )
    return result.scalar_one_or_none()


@router.post("/", response_model=ChargingStationResponse, status_code=201)
async def create_charging_station(
    station: ChargingStationCreate,
    db: AsyncSession = Depends(get_db),
):
    new_station = ChargingStation(
        name=station.name,
        description=station.description,
        address=station.address,
        latitude=station.latitude,
        longitude=station.longitude,
        status="active",
        power_level=station.power_level,
        total_connectors=len(station.connectors),
        available_connectors=len(station.connectors),
        occupied_connectors=0,
        price_per_kwh=station.price_per_kwh if station.price_per_kwh is not None else 0.50,
        connection_fee=1.00,
        amenities=station.amenities,
        operating_hours=station.operating_hours,
        phone=station.phone,
        email=station.email,
        website=station.website,
        rating=0.0,
        review_count=0,
    )

    for index, connector_data in enumerate(station.connectors, start=1):
        new_station.connectors.append(
            Connector(
                connector_number=str(index),
                connector_type=_connector_type(connector_data.type),
                status="available",
                max_power_kw=connector_data.max_power_kw,
            )
        )

    db.add(new_station)
    await db.commit()
    persisted = await _load_station(db, new_station.id)
    return _serialize_station(persisted)


@router.get("/", response_model=List[ChargingStationResponse])
async def get_charging_stations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChargingStation)
        .options(selectinload(ChargingStation.connectors))
        .order_by(ChargingStation.created_at.asc())
    )
    return [_serialize_station(station) for station in result.scalars().unique().all()]


@router.get("/{station_id}", response_model=ChargingStationResponse)
async def get_charging_station(station_id: str, db: AsyncSession = Depends(get_db)):
    station = await _load_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")
    return _serialize_station(station)


@router.put("/{station_id}", response_model=ChargingStationResponse)
async def update_charging_station(
    station_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    station = await _load_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")

    mutable_fields = {
        "name", "description", "address", "latitude", "longitude", "status",
        "power_level", "price_per_kwh", "connection_fee", "amenities",
        "operating_hours", "phone", "email", "website",
    }
    for key, value in data.items():
        if key in mutable_fields and value is not None:
            setattr(station, key, value)

    station.updated_at = datetime.utcnow()
    await db.commit()
    persisted = await _load_station(db, station_id)
    return _serialize_station(persisted)


@router.delete("/{station_id}", status_code=204)
async def delete_charging_station(station_id: str, db: AsyncSession = Depends(get_db)):
    station = await _load_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")
    await db.delete(station)
    await db.commit()
    return None


@router.get("/{station_id}/availability")
async def get_availability(station_id: str, db: AsyncSession = Depends(get_db)):
    station = await _load_station(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")
    return {
        "station_id": station_id,
        "total_connectors": station.total_connectors,
        "available_connectors": station.available_connectors,
        "occupied_connectors": station.occupied_connectors,
    }
