from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db

router = APIRouter(prefix="/charging-stations", tags=["charging-stations"])

# Pydantic Models
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
    connectors: List[ConnectorResponse] = []  # Add this field
    created_at: datetime
    updated_at: Optional[datetime]

# In-memory storage (will be replaced with database)
charging_stations = {}

@router.post("/", response_model=ChargingStationResponse, status_code=201)
async def create_charging_station(station: ChargingStationCreate):
    from uuid import uuid4
    station_id = str(uuid4())
    now = datetime.now()
    
    # Create connectors list with IDs
    connectors_list = []
    for i, connector_data in enumerate(station.connectors):
        connector_id = str(uuid4())
        connectors_list.append({
            "id": connector_id,
            "connector_number": str(i + 1),
            "connector_type": connector_data.type,
            "status": "available",
            "max_power_kw": connector_data.max_power_kw
        })
    
    new_station = {
        "id": station_id,
        "name": station.name,
        "description": station.description,
        "address": station.address,
        "latitude": station.latitude,
        "longitude": station.longitude,
        "status": "active",
        "power_level": station.power_level,
        "total_connectors": len(station.connectors),
        "available_connectors": len(station.connectors),
        "occupied_connectors": 0,
        "price_per_kwh": station.price_per_kwh or 0.50,
        "connection_fee": 1.00,
        "amenities": station.amenities,
        "operating_hours": station.operating_hours,
        "phone": station.phone,
        "email": station.email,
        "website": station.website,
        "rating": 0.0,
        "review_count": 0,
        "connectors": connectors_list,  # Add connectors to response
        "created_at": now,
        "updated_at": now
    }
    charging_stations[station_id] = new_station
    return new_station

@router.get("/", response_model=List[ChargingStationResponse])
async def get_charging_stations():
    return list(charging_stations.values())

@router.get("/{station_id}", response_model=ChargingStationResponse)
async def get_charging_station(station_id: str):
    station = charging_stations.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")
    return station

@router.put("/{station_id}", response_model=ChargingStationResponse)
async def update_charging_station(station_id: str, data: dict):
    station = charging_stations.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")
    
    for key, value in data.items():
        if key in station and value is not None:
            station[key] = value
    station["updated_at"] = datetime.now()
    return station

@router.delete("/{station_id}", status_code=204)
async def delete_charging_station(station_id: str):
    if station_id not in charging_stations:
        raise HTTPException(status_code=404, detail="Charging station not found")
    del charging_stations[station_id]
    return None

@router.get("/{station_id}/availability")
async def get_availability(station_id: str):
    station = charging_stations.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")
    return {
        "station_id": station_id,
        "total_connectors": station["total_connectors"],
        "available_connectors": station["available_connectors"],
        "occupied_connectors": station["occupied_connectors"]
    }