# ============================================================================
# Charging API Routes
# ============================================================================

"""
Charging API routes for version 1.
"""

from typing import List, Optional
from fastapi import APIRouter, Request, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse

from src.interfaces.schemas import (
    ChargingStationCreateRequest,
    ChargingStationUpdateRequest,
    ChargingStationResponse,
    ChargingStationListResponse,
    ChargingSessionCreateRequest,
    ChargingSessionUpdateRequest,
    ChargingSessionResponse,
    ChargingSessionListResponse,
    ChargingRateRequest,
    ChargingRateResponse
)
from src.interfaces.dependencies import get_charging_service
from src.application.services.charging_service import ChargingService
from src.infrastructure.message_bus import MessageBus

router = APIRouter(prefix="/charging", tags=["charging"])


# ============================================================================
# Charging Station Routes
# ============================================================================

@router.get("/stations", response_model=ChargingStationListResponse)
async def get_charging_stations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get all charging stations with pagination and optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        is_available: Filter by availability status
        charging_service: Charging service
        
    Returns:
        ChargingStationListResponse: List of charging stations with pagination metadata
    """
    try:
        stations, total = await charging_service.get_all_stations(
            skip=skip,
            limit=limit,
            is_available=is_available
        )
        
        return ChargingStationListResponse(
            items=stations,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve charging stations"
        )


@router.get("/stations/{station_id}", response_model=ChargingStationResponse)
async def get_charging_station(
    station_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get a specific charging station by ID.
    
    Args:
        station_id: Charging station ID
        charging_service: Charging service
        
    Returns:
        ChargingStationResponse: Charging station details
    """
    try:
        station = await charging_service.get_station_by_id(station_id)
        
        if not station:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging station with ID {station_id} not found"
            )
        
        return station
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve charging station"
        )


@router.get("/stations/location", response_model=ChargingStationListResponse)
async def get_charging_stations_nearby(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: float = Query(5.0, ge=0.1, le=100, description="Radius in kilometers"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get charging stations within a specified radius of a location.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        radius: Search radius in kilometers
        skip: Number of records to skip
        limit: Number of records to return
        charging_service: Charging service
        
    Returns:
        ChargingStationListResponse: List of nearby charging stations
    """
    try:
        stations, total = await charging_service.get_stations_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            skip=skip,
            limit=limit
        )
        
        return ChargingStationListResponse(
            items=stations,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve nearby charging stations"
        )


@router.post("/stations", response_model=ChargingStationResponse, status_code=status.HTTP_201_CREATED)
async def create_charging_station(
    request: Request,
    station_data: ChargingStationCreateRequest,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Create a new charging station.
    
    Args:
        request: HTTP request
        station_data: Charging station creation data
        charging_service: Charging service
        
    Returns:
        ChargingStationResponse: Created charging station details
    """
    try:
        station = await charging_service.create_station(station_data)
        
        if not station:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create charging station"
            )
        
        return station
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create charging station"
        )


@router.put("/stations/{station_id}", response_model=ChargingStationResponse)
async def update_charging_station(
    station_id: int,
    station_data: ChargingStationUpdateRequest,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Update an existing charging station.
    
    Args:
        station_id: Charging station ID
        station_data: Charging station update data
        charging_service: Charging service
        
    Returns:
        ChargingStationResponse: Updated charging station details
    """
    try:
        station = await charging_service.update_station(
            station_id=station_id,
            station_data=station_data
        )
        
        if not station:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging station with ID {station_id} not found"
            )
        
        return station
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update charging station"
        )


@router.patch("/stations/{station_id}", response_model=ChargingStationResponse)
async def partial_update_charging_station(
    station_id: int,
    station_data: ChargingStationUpdateRequest,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Partially update an existing charging station.
    
    Args:
        station_id: Charging station ID
        station_data: Charging station update data (partial)
        charging_service: Charging service
        
    Returns:
        ChargingStationResponse: Updated charging station details
    """
    try:
        station = await charging_service.partial_update_station(
            station_id=station_id,
            station_data=station_data
        )
        
        if not station:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging station with ID {station_id} not found"
            )
        
        return station
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update charging station"
        )


@router.delete("/stations/{station_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_charging_station(
    station_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Delete a charging station.
    
    Args:
        station_id: Charging station ID
        charging_service: Charging service
        
    Returns:
        None: 204 No Content on success
    """
    try:
        deleted = await charging_service.delete_station(station_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging station with ID {station_id} not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete charging station"
        )


@router.post("/stations/{station_id}/activate")
async def activate_charging_station(
    station_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Activate a charging station.
    
    Args:
        station_id: Charging station ID
        charging_service: Charging service
        
    Returns:
        JSONResponse: Activation confirmation
    """
    try:
        result = await charging_service.activate_station(station_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to activate charging station"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Charging station activated successfully",
                "station_id": station_id
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate charging station"
        )


@router.post("/stations/{station_id}/deactivate")
async def deactivate_charging_station(
    station_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Deactivate a charging station.
    
    Args:
        station_id: Charging station ID
        charging_service: Charging service
        
    Returns:
        JSONResponse: Deactivation confirmation
    """
    try:
        result = await charging_service.deactivate_station(station_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to deactivate charging station"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Charging station deactivated successfully",
                "station_id": station_id
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate charging station"
        )


# ============================================================================
# Charging Session Routes
# ============================================================================

@router.get("/sessions", response_model=ChargingSessionListResponse)
async def get_charging_sessions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    vehicle_id: Optional[int] = Query(None, description="Filter by vehicle ID"),
    station_id: Optional[int] = Query(None, description="Filter by station ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get all charging sessions with pagination and optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        vehicle_id: Filter by vehicle ID
        station_id: Filter by station ID
        is_active: Filter by active status
        charging_service: Charging service
        
    Returns:
        ChargingSessionListResponse: List of charging sessions with pagination metadata
    """
    try:
        sessions, total = await charging_service.get_all_sessions(
            skip=skip,
            limit=limit,
            vehicle_id=vehicle_id,
            station_id=station_id,
            is_active=is_active
        )
        
        return ChargingSessionListResponse(
            items=sessions,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve charging sessions"
        )


@router.get("/sessions/{session_id}", response_model=ChargingSessionResponse)
async def get_charging_session(
    session_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get a specific charging session by ID.
    
    Args:
        session_id: Charging session ID
        charging_service: Charging service
        
    Returns:
        ChargingSessionResponse: Charging session details
    """
    try:
        session = await charging_service.get_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging session with ID {session_id} not found"
            )
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve charging session"
        )


@router.get("/vehicles/{vehicle_id}/sessions", response_model=ChargingSessionListResponse)
async def get_vehicle_charging_sessions(
    vehicle_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get all charging sessions for a specific vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        skip: Number of records to skip
        limit: Number of records to return
        charging_service: Charging service
        
    Returns:
        ChargingSessionListResponse: List of charging sessions for the vehicle
    """
    try:
        sessions, total = await charging_service.get_sessions_by_vehicle(
            vehicle_id=vehicle_id,
            skip=skip,
            limit=limit
        )
        
        return ChargingSessionListResponse(
            items=sessions,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vehicle charging sessions"
        )


@router.post("/sessions/start", response_model=ChargingSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_charging_session(
    request: Request,
    session_data: ChargingSessionCreateRequest,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Start a new charging session.
    
    Args:
        request: HTTP request
        session_data: Charging session creation data
        charging_service: Charging service
        
    Returns:
        ChargingSessionResponse: Created charging session details
    """
    try:
        session = await charging_service.start_session(session_data)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to start charging session"
            )
        
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start charging session"
        )


@router.post("/sessions/{session_id}/stop", response_model=ChargingSessionResponse)
async def stop_charging_session(
    session_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Stop an active charging session.
    
    Args:
        session_id: Charging session ID
        charging_service: Charging service
        
    Returns:
        ChargingSessionResponse: Updated charging session details
    """
    try:
        session = await charging_service.stop_session(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging session with ID {session_id} not found or already completed"
            )
        
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop charging session"
        )


@router.put("/sessions/{session_id}", response_model=ChargingSessionResponse)
async def update_charging_session(
    session_id: int,
    session_data: ChargingSessionUpdateRequest,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Update an existing charging session.
    
    Args:
        session_id: Charging session ID
        session_data: Charging session update data
        charging_service: Charging service
        
    Returns:
        ChargingSessionResponse: Updated charging session details
    """
    try:
        session = await charging_service.update_session(
            session_id=session_id,
            session_data=session_data
        )
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Charging session with ID {session_id} not found"
            )
        
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update charging session"
        )


# ============================================================================
# Charging Rate Routes
# ============================================================================

@router.get("/rates/current", response_model=ChargingRateResponse)
async def get_current_charging_rate(
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get the current charging rate.
    
    Args:
        charging_service: Charging service
        
    Returns:
        ChargingRateResponse: Current charging rate details
    """
    try:
        rate = await charging_service.get_current_rate()
        
        if not rate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No charging rate configured"
            )
        
        return rate
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve current charging rate"
        )


@router.post("/rates", response_model=ChargingRateResponse, status_code=status.HTTP_201_CREATED)
async def set_charging_rate(
    request: Request,
    rate_data: ChargingRateRequest,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Set or update the charging rate.
    
    Args:
        request: HTTP request
        rate_data: Charging rate data
        charging_service: Charging service
        
    Returns:
        ChargingRateResponse: Updated charging rate details
    """
    try:
        rate = await charging_service.set_rate(rate_data)
        
        if not rate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to set charging rate"
            )
        
        return rate
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set charging rate"
        )


@router.get("/stations/{station_id}/current-session")
async def get_current_session_for_station(
    station_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get the current active charging session for a station.
    
    Args:
        station_id: Charging station ID
        charging_service: Charging service
        
    Returns:
        JSONResponse: Current session details or null if none
    """
    try:
        session = await charging_service.get_current_session_for_station(station_id)
        
        if not session:
            return JSONResponse(
                content={
                    "status": "success",
                    "message": "No active session for this station",
                    "session": None
                }
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "session": session
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve current session for station"
        )


@router.get("/vehicles/{vehicle_id}/current-session")
async def get_current_session_for_vehicle(
    vehicle_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get the current active charging session for a vehicle.
    
    Args:
        vehicle_id: Vehicle ID
        charging_service: Charging service
        
    Returns:
        JSONResponse: Current session details or null if none
    """
    try:
        session = await charging_service.get_current_session_for_vehicle(vehicle_id)
        
        if not session:
            return JSONResponse(
                content={
                    "status": "success",
                    "message": "No active session for this vehicle",
                    "session": None
                }
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "session": session
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve current session for vehicle"
        )


@router.get("/sessions/{session_id}/energy-usage")
async def get_session_energy_usage(
    session_id: int,
    charging_service: ChargingService = Depends(get_charging_service),
):
    """
    Get energy usage details for a charging session.
    
    Args:
        session_id: Charging session ID
        charging_service: Charging service
        
    Returns:
        JSONResponse: Energy usage details
    """
    try:
        energy_usage = await charging_service.get_session_energy_usage(session_id)
        
        if not energy_usage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Energy usage data not found for session {session_id}"
            )
        
        return JSONResponse(
            content={
                "status": "success",
                "session_id": session_id,
                "energy_usage": energy_usage
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve session energy usage"
        )