from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4

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

# In-memory storage
charging_sessions = {}

@router.post("/", response_model=ChargingSessionResponse, status_code=201)
async def create_charging_session(session: ChargingSessionCreate):
    session_id = str(uuid4())
    now = datetime.now()
    
    new_session = {
        "id": session_id,
        "station_id": session.station_id,
        "connector_id": session.connector_id,
        "user_id": session.user_id,
        "vehicle_id": session.vehicle_id,
        "start_time": now,
        "end_time": None,
        "status": "active",
        "energy_consumed_kwh": 0.0,
        "total_cost": 0.0,
        "price_per_kwh": 0.50,
        "connection_fee": 1.00,
        "duration_minutes": None,
        "created_at": now,
        "updated_at": now
    }
    charging_sessions[session_id] = new_session
    return new_session

@router.get("/", response_model=List[ChargingSessionResponse])
async def get_charging_sessions():
    return list(charging_sessions.values())

@router.get("/{session_id}", response_model=ChargingSessionResponse)
async def get_charging_session(session_id: str):
    session = charging_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Charging session not found")
    return session

@router.post("/{session_id}/complete")
async def complete_session(session_id: str):
    session = charging_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Charging session not found")
    
    session["end_time"] = datetime.now()
    session["status"] = "completed"
    session["energy_consumed_kwh"] = 15.0
    session["total_cost"] = session["energy_consumed_kwh"] * session["price_per_kwh"] + session["connection_fee"]
    session["duration_minutes"] = 45
    session["updated_at"] = datetime.now()
    
    return {
        "message": "Session completed successfully",
        "session_id": session_id,
        "total_cost": session["total_cost"],
        "energy_consumed": session["energy_consumed_kwh"]
    }

@router.post("/{session_id}/cancel")
async def cancel_session(session_id: str):
    session = charging_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Charging session not found")
    
    session["status"] = "cancelled"
    session["updated_at"] = datetime.now()
    
    return {
        "message": "Session cancelled successfully",
        "session_id": session_id
    }